# Std6730202190IPFinal2026 — HR Manager & Salary Analytics System

Final Exam: Internet Programming (2026) — Express.js backend + React Native (Expo) frontend.

## Project structure

```
Std6730202190IPFinal2026
├── backend                        Express.js REST API
│   ├── .env.example               optional settings (copy to .env)
│   ├── database/schema.sql        MySQL table + seed data (for phpMyAdmin)
│   ├── server.js                  entry point (node server.js) -> src/server.js
│   ├── src
│   │   ├── server.js              picks storage, starts HTTP server
│   │   ├── app.js                 Express app (middleware, routes, error handling)
│   │   ├── config/                reads .env, constants (login, limits)
│   │   ├── routes/                URL -> controller mapping
│   │   ├── controllers/           request/response handling (auth, employees)
│   │   ├── validators/            input validation for new employees
│   │   ├── services/              business logic: 1D K-Means, salary analysis
│   │   ├── repositories/          data access: in-memory (default) or MySQL
│   │   ├── middleware/            logger, auth guard, 404, error handler
│   │   └── data/                  seed employees
│   └── tests/api.test.js          automated API tests (npm test)
└── frontend                       React Native app (Expo SDK 57)
    ├── App.js                     root component
    └── src
        ├── navigation/            stack navigator (Login -> Dashboard)
        ├── screens/               LoginScreen, DashboardScreen
        ├── components/
        │   ├── employees/         EmployeeCard, AddEmployeeForm
        │   ├── analytics/         SalaryClusters (tier cards)
        │   └── common/            StatCard
        ├── services/api.js        fetch wrapper + all API calls
        ├── config/api.js          API URL (auto-detected from Expo)
        ├── constants/theme.js     colors
        └── utils/                 money formatting, form validation
```

## 1. Run the backend (Node.js 18+)

```bash
cd backend
npm install
npm start
```

Listens on **port 3000** and prints its LAN address, e.g. `http://192.168.1.10:3000`.
Run the automated tests with `npm test`.

### Storage: in-memory (default) or MySQL (optional)

Without a `backend/.env` file the API keeps data in an in-memory array, as required by the exam
(data resets on restart). To use MySQL instead:

1. Run `backend/database/schema.sql` in phpMyAdmin (or let the backend create the table itself).
2. Copy `backend/.env.example` to `backend/.env` and fill in `DB_PASSWORD`.
3. `npm start` — the log shows `Storage: MySQL ...`.

If MySQL cannot be reached (wrong password, port 3306 blocked, ...) the server logs a warning and
**falls back to in-memory** so it still starts. Set `DB_REQUIRED=true` to stop instead.
`GET /api/health` shows which storage is in use. `backend/.env` is git-ignored — never commit passwords.

### Optional: run the backend on the course server (with MySQL)

The course server gives each student a shell (`ssh -p 2222 <user>@119.59.102.161`), a workspace `/app`
and a backend port (here **3020**). MySQL is on the same machine, so `DB_HOST=localhost` works there.

1. Upload the **contents** of `backend/` (not `node_modules`) to `/app` with FileZilla
   (SFTP, host `119.59.102.161`, port `2222`).
2. In the SSH shell create `/app/.env` with `PORT=3020`, `DB_HOST=localhost`, `DB_USER`, `DB_PASSWORD`,
   `DB_NAME`, `DB_TABLE` (see `.env.example`).
3. `cd /app && npm ci && node server.js` → log shows `Storage: MySQL ...`.
4. Check `http://119.59.102.161:3020/api/health` → `{"storage":"mysql"}`.
5. Start the app against it: `EXPO_PUBLIC_API_URL=http://119.59.102.161:3020 npx expo start -c`
   (PowerShell: `$env:EXPO_PUBLIC_API_URL='http://119.59.102.161:3020'; npx expo start -c`).

## 2. Run the frontend (Expo Go)

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go**. Phone and computer must be on the same network.
The app automatically calls the API on the same IP as Metro (`http://<computer-ip>:3000`).
Override with `EXPO_PUBLIC_API_URL=http://<ip>:3000 npx expo start`.
If Windows Firewall asks, allow Node.js on private networks.

Login: **admin / password123**

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | `admin` / `password123` → `200 {success, token}`; otherwise `401` |
| GET | `/api/employees` | All employees `{success, count, data: [...]}` |
| POST | `/api/employees` | Add employee (`name`, `position`, `salary`) → `201`; empty / invalid field → `400` |
| PUT | `/api/employees/:id/status` | Toggle `Active` ↔ `On Leave`; unknown id → `404` |
| DELETE | `/api/employees/:id` | Delete employee; unknown id → `404` |
| GET | `/api/employees/salary-clusters` | 1D K-Means (k=3) → `{success, totalEmployees, clusters: [{group, centroid, count, minSalary, maxSalary}]}` |
| GET | `/api/health` | `{success, storage: "memory" \| "mysql"}` |

Employee: `{ "id": "1", "name": "John Doe", "position": "Software Engineer", "status": "Active", "salary": 45000 }`

### Validation and edge cases
- Blank / whitespace-only fields, non-numeric, zero, negative or too large salary → `400`; salary rounded to 2 decimals
- Malformed JSON → `400`; unknown route → `404`; database down at runtime → `503` (JSON, server keeps running)
- IDs are never reused after delete; toggling status is a single atomic update in MySQL
- K-Means: deterministic initialization (spread over sorted unique salaries), iterates until stable;
  no employees → empty `clusters`; fewer than 3 distinct salaries → fewer tiers (no empty/NaN tiers);
  tiers sorted lowest (Tier 1) to highest (Tier 3)
- Optional `REQUIRE_AUTH=true`: `/api/employees*` requires `Authorization: Bearer mock-jwt-token` (the app always sends it)

### Frontend behaviour
- Login: alert on failure, navigates to Dashboard on success; Dashboard can't be opened without logging in; logout
- Dashboard: stats, average salary, storage type, employee list, pull-to-refresh, error + retry
- Add form: client-side validation blocks empty / invalid input before any request; double taps are ignored
- Toggle Status / Delete per employee; Delete asks "Are you sure?" before calling the API
- Analyze Salary Structure: loading indicator, then tier cards (count, average salary, range)
