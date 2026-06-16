import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import OrderStatus from "./pages/OrderStatus";
import MenuManagement from "./pages/MenuManagement";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import RestaurantSettings from "./pages/RestaurantSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/order/:orderId" element={<OrderStatus />} />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute>
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <RestaurantSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
