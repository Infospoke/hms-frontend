export type TabKey = 'applied' | 'screening' | 'interview' | 'offer' | 'hired';

export interface Candidate {
  id: number;
  jobId?: number;
  name: string;
  initials: string;
  avatarBg: string;
  role: string;
  appliedDate: string;
  createdDateRaw: Date | null;
  skills: string[];
  skillsIdentified: string[];
  experience: string;
  source: string;
  location: string;
  status: string;
  displayStatus: string;
  matchScore: string;
  email: string;
  phone: string;
  recruiterNote: string;
  keywordMatch: number;
  experienceMatch: number;
  portfolioQuality: number;
  skillScore: number;
  experienceScore: number;
  keywordScore: number;
  screeningData?: any;
  interviewData?: any;
  postedOn?: string;
}
