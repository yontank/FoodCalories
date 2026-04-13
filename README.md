# FoodCal - Food Calorie Tracking Application

A full-stack web application for tracking daily food intake and calorie consumption. Built with a React frontend and FastAPI backend, this application helps users monitor their nutritional intake using Israeli Ministry of Health food database.

## Project Structure

```
FoodCal/
├── backend/                 # FastAPI backend server
│   ├── api/                # API routes and endpoints
│   │   ├── __init__.py
│   │   └── api.py         # Food and meal endpoints
│   ├── models/             # SQLAlchemy ORM models
│   │   ├── based.py
│   │   ├── meals_eaten.py
│   │   ├── moh_mitzrachim.py
│   │   ├── moh_yehidot_mida.py
│   │   └── moh_yehidot_mida_lemitzrachim.py
│   ├── schemas/            # Pydantic schemas for validation
│   │   └── food.py
│   ├── db.py              # Database configuration
│   ├── main.py            # Entry point (Uvicorn server)
│   └── requirements.txt    # Python dependencies
│
├── Food-Calories/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── CalorieInformation.tsx
│   │   │   ├── MealsEatenContainer.tsx
│   │   │   ├── NavBar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchItems.tsx
│   │   │   ├── SideBar.tsx
│   │   │   ├── TotalCalorieProgress.tsx
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard/  # Main dashboard view
│   │   │   ├── Calculator/ # Calorie calculator
│   │   │   ├── Settings/   # User settings
│   │   │   └── Layout.tsx  # Root layout
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── data/          # Static configuration
│   │   ├── assets/        # Images and media
│   │   └── main.tsx       # React entry point
│   ├── vite.config.ts     # Vite bundler config
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── package.json       # Node dependencies
│   └── tsconfig.json      # TypeScript config
│
└── CSV/                    # Food database CSV files
    ├── moh_matkonim_11.7.2022.csv
    ├── moh_mitzrachim.csv
    ├── moh_yehidot_mida_lemitzrachim.csv
    └── moh_yehidot_mida.csv
```

## Features

- **Food Search**: Search through an extensive database of foods from the Israeli Ministry of Health
- **Meal Tracking**: Log meals eaten throughout the day with portion sizes
- **Calorie Monitoring**: Track daily calorie intake with visual progress indicators
- **Dashboard**: View today's meals and total calorie consumption
- **Settings**: Configure application preferences
- **Calculator**: Quick calorie calculations for foods

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality UI component library
- **React Router 7** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form state management

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database interactions
- **PostgreSQL** - Database (via psycopg2)
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### 1. Configure environment variables

The project uses three `.env` files — one per service. Copy each example and fill in your values:

```bash
# Database (root)
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

> **Important:** The `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in the root `.env` must match the credentials in `backend/.env` `DATABASE_URL`.
>
> The `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` must use the same value.

### 2. Run with Docker Compose

**Development** (hot reload for both frontend and backend):
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

**Production:**
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
- Application: `http://localhost` (port 80)

## API Endpoints

### Foods
- `GET /foods` - List foods (limited to 20)
- `GET /foods/{food_query}` - Search foods by name
- `GET /foodInfo/{food_query}` - Get detailed food information by code

### Meals
- `POST /foodEaten` - Log a meal eaten
- `GET /todayMeals` - Get today's meals with calorie information

## Database Schema

The application uses an Israeli Ministry of Health food database with the following key models:
- **moh_mitzrachim** - Food items database
- **moh_yehidot_mida** - Food measurement units
- **moh_yehidot_mida_lemitzrachim** - Food to measurement unit mapping
- **meals_eaten** - User's consumed meals with timestamps

## Development

### Linting (Frontend)
```bash
cd Food-Calories
npm run lint
```

### TypeScript Build
```bash
cd Food-Calories
tsc -b
```

## Environment Variables

Environment variables are split across three files:

| File | Service | Variables |
|------|---------|-----------|
| `.env` | Database (PostgreSQL) | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| `backend/.env` | Backend (FastAPI) | `DATABASE_URL`, `SECRET_KEY`, `GOOGLE_CLIENT_ID` |
| `frontend/.env` | Frontend (Vite) | `BACKEND_URL`, `VITE_GOOGLE_CLIENT_ID` |

See each `.env.example` file for details and instructions.

## Project Status

This is an active development project. Check the repository for the latest updates and features.

## License

Not specified - See LICENSE file if present.

## Contributing

Contributions are welcome. Please ensure code follows the existing project structure and conventions.
