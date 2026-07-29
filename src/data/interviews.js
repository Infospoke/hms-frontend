
function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const date = new Date(`${dateStr}T${timeStr}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLabel(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateParts(dateStr) {
  const date = dateStr ? new Date(`${dateStr}T00:00:00`) : null;
  if (!date || Number.isNaN(date.getTime())) return { month: '—', day: '—' };
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.toLocaleDateString('en-US', { day: '2-digit' }),
  };
}

function formatTimeRange(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit' };
  const startLabel = start ? start.toLocaleTimeString('en-US', opts) : null;
  const endLabel = end ? end.toLocaleTimeString('en-US', opts) : null;
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel || endLabel || null;
}


function formatDuration(start, end) {
  if (!start || !end) return null;
  const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (diffMinutes <= 0) return null;
  if (diffMinutes % 60 === 0) {
    const hours = diffMinutes / 60;
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${diffMinutes} mins`;
}

/** Best-effort category from the free-text `interviewType` the API returns. */
function classifyInterviewType(label = '') {
  const value = label.toLowerCase();
  if (value.includes('ai')) return 'ai';
  if (value.includes('tech')) return 'technical';
  if (value.includes('manag')) return 'managerial'; // also catches the "Mangerial" typo seen in the data
  if (value.includes('hr')) return 'hr';
  return 'other';
}

/** Maps one record from GET /hms/candidate/interviews into what the Interview cards render. */
export function normalizeApiInterview(raw) {
  const jobTitle = (raw.jobTitle || '').trim();
  const interviewType = (raw.interviewType || '').trim();
  const start = combineDateAndTime(raw.interviewDate, raw.startTime);
  const end = combineDateAndTime(raw.interviewDate, raw.endTime);
  const { month, day } = formatDateParts(raw.interviewDate);

  return {
    id: `${raw.applicationId}-${raw.currentStageId}-${raw.interviewDate}-${raw.startTime}`,
    applicationId: raw.applicationId,
    currentStageId: raw.currentStageId,
    jobTitle,
    interviewType,
    typeCategory: classifyInterviewType(interviewType),
    dateMonth: month,
    dateDay: day,
    dateLabel: formatDateLabel(raw.interviewDate),
    timeRange: formatTimeRange(start, end),
    durationLabel: formatDuration(start, end),
    recruiterName: raw.recruiterName,
    meetingLink: raw.meetingLink,
    venueDetails: raw.venueDetails,
    isOnline: Boolean(raw.meetingLink),
    // No explicit status field from the API — treat anything whose start
    // time has already passed as history, everything else as upcoming.
    isUpcoming: start ? start.getTime() >= Date.now() : true,
  };
}
