import axios from "axios";
import { jwtDecode } from "jwt-decode";

let token: string | null = null;

export const setToken = (newToken: string | null) => {
  token = newToken ? `${newToken}` : null;

  if (newToken) {
    localStorage.setItem("authToken", newToken);
  } else {
    localStorage.removeItem("authToken");
  }

  window.dispatchEvent(new Event("authTokenChanged"));
};

export const getToken = () => token || localStorage.getItem("authToken");

const LOGIN_PATH = "/login";

/**
 * Tokens now carry an expiry. A decoded-but-expired token must not count as a
 * session, otherwise the guard lets the user in and every request 401s.
 */
export const isTokenExpired = (value: string | null): boolean => {
  if (!value) return true;

  try {
    const { exp } = jwtDecode<{ exp?: number }>(value);
    // A token with no exp claim never expires client-side.
    if (typeof exp !== "number") return false;
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const hasValidSession = () => !isTokenExpired(getToken());

const redirectToLogin = () => {
  if (window.location.pathname === LOGIN_PATH) return;
  window.location.assign(LOGIN_PATH);
};

/** Drops the session and sends the user back to the login screen. */
export const endSession = () => {
  setToken(null);
  redirectToLogin();
};

/**
 * Sends the user to the login page whenever the API rejects their token.
 * Skips the login request itself (a wrong password is a form error, not an
 * expired session) and skips offline failures, which the queue handles.
 */
export const setupAuthInterceptor = () => {
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
