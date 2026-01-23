import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  if (!order) return <p>Loading order...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Order Status</h2>
      <h3>Table No: {order.tableNumber}</h3>
      <h3>Status: {order.status.toUpperCase()}</h3>

      <h4>Items</h4>
      {order.items.map((item, index) => (
        <p key={index}>
          {item.name} × {item.qty}
        </p>
      ))}

      <h3>Total: ₹{order.total}</h3>
    </div>
  );
};

export default OrderStatus;
