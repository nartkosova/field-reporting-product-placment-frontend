import axios from "axios";

// The session token lives in an httpOnly cookie that page scripts cannot
// read. The browser only keeps the non-secret profile, to render the UI and
// to know when the session has run out.
export interface SessionUser {
  user_id: number;
  user: string;
  role: string;
}

interface StoredSession extends SessionUser {
  expires_at: string;
}

const SESSION_KEY = "authSession";
const SESSION_EVENT = "authTokenChanged";
const LOGIN_PATH = "/login";
const baseUrl = import.meta.env.VITE_BASE_URL;

// Tokens used to be kept in localStorage; drop any left behind.
localStorage.removeItem("authToken");

export const setSession = (session: StoredSession | null) => {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }

  window.dispatchEvent(new Event(SESSION_EVENT));
};

export const getSessionUser = (): SessionUser | null => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as StoredSession | null;
    if (!session || new Date(session.expires_at).getTime() <= Date.now()) return null;
    return { user_id: session.user_id, user: session.user, role: session.role };
  } catch {
    return null;
  }
};

export const hasValidSession = () => getSessionUser() !== null;

// Kept for the services that still build an Authorization header; the cookie
// authenticates instead and the interceptor below drops the header.
export const getToken = (): string | null => null;

const redirectToLogin = () => {
  if (window.location.pathname === LOGIN_PATH) return;
  window.location.assign(LOGIN_PATH);
};

export const logout = async () => {
  setSession(null);
  try {
    await axios.post(`${baseUrl}/api/users/logout`);
  } catch {
    // The local session is gone either way; the cookie expires on its own.
  }
};

/** Drops the session and sends the user back to the login screen. */
export const endSession = () => {
  setSession(null);
  redirectToLogin();
};

/**
 * Sends cookies with every API call, and sends the user to the login page
 * whenever the API rejects their session. Skips the login request itself (a
 * wrong password is a form error, not an expired session) and skips offline
 * failures, which the queue handles.
 */
export const setupAuthInterceptor = () => {
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use((config) => {
    config.headers?.delete?.("Authorization");
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const url: string = error?.config?.url || "";
      const isLoginRequest = url.includes("/api/users/login");

      if ((status === 401 || status === 403) && !isLoginRequest && navigator.onLine) {
        endSession();
      }

      return Promise.reject(error);
    }
  );
};
