# Deploying to Easypanel

This project is configured to be deployed as a Docker container on Easypanel. The frontend and backend are bundled together in a single container.

## Prerequisites

1.  **Git Repository**: Push your code to a Git provider (GitHub, GitLab, etc.).
2.  **Database**: You need a PostgreSQL database. You can use your existing Neon DB or create a standard PostgreSQL service in Easypanel.

## Steps to Deploy

1.  **Log in to Easypanel** and open your Project.
2.  **Create a Service**:
    *   Click **"App"**.
    *   Select **"Git"** as the source.
    *   Connect your repository and select the branch you want to deploy.
3.  **Configuration**:
    *   Easypanel should automatically detect the `nixpacks.toml` in the root directory.
    *   **Build Method**: Ensure it is set to **Nixpacks** (usually the default if no Dockerfile is found).
    *   **Port**: The container exposes port `3000`. Easypanel usually detects this, but if asked, specify `3000`.
4.  **Environment Variables**:
    You MUST set the following environment variables in the **Environment** tab of your service:

    *   `DATABASE_URL`: Your PostgreSQL connection string.
        *   *Example*: `postgresql://user:password@host:port/dbname?sslmode=require`
    *   `ACCESS_TOKEN_SECRET`: A long random string for securing sessions.
    *   `REFRESH_TOKEN_SECRET`: Another long random string.

5.  **Deploy**:
    *   Click **"Deploy"** or **"Create & Deploy"**.
    *   Wait for the build to finish. You can view the logs in the "Deployments" tab.

## Database Migrations

The application uses `node-pg-migrate`. The database schema must be initialized.
Since the app doesn't automatically run migrations on startup (to avoid race conditions in scaling), you should run them once.

**Option A: Run locally**
Connect to your production DB from your local machine and run:
```bash
npm run migrate up
```
(Make sure your `.env` points to the production DB temporarily, or pass the connection string manually).

**Option B: Run in Console**
1.  After deployment, go to the **Console** tab in Easypanel for your service.
2.  Run the command:
    ```bash
    node -r dotenv/config node_modules/node-pg-migrate/bin/node-pg-migrate up
    ```
    (Note: You might need to ensure `DATABASE_URL` is available to this command).

## Troubleshooting

*   **Build Fails**: Check the "Build Logs". If dependencies fail to install, ensure your `package-lock.json` is healthy.
*   **App Crashes**: Check "Service Logs".
    *   If you see "Connection refused" to DB, check your `DATABASE_URL`.
    *   If you see "Permissions denied", check if your DB user has rights.
