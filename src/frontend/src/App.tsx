import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import CheckerPage from "./pages/CheckerPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import PerformancePage from "./pages/PerformancePage";

// Auth guard wrapper
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-background"
        data-ocid="auth.loading_state"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Initializing…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Index redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" />,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: function LoginRoute() {
    const { isAuthenticated, isInitializing } = useAuth();

    if (isInitializing) {
      return (
        <div
          className="flex items-center justify-center h-screen bg-background"
          data-ocid="auth.loading_state"
        >
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" />;
    }

    return <LoginPage />;
  },
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: function DashboardRoute() {
    return (
      <AuthGuard>
        <DashboardPage />
      </AuthGuard>
    );
  },
});

// Checker route
const checkerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checker",
  component: function CheckerRoute() {
    return (
      <AuthGuard>
        <CheckerPage />
      </AuthGuard>
    );
  },
});

// History route
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: function HistoryRoute() {
    return (
      <AuthGuard>
        <HistoryPage />
      </AuthGuard>
    );
  },
});

// Performance route
const performanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/performance",
  component: function PerformanceRoute() {
    return (
      <AuthGuard>
        <PerformancePage />
      </AuthGuard>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  checkerRoute,
  historyRoute,
  performanceRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <RouterProvider router={router} />;
}
