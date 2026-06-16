import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const RestaurantSettings = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const docRef = doc(
                    db,
                    "restaurants",
                    "restaurant_001"
                );

                const snapshot = await getDoc(docRef);

                if (snapshot.exists()) {
                    setRestaurant(snapshot.data());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const saveSettings = async () => {
        try {
            await updateDoc(
                doc(db, "restaurants", "restaurant_001"),
                restaurant
            );

            alert("Settings updated successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to save settings");
        }
    };

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-5">
                    <h1 className="text-3xl font-bold text-stone-900">
                        Restaurant Settings
                    </h1>
                    <p className="text-stone-500 mt-1">
                        Manage restaurant information and preferences
                    </p>
                </div>
            </header>

            {/* Settings Form */}
            <main className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl border border-stone-200 p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                Restaurant Name
                            </label>
                            <input
                                type="text"
                                value={restaurant.name}
                                onChange={(e) =>
                                    setRestaurant({
                                        ...restaurant,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Restaurant Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                value={restaurant.address}
                                onChange={(e) =>
                                    setRestaurant({
                                        ...restaurant,
                                        address: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Address"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={restaurant.phone}
                                    onChange={(e) =>
                                        setRestaurant({
                                            ...restaurant,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Phone"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={restaurant.email}
                                    onChange={(e) =>
                                        setRestaurant({
                                            ...restaurant,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="Email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                UPI ID
                            </label>
                            <input
                                type="text"
                                value={restaurant.upiId}
                                onChange={(e) =>
                                    setRestaurant({
                                        ...restaurant,
                                        upiId: e.target.value,
                                    })
                                }
                                className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="UPI ID"
                            />
                        </div>

                        <div className="border border-stone-300 rounded-xl p-4 bg-stone-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-stone-900">
                                        Restaurant Status
                                    </h3>
                                    <p className="text-sm text-stone-500 mt-1">
                                        Enable or disable customer ordering
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setRestaurant({
                                            ...restaurant,
                                            isActive: !restaurant.isActive,
                                        })
                                    }
                                    className={`px-4 py-2 rounded-xl font-medium transition ${
                                        restaurant.isActive
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                    }`}
                                >
                                    {restaurant.isActive ? "Open" : "Closed"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={saveSettings}
                        className="mt-6 w-full bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition font-medium"
                    >
                        Save Settings
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RestaurantSettings;
