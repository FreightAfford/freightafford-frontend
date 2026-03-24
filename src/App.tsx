import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 2 * 60 * 1000 },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer theme="colored" />
      <RouterProvider router={AppRoutes} />
    </QueryClientProvider>
  );
};

export default App;
