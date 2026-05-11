import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { ApprovalService } from '../../services/approval-service';
import { UserService } from '../../../settings/users/servics/user-service';
import { NotificationService } from '../../../../core/services/notification.service';


export type PageMode = 'create' | 'edit' | 'view' | 'approve';

@Component({
  selector: 'app-create-new-chain',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeadingComponent],
  templateUrl: './create-new-chain.component.html',
  styleUrl: './create-new-chain.component.scss',
})
export class CreateNewChainComponent implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private approvalService = inject(ApprovalService);
  private userService = inject(UserService);
   url: string = '';
  private notificationService = inject(NotificationService)
  mode: PageMode = 'create';

  functionalityOptions: { value: any; label: string }[] = [];
  departmentOptions: { value: any; label: string }[] = [];

  approverOptionsByLevel: { [levelIndex: number]: { value: any; label: string }[] } = {};
  loadingRoles: { [levelIndex: number]: boolean } = {};


  showCommentModal = false;
  commentModalAction: 'approve' | 'reject' | 'deactivate' | 'activate' | null = null;
  commentText = '';
  commentError = '';
  submittingModal = false;


  get isView(): boolean { return this.mode === 'view'; }
  get isEdit(): boolean { return this.mode === 'edit'; }
  get isCreate(): boolean { return this.mode === 'create'; }
  get isApprove(): boolean { return this.mode === 'approve'; }
  get readOnly(): boolean { return this.isView || this.isApprove; }

  get pageTitle(): string {
    return ({
      create: 'Create New Chain',
      edit: 'Edit Chain',
      view: 'View Chain',
      approve: 'Approval of New Chain',
    })[this.mode];
  }

  get backText(): string {
    return ({
      create: 'Back to Chain',
      edit: 'Back to Chain',
      view: 'Back to Chain',
      approve: 'Back to Approval Chains',
    })[this.mode];
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

  form!: FormGroup;

  get levels(): FormArray {
    return this.form.get('levels') as FormArray;
  }

  private buildLevelGroup(dept = '', approver = ''): FormGroup {
    return this.fb.group({
      department: [dept, Validators.required],
      approver: [approver, Validators.required],
    });
  }


  async ngOnInit(): Promise<void> {

    this.mode = (this.route.snapshot.params['type'] as PageMode) ?? 'create';
    const state = history.state as { chainId?: any, url: string };
    this.url = state?.url ?? '';
    this.form = this.fb.group({
      chainName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      active: [true],
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


    if (this.readOnly) {
      this.form.disable();
    }
  }


  private async loadInitialDropdowns(): Promise<void> {
    try {
      const promises: [Promise<any>, Promise<any>?] = [
        this.approvalService.departments() as Promise<any>,
        this.isCreate
          ? this.approvalService.getFunctionalities() as Promise<any>
          : Promise.resolve([]),
      ];

      const [deptRes, funcRes] = await Promise.all(promises);

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

      const levelConfigs: any[] = chain.levelConfig ?? chain.levels ?? [];

      // Clear default empty level
      while (this.levels.length > 0) {
        this.levels.removeAt(0);
      }

      if (levelConfigs.length === 0) {
        this.levels.push(this.buildLevelGroup());
        return;
      }


      levelConfigs.forEach(lvl => {
        const deptId = lvl.departmentId ?? lvl.department ?? '';
        const roleId = lvl.roleId ?? lvl.approver ?? '';
        this.levels.push(this.buildLevelGroup(String(deptId), String(roleId)));
      });


      await Promise.all(
        levelConfigs.map(async (lvl, index) => {
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

            // Set approver value once options are available so <select> binds correctly
            (this.levels.at(index) as FormGroup)
              .get('approver')!
              .setValue(roleId ? String(roleId) : '');

          } catch (err) {
            console.error(`[loadChain roles - level ${index}, dept ${deptId}]`, err);
          } finally {
            this.loadingRoles[index] = false;
          }
        })
      );

    } catch (err) {
      console.error('[loadChain]', err);
    }
  }


  addLevel(): void {
    if (!this.readOnly && this.levels.length < 3) {
      this.levels.push(this.buildLevelGroup());
    }
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

  /**
   * Move a level row up (-1) or down (+1).
   * Swaps the FormGroup controls AND remaps the approverOptionsByLevel cache
   * so dropdowns stay in sync after the move.
   */
  // ── Drag-and-drop state ──────────────────────────────────────────────────────
  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    // Required for Firefox
    event.dataTransfer?.setData('text/plain', String(index));
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();                     // allow drop
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverIndex = index;
  }

  onDragLeave(): void {
    this.dragOverIndex = null;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const fromIndex = this.dragIndex;
    if (fromIndex === null || fromIndex === dropIndex) {
      this.resetDragState();
      return;
    }
    this.swapLevels(fromIndex, dropIndex);
    this.resetDragState();
  }

  onDragEnd(): void {
    this.resetDragState();
  }

  private resetDragState(): void {
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  /**
   * Core swap: moves the dragged row to the drop position by
   * re-inserting it (handles non-adjacent rows correctly).
   * Also remaps approverOptionsByLevel and loadingRoles caches.
   */
  private swapLevels(from: number, to: number): void {
    const total = this.levels.length;

    // 1. Snapshot values + caches for ALL rows into plain arrays
    const values: { department: string; approver: string }[] = [];
    const opts:   { value: any; label: string }[][]          = [];
    const loads:  boolean[]                                   = [];

    for (let i = 0; i < total; i++) {
      // Use getRawValue() so disabled controls are also captured
      const raw = (this.levels.at(i) as any).getRawValue();
      values.push({ department: raw.department ?? '', approver: raw.approver ?? '' });
      opts.push([...(this.approverOptionsByLevel[i] ?? [])]);
      loads.push(this.loadingRoles[i] ?? false);
    }

    // 2. Swap only the two affected indices
    [values[from], values[to]] = [values[to], values[from]];
    [opts[from],   opts[to]]   = [opts[to],   opts[from]];
    [loads[from],  loads[to]]  = [loads[to],  loads[from]];

    // 3. Restore caches FIRST so the template has options before patchValue triggers CD
    const rebuiltOpts: typeof this.approverOptionsByLevel = {};
    const rebuiltLoads: typeof this.loadingRoles          = {};
    opts.forEach((o, i)  => { rebuiltOpts[i]  = o; });
    loads.forEach((l, i) => { rebuiltLoads[i] = l; });
    this.approverOptionsByLevel = { ...rebuiltOpts };
    this.loadingRoles           = { ...rebuiltLoads };

    // 4. Patch each FormGroup in-place — no remove/insert, no reference issues
    for (let i = 0; i < total; i++) {
      const grp = this.levels.at(i) as FormGroup;
      grp.get('department')!.setValue(values[i].department, { emitEvent: false });
      grp.get('approver')!.setValue(values[i].approver,    { emitEvent: false });
    }
  }


  getDepartmentLabel(value: any): string {
    return this.departmentOptions.find(d => String(d.value) === String(value))?.label ?? value ?? '—';
  }

  getApproverLabel(levelIndex: number, value: any): string {
    const opts = this.approverOptionsByLevel[levelIndex] ?? [];
    return opts.find(a => String(a.value) === String(value))?.label ?? value ?? '—';
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


  toggleActive(): void {
    if (this.readOnly) return;
    const ctrl = this.form.get('active')!;
    const newVal = !ctrl.value;
    ctrl.setValue(newVal);


    if (this.isEdit) {
      if (!newVal) {
        this.openCommentModal('deactivate');
      } else {
        this.openCommentModal('activate');
      }
    }
  }

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


  goBack(): void { this.router.navigateByUrl(this.url || '/approval/chain-config'); }
  onCancel(): void { this.router.navigateByUrl(this.url || '/approval/chain-config'); }

  openCommentModal(action: 'approve' | 'reject' | 'deactivate' | 'activate'): void {
    this.commentModalAction = action;
    this.commentText = '';
    this.commentError = '';
    this.submittingModal = false;
    this.showCommentModal = true;
  }

  closeCommentModal(): void {

    if (this.commentModalAction === 'deactivate') {
      this.form.get('active')!.setValue(true);
    }
    if (this.commentModalAction === 'activate') {
      this.form.get('active')!.setValue(false);
    }
    this.showCommentModal = false;
    this.commentModalAction = null;
    this.commentText = '';
    this.commentError = '';
  }

  async confirmModalAction(): Promise<void> {
    if (!this.commentText.trim()) {
      this.commentError = 'Comment is required.';
      return;
    }
    if (!this.commentText.trim() || this.commentText.trim().length < 6) {
      this.commentError = 'Comment must be at least 6 characters.';
      return;
    }

    const state = history.state as { chainId?: any };
    const chainId = state?.chainId;
    this.submittingModal = true;
    let res: any;
    try {
      if (this.commentModalAction === 'approve') {
        res = await this.approvalService.updateChain({
          id: chainId,
          approval: 'Approved',
          approvedComments: this.commentText.trim(),
        });

      } else if (this.commentModalAction === 'reject') {
        res = await this.approvalService.updateChain({
          id: chainId,
          approval: 'Rejected',
          rejectedComments: this.commentText.trim(),
        });

      } else if (this.commentModalAction === 'deactivate') {
        res = await this.approvalService.updateChain({
          id: chainId,
          status: 'DEACTIVE',
          deactivateComments: this.commentText.trim(),
        });
      }
      else if (this.commentModalAction === 'activate') {
        res = await this.approvalService.updateChain({
          id: chainId,
          status: 'ACTIVE',
          activateComments: this.commentText.trim(),
        });
      }
      if (res.responsecode == '00') {
        this.showCommentModal = false;
        this.router.navigateByUrl(this.url || '/approval/chain-config');
      }
      else {
        this.notificationService.error(res?.message || res?.responsemessage || res?.errors?.[0] || 'Action failed. Please try again.', 'Error');
      }


    } catch (err) {
      console.error('[confirmModalAction]', err);
    } finally {
      this.submittingModal = false;
    }
  }


  async onSubmit(): Promise<void> {
    if (this.readOnly) return;

    this.submitting = true;

    try {
      if (this.isEdit) {
        const state = history.state as { chainId?: any };
        await this.approvalService.updateChain({
          id: state?.chainId,
          status: this.activeValue ? 'ACTIVE' : 'DEACTIVE',
        });
        this.router.navigateByUrl(this.url || '/approval/chain-config');

      } else {

        this.form.markAllAsTouched();

        const topValid = this.form.get('chainName')!.valid && this.form.get('description')!.valid;
        const levelsValid = this.atLeastOneCompleteLevelValid();

        if (!topValid || !levelsValid) {
          this.submitting = false;
          return;
        }

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
          status: this.activeValue ? 'ACTIVE' : 'DEACTIVE',
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
  onApprove(): void { this.openCommentModal('approve'); }
  onReject(): void { this.openCommentModal('reject'); }
}