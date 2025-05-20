export const getToken = () => localStorage.getItem("authToken");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let token = null;

export const setToken = (newToken: string) => {
  token = `${newToken}`;
};
