import { onRequest as __api___path___ts_onRequest } from "/home/nart/projekte/pp/field-reporting-product-placment-frontend/functions/api/[[path]].ts"

export const routes = [
    {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___ts_onRequest],
    },
  ]