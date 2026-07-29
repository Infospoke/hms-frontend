import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, setSession, clearSession } from '../lib/authStore.js';
import { logoutRequest, SESSION_EXPIRED_EVENT } from '../lib/api.js';
import { decodeJwt, isTokenExpired } from '../utils/jwt.js';

const AuthContext = createContext(null);


function sessionFromToken(token) {
  const payload = decodeJwt(token);
  if (!payload || isTokenExpired(payload)) return null;

  const firstName = payload.firstName || '';
  const lastName = payload.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'NA';

  return {
    token,
    user: {
      candidateId: payload.candidateId,
      email: payload.sub,
      firstName,
      lastName,
      candidateName: payload.candidateName || `${firstName} ${lastName}`.trim(),
      loginType: payload.loginType,
      initials,
    },
  };
}


function loadValidSession() {
  const stored = getSession();
  if (!stored?.token) return null;

  const payload = decodeJwt(stored.token);
  if (!payload || isTokenExpired(payload)) {
    clearSession();
    return null;
  }
  return stored;
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => loadValidSession());

  useEffect(() => {
    const onStorage = () => setSessionState(loadValidSession());
    // api.js already clears localStorage on any 401 before firing this —
    // just drop the in-memory session so isAuthenticated flips to false and
    // ProtectedRoute's <Navigate to="/login"> takes it from there.
    const onSessionExpired = () => setSessionState(null);
    window.addEventListener('storage', onStorage);
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, []);

  const login = useCallback((token) => {
    const next = sessionFromToken(token);
    if (!next) return false;
    setSession(next);
    setSessionState(next);
    return true;
  }, []);

  const logout = useCallback(async () => {
    const token = session?.token;
    
    clearSession();
    setSessionState(null);

    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // Best-effort — the candidate is already signed out locally.
      }
    }
  }, [session]);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      
      isAuthenticated: Boolean(session?.user),
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
