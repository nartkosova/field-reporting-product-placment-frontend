// eslint-disable-next-line @typescript-eslint/no-unused-vars
let token: string | null = null;

export const setToken = (newToken: string) => {
  token = `${newToken}`;
};

export const getToken = () => token || localStorage.getItem("authToken");
