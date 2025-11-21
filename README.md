# Dustin Product Management Challenge

A full-stack implementation built for the Dustin developer assessment. This project delivers a complete Product Management system with:

- **.NET 8 Web API** (Controllers, EF Core, SQLite)
- **React + TypeScript + Vite** frontend (MUI, Axios)
- **Automated testing**
  - Backend: xUnit + EF InMemory
  - Frontend: Vitest + React Testing Library
  - E2E: Cypress (Add/Edit/Delete workflow)
- **Clean architecture**
- **Docker-ready** (optional)

---

## Project Structure

```
root/
│
├── backend/
│   ├── ProductApi/              # .NET Web API
│   ├── ProductApi.Tests/        # xUnit tests
│
├── frontend/
│   ├── src/                     # React app
│   ├── cypress/                 # E2E tests
│
└── README.md
```

---

## Features

### Backend (C# / .NET 8)
- REST API using Controllers
- SQLite database using Entity Framework Core
- Full CRUD for Products
- Search endpoint with multi-field filtering
- Validation rules:
  - Product ID must be unique
  - Required fields enforced
  - Price > 0, Stock ≥ 0
- Swagger UI enabled
- CORS configured for React dev environment
- In-memory test database for xUnit

### Frontend (React + TS)
- Fully responsive UI matching mock design
- Product table with zebra rows & clean MUI design
- Real-time Search
- Add/Edit modal dialogs
- Delete confirmation dialog
- Snackbar notifications
- Axios API client with environment-based base URL
- Optimized for Cypress selectors (`data-testid`)

### Testing
#### Backend (xUnit)
- Product filtering
- Unique ID validation
- Invalid data validation
- Update & Delete behaviors

#### Frontend (Vitest)
- UI renders returned API data
- Search filters table properly

#### E2E (Cypress)
Tests full workflow:
- Add Product
- Edit the same Product
- Delete Product
- Verify notifications and UI updates

---

## Running the Project

### 1. Backend API
Inside `backend/ProductApi`:

```
dotnet restore
dotnet build
dotnet run
```

It will auto-create `products.db` via migrations and expose:

```
https://localhost:<PORT>/api/products
```

Visit Swagger at:

```
https://localhost:<PORT>/swagger
```

### 2. Frontend App
Inside `frontend/`:

```
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

Make sure `.env.local` contains:

```
VITE_API_BASE_URL=https://localhost:<BACKEND_PORT>/api
```

### 3. Backend Tests (xUnit)

```
cd backend
dotnet test
```

### 4. Frontend Tests (Vitest)

```
cd frontend
npm test
```

### 5. Cypress E2E Tests

Start frontend + backend, then:

```
npm run cypress:open
```

Run: **product-crud.cy.ts**.

---

## Docker (Optional)

Docker is optional for the test, but project includes ready-to-use Dockerfiles for:

- API container (`backend/ProductApi/Dockerfile`)
- Frontend dev container (`frontend/Dockerfile`)

A `docker-compose.yml` can run both (if configured).

---

## Cypress Workflow (Add → Edit → Delete)

Cypress tests perform:

1. Click **Add Product**
2. Fill inputs
3. Save & validate new row
4. Click **Edit**
5. Update fields, save & validate
6. Click **Delete**
7. Confirm & validate removal

This ensures the entire UI + API integration works.

---

## Build & CI

Optionally, you can add GitHub Actions:

```
dotnet build
dotnet test
npm ci
npm run test
npm run build
```

E2E can run in CI using Cypress GitHub Action runners.

---

## Notes & Decisions

- SQLite chosen for simplicity; EF InMemory for test isolation.
- React with Vite used for speed and simplicity.
- Added `data-testid` selectors specifically for reliable Cypress testing.
- Docker not required by the assignment but supported.
- Written to be **production-realistic** and easy to maintain.

---

## Author

Damjan (“Daki”)  
Full‑stack Developer — .NET, React, TypeScript - done with assistance from Co-Pilot

---

## Summary

This project demonstrates:
- Solid backend fundamentals
- Modern frontend development with React/TS
- Real testing stack: unit + integration + e2e
- Clean architecture & professional structure
- Ability to deliver a full solution end-to-end

Exactly what the Dustin assessment aims to evaluate.
