import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Header from "./pages/Navigation/Header";
import { useEffect, useState } from "react";
import PodravkaFacingsFormPage from "./pages/PPL/PPLPodravka/PPLPodravka";
import FacingsSelector from "./pages/PPL/PPLCompanySelector";
import CompetitorFacingsFormPage from "./pages/PPL/PPLCompetitor/PPLCompetitor";
import ReportView from "./pages/ReportView/ReportHeader";
import StoreSelector from "./components/StoreList/StoreSelector";
import PhotoSelector from "./pages/Photos/PhotosSelector";
// import PriceCheckSelector from "./pages/PriceCheck/PriceCheckSelector";
// import PriceCheckPodravka from "./pages/PriceCheck/PriceCheckPodravka";
// import PriceCheckCompetitor from "./pages/PriceCheck/PriceCheckCompetitor/PriceCheckCompetitor";
import { setToken } from "./services/authService";
import PhotoUploadPage from "./pages/Photos/PhotoUploadPage";
import PhotoReportHeader from "./pages/PhotoReports/PhotoReportHeader";
import PodravkaPPLEditor from "./pages/PPL/PPLPodravka/PodravkaPPLList";
import UpdatePodravkaFacingsPage from "./pages/PPL/PPLPodravka/UpdatePodravkaFacings";
import CreateCompetitorBrand from "./pages/Features/Competitor/CreateCompetitorBrand";
import SelectCreateEdit from "./pages/SelectCreateUpdate/SelectCreateUpdate";
import CreateCompetitorProduct from "./pages/Features/Products/CreateCompetitorProduct";
import CreateUser from "./pages/Features/Users/CreateUser";
import CompetitorList from "./pages/Features/Competitor/CompetitorList";
import UpdateCompetitorBrand from "./pages/Features/Competitor/UpdateCompetitorBrand";
import UserList from "./pages/Features/Users/UserList";
import UpdateUser from "./pages/Features/Users/UpdateUser";
import CompetitorProductList from "./pages/Features/Products/ProductList";
import UpdateCompetitorProduct from "./pages/Features/Products/UpdateCompetitorProducts";
import PhotoList from "./pages/Photos/PhotoList";
import UpdatePhotoPage from "./pages/Photos/UpdateProdravkaPhotos";
import Stores from "./pages/Features/Stores/Stores";
import CreateStorePage from "./pages/Features/Stores/CreateStore";
import UpdateStore from "./pages/Features/Stores/UpdateStore";
import PhotoCompanySelector from "./pages/Photos/PhotoCompanySelector";
import CompetitorPPLEditor from "./pages/PPL/PPLCompetitor/CompetitorPPLList";
import UpdateCompetitorFacings from "./pages/PPL/PPLCompetitor/UpdateCompetitorFacings";

const App = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userRole = userInfo?.role;
  useEffect(() => {
    const loggedUserJSON = localStorage.getItem("authToken");
    const userInfoJSON = localStorage.getItem("userInfo");

    if (loggedUserJSON && userInfoJSON) {
      const parsedUser = JSON.parse(userInfoJSON);
      if (parsedUser?.id || parsedUser?.role) {
        setLoggedIn(loggedUserJSON);
        setToken(loggedUserJSON);
        return;
      }
    }

    setLoggedIn(null);
    setToken("");
    navigate("/login");
  }, [navigate]);

  return (
    <div>
      {loggedIn ? <Header /> : null}
      <Routes>
        {loggedIn ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
            {userRole !== "admin" && (
              <>
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
                <Route path="/ppl-podravka" element={<PodravkaPPLEditor />} />
                <Route
                  path="/ppl-podravka/edit/:batchId"
                  element={<UpdatePodravkaFacingsPage />}
                />
                <Route
                  path="/ppl-konkurrenca"
                  element={<CompetitorPPLEditor />}
                />
                <Route
                  path="/ppl-konkurrenca/edit/:batchId"
                  element={<UpdateCompetitorFacings />}
                />
                <Route path="/photos" element={<StoreSelector />} />
                <Route
                  path="/photos/:storeId"
                  element={<PhotoCompanySelector />}
                />
                <Route path="/photos/edit" element={<PhotoList />} />
                <Route path="/photos/edit/:id" element={<UpdatePhotoPage />} />
                <Route
                  path="/photos/:id/:company"
                  element={<PhotoSelector />}
                />
                <Route
                  path="/photos/:storeId/:company/primare"
                  element={<PhotoUploadPage photoType="regular_shelf" />}
                />
                <Route
                  path="/photos/:storeId/:company/sekondare"
                  element={<PhotoUploadPage photoType="secondary_position" />}
                />
                <Route
                  path="/photos/:storeId/:company/fletushka"
                  element={<PhotoUploadPage photoType="fletushka" />}
                />
                <Route
                  path="/photos/:storeId/:company/korporative"
                  element={<PhotoUploadPage photoType="korporative" />}
                />
                {/* <Route path="/price-check" element={<StoreSelector />} />
                <Route
                  path="/price-check/:id"
                  element={<PriceCheckSelector />}
                />
                <Route
                  path="/price-check/:id/podravka"
                  element={<PriceCheckPodravka />}
                />
                <Route
                  path="/price-check/:id/konkurrenca"
                  element={<PriceCheckCompetitor />}
                /> */}
                <Route path="/reports" element={<ReportView />} />
              </>
            )}
            {userRole === "admin" && (
              <>
                <Route path="/photos/report" element={<PhotoReportHeader />} />
                <Route path="/reports" element={<ReportView />} />
                <Route path="/settings" element={<SelectCreateEdit />} />
                <Route
                  path="/settings/create/store"
                  element={<CreateStorePage />}
                />
                <Route
                  path="/settings/create/competitor-brand"
                  element={<CreateCompetitorBrand />}
                />
                <Route
                  path="/settings/create/competitor-product"
                  element={<CreateCompetitorProduct />}
                />
                <Route path="/settings/create/user" element={<CreateUser />} />
                <Route path="/settings/edit/store" element={<Stores />} />
                <Route
                  path="/settings/edit/store/:id"
                  element={<UpdateStore />}
                />
                <Route
                  path="/settings/edit/competitor-brands"
                  element={<CompetitorList />}
                />
                <Route
                  path="/settings/edit/competitor-brands/:id"
                  element={<UpdateCompetitorBrand />}
                />
                <Route path="/settings/edit/users" element={<UserList />} />
                <Route
                  path="/settings/edit/users/:id"
                  element={<UpdateUser />}
                />
                <Route
                  path="/settings/edit/competitor-products"
                  element={<CompetitorProductList />}
                />
                <Route
                  path="/settings/edit/competitor-products/:id"
                  element={<UpdateCompetitorProduct />}
                />
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
