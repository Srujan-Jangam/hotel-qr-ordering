import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);

    const [filter, setFilter] = useState("all"); // New filter state

    useEffect(() => {
        // Listen to orders collection, sorted by newest first
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(data);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus,
                statusUpdatedAt: new Date(), // Track when status was updated
            });
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "preparing":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "served":
                return "bg-green-100 text-green-700 border-green-200";
            default:
                return "bg-stone-100 text-stone-600 border-stone-200";
        }
    };

    const getPaymentStatusStyle = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-amber-100 text-amber-700";
            default:
                return "bg-stone-100 text-stone-600";
        }
    };

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "-";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
    };

    // Filtered orders based on dropdown selection
    const filteredOrders =
        filter === "all" ? orders : orders.filter((o) => o.status === filter);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-stone-500 mt-0.5">
                            Manage incoming orders
                        </p>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-stone-600 text-sm font-medium">Filter:</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="served">Served</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium">{orders.length} Active Orders</span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-10 h-10 text-stone-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <p className="text-stone-600 font-medium">No orders yet</p>
                        <p className="text-stone-400 text-sm mt-1">
                            New orders will appear here in real-time
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300"
                            >
                                {/* Order Header */}
                                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-amber-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-stone-900">Table {order.tableNumber}</h3>
                                            <p className="text-xs text-stone-500">
                                                Order #{order.id.slice(-6)}
                                            </p>
                                            <p className="text-xs text-stone-400 mt-0.5">
                                                Placed: {formatDateTime(order.createdAt)}
                                            </p>
                                            {order.statusUpdatedAt && (
                                                <p className="text-xs text-stone-400">
                                                    Last Update: {formatDateTime(order.statusUpdatedAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${getStatusStyle(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Items */}
                                <div className="px-5 py-4 border-b border-stone-100">
                                    <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
                                        Items
                                    </p>
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 bg-stone-100 text-stone-600 rounded flex items-center justify-center text-xs font-bold">
                                                        {item.qty}
                                                    </span>
                                                    <span className="text-sm text-stone-700">{item.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-stone-500">Payment</span>
                                        <span className="text-sm font-medium text-stone-700 capitalize">
                                            {order.paymentMethod}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-stone-500">Status</span>
                                        <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getPaymentStatusStyle(
                                                order.paymentStatus
                                            )}`}
                                        >
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-stone-600 font-medium">Total</span>
                                        <span className="text-2xl font-bold text-stone-900">
                                            ₹{order.total}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateStatus(order.id, "preparing")}
                                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] ${order.status === "preparing"
                                                ? "bg-amber-500 text-white"
                                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Preparing
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => updateStatus(order.id, "served")}
                                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] ${order.status === "served"
                                                ? "bg-green-500 text-white"
                                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Served
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
