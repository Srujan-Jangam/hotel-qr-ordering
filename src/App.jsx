import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import OrderStatus from "./pages/OrderStatus";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/order/:orderId" element={<OrderStatus />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
