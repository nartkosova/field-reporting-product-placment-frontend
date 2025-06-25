import { RouteObject } from "react-router-dom";
import HomePage from "../pages/HomePage";

import {
  publicRoutes,
  pplRoutes,
  photoRoutes,
  settingsRoutes,
  reportRoutes,
} from "./routeGroups";

const userRoutes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  ...pplRoutes,
  ...photoRoutes,
  ...reportRoutes,
];

const adminRoutes: RouteObject[] = [...reportRoutes, ...settingsRoutes];

export { publicRoutes, userRoutes, adminRoutes };
