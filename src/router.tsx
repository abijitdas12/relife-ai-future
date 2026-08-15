import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Every hash link (nav, footer, in-page) scrolls the same smooth way and
    // stops just below the sticky header thanks to scroll-margin-top in CSS.
    defaultHashScrollIntoView: { behavior: "smooth", block: "start" },
  });

  return router;
};
