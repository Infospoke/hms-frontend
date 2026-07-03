import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { ApprovalService } from '../../services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommentModalAction, CommentModalConfig, CommentModalResult, CommonModalComponent } from '../../../../shared/components/common-modal/common-modal.component';
import { NzSelectModule } from 'ng-zorro-antd/select';

export type PageMode = 'create' | 'edit' | 'view' | 'approve';

@Component({
  selector: 'app-create-new-chain',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeadingComponent,
    CommonModalComponent,
    NzSelectModule,
  ],
  templateUrl: './create-new-chain.component.html',
  styleUrl: './create-new-chain.component.scss',
})
export class CreateNewChainComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private approvalService = inject(ApprovalService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  url: string = '/approval/chain-config';
  mode: PageMode = 'create';

  functionalityOptions: { value: any; label: string }[] = [];
  departmentOptions: { value: any; label: string }[] = [];

  approverOptionsByLevel: { [levelIndex: number]: { value: any; label: string }[] } = {};
  loadingRoles: { [levelIndex: number]: boolean } = {};

  // ── Comment modal state ───────────────────────────────────────────────────
  showCommentModal = false;
  commentModalAction: CommentModalAction | null = null;
  submittingModal = false;




  get modalConfig(): Partial<CommentModalConfig> | null {
    if (!this.commentModalAction) return null;
    const map: Record<CommentModalAction, Partial<CommentModalConfig>> = {
      approve: { title: 'Approve Chain', description: 'Please provide a comment for approving this chain.', },
      reject: { title: 'Reject Chain', description: 'Please provide a reason for rejecting this chain.', },
      deactivate: { title: 'Deactivate Chain', description: 'Please provide a reason for deactivating this chain.', },
      activate: { title: 'Activate Chain', description: 'Please provide a reason for activating this chain.', },
    };
    return map[this.commentModalAction] ?? null;
  }

  // ── Page mode helpers ─────────────────────────────────────────────────────
  get isView(): boolean { return this.mode === 'view'; }
  get isEdit(): boolean { return this.mode === 'edit'; }
  get isCreate(): boolean { return this.mode === 'create'; }
  get isApprove(): boolean { return this.mode === 'approve'; }
  get readOnly(): boolean { return this.isView || this.isApprove; }

  /** Controls visibility of the Activity Timeline card. */
  get showComment(): boolean { return this.showTimeLine && !this.isCreate; }

  get pageTitle(): string {
    return ({ create: 'Create New Chain', edit: 'Edit Chain', view: 'View Chain', approve: 'Approval of New Chain' })[this.mode];
  }

  get backText(): string {
    return ({ create: 'Back to Chain', edit: 'Back to Chain', view: 'Back to Chain', approve: 'Back to Approval Chains' })[this.mode];
  }

  get pageSubtitle(): string {
    return ({
      create: 'Configure a new approval chain workflow',
      edit: 'Update the approval chain status',
      view: 'Viewing approval chain details',
      approve: 'Review and take action on the new approval chain request',
    })[this.mode];
  }

  submitting = false;
  showTimeLine = false;

  /** All comment / history fields populated from the API in non-create modes. */
  approvalStatus = '';   // 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | ''
  approvedComments = '';
  rejectedComments = '';
  activateComments = '';
  deactivateComments = '';

  /** Audit meta fields */
  showComments = false;
  createdAt = '';
  createdBy = '';
  updatedAt='';
  updatedBy='';
 
  get isApprovalDecided(): boolean {
    const s = (this.approvalStatus ?? '').toUpperCase();
    return s === 'APPROVED' || s === 'REJECTED';
  }

  /** True if at least one comment field has a value — drives the Comments card visibility. */
  get hasAnyComment(): boolean {
    return !!(this.approvedComments || this.rejectedComments ||
      this.activateComments || this.deactivateComments);
  }
  commentsDataTimeline:any[]=[];
  form!: FormGroup;
  requestType: string = '';
  get levels(): FormArray { return this.form.get('levels') as FormArray; }

  private buildLevelGroup(dept = '', approver = ''): FormGroup {
    return this.fb.group({
      department: [dept, Validators.required],
      approver: [approver, Validators.required],
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    this.mode = (this.route.snapshot.params['type'] as PageMode) ?? 'create';
    const state = history.state as { chainId?: any; url: string, show: boolean };
    this.url = state?.url ?? '';
    this.showTimeLine = state?.show ?? false;
    this.form = this.fb.group({
      chainName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
    
      active: [{ value: false, disabled: this.isCreate }],
      functionality: [''],
      levels: this.fb.array([this.buildLevelGroup()]),
    });

    await this.loadInitialDropdowns();

    if (this.mode !== 'create' && state?.chainId) {
      await this.loadChain(state.chainId);
    }

    if (this.isEdit) {
      this.form.get('chainName')!.disable();
      this.form.get('description')!.disable();
      this.form.get('functionality')!.disable();
      this.levels.controls.forEach((_, i) => {
        (this.levels.at(i) as FormGroup).get('department')!.disable();
        (this.levels.at(i) as FormGroup).get('approver')!.disable();
      });
    }

    if (this.readOnly) { this.form.disable(); }
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────
  private async loadInitialDropdowns(): Promise<void> {
    try {
      const [deptRes, funcRes] = await Promise.all([
        this.approvalService.departments() as Promise<any>,
        this.isCreate ? this.approvalService.getFunctionalities() as Promise<any> : Promise.resolve([]),
      ]);

      this.departmentOptions = (deptRes?.data ?? deptRes ?? []).map((d: any) => ({
        value: d.id ?? d.value,
        label: d.name ?? d.departmentName ?? d.label,
      }));

      if (this.isCreate) {
        this.functionalityOptions = (funcRes?.data ?? funcRes ?? []).map((f: any) => ({
          value: f.id ?? f.value,
          label: f.name ?? f.functionalityName ?? f.label,
        }));
      }
    } catch (err) {
      console.error('[init dropdowns]', err);
    }
  }

  async onDepartmentChange(levelIndex: number, deptId: any): Promise<void> {
    (this.levels.at(levelIndex) as FormGroup).get('approver')!.setValue('');
    this.approverOptionsByLevel[levelIndex] = [];
    if (!deptId) return;

    try {
      this.loadingRoles[levelIndex] = true;
      const rolesRes: any = await this.userService.getRoles(deptId);
      this.approverOptionsByLevel[levelIndex] = (rolesRes?.data ?? rolesRes ?? []).map((r: any) => ({
        value: r.id ?? r.value,
        label: r.name ?? r.roleName ?? r.label,
      }));
    } catch (err) {
      console.error(`[roles for dept ${deptId}]`, err);
    } finally {
      this.loadingRoles[levelIndex] = false;
    }
  }

  private async loadChain(chainId: any): Promise<void> {
    try {
      const res: any = await this.approvalService.chainDetailsById(chainId);
      const chain = res?.data ?? res;
      if (!chain) return;

      this.form.patchValue({
        chainName: chain.chainName ?? chain.name ?? '',
        description: chain.description ?? '',
        active: (chain.status ?? '').toLowerCase() === 'active',
        functionality: chain.functionalityName ?? chain.functionalityId ?? '',
      });

      // Capture approval status + all comment fields.
      this.requestType = chain?.requestType;
      this.approvalStatus = (chain.approval ?? '').toUpperCase();
      this.approvedComments = chain.approvedComments ?? '';
      this.rejectedComments = chain.rejectedComments ?? '';
      this.activateComments = chain.activateComments ?? '';
      this.deactivateComments = chain.deactivateComments ?? '';
      this.commentsDataTimeline=chain?.commentTimeline;
      // Audit meta
      this.createdAt = chain.createdAt ?? '';
      this.createdBy = chain.createdBy ?? '';
      this.updatedAt=chain?.updatedAt;
      this.updatedBy=chain?.updatedBy;
      this.showComments = !!(chain.showComments ?? this.hasAnyComment);

      const levelConfigs: any[] = chain.levelConfig ?? chain.levels ?? [];
      while (this.levels.length > 0) { this.levels.removeAt(0); }

      if (!levelConfigs.length) { this.levels.push(this.buildLevelGroup()); return; }

      levelConfigs.forEach(lvl => {
        this.levels.push(this.buildLevelGroup(
          String(lvl.departmentId ?? lvl.department ?? ''),
          String(lvl.roleId ?? lvl.approver ?? ''),
        ));
      });

      await Promise.all(levelConfigs.map(async (lvl, index) => {
        const deptId = lvl.departmentId ?? lvl.department;
        const roleId = lvl.roleId ?? lvl.approver;
        if (!deptId) return;
        try {
          this.loadingRoles[index] = true;
          const rolesRes: any = await this.userService.getRoles(deptId);
          this.approverOptionsByLevel[index] = (rolesRes?.data ?? rolesRes ?? []).map((r: any) => ({
            value: r.id ?? r.value,
            label: r.name ?? r.roleName ?? r.label,
          }));
          (this.levels.at(index) as FormGroup).get('approver')!.setValue(roleId ? String(roleId) : '');
        } catch (err) {
          console.error(`[loadChain roles - level ${index}]`, err);
        } finally {
          this.loadingRoles[index] = false;
        }
      }));
    } catch (err) {
      console.error('[loadChain]', err);
    }
  }

  // ── Level CRUD ────────────────────────────────────────────────────────────
  addLevel(): void {
    if (!this.readOnly && this.levels.length < 3) { this.levels.push(this.buildLevelGroup()); }
  }

  removeLevel(index: number): void {
    if (!this.readOnly && this.levels.length > 1) {
      this.levels.removeAt(index);
      const rebuilt: typeof this.approverOptionsByLevel = {};
      Object.entries(this.approverOptionsByLevel).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < index) rebuilt[ki] = v;
        else if (ki > index) rebuilt[ki - 1] = v;
      });
      this.approverOptionsByLevel = rebuilt;
    }
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    event.dataTransfer?.setData('text/plain', String(index));
    event.dataTransfer!.effectAllowed = 'move';
  }
  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverIndex = index;
  }
  onDragLeave(): void { this.dragOverIndex = null; }
  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const fromIndex = this.dragIndex;
    if (fromIndex === null || fromIndex === dropIndex) { this.resetDragState(); return; }
    this.swapLevels(fromIndex, dropIndex);
    this.resetDragState();
  }
  onDragEnd(): void { this.resetDragState(); }
  private resetDragState(): void { this.dragIndex = null; this.dragOverIndex = null; }

  private swapLevels(from: number, to: number): void {
    const total = this.levels.length;
    const values: { department: string; approver: string }[] = [];
    const opts: { value: any; label: string }[][] = [];
    const loads: boolean[] = [];

    for (let i = 0; i < total; i++) {
      const raw = (this.levels.at(i) as any).getRawValue();
      values.push({ department: raw.department ?? '', approver: raw.approver ?? '' });
      opts.push([...(this.approverOptionsByLevel[i] ?? [])]);
      loads.push(this.loadingRoles[i] ?? false);
    }

    [values[from], values[to]] = [values[to], values[from]];
    [opts[from], opts[to]] = [opts[to], opts[from]];
    [loads[from], loads[to]] = [loads[to], loads[from]];

    const rebuiltOpts: typeof this.approverOptionsByLevel = {};
    const rebuiltLoads: typeof this.loadingRoles = {};
    opts.forEach((o, i) => { rebuiltOpts[i] = o; });
    loads.forEach((l, i) => { rebuiltLoads[i] = l; });
    this.approverOptionsByLevel = { ...rebuiltOpts };
    this.loadingRoles = { ...rebuiltLoads };

    for (let i = 0; i < total; i++) {
      const grp = this.levels.at(i) as FormGroup;
      grp.get('department')!.setValue(values[i].department, { emitEvent: false });
      grp.get('approver')!.setValue(values[i].approver, { emitEvent: false });
    }
  }

  // ── Label helpers ─────────────────────────────────────────────────────────
  getDepartmentLabel(value: any): string {
    return this.departmentOptions.find(d => String(d.value) === String(value))?.label ?? value ?? '—';
  }
  getApproverLabel(levelIndex: number, value: any): string {
    return (this.approverOptionsByLevel[levelIndex] ?? []).find(a => String(a.value) === String(value))?.label ?? value ?? '—';
  }
  getFunctionalityLabel(value: any): string {
    if (!value) return '—';
    return this.functionalityOptions.find(f => String(f.value) === String(value))?.label ?? String(value);
  }
  getLevelSubtitle(): string {
    const count = this.levels.length;
    if (this.isApprove) return `This chain contains ${count} level(s) for approval.`;
    if (this.isView) return 'Configured approvers for each level';
    return 'Configure the approvers for each level (Maximum 3 levels allowed)';
  }
  approverOptionsFor(levelIndex: number): { value: any; label: string }[] {
    return this.approverOptionsByLevel[levelIndex] ?? [];
  }
  controlHasError(index: number, control: 'department' | 'approver'): boolean {
    const ctrl = (this.levels.at(index) as FormGroup).get(control)!;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitting);
  }
  trackByIndex(index: number): number { return index; }

  get chainNameLength(): number { return this.form.get('chainName')?.value?.length ?? 0; }
  get descriptionLength(): number { return this.form.get('description')?.value?.length ?? 0; }
  get activeValue(): boolean { return this.form.get('active')?.value ?? false; }

  fieldError(name: string): string | null {
    const ctrl = this.form.get(name)!;
    if (!ctrl.invalid || (!ctrl.dirty && !ctrl.touched && !this.submitting)) return null;
    if (ctrl.errors?.['required']) return `${name === 'chainName' ? 'Chain name' : 'Description'} is required.`;
    if (ctrl.errors?.['minlength']) return 'Chain name must be at least 3 characters.';
    return null;
  }

  private atLeastOneCompleteLevelValid(): boolean {
    return this.levels.controls.some(grp => {
      const g = grp as FormGroup;
      return g.get('department')!.value && g.get('approver')!.value;
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goBack(): void { this.router.navigateByUrl(this.url || '/approval/chain-config'); }
  onCancel(): void { this.router.navigateByUrl(this.url || '/approval/chain-config'); }

  // ── Toggle (edit mode only) ───────────────────────────────────────────────
  toggleActive(): void {
    if (this.readOnly || this.isCreate) return;
    const ctrl = this.form.get('active')!;
    const newVal = !ctrl.value;
    ctrl.setValue(newVal);
    if (this.isEdit) {
      // Both activate and deactivate in edit mode raise an approval request.
      this.openCommentModal(newVal ? 'activate' : 'deactivate');
    }
  }

  // ── Comment Modal ─────────────────────────────────────────────────────────
  openCommentModal(action: CommentModalAction): void {
    this.commentModalAction = action;
    this.submittingModal = false;
    this.showCommentModal = true;
  }

  closeCommentModal(): void {
    // Revert toggle if the user cancels a deactivate / activate modal in edit mode.
    if (this.commentModalAction === 'deactivate') { this.form.get('active')!.setValue(true); }
    if (this.commentModalAction === 'activate') { this.form.get('active')!.setValue(false); }
    this.showCommentModal = false;
    this.commentModalAction = null;
  }


  async onModalConfirmed(result: CommentModalResult): Promise<void> {
    const state   = history.state as { chainId?: any };
    const chainId = state?.chainId;
    this.submittingModal = true;
 
    let payload: Record<string, any> | null = null;
 
    try {
      switch (result.action) {
 
        case 'approve':
        case 'reject': {
          const isApprove = result.action === 'approve';
 
          if (this.requestType === 'Chain-Deactive') {
            payload = {
              id:                chainId,
              deactiveApproval:  isApprove,   // true = approved, false = rejected
              comments:          result.comment,
            };
          } else if (this.requestType === 'Chain Active') {

            payload = {
              id:              chainId,
              activeApproval:  isApprove,     // true = approved, false = rejected
              comments:        result.comment,
            };
          } else {
         
            payload = {
              id:       chainId,
              approval: isApprove ? 'APPROVED' : 'REJECTED',
              comments: result.comment,
            };
          }
          break;
        }
 
        // ── Edit-mode deactivate: raises a deactivation approval request ────
        case 'deactivate':
          payload = {
            id:                 chainId,
            status:           'DEACTIVE',
            description: result.comment,
          };
          break;
 
        // ── Edit-mode activate: raises an activation approval request ───────
        case 'activate':
          payload = {
            id:               chainId,
            status:         'ACTIVE',
            description: result.comment,
          };
          break;
      }
 
      if (!payload) return;
 
      const res: any = await this.approvalService.updateChain(payload);
 
      if (res?.responsecode === '00') {
        this.showCommentModal = false;
        this.router.navigateByUrl(this.url || '/approval/chain-config');
      } else {
        this.notificationService.error(
          res?.message ?? res?.responsemessage ?? res?.errors?.[0] ?? 'Action failed. Please try again.',
          'Error',
        );
      }
    } catch (err) {
      console.error('[onModalConfirmed]', err);
    } finally {
      this.submittingModal = false;
    }
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  async onSubmit(): Promise<void> {
    if (this.readOnly) return;
    this.submitting = true;

    try {
      if (this.isEdit) {
        // Edit submit is a no-op here — status changes are handled via the toggle → modal flow.
        this.router.navigateByUrl(this.url || '/approval/chain-config');
      } else {
        this.form.markAllAsTouched();
        const topValid = this.form.get('chainName')!.valid && this.form.get('description')!.valid;
        const levelsValid = this.atLeastOneCompleteLevelValid();
        if (!topValid || !levelsValid) { this.submitting = false; return; }

        const raw = this.form.getRawValue();
        const filledLevels = this.levels.controls
          .map((g, i) => ({ ...g.value, _index: i }))
          .filter((l: any) => l.department && l.approver)
          .map((l: any, i: number) => ({
            level: i + 1,
            departmentId: Number(l.department),
            roleId: Number(l.approver),
          }));

        await this.approvalService.createChain({
          chainName: raw.chainName,
          description: raw.description,
          // Status is always INACTIVE on create — becomes ACTIVE only after approval.
          status: 'INACTIVE',
          functionality: raw.functionality ? Number(raw.functionality) : null,
          levelConfig: filledLevels,
        });
        this.router.navigateByUrl('/approval/chain-config');
      }
    } catch (err) {
      console.error('[submit]', err);
    } finally {
      this.submitting = false;
    }
  }

  /** Approve button — carries the inline comment into the modal. */
  onApprove(): void { this.openCommentModal('approve'); }

  /** Reject button — carries the inline comment into the modal. */
  onReject(): void { this.openCommentModal('reject'); }
}