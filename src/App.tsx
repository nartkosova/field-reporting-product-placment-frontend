import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import Header from "./Navigation/Header";
import PodravkaFacingsFormPage from "./PPL";
import { useEffect, useState } from "react";
import userService from "./Services/userService";
const App = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("authToken");
    setLoggedIn(loggedUserJSON);
    if (loggedUserJSON) {
      userService.setToken(loggedUserJSON);
    } else {
      userService.setToken("");
    }
  }, [navigate]);

  return (
    <div className="h-screen">
      {loggedIn ? <Header /> : null}
      <Routes>
        {loggedIn ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/ppl" element={<PodravkaFacingsFormPage />} />
          </>
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
