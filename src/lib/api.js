import { clearSession } from './authStore.js';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://172.16.1.101:5006';

export class ApiError extends Error {
  constructor(message, { responsecode, status } = {}) {
    super(message || 'Something went wrong. Please try again.');
    this.name = 'ApiError';
    this.responsecode = responsecode;
    this.status = status;
  }
}

/**
 * Fired whenever any API call comes back 401 (e.g.
 * { "status": "FAILURE", "message": "Token expired" }). AuthContext listens
 * for this to clear its in-memory session and let ProtectedRoute's redirect
 * to /login take over — this module can't call useNavigate() directly since
 * it isn't a component/hook.
 */
export const SESSION_EXPIRED_EVENT = 'nexus:session-expired';

function handleUnauthorized() {
  clearSession();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

async function request(path, { method = 'POST', body, token, isFormData = false, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
         'X-Channel': 'web',

        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {

    if (err?.name === 'AbortError') throw err;

    throw new ApiError('Unable to reach the server. Please check your connection and try again.');
  }

  if (response.status === 401) {
    handleUnauthorized();
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {

  }

  if (!payload || payload.responsecode !== '00') {
    throw new ApiError(payload?.message || `Request failed (${response.status}).`, {
      responsecode: payload?.responsecode,
      status: response.status,
    });
  }

  return payload;
}


export function loginRequest(email, password) {
  return request('/hms/candidate/login', { body: { email, password } });
}


export function logoutRequest(token) {
  return request('/hms/candidate/logout', { token });
}


export function forgotPasswordRequest(email) {
  return request('/hms/candidate/forgot-password', { body: { email } });
}

export function getCandidateOffersRequest(token, signal) {
  return request('/hms/candidate/candidate-offers', { method: 'GET', token, signal });
}

export function getOfferDetailsByApplicantIdRequest(token, applicantId, signal) {
  return request(`/hms/offer-details/get-offer-details-by-applicant-id/${applicantId}`, {
    method: 'GET',
    token,
    signal,
  });
}

/**
 * POST /hms/candidate/negotiate-offer — multipart/form-data with a JSON
 * "request" part:
 *   { offerId, applicantId, jobId, overallJustification, others,
 *     joiningDate, negotiation: [{ fieldName, requestedAmount, reason }] }
 * plus zero or more "files" parts (supporting documents). Same Blob-typed
 * JSON part pattern used by createCandidateRequest/resumeReuploadRequest —
 * a plain string part has no Content-Type and Spring rejects it as
 * octet-stream.
 */
export function negotiateOfferRequest(token, payload, files = []) {
  const form = new FormData();
  const requestBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  form.append('request', requestBlob);
  files.forEach((file) => form.append('files', file));

  return request('/hms/candidate/negotiate-offer', { token, body: form, isFormData: true });
}

const OFFER_LETTER_PATH = '/hms/offer-details/download/offerLetter';


export function offerLetterUrl(applicantId, action = 'view') {
  return `${API_BASE_URL}${OFFER_LETTER_PATH}?appId=${applicantId}&action=${action}`;
}

export async function fetchOfferLetterBlob(token, applicantId, action, signal) {
  let response;
  try {
    response = await fetch(offerLetterUrl(applicantId, action), {
      headers: {
        'X-Channel': 'web',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Unable to reach the server. Please check your connection and try again.');
  }
  if (response.status === 401) {
    handleUnauthorized();
  }
  if (!response.ok) {
    throw new ApiError(`Could not load the offer letter (${response.status}).`, { status: response.status });
  }
  return response.blob();
}

export function getCandidateInterviewsRequest(token, signal) {
  return request('/hms/candidate/interviews', { method: 'GET', token, signal });
}

export function getMyApplicationsRequest(token, signal) {
  return request('/hms/candidate/get-my-applications', { method: 'GET', token, signal });
}
//jobs-api
export function getJobsList(token, payload, signal) {
  return request('/hms/create-job/get-all-jobs', { token, body: payload, signal });
}

export function getJobDetailsByIdRequest(token, jobId, signal) {
  return request(`/hms/create-job/get-job-details/${jobId}`, { method: 'GET', token, signal });
}

/** GET /hms/candidate/details/:candidateId — the candidate's own profile (name, email, phone, resume/additionalFile storage paths). */
export function getCandidateDetailsRequest(token, candidateId, signal) {
  return request(`/hms/candidate/details/${candidateId}`, { method: 'GET', token, signal });
}

/**
 * POST /hms/candidate/apply-job — multipart/form-data, "data" part:
 *   { candidateId, jobId }
 * plus an optional "resume" file part. When the candidate applies with
 * their resume already on file, no "resume" part is sent at all (the
 * backend already has it, keyed by candidateId); it's only attached when
 * they explicitly upload a new one for this application.
 */
export function applyJobRequest(token, { candidateId, jobId, resumeFile }) {
  const form = new FormData();
  const dataBlob = new Blob([JSON.stringify({ candidateId, jobId })], { type: 'application/json' });
  form.append('data', dataBlob);
  if (resumeFile) form.append('resume', resumeFile);

  return request('/hms/candidate/apply-job', { token, body: form, isFormData: true });
}

export function changePasswordRequest(token, { oldPassword, newPassword }) {
  return request('/hms/candidate/change-password', {
    token,
    body: { oldPassword, newPassword },
  });
}

export function resumeReuploadRequest(token, { applicationId, updateProfileResume, resumeFile }) {
  const form = new FormData();
  const dataBlob = new Blob([JSON.stringify({ applicationId, updateProfileResume })], {
    type: 'application/json',
  });
  form.append('data', dataBlob);
  if (resumeFile) form.append('resume', resumeFile);

  return request('/hms/candidate/resume/reupload', { token, body: form, isFormData: true });
}

export function createCandidateRequest({
  firstName,
  lastName,
  email,
  phoneNumber,
  password,
  confirmPassword,
  resumeFile,
  additionalFile,
}) {
  const form = new FormData();

  const dataBlob = new Blob(
    [JSON.stringify({ firstName, lastName, email, phoneNumber, password,confirmPassword })],
    { type: 'application/json' },
  );
  form.append('data', dataBlob);
  if (resumeFile) form.append('resume', resumeFile);
  if (additionalFile) form.append('additionalFile', additionalFile);

  return request('/hms/candidate/create', { body: form, isFormData: true });
}
