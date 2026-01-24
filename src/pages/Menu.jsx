import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      const querySnapshot = await getDocs(collection(db, "menuItems"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    };

    fetchMenu();
  }, []);

  const addToCart = (food) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === food.id);
      if (existing) {
        return prev.map((i) =>
          i.id === food.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...food, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, food) => sum + food.price * food.qty, 0);

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden w-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Our Menu
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">Fresh & delicious</p>
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

      <main className="max-w-6xl mx-auto px-4 py-6 pb-[140px] sm:pb-32 lg:pb-6 w-full overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-stone-200 p-5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-stone-900 truncate">
                        {item.name}
                      </h3>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-medium bg-stone-100 text-stone-600 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-amber-600 whitespace-nowrap">
                      ₹{item.price}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-2.5 rounded-xl font-medium hover:bg-stone-800 active:scale-[0.98] transition-all duration-200"
                  >
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
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
                  Your Order
                </h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-stone-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-stone-500 text-sm">Your cart is empty</p>
                  <p className="text-stone-400 text-xs mt-1">
                    Add items to get started
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto overscroll-contain">
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

                  <div className="border-t border-stone-200 mt-4 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-stone-600 font-medium">Total</span>
                      <span className="text-2xl font-bold text-stone-900">
                        ₹{total}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        navigate("/checkout", {
                          state: { cart, total, tableNumber },
                        })
                      }
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-200"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Cart - Mobile Fixed Bottom */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 p-4 overflow-x-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
              <span className="text-sm text-stone-600">items</span>
            </div>
            <span className="text-xl font-bold text-stone-900">₹{total}</span>
          </div>
          <button
            onClick={() =>
              navigate("/checkout", {
                state: { cart, total, tableNumber },
              })
            }
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;