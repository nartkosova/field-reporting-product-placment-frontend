import { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";

import {
  publicRoutes,
  pplRoutes,
  photoRoutes,
  settingsRoutes,
  reportRoutes,
  proexVfsRoutes,
} from "./routeGroups";

const employeeRoutes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  ...pplRoutes,
  ...photoRoutes,
  ...proexVfsRoutes,
];

const adminRoutes: RouteObject[] = [...settingsRoutes];

export { publicRoutes, reportRoutes, employeeRoutes, adminRoutes };
