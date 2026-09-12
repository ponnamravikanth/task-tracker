# Task Tracker

A small full-stack task application created as a hands-on
software-development learning project.

Live application:
https://ponnamravikanth.github.io/task-tracker/

## Features

- Auth0 login and logout
- Private task lists for each authenticated user
- Add, complete, and delete tasks
- Persistent PostgreSQL storage
- Responsive browser interface
- Automated unit, API, and database integration tests
- Continuous integration with GitHub Actions
- Automatic frontend and backend deployment

## Architecture

```text
Browser
  |
  | HTTPS + Auth0 access token
  v
GitHub Pages frontend
  |
  | REST API
  v
Render Express API
  |
  | encrypted PostgreSQL connection
  v
Neon PostgreSQL
Auth0 authenticates users. The Express API validates access tokens
and uses the token's sub claim as the task owner ID.
Technology
- HTML and CSS
- JavaScript
- Vite
- Node.js 24
- Express 5
- PostgreSQL
- Auth0
- Vitest
- GitHub Actions
- GitHub Pages
- Render
- Neon
Local prerequisites
- Node.js 24
- npm
- PostgreSQL 17
- Git
- A configured Auth0 Single Page Application and API
Installation
Clone the repository and install dependencies:
git clone https://github.com/ponnamravikanth/task-tracker.git
cd task-tracker
npm ci
Copy .env.example to .env.local and replace its placeholders
with local development values.
Never commit .env.local or database credentials.
Local database
Create a PostgreSQL role and databases:
createuser --pwprompt task_tracker_app
createdb --owner=task_tracker_app task_tracker
createdb --owner=task_tracker_app task_tracker_test
Create .env.test.local with a TEST_DATABASE_URL that points
only to task_tracker_test.
Run locally
Start the API:
npm run server
In another terminal, start Vite:
npm run dev
Open:
http://localhost:5173/task-tracker/
Tests
Run fast automated tests:
npm test
Run PostgreSQL integration tests:
npm run test:postgres
Run server syntax checks:
npm run check:server
Build the production frontend:
npm run build
API
Public endpoint:
GET /api/health
Authenticated endpoints:
GET    /api/me
GET    /api/tasks
GET    /api/tasks/:taskId
POST   /api/tasks
PATCH  /api/tasks/:taskId
DELETE /api/tasks/:taskId
Authenticated requests require:
Authorization: Bearer <Auth0 access token>
Every task query is filtered by the authenticated token's sub
claim.
CI/CD
Pull requests targeting main run:
- Automated unit and API tests
- PostgreSQL integration tests
- Server syntax checks
- Production frontend build
After a merge into main:
- GitHub Actions deploys the frontend to GitHub Pages.
- Render automatically deploys the Express API.
Security notes
- Database credentials are stored outside Git.
- Auth0 access tokens are validated by the API.
- Users can access only tasks associated with their Auth0 ID.
- Task IDs and input lengths are validated.
- JSON request bodies have a size limit.
- Standard security response headers are enabled.
- This remains an educational prototype, not a production SLA
  service.
Free-tier limitations
- Render may sleep after inactivity, causing a slow first request.
- Neon may suspend inactive database compute and has usage limits.
- GitHub Pages serves only the static frontend.
- Auth0, Render, and Neon free-plan terms can change.
License
No open-source license has been selected. The source is publicly
visible, but that does not automatically grant permission to reuse
or redistribute it.

