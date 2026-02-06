# Ecoryx ESG Ratings - Distribution Package

## Setup Instructions

### 1. Install Dependencies

#### Client (Frontend)
```bash
cd client
npm install
```

#### Server (Backend)
```bash
cd server
npm install
```

### 2. Configure Environment Variables

#### Server Configuration
Copy `.env.example` to `.env` in the server directory:
```bash
cd server
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Database Setup

```bash
cd server
npx prisma generate
npx prisma migrate deploy
npm run seed
```

### 4. Run the Application

#### Start Server
```bash
cd server
npm run dev
```

#### Start Client
```bash
cd client
npm run dev
```

### 5. Access the Application

- **Client**: http://localhost:5173
- **Server**: http://localhost:3000
- **Login**: admin@ecoryx.com / admin123

## Project Structure

- `/client` - Vue 3 frontend with TypeScript and Tailwind CSS
- `/server` - Express backend with Prisma ORM and SQLite
