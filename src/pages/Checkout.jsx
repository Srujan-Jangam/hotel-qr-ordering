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
    <div style={{ padding: "16px" }}>
      <h2>Checkout</h2>
      <h3>Table No: {tableNumber}</h3>

      {cart.map(item => (
        <div key={item.id}>
          <p>{item.name} × {item.qty}</p>
          <p>₹{item.price * item.qty}</p>
        </div>
      ))}

      <h3>Total: ₹{total}</h3>

      <h3>Select Payment Method</h3>

      <label>
        <input
          type="radio"
          value="counter"
          checked={paymentMethod === "counter"}
          onChange={() => setPaymentMethod("counter")}
        />
        Pay at Counter
      </label>

      <br />

      <label>
        <input
          type="radio"
          value="online"
          checked={paymentMethod === "online"}
          onChange={() => setPaymentMethod("online")}
        />
        Pay Online (Demo)
      </label>
      {paymentMethod === "online" && (
        <div style={{ marginTop: "12px" }}>
          <p>Scan QR to Pay (Demo)</p>
          <img
            src="/dummy-qr.png"
            alt="Demo QR"
            width="200"
          />
          <p style={{ fontSize: "12px", color: "#777" }}>
            This is a demo payment screen.
          </p>
        </div>
      )}
      
      <button onClick={placeOrder} disabled={isPlacing}>
        Confirm Order
      </button>
      
    </div>
  );
};

export default Checkout;
