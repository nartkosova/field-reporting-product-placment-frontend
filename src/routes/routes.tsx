import { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";

import ReportView from "../pages/ReportView/ReportHeader";

import PhotoReportHeader from "../pages/PhotoReports/PhotoReportHeader";

import {
  publicRoutes,
  pplRoutes,
  photoRoutes,
  settingsRoutes,
} from "./routeGroups";

const userRoutes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  ...pplRoutes,
  ...photoRoutes,
  {
    path: "/reports",
    element: <ReportView />,
  },
];

const adminRoutes: RouteObject[] = [
  {
    path: "/photos/report",
    element: <PhotoReportHeader />,
  },
  {
    path: "/reports",
    element: <ReportView />,
  },
  ...settingsRoutes,
];

export { publicRoutes, userRoutes, adminRoutes };
