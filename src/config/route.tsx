import { Navigate } from "react-router-dom";
import PerformanceLayout from "../layouts/PerformanceLayout";
import Dashboard from "../pages/performance/Dashboard";
import ChecklistTemplatesPage from "../pages/performance/ChecklistTemplatesPage";
import ChecklistTemplateDetailPage from "../pages/performance/ChecklistTemplateDetailPage";
import EmployeeChecklistsPage from "../pages/performance/EmployeeChecklistsPage";
import EmployeeChecklistDetailPage from "../pages/performance/EmployeeChecklistDetailPage";
import PerformanceReportsPage from "../pages/performance/PerformanceReportsPage";

export const appRoutes = [
  {
    element: <PerformanceLayout />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/templates", element: <ChecklistTemplatesPage /> },
      { path: "/templates/:id", element: <ChecklistTemplateDetailPage /> },
      { path: "/employee-checklists", element: <EmployeeChecklistsPage /> },
      { path: "/employee-checklists/:id", element: <EmployeeChecklistDetailPage /> },
      { path: "/reports", element: <PerformanceReportsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
];
