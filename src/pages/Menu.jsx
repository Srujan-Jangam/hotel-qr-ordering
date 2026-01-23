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
    <div style={{ padding: "16px" }}>
      <h2>Menu</h2>
      Table No: {tableNumber ? tableNumber : "Not Assigned"}

      {/* MENU LIST */}
      {items.map(food => (
        <div
          key={food.id}
          style={{
            border: "1px solid #ddd",
            marginBottom: "12px",
            padding: "12px",
          }}
        >
          <h4>{food.name}</h4>
          <p>₹{food.price}</p>
          <p>{food.category}</p>
          <button onClick={() => addToCart(food)}>
            Add to Cart
          </button>
        </div>
      ))}

      {/* CART SECTION */}
      <hr />
      <h3>Cart</h3>

      {cart.length === 0 && <p>No items added</p>}

      {cart.map(food => (
        <div key={food.id}>
          <p>
            {food.name} × {food.qty} = ₹{food.price * food.qty}
          </p>
        </div>
      ))}

      <h3>Total: ₹{total}</h3>

      {/* CheckOut SECTION */}
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
  );
};

export default Menu;
