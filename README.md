# Book Discovery & Tracking

A full-stack reading app where users can search for books, explore detailed book pages, save titles to a personal reading list, track reading progress, and use lightweight dashboard tools to decide what to read next.

This project was built to feel more like a personal reading space than a plain catalog. Visitors can browse publicly, while signed-in users unlock saved lists, reading notes, progress tracking, and dashboard insights.

## Live Demo

- Frontend: https://book-discovery-and-tracking.vercel.app/
- Backend API: https://book-discovery-and-tracking.onrender.com

## Features

- Public book search powered by the Open Library API
- Detailed book pages with description, publish date, categories, and cover art
- User authentication with secure password hashing and JWT-based sessions
- Personal reading list with add/remove actions
- Reading status tracking for `Want to Read`, `Reading`, and `Finished`
- Progress slider for books currently in progress
- Reading dashboard with:
  - reading stats
  - recent add spotlight
  - in-progress overview
  - "Choose My Next Read" suggestion tool
- Reader notes on book detail pages for signed-in users
- Responsive React frontend deployed separately from the API

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: bcrypt, JSON Web Tokens
- External data source: Open Library API
- Deployment: Vercel (frontend), Render (backend + PostgreSQL)

## Project Structure

```text
book_discovery_and_tracking/
├── README.md
└── book_discovery/
    ├── client/
    └── server/
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/book_discovery_and_tracking.git
cd book_discovery_and_tracking
```

### 2. Install frontend dependencies

```bash
cd book_discovery/client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Set up environment variables

Create a `.env` file in `book_discovery/server`:

```env
DATABASE_URL=your_local_or_hosted_postgres_url
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

Create a `.env` file in `book_discovery/client`:

```env
VITE_API_URL=http://localhost:5001/api
```

### 5. Create the database tables

Run the SQL schema in:

```text
book_discovery/server/db.sql
```

### 6. Start the backend

From `book_discovery/server`:

```bash
node server.js
```

### 7. Start the frontend

From `book_discovery/client`:

```bash
npm run dev
```

## Deployment

### Backend on Render

- Deploy the `book_discovery/server` directory as a web service
- Add environment variables:

```env
DATABASE_URL=your_render_postgres_internal_database_url
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=https://your-vercel-site.vercel.app
```

- Run the schema in `book_discovery/server/db.sql` against your Render PostgreSQL database

### Frontend on Vercel

- Deploy the `book_discovery/client` directory
- Add:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

- The frontend includes a `vercel.json` rewrite so React Router routes work correctly on refresh

## Why I Built It

I wanted this project to feel more personal book club than a basic search-and-save app. Instead of only displaying books, it gives readers a space to organize their reading life, track momentum, and make small decisions like what to pick up next. I hope having this app encourages more individuals to make regular trips to their local libraries and experience the magic of surrounded by literature. We cannot let physical library attendances decline any more than it has!

## Future Improvements

- Better surfaced backend error messages on the frontend
- Stronger recommendation or mood-based discovery features
- Optional email verification and password reset
- Custom domain for a cleaner production URL
- Richer reading insights and user activity trends

## Author

Built by Daniella Ovbude 

Developer Portfolio: daniella3.github.io/portfolio/
Email: daniella.ovbude@gmail.com