import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { mobileValidator } from '../../../../shared/validations/validators';
import { HeadingComponent } from '../../../../shared/components/heading/heading.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientManagementService } from '../../services/client-management.service';

type PageMode = 'create' | 'edit' | 'view';

interface ClientPoc {
  pocName: string;
  designation: string;
  contactNo: string;
  email: string;
  location: string;
}

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('agreementStartDate')?.value;
  const end = group.get('agreementEndDate')?.value;
  if (start && end && new Date(end) < new Date(start)) {
    return { dateRangeInvalid: true };
  }
  return null;
}

@Component({
  selector: 'app-add-client-management',
  imports: [CommonModule, ReactiveFormsModule, HeadingComponent],
  templateUrl: './add-client-management.component.html',
  styleUrl: './add-client-management.component.scss',
})
export class AddClientManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientManagementService);
  private notificationService = inject(NotificationService);

  mode: PageMode = 'create';
  editingId: number | null = null;
  isLoading = false;
  isSaving = false;

  clientStatusOptions: string[] = ['Active', 'Inactive'];
  agreementStatusOptions: string[] = ['Active', 'Pending', 'Renewed', 'Expired', 'Terminated'];

  form: FormGroup = this.fb.group(
    {
      clientName: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(150)],
      ],
      industry: ['', [Validators.required, Validators.maxLength(100)]],
      teamSize: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]],
      clientStatus: ['Active', [Validators.required]],
      agreementStatus: ['', [Validators.required]],
      agreementStartDate: [''],
      agreementEndDate: [''],
      bdm: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      businessProposed: ['', [Validators.required, Validators.maxLength(255)]],
      clientManager: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      designation: ['', [Validators.maxLength(100)]],
      contactNo: ['', [mobileValidator()]],
      email: ['', [Validators.email]],
      location: ['', [Validators.maxLength(150)]],
      pocs: this.fb.array([this.buildPocGroup(), this.buildPocGroup()]),
      remarks: ['', [Validators.maxLength(1000)]],
    },
    { validators: [dateRangeValidator] }
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      const mode = params.get('mode');
      this.mode = mode === 'view' ? 'view' : mode === 'edit' ? 'edit' : 'create';
      this.editingId = id ? Number(id) : null;

      if (this.editingId) {
        this.loadClient(this.editingId);
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  private async loadClient(id: number): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.clientService.getClientById(id);
      const client = response?.data ?? response;

      if (!client) {
        this.notificationService.error('That client could not be found.');
        this.router.navigateByUrl('/client-management/client-management-list');
        return;
      }

      this.patchForm(client);

      if (this.mode === 'view') {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    } catch {
      this.notificationService.error('Something went wrong while loading this client.');
      this.router.navigateByUrl('/client-management/client-management-list');
    } finally {
      this.isLoading = false;
    }
  }

  private patchForm(client: any): void {
    this.pocs.clear();
    const pocList: Partial<ClientPoc>[] = client.poc?.length
      ? client.poc
      : client.pocs?.length
      ? client.pocs
      : [{}];
    pocList.forEach((p: Partial<ClientPoc>) => this.pocs.push(this.buildPocGroup(p)));

    this.form.patchValue({
      clientName: client.clientName,
      industry: client.industry,
      teamSize: client.teamSize,
      clientStatus: client.clientStatus,
      agreementStatus: client.agreementStatus,
      agreementStartDate: client.agreementStartDate ?? '',
      agreementEndDate: client.agreementEndDate ?? '',
      bdm: client.bdm,
      businessProposed: client.businessProposed,
      clientManager: client.clientManager,
      designation: client.designation,
      contactNo: client.contactNo,
      email: client.email,
      location: client.location,
      remarks: client.remarks,
    });
  }

  get pocs(): FormArray {
    return this.form.get('pocs') as FormArray;
  }

  private buildPocGroup(poc?: Partial<ClientPoc>): FormGroup {
    return this.fb.group({
      pocName: [poc?.pocName ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      designation: [poc?.designation ?? '', [Validators.required, Validators.maxLength(100)]],
      contactNo: [poc?.contactNo ?? '', [Validators.required, mobileValidator()]],
      email: [poc?.email ?? '', [Validators.required, Validators.email]],
      location: [poc?.location ?? '', [Validators.required, Validators.maxLength(150)]],
    });
  }

  addPoc(): void {
    if (this.isViewMode) return;
    this.pocs.push(this.buildPocGroup());
  }

  removePoc(index: number): void {
    if (this.isViewMode || this.pocs.length <= 1) return;
    this.pocs.removeAt(index);
  }

  async save(): Promise<void> {
    if (this.isViewMode) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.notificationService.warning('Please fix the highlighted fields before saving.');
      return;
    }

    this.isSaving = true;
    const raw = this.form.getRawValue();
    const payload: any = {
      clientName: (raw.clientName ?? '').trim(),
      industry: (raw.industry ?? '').trim(),
      teamSize: raw.teamSize ? Number(raw.teamSize) : null,
      clientStatus: raw.clientStatus,
      agreementStatus: raw.agreementStatus,
      agreementStartDate: raw.agreementStartDate || null,
      agreementEndDate: raw.agreementEndDate || null,
      bdm: (raw.bdm ?? '').trim(),
      businessProposed: (raw.businessProposed ?? '').trim(),
      clientManager: (raw.clientManager ?? '').trim(),
      designation: (raw.designation ?? '').trim(),
      contactNo: (raw.contactNo ?? '').trim(),
      email: (raw.email ?? '').trim(),
      location: (raw.location ?? '').trim(),
      poc: (raw.pocs as ClientPoc[]).map(p => ({
        pocName: (p.pocName ?? '').trim(),
        designation: (p.designation ?? '').trim(),
        contactNo: (p.contactNo ?? '').trim(),
        email: (p.email ?? '').trim(),
        location: (p.location ?? '').trim(),
      })),
      remarks: (raw.remarks ?? '').trim(),
    };

    try {
      let response: any;
      if (this.mode === 'edit' && this.editingId) {
        response = await this.clientService.updateClient({ id: this.editingId, ...payload });
        if (response?.responsecode && response.responsecode !== '00') {
          throw new Error(response.message || 'Failed to update client.');
        }
        this.notificationService.success(response?.message || 'Client updated successfully.');
      } else {
        response = await this.clientService.addClient(payload);
        if (response?.responsecode && response.responsecode !== '00') {
          throw new Error(response.message || 'Failed to add client.');
        }
        this.notificationService.success(response?.message || 'Client added successfully.');
      }
      this.router.navigateByUrl('/client-management/client-management-list');
    } catch {
      this.notificationService.error('Something went wrong while saving this client. Please try again.');
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.router.navigateByUrl('/client-management/client-management-list');
  }

  resetForm(): void {
    if (this.isViewMode) return;
    this.form.reset({ clientStatus: 'Active' });
    this.pocs.clear();
    this.pocs.push(this.buildPocGroup());
    this.pocs.push(this.buildPocGroup());
  }

  switchToEdit(): void {
    if (!this.editingId) return;
    this.router.navigate(['/client-management/client-management-list/add'], {
      queryParams: { id: this.editingId, mode: 'edit' },
    });
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get pageTitle(): string {
    if (this.mode === 'edit') return 'Edit Client';
    if (this.mode === 'view') return 'View Client';
    return 'Add Client';
  }

  get pageSubHeading(): string {
    if (this.mode === 'edit') return 'Update this client\'s details below.';
    if (this.mode === 'view') return 'Viewing client details in read-only mode.';
    return 'Fill in the details below to add a new client.';
  }

  get saveButtonLabel(): string {
    if (this.isSaving) return 'Saving…';
    return this.mode === 'edit' ? 'Update Client' : 'Save Client';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.touched && control.invalid;
  }

  isPocInvalid(index: number, field: string): boolean {
    const control = this.pocs.at(index)?.get(field);
    return !!control && control.touched && control.invalid;
  }
}