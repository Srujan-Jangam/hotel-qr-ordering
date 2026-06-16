import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const savedIds = JSON.parse(
                localStorage.getItem("myOrders") || "[]"
            );

            const snapshot = await getDocs(
                collection(db, "orders")
            );

            const data = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .filter((order) =>
                    savedIds.includes(order.id)
                );

            setOrders(data);
        };

        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-4xl mx-auto p-6">

                <h1 className="text-3xl font-bold mb-6">
                    My Orders
                </h1>

                <div className="space-y-4">

                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            to={`/order/${order.id}`}
                            className="block bg-white border rounded-xl p-4"
                        >
                            <div className="flex justify-between">
                                <span>
                                    Order #{order.id.slice(0, 6)}
                                </span>

                                <span>
                                    {order.status}
                                </span>
                            </div>

                            <div className="mt-2">
                                ₹{order.total}
                            </div>
                        </Link>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default MyOrders;