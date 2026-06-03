# 🌿 AgroMart — Agricultural E-Commerce Platform

> **Farm supplies delivered to your doorstep in 2–3 hours**  
> Verified organic manures, pesticides, bio-fertilizers & more — across Karnataka

![AgroMart Banner](https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80)

---

## ✨ Features

- 🛒 **Product Catalog** — 40+ verified agricultural products with real images
- 📍 **GPS Location Detection** — Automatically finds nearest AgroMart store
- 🗺️ **Store Map** — Interactive map showing all stores across Karnataka districts
- 🚴 **Live Order Tracking** — Real-time delivery simulation with scooter animation
- 📱 **Mobile-First Design** — Fully responsive, works on any device
- 🌙 **Dark Mode** — Smooth light/dark theme toggle
- 🔐 **Phone-based Auth** — Login with mobile number (no password needed)
- 🛡️ **Admin Dashboard** — Manage products, orders, categories
- ❤️ **Wishlist & Cart** — Save products and checkout seamlessly
- ⭐ **Reviews & Ratings** — Verified farmer reviews

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite | UI Framework |
| Redux Toolkit | State Management |
| React Router v6 | Navigation |
| Framer Motion | Animations |
| Leaflet.js | Interactive Maps |
| Tailwind CSS | Styling |
| Axios | API Calls |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Bcrypt | Password Hashing |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/agromart.git
cd agromart
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
```

Seed the database:
```bash
node utils/seeder.js
```

Start backend:
```bash
npm run dev
```
> Runs at: http://localhost:5000

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
> Runs at: http://localhost:5173

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) — Root dir: `frontend` |
| Backend | [Render](https://render.com) — Root dir: `backend` |
| Database | MongoDB Atlas (cloud) |

**Frontend env variable on Vercel:**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 📁 Project Structure

```
agromart/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Seeder, helpers
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/         # Axios API calls
        ├── components/  # Navbar, Map, Cards
        ├── context/     # Auth, Cart, Location
        ├── pages/       # Home, Products, Orders
        └── store/       # Redux slices
```

---

## 🗺️ Delivery Coverage — 12 Karnataka Districts

Bengaluru Urban · Mysuru · Mandya · Hassan · Tumkur · Kolar  
Shivamogga · Davangere · Dharwad · Belagavi · Vijayapura · Kalaburagi

---

## 👨‍💻 Built with ❤️ for Indian Farmers 🌾
