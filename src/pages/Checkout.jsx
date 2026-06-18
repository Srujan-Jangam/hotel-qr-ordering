import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs, // <-- for fetching orders
  updateDoc, // <-- for merging
  doc, // <-- for referencing specific document
} from "firebase/firestore";

import { db } from "../firebase";


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");

  const { cart, total, tableNumber, tableId, restaurantId } = location.state || {};

  useEffect(() => {
    if (!cart || !tableNumber || !restaurantId || !tableId) {
      navigate("/");
    }
  }, [cart, tableNumber, restaurantId, tableId, navigate]);

  const [isPlacing, setIsPlacing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("counter");

  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateOrderId, setDuplicateOrderId] = useState(null);
  const [mergedCart, setMergedCart] = useState([]);
  const [mergedTotal, setMergedTotal] = useState(0);

  // Helper to compare two carts
  const isSameCart = (cart1, cart2) => {
    if (cart1.length !== cart2.length) return false;

    // Compare each item (id + qty)
    const sorted1 = [...cart1].sort((a, b) => a.id.localeCompare(b.id));
    const sorted2 = [...cart2].sort((a, b) => a.id.localeCompare(b.id));

    for (let i = 0; i < sorted1.length; i++) {
      if (
        sorted1[i].id !== sorted2[i].id ||
        sorted1[i].qty !== sorted2[i].qty
      ) {
        return false;
      }
    }
    return true;
  };

  const placeOrder = async () => {
    if (isPlacing) return;
    if (!cart || cart.length === 0) return alert("Cart is empty");

    setIsPlacing(true);

    try {
      //1️⃣ Check for duplicate active orders
      const ordersRef = collection(db, "orders");
      const snapshot = await getDocs(ordersRef);
      const activeOrders = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (o) =>
            o.tableNumber === tableNumber &&
            ["pending", "preparing"].includes(o.status),
        );

      const duplicate = activeOrders.find((o) => isSameCart(o.items, cart));

      if (duplicate) {
        // 2️⃣ Prompt user
        const confirmMerge = window.confirm(
          "You already have an active order with these items. Do you want to add the new items to your existing order?",
        );

        if (confirmMerge) {
          // 3️⃣ Merge items & update total
          const updatedItems = mergeCarts(duplicate.items, cart);
          const updatedTotal = updatedItems.reduce(
            (sum, i) => sum + i.price * i.qty,
            0,
          );

          await updateDoc(doc(db, "orders", duplicate.id), {
            items: updatedItems,
            total: updatedTotal,
            statusUpdatedAt: new Date(),
          });
          setDuplicateOrderId(duplicate.id);
          setMergedCart(updatedItems);
          setMergedTotal(updatedTotal);
          setShowDuplicateModal(true);
          setIsPlacing(false);
          // navigate(`/order/${duplicate.id}`);
          return; // Stop here
        } else {
          setIsPlacing(false);
          return; // User canceled merge
        }
      }

      // 4️⃣ No duplicate: place new order
      const docRef = await addDoc(ordersRef, {
        // Secure identity
        restaurantId,
        tableId,
        tableNumber,

        // Order details
        items: cart,
        total,

        // Payment
        paymentMethod,
        paymentStatus: paymentMethod === "counter" ? "pending" : "demo",

        // Order lifecycle
        status: "pending",
        statusUpdatedAt: serverTimestamp(),

        // Metadata
        customerName: customerName.trim() || "Guest",
        createdAt: serverTimestamp(),
      });

      const existingOrders = JSON.parse(
        localStorage.getItem("myOrders") || "[]"
      );

      existingOrders.push(docRef.id);

      localStorage.setItem(
        "myOrders",
        JSON.stringify(existingOrders)
      );

      navigate(`/order/${docRef.id}`);
    } catch (err) {
  console.error("Order Error:", err);
  alert(err.message);
}
  };

  // Merger Carts if orders are same
  const mergeCarts = (existingItems, newItems) => {
    const merged = [...existingItems];

    newItems.forEach((newItem) => {
      const index = merged.findIndex((i) => i.id === newItem.id);
      if (index !== -1) {
        // If item exists, increase quantity
        merged[index].qty += newItem.qty;
      } else {
        // Add new item
        merged.push(newItem);
      }
    });

    return merged;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-lg mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Checkout
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">Review your order</p>
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
              <span className="text-sm font-medium">Table {tableNumber}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-32 sm:pb-6">
        {/* Order Summary Card */}
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Order Summary
            </h2>
          </div>

          <div className="px-5 py-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
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
                  <span className="text-sm font-semibold text-stone-900">
                    ₹{item.price * item.qty}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between items-center">
              <span className="text-stone-600 font-medium">Total</span>
              <span className="text-2xl font-bold text-stone-900">
                ₹{total}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-stone-100">
            <h2 className="text-lg font-semibold text-stone-900">
              Customer Details
            </h2>
          </div>

          <div className="p-5">
            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              maxLength={50}
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        {/* Payment Method Card */}
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Payment Method
            </h2>
          </div>

          <div className="px-5 py-4 space-y-3">
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === "counter"
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300"
                }`}
            >
              <input
                type="radio"
                checked={paymentMethod === "counter"}
                onChange={() => setPaymentMethod("counter")}
                className="w-4 h-4 accent-amber-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-stone-900">
                  Pay at Counter
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pay when your order is ready
                </p>
              </div>
              <svg
                className="w-5 h-5 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </label>

            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === "online"
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 hover:border-stone-300"
                }`}
            >
              <input
                type="radio"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="w-4 h-4 accent-amber-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-stone-900">
                  Pay Online
                </span>
                <p className="text-xs text-stone-500 mt-0.5">
                  Scan QR code to pay instantly
                </p>
              </div>
              <svg
                className="w-5 h-5 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </label>
          </div>
        </div>

        {/* QR Code Section */}
        {paymentMethod === "online" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center mb-4">
            <p className="text-sm text-stone-600 mb-4 font-medium">
              Scan QR to Pay (Demo)
            </p>
            <div className="bg-stone-50 rounded-xl p-4 inline-block">
              <img
                src="./src/assets/dummy-qr.png"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Use any UPI app to complete payment
            </p>
          </div>
        )}

        {/* Desktop Confirm Button */}
        <button
          onClick={placeOrder}
          disabled={isPlacing}
          className="hidden sm:flex w-full items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3.5 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlacing ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Placing Order...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
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
              Confirm Order
            </>
          )}
        </button>
      </main>

      {/* Mobile Fixed Bottom Button */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          onClick={placeOrder}
          disabled={isPlacing}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3.5 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlacing ? (
            <>
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Placing Order...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
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
              Confirm Order
            </>
          )}
        </button>
      </div>

      {/* Duplicate Order Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Duplicate Order Detected
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              You already have an active order with these items. Do you want to
              merge the new items into your existing order?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsPlacing(true);
                  try {
                    await updateDoc(doc(db, "orders", duplicateOrderId), {
                      items: mergedCart,
                      total: mergedTotal,
                      statusUpdatedAt: new Date(),
                    });
                    setShowDuplicateModal(false);
                    navigate(`/order/${duplicateOrderId}`);
                  } catch (err) {
                    console.error(err);
                    alert("Failed to merge order");
                    setIsPlacing(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
