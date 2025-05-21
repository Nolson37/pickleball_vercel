# Pickleball Facility Owner Platform

## Deployment Instructions

### Vercel Deployment

To deploy this application to Vercel, follow these steps:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Create a new project in Vercel and connect it to your Git repository.
3. **Create a PostgreSQL database**:
   - In the Vercel dashboard, go to "Storage" and create a new PostgreSQL database.
   - Vercel will automatically inject the database connection variables into your deployment.

4. **Set up environment variables**:
   - In the Vercel project settings, go to the "Environment Variables" tab.
   - Add the following environment variable:
     - `NEXTAUTH_SECRET`: "0abf0255d10145f1f69f0a3c33d0f9aa6c61d99e126ddc1ebd9d1dde49ed77b9" (or generate a new secure random string)
   
   - Note: Vercel automatically sets the following variables, so you don't need to add them manually:
     - `POSTGRES_PRISMA_URL`: Connection string for your PostgreSQL database (with connection pooling)
     - `POSTGRES_URL_NON_POOLING`: Connection string for your PostgreSQL database (without connection pooling)
     - `DATABASE_URL`: Will be set to the same value as `POSTGRES_PRISMA_URL`
     - `NEXTAUTH_URL`: Will be set to your deployment URL
     - `VERCEL_URL`: Your deployment URL
     - `NODE_ENV`: Set to "production" in production deployments

5. **Deploy the application**:
   - Click "Deploy" to start the deployment process.
   - The `vercel.json` file in this repository configures the build process to run Prisma migrations automatically.

6. **Verify the deployment**:
   - Once the deployment is complete, visit your deployment URL to verify that the application is working correctly.
   - If you encounter a 404 error, check the troubleshooting section below.

### Local Development

To run the application locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables in `.env.local` or `.env`.
4. Run the development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

If you encounter a 404 error after deployment:

1. **Check environment variables**:
   - In the Vercel dashboard, go to your project settings.
   - Verify that all required environment variables are set correctly.
   - Make sure the PostgreSQL database is properly configured and accessible.

2. **Check build logs**:
   - In the Vercel dashboard, go to the "Deployments" tab.
   - Click on the latest deployment and check the build logs for any errors.
   - Look for any issues with Prisma migrations or database connections.

3. **Run migrations manually**:
   - If the automatic migrations didn't run correctly, you can run them manually:
   - In the Vercel dashboard, go to your project.
   - Click on "Deployments" and select the latest deployment.
   - Click on "Functions" and select the "Console" tab.
   - Run the following command: `npx prisma migrate deploy`

4. **Check Next.js logs**:
   - In the Vercel dashboard, go to the "Logs" tab.
   - Look for any errors related to Next.js or the application.
