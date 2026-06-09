import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface Channel {
  id: string;
  name: string;
  iconText: string;
  iconBg: string;
  iconColor: string;
  bestFor: string;
  cost: 'Paid' | 'Free';
  isRecommended: boolean;
  hasReferralAmount: boolean;
  enabled: boolean;
  referralAmount?: number;
}

const WHY_REASONS = [
  'High visibility among Indian job seekers',
  'Better match for this role & experience level',
  'Improved response rate',
  'Industry standard channels selected',
];

@Component({
  selector: 'app-sourcing-strategy-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sourcing-strategy.component.html',
  styleUrl: './sourcing-strategy.component.scss',
})
export class SourcingStrategyStepComponent implements OnInit {
  @Input() form!: FormGroup;

  whyReasons = WHY_REASONS;

  channels: Channel[] = [
    { id: 'linkedin',  name: 'LinkedIn',       iconText: 'in', iconBg: '#0a66c2', iconColor: '#fff',     bestFor: 'Professional & experienced candidates',   cost: 'Paid',  isRecommended: false, hasReferralAmount: false, enabled: true  },
    { id: 'indeed',    name: 'Indeed',               iconText: 'i',  iconBg: '#003a9b', iconColor: '#fff',     bestFor: 'Large volume of active job seekers',       cost: 'Paid',  isRecommended: false, hasReferralAmount: false, enabled: false  },
    { id: 'naukri',    name: 'Naukri',           iconText: 'N',  iconBg: '#ff7555', iconColor: '#fff',     bestFor: 'Active job seekers across India',          cost: 'Paid',  isRecommended: false, hasReferralAmount: false, enabled: true  },
    { id: 'internal',  name: 'Internal Career Site', iconText: '🏢', iconBg: '#e0f2fe', iconColor: '#0369a1',  bestFor: 'Internal & past applicants',               cost: 'Free',  isRecommended: false, hasReferralAmount: false, enabled: false  },
    { id: 'referral',  name: 'Employee Referral',    iconText: '👥', iconBg: '#dcfce7', iconColor: '#16a34a',  bestFor: 'Quality hires through employee network',   cost: 'Free',  isRecommended: true,  hasReferralAmount: true,  enabled: false, referralAmount: 0 },
    { id: 'monster',   name: 'Monster',              iconText: 'M',  iconBg: '#6d28d9', iconColor: '#fff',     bestFor: 'Diverse talent pool',                     cost: 'Paid',  isRecommended: false, hasReferralAmount: false, enabled: false },
    { id: 'shine',     name: 'Shine.com',            iconText: 'S',  iconBg: '#fbbf24', iconColor: '#fff',     bestFor: 'Mid-level professionals',                 cost: 'Paid',  isRecommended: false, hasReferralAmount: false, enabled: false },
    { id: 'timesjobs', name: 'TimesJobs',            iconText: 'T',  iconBg: '#dc2626', iconColor: '#fff',     bestFor: 'Experienced professionals',               cost: 'Paid',  isRecommended: false, hasReferralAmount: false, enabled: false },
    { id: 'apna',      name: 'Apna',                 iconText: 'A',  iconBg: '#0891b2', iconColor: '#fff',     bestFor: 'Blue collar & local candidates',           cost: 'Free',  isRecommended: false, hasReferralAmount: false, enabled: false },
  ];

  ngOnInit(): void {
    if (!this.form.get('selectedChannels')) {
      this.form.addControl('selectedChannels', new FormControl([]));

    }

    this.syncForm();
    if (!this.form.get('referralAmount')) {
      this.form.addControl('referralAmount', new FormControl(5000));
    }
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get selectedChannels(): Channel[] {
    return this.channels.filter(c => c.enabled);
  }

  get selectedCount(): number {
    return this.selectedChannels.length;
  }

  getReferralChannel(): Channel | undefined {
    return this.channels.find(c => c.id === 'referral');
  }

  // ── Toggle ────────────────────────────────────────────────────────────────
  toggle(channel: Channel): void {
    channel.enabled = !channel.enabled;
    this.syncForm();
  }

  removeChannel(channel: Channel): void {
    channel.enabled = false;
    this.syncForm();
  }

  clearAll(): void {
    this.channels.forEach(c => c.enabled = false);
    this.syncForm();
  }

  onReferralAmountChange(channel: Channel): void {
    this.form.get('referralAmount')?.setValue(channel.referralAmount);
    this.syncForm();
  }

private syncForm(): void {
  const payloadChannels = this.channels.map(channel => {
    const data: any = {
      channelName: channel.name,
      postJob:     channel.enabled,
      iconText:    channel.iconText,
      iconBg:      channel.iconBg,
      iconColor:   channel.iconColor,
      bestFor:     channel.bestFor,
      cost:        channel.cost,
    };
    if (channel.hasReferralAmount && channel.referralAmount) {
      data.referralAmount = String(channel.referralAmount);
    }
    return data;
  });
  this.form.get('selectedChannels')?.setValue(payloadChannels);
}

  formatAmount(n: number): string {
    return n ? n.toLocaleString('en-IN') : '0';
  }
}
