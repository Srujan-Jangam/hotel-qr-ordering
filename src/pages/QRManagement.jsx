import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import { db } from "../firebase";

const QRManagement = () => {
    const [tables, setTables] = useState([]);

    const qrRefs = useRef({});

    const downloadQR = (tableId, tableNumber) => {
        const canvas = qrRefs.current[tableId];

        if (!canvas) return;

        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");

        downloadLink.href = pngUrl;
        downloadLink.download = `table-${tableNumber}-qr.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const printQR = (table) => {
        const canvas = qrRefs.current[table.id];

        if (!canvas) return;

        const image = canvas.toDataURL("image/png");

        const printWindow = window.open("", "_blank");

        printWindow.document.write(`
        <html>
        <head>
            <title>Table ${table.tableNumber} QR</title>
        </head>
        <body style="text-align:center;padding:30px;">
            <h2>Table ${table.tableNumber}</h2>
            <img src="${image}" />
        </body>
        </html>
    `);

        printWindow.document.close();
        printWindow.print();
    };

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const snapshot = await getDocs(
                    collection(db, "tables")
                );

                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setTables(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTables();
    }, []);

    const generateURL = (table) => {
        return `${window.location.origin}/?restaurantId=${table.restaurantId}&table=${table.tableNumber}&token=${table.token}`;
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-6xl mx-auto px-4 py-8">

                <h1 className="text-3xl font-bold mb-6">
                    QR Management
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {tables.map((table) => (
                        <div
                            key={table.id}
                            className="bg-white rounded-2xl border border-stone-200 p-5"
                        >
                            <h2 className="text-xl font-semibold mb-4">
                                Table {table.tableNumber}
                            </h2>

                            <div className="flex justify-center mb-4">
                                <QRCodeCanvas
                                    value={generateURL(table)}
                                    size={200}
                                    ref={(el) => {
                                        if (el) {
                                            qrRefs.current[table.id] = el;
                                        }
                                    }}
                                />
                            </div>

                            <div className="text-xs text-stone-500 break-all">
                                {generateURL(table)}
                            </div>

                            <button
                                onClick={() =>
                                    downloadQR(
                                        table.id,
                                        table.tableNumber
                                    )
                                }
                                className="mt-4 w-full bg-amber-500 text-white py-2 rounded-xl hover:bg-amber-600 transition"
                            >
                                Download QR
                            </button>

                            <button
                                onClick={() => printQR(table)}
                                className="mt-2 w-full bg-stone-800 text-white py-2 rounded-xl hover:bg-stone-900 transition"
                            >
                                Print QR
                            </button>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default QRManagement;