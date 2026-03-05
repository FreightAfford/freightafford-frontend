import { RouterProvider } from "react-router";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return <RouterProvider router={AppRoutes} />;
};
export default App;
