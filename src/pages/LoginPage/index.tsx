import { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import { setToken } from "../../services/authService";
import ActionButton from "../../components/Buttons/ActionButtons";
const LoginPage = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await userService.loginUser({ user, password });
      window.localStorage.setItem("authToken", response.token);
      window.localStorage.setItem("userInfo", JSON.stringify(response.user));
      setToken(response.token);
      setUser("");
      setPassword("");
      navigate("/");
    } catch (error: unknown) {
      setToken("");
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { error?: string } };
        };
        const message = axiosError.response?.data?.error || "Login failed";
        alert(message);
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  const handleViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>
      <input
        className="border px-3 py-2"
        placeholder="User"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        className="border px-3 py-2"
        placeholder="Password"
        type={viewPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="cursor-pointer" onClick={handleViewPassword}>
        {viewPassword ? "Hide Password" : "Show Passowrd"}
      </p>
      <ActionButton onClick={handleLogin}>Login</ActionButton>
    </div>
  );
};

export default LoginPage;
