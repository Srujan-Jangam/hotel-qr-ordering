import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (docSnap) => {
      if (docSnap.exists()) {
        setOrder(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (!order)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 font-medium">Loading order...</p>
        </div>
      </div>
    );

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: "clipboard" },
    { key: "preparing", label: "Preparing", icon: "fire" },
    { key: "served", label: "Served", icon: "check" },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  const renderIcon = (iconName, status) => {
    const baseClass = "w-5 h-5";
    const colorClass =
      status === "completed"
        ? "text-white"
        : status === "current"
        ? "text-white"
        : "text-stone-400";

    switch (iconName) {
      case "clipboard":
        return (
          <svg
            className={`${baseClass} ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "fire":
        return (
          <svg
            className={`${baseClass} ${colorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
            />
          </svg>
        );
      case "check":
        return (
          <svg
            className={`${baseClass} ${colorClass}`}
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-lg mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Order Status
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Order #{orderId.slice(-6)}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200">
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
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">
                Table {order.tableNumber}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Status Tracker Card */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Order Progress
            </h2>
          </div>

          <div className="px-5 py-6">
            <div className="relative flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">

                    {/* Step Circle */}
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === "completed"
                          ? "bg-green-500"
                          : status === "current"
                          ? "bg-amber-500 ring-4 ring-amber-100"
                          : "bg-stone-200"
                      }`}
                    >
                      {renderIcon(step.icon, status)}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`mt-3 text-xs font-medium text-center ${
                        status === "upcoming"
                          ? "text-stone-400"
                          : "text-stone-700"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mt-6 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentStepIndex + 1) / statusSteps.length) * 100}%`,
                }}
              />
            </div>

            {/* Current Status Message */}
            <div className="mt-4 text-center">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === "served"
                    ? "bg-green-100 text-green-700"
                    : order.status === "preparing"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                {order.status === "preparing" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
                {order.status === "pending" && "Waiting to be prepared"}
                {order.status === "preparing" && "Your food is being prepared"}
                {order.status === "served" && "Your order has been served!"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-stone-900">Your Items</h2>
          </div>

          <div className="px-5 py-4">
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {item.qty}
                    </span>
                    <span className="text-sm text-stone-700 font-medium">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between items-center">
              <span className="text-stone-600 font-medium">Total</span>
              <span className="text-2xl font-bold text-stone-900">
                ₹{order.total}
              </span>
            </div>
          </div>
        </div>

        <button
  onClick={() => navigate(`/receipt/${orderId}`)}
  className="w-full mt-4 bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition"
>
  View Receipt
</button>

<button
  onClick={() => navigate("/my-orders")}
  className="w-full mt-3 border border-stone-300 py-3 rounded-xl font-medium"
>
  My Orders
</button>

        {/* Help Card */}
        <div className="bg-stone-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-stone-600">
            Need help with your order?
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Please ask our staff at the counter
          </p>
        </div>
      </main>
    </div>
  );
};

export default OrderStatus;