# Student Project Tracker

A hands-on web application for tracking student electronics projects.

## Technologies Used
- HTML, CSS and JavaScript
- Node.js and Express
- PostgreSQL with Supabase
- Vercel for deployment

## Run Locally
1. Open the project folder in VS Code.
2. Open the terminal in the project folder.
3. Install dependencies using `npm.cmd ci`.
4. Create a private `.env` file using `.env.example` as a template.
5. Add your own PostgreSQL connection string to `.env`.
6. Configure the database using `schema.sql` and the project's database setup instructions.
7. Run `npm.cmd start`.
8. Open http://localhost:3000.

## Database
This version uses PostgreSQL instead of SQLite. Existing SQLite records are not automatically migrated. The application uses shared demonstration records and does not have a sign-in system.

Keep database credentials private. Never commit `.env` or include the real `DATABASE_URL` in this README.

## Deployment
The application will be deployed using Vercel. Add the actual hosted URL only after deployment succeeds.

## Testing
Record the local startup, database operations, and deployment checks after you have completed them.