import { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import { setSession } from "../../services/authService";
import ActionButton from "../../components/Buttons/ActionButtons";
import { toast } from "../../components/Toast/toast";

const LoginPage = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await userService.loginUser({ user, password });
      setSession({ ...response.user, expires_at: response.expires_at });
      setUser("");
      setPassword("");
      navigate("/");
    } catch (error: unknown) {
      setSession(null);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { error?: string } };
        };
        const message = axiosError.response?.data?.error || "Login failed";
        toast.error(message);
      } else {
        toast.error("Ndodhi një gabim i papritur. Provo përsëri.");
      }
    }
  };

  const handleViewPassword = () => {
    setViewPassword(!viewPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="card w-full max-w-md flex flex-col items-center space-y-6">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Hyni në profilin tuaj
        </h2>
        <p className="text-gray-400 text-sm mb-4">PPL App</p>
        <div className="w-full flex flex-col space-y-4">
          <input
            className="border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition placeholder-gray-500 text-base bg-black text-white"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
          />
          <div className="relative">
            <input
              className="border border-neutral-700 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-neutral-600 transition placeholder-gray-500 text-base pr-12 bg-black text-white"
              placeholder="Password"
              type={viewPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white focus:outline-none cursor-pointer"
              onClick={handleViewPassword}
              tabIndex={-1}
            >
              {viewPassword ? "Fshih" : "Shfaq"}
            </button>
          </div>
        </div>
        <ActionButton
          onClick={handleLogin}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2 rounded-lg shadow border border-neutral-700 transition-none mt-2"
        >
          Hyr
        </ActionButton>
      </div>
    </div>
  );
};

export default LoginPage;
