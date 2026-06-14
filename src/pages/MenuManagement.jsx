import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);

      const toggleAvailability = async (id, currentStatus) => {
  try {
    await updateDoc(doc(db, "menuItems", id), {
      available: !currentStatus,
    });

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, available: !currentStatus }
          : item
      )
    );
  } catch (error) {
    console.error("Failed to update availability:", error);
    alert("Failed to update menu item.");
  }
};

  useEffect(() => {

    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menuItems"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMenuItems(data);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };

    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-3xl font-bold text-stone-900">
            Menu Management
          </h1>
          <p className="text-stone-500 mt-1">
            Manage restaurant menu items
          </p>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
              )}

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {item.name}
                  </h2>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.available
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <p className="text-sm text-stone-500 mt-2">
                  {item.category}
                </p>

                <p className="text-xl font-bold text-amber-600 mt-3">
                  ₹{item.price}
                </p>
                <div className="mt-4">
  <button
    onClick={() =>
      toggleAvailability(item.id, item.available)
    }
    className={`w-full py-2 rounded-xl font-medium transition ${
      item.available
        ? "bg-red-100 text-red-700 hover:bg-red-200"
        : "bg-green-100 text-green-700 hover:bg-green-200"
    }`}
  >
    {item.available
      ? "Mark Unavailable"
      : "Mark Available"}
  </button>
</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MenuManagement;