import { Navigate } from "react-router-dom";
import PerformanceLayout from "../layouts/PerformanceLayout";
import Dashboard from "../pages/performance/Dashboard";
import ChecklistTemplatesPage from "../pages/performance/ChecklistTemplatesPage";
import ChecklistTemplateDetailPage from "../pages/performance/ChecklistTemplateDetailPage";
import EmployeeChecklistsPage from "../pages/performance/EmployeeChecklistsPage";
import EmployeeChecklistDetailPage from "../pages/performance/EmployeeChecklistDetailPage";
import PerformanceReportsPage from "../pages/performance/PerformanceReportsPage";
import StudentDashboardPage from "../pages/performance/StudentDashboardPage";
import StudentChecklistsPage from "../pages/performance/StudentChecklistsPage";
import StudentChecklistDetailPage from "../pages/performance/StudentChecklistDetailPage";
import { useCurrentPerformanceUser } from "../hooks/useCurrentPerformanceUser";
import { getStoredAuthToken } from "../lib/authToken";
import UnauthorizedPage from "../pages/UnauthorizedPage";

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <p className="text-sm text-slate-500">Loading workspace...</p>
    </div>
  );
}

function DefaultRoleRedirect() {
  const { data: currentUser, isLoading, isError } = useCurrentPerformanceUser();
  const hasToken = Boolean(getStoredAuthToken());
  if (isLoading) return <RouteLoadingScreen />;
  if (isError || (!hasToken && !currentUser?.id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (currentUser?.isStudent) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AdminOnlyRoute({ children }: { children: JSX.Element }) {
  const { data: currentUser, isLoading, isError } = useCurrentPerformanceUser();
  const hasToken = Boolean(getStoredAuthToken());
  if (isLoading) return <RouteLoadingScreen />;
  if (isError || (!hasToken && !currentUser?.id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (currentUser?.isStudent) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

function StudentOnlyRoute({ children }: { children: JSX.Element }) {
  const { data: currentUser, isLoading, isError } = useCurrentPerformanceUser();
  const hasToken = Boolean(getStoredAuthToken());
  if (isLoading) return <RouteLoadingScreen />;
  if (isError || (!hasToken && !currentUser?.id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!currentUser?.isStudent) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export const appRoutes = [
  {
    element: <PerformanceLayout />,
    children: [
      { path: "/", element: <DefaultRoleRedirect /> },
      {
        path: "/dashboard",
        element: (
          <AdminOnlyRoute>
            <Dashboard />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "/templates",
        element: (
          <AdminOnlyRoute>
            <ChecklistTemplatesPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "/templates/:id",
        element: (
          <AdminOnlyRoute>
            <ChecklistTemplateDetailPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "/employee-checklists",
        element: (
          <AdminOnlyRoute>
            <EmployeeChecklistsPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "/employee-checklists/:id",
        element: (
          <AdminOnlyRoute>
            <EmployeeChecklistDetailPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "/reports",
        element: (
          <AdminOnlyRoute>
            <PerformanceReportsPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: "/student/dashboard",
        element: (
          <StudentOnlyRoute>
            <StudentDashboardPage />
          </StudentOnlyRoute>
        ),
      },
      {
        path: "/student/checklists",
        element: (
          <StudentOnlyRoute>
            <StudentChecklistsPage />
          </StudentOnlyRoute>
        ),
      },
      {
        path: "/student/checklists/:id",
        element: (
          <StudentOnlyRoute>
            <StudentChecklistDetailPage />
          </StudentOnlyRoute>
        ),
      },
    ],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
