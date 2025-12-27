# Namma Oor Fix

## Quick Start

### Prerequisites
- Node.js installed
- MongoDB connection (or use default MongoDB Atlas)

### Setup & Run Commands

1. **Install Server Dependencies**
```bash
cd server
npm install
```

2. **Install Client Dependencies**
```bash
cd ../client
npm install
```

3. **Start Backend Server**
```bash
cd ../server
node server.js
```
*Server runs on http://localhost:5000*

4. **Start Frontend Development Server**
```bash
cd ../client
npm run dev
```
*Client runs on http://localhost:5173*

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Build for Production
```bash
cd client
npm run build
```

### Environment Variables
Create `.env` file in server directory:
```
MONGODB_URI=your_mongodb_connection_string
```
