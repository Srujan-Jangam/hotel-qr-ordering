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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="max-w-2xl mx-auto p-6">
                {/* Receipt Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-8 text-white">
                        <h1 className="text-4xl font-bold tracking-tight">
                            {restaurant?.name}
                        </h1>
                        <p className="text-amber-100 mt-1 text-sm">Order Receipt</p>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-8 space-y-6">
                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Customer</p>
                                <p className="text-lg font-semibold text-stone-900 mt-2">
                                    {order.customerName}
                                </p>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Order ID</p>
                                <p className="text-lg font-semibold text-stone-900 mt-2 font-mono">
                                    {orderId.slice(-8)}
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Table</p>
                                <p className="text-lg font-semibold text-stone-900 mt-2">
                                    #{order.tableNumber}
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Status</p>
                                <p className="text-lg font-semibold text-stone-900 mt-2 capitalize">
                                    {order.status}
                                </p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-stone-100 rounded-xl p-4 border border-stone-200">
                            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Payment Method</p>
                            <p className="text-lg font-semibold text-stone-900 mt-2 capitalize">
                                {order.paymentMethod}
                            </p>
                        </div>

                        {/* Items Section */}
                        <div className="border-t-2 border-stone-200 pt-6">
                            <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">🍽️</span> Order Items
                            </h2>

                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200 hover:bg-stone-100 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full font-bold text-sm">
                                                {item.qty}
                                            </span>
                                            <span className="font-medium text-stone-800">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="font-bold text-amber-700 text-lg">
                                            ₹{item.price * item.qty}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="border-t-2 border-stone-200 pt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border ">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-stone-600">Total Amount</span>
                                <span className="text-4xl font-bold text-amber-700">
                                    ₹{order.total}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Button */}
                <button
                    onClick={printReceipt}
                    className="w-full mt-8 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2z" />
                    </svg>
                    Print Receipt
                </button>
            </div>
        </div>
    );
};

export default Receipt;
