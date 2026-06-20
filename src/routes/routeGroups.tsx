import { RouteObject } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
// import StoreSelector from "../components/StoreList/StoreSelector";
import FacingsSelector from "../pages/PPL/PPLCompanySelector";
import PodravkaFacingsFormPage from "../pages/PPL/PPLPodravka/PPLPodravka";
import PPLCompetitor from "../pages/PPL/PPLCompetitor/PPLCompetitor";
import PodravkaPPLEditor from "../pages/PPL/PPLPodravka/PodravkaPPLList";
import UpdatePodravkaFacingsPage from "../pages/PPL/PPLPodravka/UpdatePodravkaFacings";
import CompetitorPPLEditor from "../pages/PPL/PPLCompetitor/CompetitorPPLList";
import UpdateCompetitorFacings from "../pages/PPL/PPLCompetitor/UpdateCompetitorFacings";
import PresenceBatchList from "../pages/PresenceEditor/PresenceBatchList";
import UpdatePresenceBatch from "../pages/PresenceEditor/UpdatePresenceBatch";
import PhotoCompanySelector from "../pages/Photos/PhotoCompanySelector";
import PhotoSelector from "../pages/Photos/PhotosSelector";
import PhotoUploadPage from "../pages/Photos/PhotoUploadPage";
import PhotoList from "../pages/Photos/PhotoList";
import UpdatePhotoPage from "../pages/Photos/UpdateProdravkaPhotos";
import SelectCreateEdit from "../pages/SelectCreateUpdate/SelectCreateUpdate";
import CreateStorePage from "../pages/Features/Stores/CreateStore";
import CreateCompetitorBrand from "../pages/Features/Competitor/CreateCompetitorBrand";
import CreateCompetitorProduct from "../pages/Features/CompetitorProducts/CreateCompetitorProduct";
import CreateUser from "../pages/Features/Users/CreateUser";
import Stores from "../pages/Features/Stores/Stores";
import UpdateStore from "../pages/Features/Stores/UpdateStore";
import CompetitorList from "../pages/Features/Competitor/CompetitorList";
import UpdateCompetitorBrand from "../pages/Features/Competitor/UpdateCompetitorBrand";
import UserList from "../pages/Features/Users/UserList";
import UpdateUser from "../pages/Features/Users/UpdateUser";
import CompetitorProductList from "../pages/Features/CompetitorProducts/CompetitorProductList";
import UpdateCompetitorProduct from "../pages/Features/CompetitorProducts/UpdateCompetitorProducts";
import EditPPL from "../pages/EditPPL/EditPPL";
import ReportSelector from "../pages/ReportSelector/ReportSelector";
import PhotoReportHeader from "../pages/PhotoReports/PhotoReportHeader";
import ReportHeader from "../pages/ReportView/ReportHeader";
import CreatePodravkaProduct from "../pages/Features/PodravkaProducts/CreatePodravkaProduct";
import UpdatePodravkaProduct from "../pages/Features/PodravkaProducts/UpdatePodravkaProducts";
import PodravkaProductList from "../pages/Features/PodravkaProducts/PodravkaProductList";
import ProductFacingsReportHeader from "../pages/ProductFacingsReport/ProductFacingsReportHeader";
import { AdminGuard } from "./AminGuard";
import ProexVFSSelector from "../pages/ProexVFSSelector/ProexVFSSelector";
import ProexStoreSelector from "../pages/ProexVFSSelector/ProexStoreSelector";
import VFSStoreSelector from "../pages/ProexVFSSelector/VFSStoreSelector";
import PresenceReport from "../pages/PresenceReports/PresenceReport";

export const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export const pplRoutes: RouteObject[] = [
  // {
  //   path: "/ppl-store",
  //   element: <StoreSelector />,
  // },
  {
    path: `/ppl-store/:storeId`,
    element: <FacingsSelector />,
  },
  {
    path: `/ppl-store/:storeId/ppl-podravka`,
    element: <PodravkaFacingsFormPage />,
  },
  {
    path: `/ppl-store/:storeId/ppl-konkurrenca`,
    element: <PPLCompetitor />,
  },
  {
    path: "/edit-ppl",
    element: <EditPPL />,
  },
  {
    path: "/edit-ppl/podravka",
    element: <PodravkaPPLEditor />,
  },
  {
    path: "/ppl-podravka/edit/:batchId",
    element: <UpdatePodravkaFacingsPage />,
  },
  {
    path: "/edit-ppl/konkurrenca",
    element: <CompetitorPPLEditor />,
  },
  {
    path: "/ppl-konkurrenca/edit/:batchId",
    element: <UpdateCompetitorFacings />,
  },
  {
    path: "/edit-ppl/presence",
    element: <PresenceBatchList />,
  },
  {
    path: "/edit-ppl/presence/edit/:batchId",
    element: <UpdatePresenceBatch />,
  },
];

