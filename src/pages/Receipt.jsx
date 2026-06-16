import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Receipt = () => {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [restaurant, setRestaurant] = useState(null);

    const printReceipt = () => {
  window.print();
};

    useEffect(() => {
        const fetchReceipt = async () => {
            const orderDoc = await getDoc(
                doc(db, "orders", orderId)
            );

            if (!orderDoc.exists()) return;

            const orderData = orderDoc.data();

            setOrder(orderData);

            const restaurantDoc = await getDoc(
                doc(
                    db,
                    "restaurants",
                    orderData.restaurantId
                )
            );

            if (restaurantDoc.exists()) {
                setRestaurant(
                    restaurantDoc.data()
                );
            }
        };

        fetchReceipt();
    }, [orderId]);

    if (!order) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-2xl mx-auto p-6">

                <div className="bg-white rounded-2xl border p-6">

                    <h1 className="text-3xl font-bold">
                        {restaurant?.name}
                    </h1>

                    <div className="mt-6 space-y-2">
                        <p>
                            <strong>Customer:</strong>
                            {order.customerName}
                        </p>
                        <p>
                            <strong>Order ID:</strong>
                            {" "}
                            {orderId}
                        </p>

                        <p>
                            <strong>Table:</strong>
                            {" "}
                            {order.tableNumber}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            {" "}
                            {order.status}
                        </p>

                        <p>
                            <strong>Payment:</strong>
                            {" "}
                            {order.paymentMethod}
                        </p>

                    </div>

                    <div className="mt-6 border-t pt-4">

                        <h2 className="font-semibold mb-4">
                            Items
                        </h2>

                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between mb-2"
                            >
                                <span>
                                    {item.name}
                                    {" "}
                                    x{item.qty}
                                </span>

                                <span>
                                    ₹{item.price * item.qty}
                                </span>
                            </div>
                        ))}

                    </div>

                    <div className="border-t mt-4 pt-4 flex justify-between">

                        <strong>Total</strong>

                        <strong>
                            ₹{order.total}
                        </strong>

                    </div>

                </div>

                <button
                    onClick={printReceipt}
                    className="w-full mt-6 bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition"
                >
                    Print Receipt
                </button>

            </div>
        </div>
    );
};

export default Receipt;