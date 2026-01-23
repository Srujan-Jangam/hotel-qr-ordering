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
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    };

    fetchMenu();
  }, []);

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === food.id);
      if (existing) {
        return prev.map(i =>
          i.id === food.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...food, qty: 1 }];
    });
  };

  const total = cart.reduce(
    (sum, food) => sum + food.price * food.qty,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Menu</h2>
      <p className="text-center text-gray-600 mb-6">
        Table No: <span className="font-semibold">{tableNumber}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-gray-500">{item.category}</p>
            <p className="font-medium mt-2">₹{item.price}</p>

            <button
              onClick={() => addToCart(item)}
              className="mt-3 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">Cart</h3>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} × {item.qty}</span>
                <span>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-semibold text-lg mt-3">
            <span>Total:</span>
            <span>₹{total}</span>
          </div>
          <button
            onClick={() =>
              navigate("/checkout", {
                state: {
                  cart,
                  total,
                  tableNumber,
                },
              })
            }
          >
            Proceed to Checkout
          </button>

        </div>
      )}
    </div>
  );
};

export default Menu;
