import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import Header from "./Navigation/Header";
import { useEffect, useState } from "react";
import PodravkaFacingsFormPage from "./PPL/PPLPodravka";
import FacingsSelector from "./PPL/PPLFacingsSelector";
import CompetitorFacingsFormPage from "./PPL/PPLCompetitor";
import ReportView from "./ReportView/ReportHeader";
import StoreSelector from "./Components/StoreList/StoreSelector";
import PhotoSelector from "./Photos/PhotosSelector";
import PriceCheckSelector from "./PriceCheck/PriceCheckSelector";
import PriceCheckPodravka from "./PriceCheck/PriceCheckPodravka";
import PriceCheckCompetitor from "./PriceCheck/PriceCheckCompetitor/PriceCheckCompetitor";
import { setToken } from "./Services/authService";
import PhotoUploadPage from "./Photos/PhotoUploadPage";
import PhotoReportHeader from "./PhotoReports/PhotoReportHeader";

const App = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRole = userInfo?.role;
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("authToken");
    setLoggedIn(loggedUserJSON);
    if (loggedUserJSON) {
      setToken(loggedUserJSON);
    } else {
      setToken("");
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
            <Route path="/ppl-store" element={<StoreSelector />} />
            <Route path="/ppl-store/:id" element={<FacingsSelector />} />
            <Route
              path="/ppl-store/:id/ppl-podravka"
              element={<PodravkaFacingsFormPage />}
            />
            <Route
              path="/ppl-store/:id/ppl-konkurrenca"
              element={<CompetitorFacingsFormPage />}
            />
            <Route path="/photos" element={<StoreSelector />} />
            <Route path="/photos/:id" element={<PhotoSelector />} />
            <Route
              path="/photos/:storeId/primare"
              element={<PhotoUploadPage photoType="regular_shelf" />}
            />
            <Route
              path="/photos/:storeId/sekondare"
              element={<PhotoUploadPage photoType="secondary_position" />}
            />
            <Route
              path="/photos/:storeId/terciare"
              element={<PhotoUploadPage photoType="other_position" />}
            />
            <Route path="/price-check" element={<StoreSelector />} />
            <Route path="/price-check/:id" element={<PriceCheckSelector />} />
            <Route
              path="/price-check/:id/podravka"
              element={<PriceCheckPodravka />}
            />
            <Route
              path="/price-check/:id/konkurrenca"
              element={<PriceCheckCompetitor />}
            />
            {userRole === "admin" && (
              <>
                <Route path="/photos/report" element={<PhotoReportHeader />} />
                <Route path="/reports" element={<ReportView />} />
              </>
            )}
          </>
        ) : (
          <Route path="/login" element={<LoginPage />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
