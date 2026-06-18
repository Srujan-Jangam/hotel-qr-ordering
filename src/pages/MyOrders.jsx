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

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '⏳' },
            preparing: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '👨‍🍳' },
            served: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅' }
        };
        return statusConfig[status] || { bg: 'bg-stone-100', text: 'text-stone-700', icon: '📋' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-50">
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-stone-900 tracking-tight">
                        My Orders
                    </h1>
                    <p className="text-stone-600 mt-2">Track and view all your restaurant orders</p>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                📋
                            </div>
                            <p className="text-stone-600 font-medium text-lg">No orders yet</p>
                            <p className="text-stone-500 mt-2">Your orders will appear here</p>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const statusConfig = getStatusBadge(order.status);
                            return (
                                <Link
                                    key={order.id}
                                    to={`/order/${order.id}`}
                                    className="group block bg-white border border-stone-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        {/* Left Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`w-12 h-12 rounded-full ${statusConfig.bg} flex items-center justify-center text-xl`}>
                                                    {statusConfig.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-stone-900 text-lg">
                                                        Order #{order.id.slice(0, 6).toUpperCase()}
                                                    </h3>
                                                    <p className="text-xs text-stone-500 mt-0.5">
                                                        Order ID: {order.id.slice(0, 12)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Content */}
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-amber-700 mb-2">
                                                ₹{order.total}
                                            </p>
                                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} capitalize border ${statusConfig.bg.replace('bg-', 'border-').replace('-100', '-300')}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover Indicator */}
                                    <div className="mt-3 flex items-center gap-1 text-amber-600 text-sm font-medium group-hover:gap-2 transition-all">
                                        <span>View Details</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
