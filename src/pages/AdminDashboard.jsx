import { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {

    const [dateFilter, setDateFilter] = useState("all");

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/admin/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const [orders, setOrders] = useState([]);

    const [menuCount, setMenuCount] = useState(0);

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

        // Listen to menu items collection
        const menuUnsubscribe = onSnapshot(
            collection(db, "menuItems"),
            (snapshot) => {
                setMenuCount(snapshot.size);
            }
        );

        return () => {
            unsubscribe();
            menuUnsubscribe();
        };
    }, []);

    const updateStatus = async (orderId, newStatus, currentStatus) => {

        // Prevent backward or duplicate updates
        if (
            currentStatus === "served" ||
            (currentStatus === "preparing" && newStatus === "pending")
        ) {
            return;
        }

        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: newStatus,
                statusUpdatedAt: new Date(), // Track when status was updated
            });
        } catch (error) {
    console.error("Update Error:", error);
    alert(error.message);
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

    const filterByDate = (order) => {
        if (dateFilter === "all") return true;

        if (!order.createdAt?.toDate) return true;

        const orderDate = order.createdAt.toDate();
        const now = new Date();

        if (dateFilter === "today") {
            return orderDate.toDateString() === now.toDateString();
        }

        if (dateFilter === "week") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);

            return orderDate >= sevenDaysAgo;
        }

        if (dateFilter === "month") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);

            return orderDate >= thirtyDaysAgo;
        }

        return true;
    };

    const activeOrders = orders.filter(
        (o) =>
            filterByDate(o) &&
            (o.status === "pending" || o.status === "preparing")
    );

    const completedOrders = orders.filter(
        (o) =>
            filterByDate(o) &&
            o.status === "served"
    );

    const filteredOrders = orders.filter(filterByDate);

    const totalOrders = filteredOrders.length;
    const activeOrderCount = activeOrders.length;

    const revenue = filteredOrders
        .filter((o) => ["served", "completed"].includes(o.status))
        .reduce((sum, order) => sum + (order.total || 0), 0);

    const onlinePayments = filteredOrders.filter(
        (o) => o.paymentMethod === "online"
    ).length;

    const counterPayments = filteredOrders.filter(
        (o) => o.paymentMethod === "counter"
    ).length;

    const pendingOrders = filteredOrders.filter(
        (o) => o.status === "pending"
    ).length;

    const preparingOrders = filteredOrders.filter(
        (o) => o.status === "preparing"
    ).length;

    const servedOrders = filteredOrders.filter(
        (o) => o.status === "served"
    ).length;

    const itemFrequency = {};

    filteredOrders.forEach((order) => {
        if (!order.items) return;

        order.items.forEach((item) => {
            if (!itemFrequency[item.name]) {
                itemFrequency[item.name] = 0;
            }
            itemFrequency[item.name] += item.qty || 1;
        });
    });

    let mostOrderedItem = "No orders yet";
    let highestCount = 0;

    Object.entries(itemFrequency).forEach(([name, count]) => {
        if (count > highestCount) {
            highestCount = count;
            mostOrderedItem = name;
        }
    });

    const topSellingItems = Object.entries(itemFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);


    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-50">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-stone-600 mt-1">
                            Manage incoming orders in real-time
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2.5 rounded-full border border-green-200 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-bold">{activeOrders.length} Active</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col items-end mr-8">
                <div className="relative">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="appearance-none bg-white border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-stone-700 shadow-sm hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>

                    <svg
                        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>

                <p className="text-xs text-stone-500 mt-1">
                    Showing {
                        dateFilter === "all"
                            ? "All Orders"
                            : dateFilter === "today"
                                ? "Today's Orders"
                                : dateFilter === "week"
                                    ? "Last 7 Days"
                                    : "Last 30 Days"
                    }
                </p>
            </div>

            {/* Stats Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Orders Card */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-stone-600 uppercase tracking-wider">Total Orders</span>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">📊</div>
                        </div>
                        <h2 className="text-4xl font-bold text-stone-900">
                            {totalOrders}
                        </h2>
                    </div>

                    {/* Active Orders Card */}
                    <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Active Orders</span>
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">⏳</div>
                        </div>
                        <h2 className="text-4xl font-bold text-amber-600">
                            {activeOrderCount}
                        </h2>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-green-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">Revenue</span>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">💰</div>
                        </div>
                        <h2 className="text-4xl font-bold text-green-600">
                            ₹{revenue}
                        </h2>
                    </div>

                    {/* Menu Items Card */}
                    <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-purple-700 uppercase tracking-wider">Menu Items</span>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">🍽️</div>
                        </div>
                        <h2 className="text-4xl font-bold text-purple-600">
                            {menuCount}
                        </h2>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Quick Analytics */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                            <span className="text-3xl">📈</span> Quick Analytics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                <div>
                                    <p className="text-sm text-blue-600 font-semibold">Mobile Payments</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-1">{onlinePayments}</p>
                                </div>
                                <span className="text-4xl">📱</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                                <div>
                                    <p className="text-sm text-amber-600 font-semibold">Counter Payments</p>
                                    <p className="text-3xl font-bold text-amber-900 mt-1">{counterPayments}</p>
                                </div>
                                <span className="text-4xl">💵</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                                <div>
                                    <p className="text-sm text-green-600 font-semibold">Top Item</p>
                                    <p className="text-lg font-bold text-green-900 mt-1">
                                        {mostOrderedItem}
                                        {highestCount > 0 && <span className="block text-sm text-green-700">({highestCount} sold)</span>}
                                    </p>
                                </div>
                                <span className="text-4xl">🍔</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Order Status Breakdown */}
                        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <span className="text-3xl">📦</span> Order Status Breakdown
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:border-blue-300 transition">
                                    <span className="text-stone-700 font-medium">Pending Orders</span>
                                    <span className="font-bold text-2xl text-blue-600">{pendingOrders}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200 hover:border-amber-300 transition">
                                    <span className="text-stone-700 font-medium">Preparing Orders</span>
                                    <span className="font-bold text-2xl text-amber-600">{preparingOrders}</span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 hover:border-green-300 transition">
                                    <span className="text-stone-700 font-medium">Served Orders</span>
                                    <span className="font-bold text-2xl text-green-600">{servedOrders}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Selling Items */}
                        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <span className="text-3xl">⭐</span> Top Selling Items
                            </h2>

                            {topSellingItems.length === 0 ? (
                                <div className="bg-stone-50 rounded-xl p-8 text-center border border-stone-200">
                                    <p className="text-stone-500 font-medium">No sales data available yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topSellingItems.map(([name, count], index) => (
                                        <div
                                            key={name}
                                            className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <span className="text-stone-700 font-medium">{name}</span>
                                            </div>

                                            <span className="font-bold text-amber-700 text-lg">
                                                {count} sold
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>


                {/* Active Orders */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <span className="text-3xl">🔥</span> Active Orders ({activeOrders.length})
                    </h2>
                    {activeOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
                            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-12 h-12 text-amber-400"
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
                            <p className="text-stone-700 font-bold text-lg">All caught up!</p>
                            <p className="text-stone-500 text-sm mt-2">
                                No active orders. New orders will appear here in real-time
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100/30 transition-all duration-300 shadow-sm"
                                >
                                    {/* Order Header */}
                                    <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-stone-50 to-transparent">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-amber-200">
                                                <span className="text-xl">🍽️</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-stone-900 text-lg">
                                                    Table #{order.tableNumber}
                                                </h3>

                                                <p className="text-sm text-amber-700 font-semibold">
                                                    {order.customerName || "Guest"}
                                                </p>

                                                <p className="text-xs text-stone-500 mt-1">
                                                    Order ID: {order.id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-4 py-2 text-xs font-bold rounded-full border capitalize ${getStatusStyle(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Order Items */}
                                    <div className="px-6 py-5 border-b border-stone-100">
                                        <p className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4">
                                            Items ({order.items.length})
                                        </p>
                                        <div className="space-y-3">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                            {item.qty}
                                                        </span>
                                                        <span className="text-sm font-medium text-stone-700">{item.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/80">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-stone-600 font-semibold uppercase">Payment</p>
                                                <p className="text-sm font-bold text-stone-900 mt-1 capitalize">
                                                    {order.paymentMethod}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-600 font-semibold uppercase">Status</p>
                                                <span
                                                    className={`inline-block text-xs font-bold rounded-full px-3 py-1 mt-1 capitalize ${getPaymentStatusStyle(
                                                        order.paymentStatus
                                                    )}`}
                                                >
                                                    {order.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50b rounded-xl border ">
                                        <p className="text-xs text-amber-700 font-semibold uppercase">Total Amount</p>
                                        <p className="text-3xl font-bold text-amber-700 mt-1">
                                            ₹{order.total}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-6 py-5 flex gap-3">
                                        <button
                                            disabled={order.status !== "pending"}
                                            onClick={() => updateStatus(order.id, "preparing", order.status)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${order.status === "preparing"
                                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"}
                                            ${order.status !== "pending" && "opacity-50 cursor-not-allowed"}
                                            `}
                                        >
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
                                            Start
                                        </button>
                                        <button
                                            disabled={order.status === "served"}
                                            onClick={() => updateStatus(order.id, "served", order.status)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${order.status === "served"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"}
                                            ${order.status === "served" && "opacity-50 cursor-not-allowed"}
                                            `}
                                        >
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
                                            Complete
                                        </button>
                                    </div>
                                </div>

                            ))}
                        </div>
                    )}
                </section>

                {/* Completed Orders */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <span className="text-3xl">✅</span> Completed Orders ({completedOrders.length})
                    </h2>

                    {completedOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">📋</span>
                            </div>
                            <p className="text-stone-600 font-medium">No completed orders yet</p>
                            <p className="text-stone-500 text-sm mt-2">Completed orders will appear here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                            {completedOrders.map((order) => (
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
                                                disabled={order.status !== "pending"}
                                                onClick={() => updateStatus(order.id, "preparing", order.status)}
                                                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] ${order.status === "preparing"
                                                    ? "bg-amber-500 text-white"
                                                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"}
                                                ${order.status !== "pending" && "opacity-50 cursor-not-allowed"}
                                                `}
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
                                                disabled={order.status === "served"}
                                                onClick={() => updateStatus(order.id, "served", order.status)}
                                                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98] ${order.status === "served"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"}
                                                ${order.status === "served" && "opacity-50 cursor-not-allowed"}
                                                `}
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
                </section>

            </main>
        </div>
    );
};

export default AdminDashboard;
