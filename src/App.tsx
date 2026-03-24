import { useRoutes } from "react-router-dom";
import { appRoutes } from "./config/route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MockDataProvider } from "./context/MockDataContext";
import { AppThemeProvider, useAppTheme } from "./context/AppThemeContext";

const Routes = () => useRoutes(appRoutes);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function AppContent() {
  const { theme } = useAppTheme();

  return (
    <MockDataProvider>
      <Routes />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        pauseOnHover={false}
        stacked
        theme={theme}
      />
    </MockDataProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AppContent />
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
