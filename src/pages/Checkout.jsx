import { useState } from "react";
import { useLocation, useNavigate, } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart, total, tableNumber } = location.state || {};

  const [isPlacing, setIsPlacing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("counter");

  const placeOrder = async () => {
    if (isPlacing) return;
    if (!cart || cart.length === 0) return alert("Cart is empty");

    setIsPlacing(true);

    try {
      const docRef = await addDoc(collection(db, "orders"), {
        tableNumber,
        items: cart,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === "counter" ? "pending" : "demo",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      navigate(`/order/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
      setIsPlacing(false);
    }
  };


return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-2 text-center">Checkout</h2>
        <p className="text-gray-600 text-center mb-4">
          Table No: <span className="font-semibold">{tableNumber}</span>
        </p>

        {/* Cart Items */}
        <div className="space-y-3 mb-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between border-b pb-2">
              <span>{item.name} × {item.qty}</span>
              <span className="font-medium">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between font-semibold text-lg mb-5">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {/* Payment Method */}
        <h3 className="font-semibold mb-2">Payment Method</h3>
        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "counter"}
              onChange={() => setPaymentMethod("counter")}
              className="accent-black"
            />
            Pay at Counter
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
              className="accent-black"
            />
            Pay Online (Demo)
          </label>
        </div>

        {/* Dummy QR */}
        {paymentMethod === "online" && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">Scan QR to Pay (Demo)</p>
            <img src="/dummy-qr.png" alt="Demo QR" className="mx-auto w-40" />
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={placeOrder}
          disabled={isPlacing}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isPlacing ? "Placing Order..." : "Confirm Order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
