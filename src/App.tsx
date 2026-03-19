import { useRoutes } from "react-router-dom";
import { appRoutes } from "./config/route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MockDataProvider } from "./context/MockDataContext";

const Routes = () => useRoutes(appRoutes);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MockDataProvider>
        <Routes />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          pauseOnHover={false}
          stacked
        />
      </MockDataProvider>
    </QueryClientProvider>
  );
}
