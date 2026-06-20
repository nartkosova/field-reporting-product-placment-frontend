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
