


function formatDateLabel(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTimeLabel(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${datePart} at ${timePart}`;
}

export function normalizeTimelineEntry(raw, index) {
  const roundName = (raw.roundName || '').trim();
  const isCompleted = Boolean(raw.completedDate);
  const isScheduled = !isCompleted && Boolean(raw.scheduledDate);

  return {
    key: `${index}-${roundName}`,
    roundName,
    status: isCompleted ? 'completed' : isScheduled ? 'in-progress' : 'upcoming',
    dateLabel: isCompleted
      ? `Completed ${formatDateTimeLabel(raw.completedDate)}`
      : isScheduled
        ? `Scheduled for ${formatDateTimeLabel(raw.scheduledDate)}`
        : null,
  };
}


const REUPLOAD_MESSAGE =
  "Your recruiter has requested an updated resume for this application — could you upload a new version so our team can take a proper look?";

export function normalizeApiApplication(raw) {
  const timeline = (raw.timeline || []).map(normalizeTimelineEntry);
  const reuploadRequested = raw.reuploadStatus === 'REQUESTED';

  const inProgressIndex = timeline.findIndex((entry) => entry.status === 'in-progress');
  const completedCount = timeline.filter((entry) => entry.status === 'completed').length;
  const activeIndex = inProgressIndex >= 0 ? inProgressIndex : Math.max(completedCount - 1, 0);

  return {
    applicationId: raw.applicationId,
    jobId: raw.jobId,
    jobTitle: (raw.jobTitle || '').trim(),
    location: raw.location,
    employmentType: raw.employmentType,
    appliedDaysAgo: raw.daysAfterApplied,
    appliedDateLabel: formatDateLabel(raw.appliedDate),
    currentRound: (raw.currentRound || '').trim(),
    completedRounds: completedCount,
    totalRounds: timeline.length,
    activeIndex,
    timeline,
    reuploadRequested,
    reuploadMessage: reuploadRequested ? REUPLOAD_MESSAGE : null,
  };
}