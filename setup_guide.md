# Sahayogi Project - VS Code Setup Guide

Follow these steps to run the Sahayogi project locally in VS Code.

## Prerequisites
- **Node.js**: v18 or later (v22 recommended)
- **PostgreSQL**: Running on port **5433** with password `123456`.
- **VS Code Extenions**: Prisma, ESLint, Tailwind CSS IntelliSense (Recommended).

## 1. Backend Setup
1. Open the `backend` folder in VS Code or a terminal.
2. Ensure dependencies are installed:
   ```bash
   npm install
   ```
3. Verify your `.env` file contains:
   ```text
   DATABASE_URL="postgresql://postgres:123456@127.0.0.1:5433/sahayogi?schema=public"
   JWT_SECRET="your-secret-key"
   ```
4. Initialize the database (one-time setup):
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```
   *The server will run on [http://localhost:3000](http://localhost:3000)*

## 2. Frontend Setup
1. Open the `Sahayogi` folder in a new terminal/VS Code window.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will run on [http://localhost:8081](http://localhost:8081)*

## 3. Running concurrently in VS Code
You can use the built-in terminal split feature in VS Code to see both logs at once:
1. Open terminal (`Ctrl + ~`).
2. Create two tabs: one for `backend` and one for `Sahayogi`.
3. Run the respective `npm run dev` commands.

## Troubleshooting
- **Database Connection**: Ensure PostgreSQL is running on port **5433**. If you get an authentication error, verify the password is `123456`.
- **API URL**: The frontend is configured to call `http://localhost:3000/api`. Ensure the backend is running on this port.
