# Production Deployment Guide — CloudMed AI

This guide documents the complete cloud deployment architecture for hosting CloudMed AI across **Vercel**, **Render**, **MongoDB Atlas**, and **Cloudinary**.

---

## 1. Cloud Infrastructure Overview

```
Frontend SPA        ──▶ Vercel (Edge CDN)
Backend API Server  ──▶ Render (Web Service - Node.js)
AI/ML Microservice  ──▶ Render (Web Service - Python FastAPI)
Database            ──▶ MongoDB Atlas (M0/M10 Cluster)
Asset Storage       ──▶ Cloudinary (Medical Document CDN)
```

---

## 2. Step 1: Database Setup on MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g. `Cluster0` in `AWS / us-east-1` or `ap-south-1`).
3. Under **Database Access**, create a user:
   - Username: `cloudmed_admin`
   - Password: `<SECURE_PASSWORD>`
   - Roles: `readWriteAnyDatabase`
4. Under **Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere).
5. Obtain connection URI:
   ```text
   mongodb+srv://cloudmed_admin:<SECURE_PASSWORD>@cluster0.abcde.mongodb.net/cloudmed_ai?retryWrites=true&w=majority
   ```

---

## 3. Step 2: Storage Setup on Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/).
2. On your Dashboard, note your credentials:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Create an upload preset (optional) or use the backend stream uploader.

---

## 4. Step 3: Deploy AI Microservice to Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Configure service:
   - **Root Directory:** `ai-service`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python ml/train_health_model.py && python ml/train_priority_model.py`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `PYTHON_VERSION`: `3.11.0` or `3.13.0`
5. Note the deployed URL (e.g., `https://cloudmed-ai-service.onrender.com`).

---

## 5. Step 4: Deploy Backend API Server to Render

1. Create a second **Web Service** on Render.
2. Configure service:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
3. Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGO_URI` | `mongodb+srv://...` (from Step 1) |
   | `JWT_SECRET` | `<32_CHARACTER_SECRET>` |
   | `JWT_EXPIRE` | `7d` |
   | `CLOUDINARY_CLOUD_NAME` | `<YOUR_CLOUD_NAME>` |
   | `CLOUDINARY_API_KEY` | `<YOUR_API_KEY>` |
   | `CLOUDINARY_API_SECRET` | `<YOUR_API_SECRET>` |
   | `AI_SERVICE_URL` | `https://cloudmed-ai-service.onrender.com` |
   | `ADMIN_EMAIL` | `admin@cloudmed.demo` |
   | `ADMIN_PASSWORD` | `Admin@1234` |
4. Run initial database seed:
   - In the Render service dashboard, open the **Shell** tab and run:
     ```bash
     npm run seed
     ```
5. Note the deployed Backend URL (e.g., `https://cloudmed-server.onrender.com`).

---

## 6. Step 5: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://cloudmed-server.onrender.com/api`
5. Deploy. Vercel will build and publish your SPA to an Edge global CDN (e.g. `https://cloudmed-ai.vercel.app`).

---

## 7. Verifying End-to-End Cloud Connectivity

1. Open the Vercel URL.
2. Sign in using the Admin Demo credentials (`admin@cloudmed.demo` / `Admin@1234`).
3. Verify that:
   - Recharts cards load live data from MongoDB Atlas.
   - An appointment can be booked with double-booking prevention.
   - The AI screening runs against the Render FastAPI microservice and returns the real probability score.
   - A document can be uploaded and viewed via Cloudinary.
