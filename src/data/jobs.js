import { Compass, Hexagon, HeartPulse, GraduationCap, Clock, Monitor } from 'lucide-react';


export const BENEFITS = [
  { icon: Compass, title: 'Remote-first', description: 'Work from anywhere, async by default' },
  { icon: Hexagon, title: 'Equity for all', description: 'Meaningful ownership from day one' },
  { icon: HeartPulse, title: 'Health, fully covered', description: 'Medical, dental & vision for you + family' },
  { icon: GraduationCap, title: 'Learning budget', description: '$2,000/yr for courses, books & conferences' },
  { icon: Clock, title: 'Flexible time off', description: 'Take what you need — we mean it' },
  { icon: Monitor, title: 'Home office setup', description: 'A budget to build your ideal workspace' },
];

export const LIFE_AT_NEXUS =
  "We're a remote-first team that cares deeply about craft and about each other. We work async, document generously, and protect focus time. Twice a year we gather in person to build, share, and celebrate.";

export const MODE_TYPE_TABS = [
  { id: 'all', label: 'All roles' },
  { id: 'On-site', label: 'On-site' },
  { id: 'Hybrid', label: 'Hybrid' },
  { id: 'Remote', label: 'Remote' },
];


export const LEVEL_FILTER_OPTIONS = ['All levels', 'Junior', 'Mid', 'Senior', 'Staff / Lead'];

export function deriveLevel(minExperience, maxExperience) {
  const min = Number(minExperience) || 0;
  const max = Number(maxExperience) || min;
  const midpoint = (min + max) / 2;
  if (midpoint < 2) return 'Junior';
  if (midpoint < 5) return 'Mid';
  if (midpoint < 10) return 'Senior';
  return 'Manager';
}

export function formatExperienceRange(minExperience, maxExperience) {
  const min = Number(minExperience) || 0;
  const max = Number(maxExperience);
  if (!max || max <= min) return `${min}+ yrs experience`;
  return `${min}–${max} yrs experience`;
}


function fixExplodedString(str) {
  if (typeof str !== 'string' || !str.includes(', ')) return str;
  const parts = str.split(', ');
  if (parts.length < 4) return str;
  const singleCharShare = parts.filter((p) => p.length <= 1).length / parts.length;
  return singleCharShare > 0.6 ? parts.join('') : str;
}

/** Recursively applies fixExplodedString to every string found in an object/array. */
function deepFixExplodedStrings(value) {
  if (typeof value === 'string') return fixExplodedString(value);
  if (Array.isArray(value)) return value.map(deepFixExplodedStrings);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepFixExplodedStrings(v)]));
  }
  return value;
}

export function normalizeJobSummary(raw) {
  const minExperience = raw.minExperience ?? 0;
  const maxExperience = raw.maxExperience ?? minExperience;
  return {
    id: raw.jobId,
    jobId: raw.jobId,
    jobCode: raw.jobCode,
    title: raw.jobTitle,
    location: (raw.Location || raw.location || '').trim(),
    modeType: raw.modeType,
    remote: raw.modeType === 'Remote',
    minExperience,
    maxExperience,
    experienceLabel: formatExperienceRange(minExperience, maxExperience),
    level: deriveLevel(minExperience, maxExperience),
    skills: raw.skillsMustHave || [],
    totalApplications: raw.totalApplications ?? 0,
    completedAiInterviews: raw.completedAiInterviews ?? 0,
  };
}

export function matchesLevelFilter(job, level) {
  if (!level || level === 'All levels') return true;
  return job.level === level;
}

/**
 * `fallbackJobId` should be the id the caller already knows (the route
 * param, or the id used to fetch this job in the first place) — the
 * get-job-details response's `jobOverview` doesn't actually include a
 * `jobId` field, so without a fallback this silently comes back
 * `undefined` and breaks every link built from `job.jobId` (Apply now,
 * "Back to role", etc).
 */
export function normalizeJobDetail(rawInput, fallbackJobId) {
  const raw = deepFixExplodedStrings(rawInput || {});
  const overview = raw.jobOverview || {};
  const description = (raw.jobDescription?.description || [])[0] || {};
  const sourcing = raw.sourcingStrategy || {};
  const recruiters = raw.recruiters?.recruiters || [];
  const applicants = raw.applicantsCount || {};

  const minExperience = overview.minExperience ?? 0;
  const maxExperience = overview.maxExperience ?? minExperience;

  return {
    jobId: overview.jobId ?? fallbackJobId ?? null,
    title: overview.jobTitle || description.jobTitle,
    jobCode: overview.jobCode,
    businessUnit: overview.businessUnit,
    department: overview.department,
    location: overview.location || description.location,
    country: overview.country,
    openings: overview.openings,
    targetStartDate: overview.targetStartDate,
    workMode: overview.workMode || description.workMode,
    employmentType: overview.employmentType || description.employmentType,
    minExperience,
    maxExperience,
    experienceLabel: formatExperienceRange(minExperience, maxExperience),
    level: deriveLevel(minExperience, maxExperience),
    skillsMustHave: overview.skillsMustHave || description.skillsMustHave || [],
    niceToHaveSkills: overview.niceToHaveSkills || description.niceToHaveSkills || [],
    additionalNotes: overview.additionalNotes,

    summary: description.jobSummary,
    aboutCompany: description.aboutCompany,
    keyResponsibilities: description.keyResponsibilities || [],
    basicQualifications: description.basicQaulifications || [],
    preferredQualifications: description.preferredQualifications || [],
    educationRequirements: description.educationRequirements,
    experienceRequirements: description.experienceRequirements,
    certificationsRequired: description.certificationsRequired || [],
    languagesRequired: description.languagesRequired || [],

    sourcingChannels: sourcing.sourcingChannels || {},
    referral: sourcing.referral,
    referralAmount: sourcing.referralAmount,

    recruiters: recruiters.map((r) => ({
      name: r.userName,
      email: r.email,
      assignedAt: r.assignedAt,
      initials: (r.userName || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(''),
    })),

    applicantCount: applicants.applicantCount ?? 0,
    resumeCount: applicants.resumeCount ?? 0,
    shortlisted: applicants.shortlisted ?? 0,
    interviewCount: applicants.interviewCount ?? 0,
    offerReleased: applicants.offerReleased ?? 0,
    hiredCount: applicants.hiredCount ?? 0,
  };
}
