import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(data);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus,
        });
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Admin Dashboard</h2>

            {orders.length === 0 && <p>No orders yet</p>}

            {orders.map((order) => (
                <div
                    key={order.id}
                    style={{
                        border: "1px solid #ccc",
                        marginBottom: "16px",
                        padding: "12px",
                    }}
                >
                    <h3>Table No: {order.tableNumber}</h3>
                    <p>
                        Status: <strong>{order.status}</strong>
                    </p>

                    {order.items.map((item, index) => (
                        <p key={index}>
                            {item.name} × {item.qty}
                        </p>
                    ))}

                    <h4>Total: ₹{order.total}</h4>

                    <button onClick={() => updateStatus(order.id, "preparing")}>
                        Preparing
                    </button>
                    <button onClick={() => updateStatus(order.id, "served")}>
                        Served
                    </button>

                    <p>Payment: {order.paymentMethod}</p>
                    <p>Payment Status: {order.paymentStatus}</p>

                </div>
            ))}
        </div>
    );
};

export default AdminDashboard;
