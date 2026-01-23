# 🏨 Hotel QR Ordering System

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

A **QR code-based hotel ordering web app** built with **React**, **Firebase**, and **Tailwind CSS (via CDN)**.  
Customers can scan a QR code, browse the menu, add items to the cart, and choose payment options (Pay at Counter or Demo Online Payment).  
Admins can view orders **live in real-time**.

---

## ⚡ Features

- **QR Code-Based Table Ordering** – Scan a QR code to access the menu.  
- **Dynamic Menu from Firebase** – Menu items stored in Firestore.  
- **Cart Functionality** – Add/remove items, see total cost.  
- **Payment Options** –  
  - Pay at Counter  
  - Online Payment (Demo QR, no real payment integration)  
- **Admin Dashboard** – View live orders with table number, items, and payment method.  
- **Responsive Design** – Works on mobile and desktop.  

---

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS (via CDN)  
- **Backend / Database:** Firebase Firestore  
- **Routing:** React Router DOM  

---

## 📂 Project Structure
```
hotel-qr-ordering/
│
├─ src/
│  ├─ components/
│  │  ├─ Menu.jsx
│  │  ├─ Checkout.jsx
│  │  └─ Admin.jsx
│  ├─ firebase.js
│  └─ App.jsx
│
├─ public/
│  └─ dummy-qr.png
│
├─ package.json
└─ README.md

```
---

## 🚀 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/hotel-qr-ordering.git
cd hotel-qr-ordering
```

2. **Install dependencies**
```
    npm install
```

3. **Set up Firebase**
    - Create a Firebase project

    - Copy your config to src/firebase.js
        ```
        import { initializeApp } from "firebase/app";
        import { getFirestore } from "firebase/firestore";

        const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
        };

        const app = initializeApp(firebaseConfig);
        export const db = getFirestore(app);
        ```

4. **Run the app**

    ```npm start```


- Open http://localhost:3000 in your browser

## 📝 Usage

1. Scan a QR code (or visit /menu?table=1)

2. Add items to the cart

3. Choose Pay at Counter or Demo Online Payment

4. Confirm order

5. Admin dashboard shows orders live

### 💡 Future Improvements

- Integrate real payment gateway (Razorpay / Stripe)

- Add user authentication for customers

- Add order history & analytics

- Enhance UI/UX with animations or modern design frameworks

### 📄 License

- This project is for educational purposes and portfolio demonstration.
- Feel free to use and modify for learning.