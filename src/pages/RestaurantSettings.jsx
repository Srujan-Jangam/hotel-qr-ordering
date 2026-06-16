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
        <div className="bg-white rounded-2xl border border-stone-200 p-6">

            <div className="space-y-4">

                <input
                    type="text"
                    value={restaurant.name}
                    onChange={(e) =>
                        setRestaurant({
                            ...restaurant,
                            name: e.target.value,
                        })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="Restaurant Name"
                />

                <input
                    type="text"
                    value={restaurant.address}
                    onChange={(e) =>
                        setRestaurant({
                            ...restaurant,
                            address: e.target.value,
                        })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="Address"
                />

                <input
                    type="text"
                    value={restaurant.phone}
                    onChange={(e) =>
                        setRestaurant({
                            ...restaurant,
                            phone: e.target.value,
                        })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="Phone"
                />

                <input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) =>
                        setRestaurant({
                            ...restaurant,
                            email: e.target.value,
                        })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="Email"
                />

                <input
                    type="text"
                    value={restaurant.upiId}
                    onChange={(e) =>
                        setRestaurant({
                            ...restaurant,
                            upiId: e.target.value,
                        })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="UPI ID"
                />

<div className="flex items-center justify-between border rounded-xl p-4">
  <div>
    <h3 className="font-medium">
      Restaurant Status
    </h3>

    <p className="text-sm text-stone-500">
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
    className={`px-4 py-2 rounded-xl font-medium ${
      restaurant.isActive
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {restaurant.isActive ? "Open" : "Closed"}
  </button>
</div>

            </div>

            <button
                onClick={saveSettings}
                className="mt-6 bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition"
            >
                Save Settings
            </button>

        </div>

    );
};

export default RestaurantSettings;