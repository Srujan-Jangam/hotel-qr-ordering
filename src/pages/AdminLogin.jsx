import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/admin");
        } catch (error) {
            console.error(error);
            alert("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-900">
                        Admin Login
                    </h1>
                    <p className="text-stone-500 mt-2 text-sm">
                        Enter your credentials to access the dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full border border-stone-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? "Signing In..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