export const photoRoutes: RouteObject[] = [
  // {
  //   path: "/photos",
  //   element: <StoreSelector />,
  // },
  {
    path: `/photos/:storeId`,
    element: <PhotoCompanySelector />,
  },
  {
    path: "/photos/edit",
    element: <PhotoList />,
  },
  {
    path: "/photos/edit/:id",
    element: <UpdatePhotoPage />,
  },
  {
    path: "/photos/:storeId/:company",
    element: <PhotoSelector />,
  },
  {
    path: `/photos/:storeId/:company/primare`,
    element: <PhotoUploadPage photoType="regular_shelf" />,
  },
  {
    path: `/photos/:storeId/:company/sekondare`,
    element: <PhotoUploadPage photoType="secondary_position" />,
  },
  {
    path: `/photos/:storeId/:company/produkt-i-ri`,
    element: <PhotoUploadPage photoType="new_product" />,
  },
  {
    path: `/photos/:storeId/:company/aksion`,
    element: <PhotoUploadPage photoType="sale" />,
  },
  {
    path: `/photos/:storeId/:company/fletushka`,
    element: <PhotoUploadPage photoType="fletushka" />,
  },
  {
    path: `/photos/:storeId/:company/korporative`,
    element: <PhotoUploadPage photoType="korporative" />,
  },
  {
    path: `/photos/:storeId/:company/afer-afatit`,
    element: <PhotoUploadPage photoType="staleness" />,
  },
  {
    path: `/photos/:storeId/:company/loje-shperblyese`,
    element: <PhotoUploadPage photoType="reward_game" />,
  },
  {
    path: `/photos/:storeId/:company/raport-dimenzionime`,
    element: <PhotoUploadPage photoType="dimensioning_report" />,
  },
  {
    path: `/photos/:storeId/:company/pozita-sekondare-kvartal`,
    element: <PhotoUploadPage photoType="secondary_position_quarter" />,
  },
  {
    path: `/photos/:storeId/:company/tjeter1`,
    element: <PhotoUploadPage photoType="other1" />,
  },
  {
    path: `/photos/:storeId/:company/tjeter2`,
    element: <PhotoUploadPage photoType="other2" />,
  },
];

export const settingsRoutes: RouteObject[] = [
  {
    path: "/settings",
    element: <SelectCreateEdit />,
  },
  {
    path: "/settings/create/store",
    element: <CreateStorePage />,
  },
  {
    path: "/settings/create/competitor-brand",
    element: <CreateCompetitorBrand />,
  },
  {
    path: "/settings/create/competitor-product",
    element: <CreateCompetitorProduct />,
  },
  {
    path: "/settings/create/user",
    element: (
      <AdminGuard>
        <CreateUser />
      </AdminGuard>
    ),
  },
  {
    path: "/settings/edit/store",
    element: <Stores />,
  },
  {
    path: "/settings/edit/store/:id",
    element: <UpdateStore />,
  },
  {
    path: "/settings/create/podravka-products",
    element: <CreatePodravkaProduct />,
  },
  {
    path: "/settings/edit/podravka-products",
    element: <PodravkaProductList />,
  },
  {
    path: "/settings/edit/podravka-products/:id",
    element: <UpdatePodravkaProduct />,
  },
  {
    path: "/settings/edit/competitor-brands",
    element: <CompetitorList />,
  },
  {
    path: "/settings/edit/competitor-brands/:id",
    element: <UpdateCompetitorBrand />,
  },
  {
    path: "/settings/edit/users",
    element: (
      <AdminGuard>
        <UserList />
      </AdminGuard>
    ),
  },
  {
    path: "/settings/edit/users/:id",
    element: (
      <AdminGuard>
        <UpdateUser />
      </AdminGuard>
    ),
  },
  {
    path: "/settings/edit/competitor-products",
    element: <CompetitorProductList />,
  },
  {
    path: "/settings/edit/competitor-products/:id",
    element: <UpdateCompetitorProduct />,
  },
];

export const reportRoutes: RouteObject[] = [
  {
    path: "/reports",
    element: <ReportSelector />,
  },
  {
    path: "/reports/photo-reports",
    element: <PhotoReportHeader />,
  },
  {
    path: "/reports/ppl-reports",
    element: <ReportHeader />,
  },
  {
    path: "/reports/product-facings",
    element: <ProductFacingsReportHeader />,
  },
  {
    path: "/reports/presence",
    element: <PresenceReport />,
  },
];

export const proexVfsRoutes: RouteObject[] = [
  {
    path: "/proex-vfs",
    element: <ProexVFSSelector />,
  },
  {
    path: "/proex-vfs/vfs",
    element: <VFSStoreSelector />,
  },
  {
    path: "/proex-vfs/proex",
    element: <ProexStoreSelector />,
  },
];
