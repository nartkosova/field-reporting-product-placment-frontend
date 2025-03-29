import { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../Services/userService";

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
      userService.setToken(response.token);
      setUser("");
      setPassword("");
      navigate("/");
    } catch (error) {
      userService.setToken("");
      alert(error);
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
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default LoginPage;
