import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import Header from "./Navigation/Header";
import { useEffect, useState } from "react";
import userService from "./Services/userService";
import PodravkaFacingsFormPage from "./PPL/PPLForm";
import FacingsSelector from "./PPL/PPLFacingsSelector";
import CompetitorFacingsFormPage from "./PPL/PPLCompetitor";
import ReportView from "./ReportView/ReportHeader";
import StoreSelector from "./Components/StoreList/StoreSelector";
import PhotoSelector from "./Photos/PhotosSelector";
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
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="h-screen">
      {loggedIn ? <Header /> : null}
      <Routes>
        {loggedIn ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
            <Route path="/store" element={<StoreSelector />} />
            <Route path="/store/:id" element={<FacingsSelector />} />
            <Route
              path="/ppl/store/:id/ppl-podravka"
              element={<PodravkaFacingsFormPage />}
            />
            <Route
              path="/ppl/store/:id/ppl-konkurrenca"
              element={<CompetitorFacingsFormPage />}
            />
            <Route path="/reports" element={<ReportView />} />
            <Route path="/photos" element={<StoreSelector />} />
            <Route path="/photos/:id" element={<PhotoSelector />} />
          </>
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
