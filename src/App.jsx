import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import OrderStatus from "./pages/OrderStatus";
import MenuManagement from "./pages/MenuManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/order/:orderId" element={<OrderStatus />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
