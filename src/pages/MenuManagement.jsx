import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);

    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
    });

    const toggleAvailability = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "menuItems", id), {
                available: !currentStatus,
            });

            setMenuItems((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, available: !currentStatus } : item,
                ),
            );
        } catch (error) {
            console.error("Failed to update availability:", error);
            alert("Failed to update menu item.");
        }
    };

    const openEditModal = (item) => {
        setEditingItem({ ...item });
        setShowEditModal(true);
    };

    const saveMenuItem = async () => {
        try {
            await updateDoc(doc(db, "menuItems", editingItem.id), {
                name: editingItem.name,
                price: editingItem.price,
                category: editingItem.category,
                description: editingItem.description,
                image: editingItem.image,
            });

            setMenuItems((prev) =>
                prev.map((item) =>
                    item.id === editingItem.id ? editingItem : item
                )
            );

            setShowEditModal(false);
            setEditingItem(null);
        } catch (error) {
            console.error("Failed to update menu item:", error);
            alert("Failed to save changes.");
        }
    };

    const addMenuItem = async () => {
        try {
            const itemToAdd = {
                ...newItem,
                price: Number(newItem.price),
                available: true,
                restaurantId: "restaurant_001",
            };

            const docRef = await addDoc(
                collection(db, "menuItems"),
                itemToAdd
            );

            setMenuItems((prev) => [
                ...prev,
                {
                    id: docRef.id,
                    ...itemToAdd,
                },
            ]);

            setShowAddModal(false);

            setNewItem({
                name: "",
                price: "",
                category: "",
                description: "",
                image: "",
            });
        } catch (error) {
            console.error("Failed to add menu item:", error);
            alert("Failed to add menu item.");
        }
    };

    const deleteMenuItem = async (id, itemName) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${itemName}"?`
        );

        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "menuItems", id));

            setMenuItems((prev) =>
                prev.filter((item) => item.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete menu item:", error);
            alert("Failed to delete menu item.");
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
                <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900">
                            Menu Management
                        </h1>
                        <p className="text-stone-500 mt-1">
                            Manage restaurant menu items
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-amber-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-amber-600 transition"
                    >
                        + Add Item
                    </button>
                </div>
            </header>

            {/* Menu Grid */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-stone-200 overflow-visible shadow-sm hover:shadow-md transition-shadow flex flex-col"
                        >
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-40 object-cover"
                                />
                            )}

                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h2 className="text-lg font-semibold text-stone-900 flex-1 line-clamp-2">
                                        {item.name}
                                    </h2>

                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${item.available
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {item.available ? "Available" : "Unavailable"}
                                    </span>
                                </div>

                                <p className="text-sm text-stone-500 mb-3 line-clamp-1">{item.category}</p>

                                <p className="text-xl font-bold text-amber-600 mb-4">
                                    ₹{item.price}
                                </p>
                                
                                <div className="space-y-2 mt-auto">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="flex-1 py-2 px-3 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium transition text-sm"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                toggleAvailability(item.id, item.available)
                                            }
                                            className={`flex-1 py-2 px-3 rounded-xl font-medium transition text-sm ${item.available
                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                }`}
                                        >
                                            {item.available
                                                ? "Disable"
                                                : "Enable"}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() =>
                                            deleteMenuItem(item.id, item.name)
                                        }
                                        className="w-full py-2 px-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-medium text-sm"
                                    >
                                        Delete Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 sticky top-0 bg-white">
                            Add New Menu Item
                        </h2>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Item Name"
                            />

                            <input
                                type="number"
                                value={newItem.price}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        price: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Price"
                            />

                            <input
                                type="text"
                                value={newItem.category}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        category: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Category"
                            />

                            <textarea
                                value={newItem.description}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                rows={3}
                                placeholder="Description"
                            />

                            <input
                                type="text"
                                value={newItem.image}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        image: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Image URL"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewItem({
                                        name: "",
                                        price: "",
                                        category: "",
                                        description: "",
                                        image: "",
                                    });
                                }}
                                className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={addMenuItem}
                                className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition font-medium"
                            >
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 sticky top-0 bg-white">
                            Edit Menu Item
                        </h2>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={editingItem.name}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Item Name"
                            />

                            <input
                                type="number"
                                value={editingItem.price}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        price: Number(e.target.value),
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Price"
                            />

                            <input
                                type="text"
                                value={editingItem.category || ""}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        category: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Category"
                            />

                            <textarea
                                value={editingItem.description || ""}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                rows={3}
                                placeholder="Description"
                            />

                            <input
                                type="text"
                                value={editingItem.image || ""}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        image: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-lg p-2"
                                placeholder="Image URL"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={saveMenuItem}
                                className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
