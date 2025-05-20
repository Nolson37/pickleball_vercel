# Deployment Procedures

This document provides detailed step-by-step procedures for deploying our Next.js application to different environments. It covers the entire deployment process from pre-deployment preparation to post-deployment verification.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Development Environment Deployment](#development-environment-deployment)
3. [Staging Environment Deployment](#staging-environment-deployment)
4. [Canary Deployment](#canary-deployment)
5. [Production Deployment](#production-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedures](#rollback-procedures)
8. [Database Migration Procedures](#database-migration-procedures)

## Pre-Deployment Checklist

Before initiating any deployment, ensure the following items are checked:

### Code Quality
- [ ] All unit tests are passing
- [ ] All integration tests are passing
- [ ] Code has been reviewed and approved
- [ ] Code meets development standards
- [ ] No security vulnerabilities identified

### Feature Flags
- [ ] New features are behind feature flags
- [ ] Feature flag configuration is correct
- [ ] Feature flags have been tested

### Database Changes
- [ ] Database migrations have been reviewed
- [ ] Down migrations are available for rollback
- [ ] Database backup has been created (for production)

### Documentation
- [ ] API changes are documented
- [ ] New features are documented
- [ ] Deployment notes are prepared

### Approvals
- [ ] Product owner approval obtained
- [ ] Technical lead approval obtained
- [ ] Security approval obtained (if applicable)

## Development Environment Deployment

The development environment is used for ongoing development and initial testing.

### Deployment Steps

1. **Prepare the Deployment**
   ```bash
   # Ensure you're on the correct branch
   git checkout <branch-name>
   
   # Pull latest changes
   git pull origin <branch-name>
   
   # Install dependencies
   npm install
   
   # Run tests
   npm test
   ```

2. **Deploy to Development**
   ```bash
   # Push to the development branch
   git push origin <branch-name>
   ```

   The CI/CD pipeline will automatically deploy to the development environment.

3. **Verify Deployment**
   - Access the development environment URL
   - Verify that the application loads correctly
   - Test the new features or changes
   - Check for any console errors

## Staging Environment Deployment

The staging environment mirrors the production environment and is used for final testing before production deployment.

### Deployment Steps

1. **Prepare the Deployment**
   ```bash
   # Create a release branch from development
   git checkout development
   git pull origin development
   git checkout -b release/v<version>
   
   # Update version numbers
   # Edit package.json and other version files
   
   # Commit version changes
   git add .
   git commit -m "Bump version to v<version>"
   
   # Push release branch
   git push origin release/v<version>
   ```

2. **Deploy to Staging**
   ```bash
   # Merge release branch to staging
   git checkout staging
   git pull origin staging
   git merge release/v<version>
   git push origin staging
   ```

   The CI/CD pipeline will automatically deploy to the staging environment.

3. **Execute Tests**
   ```bash
   # Run smoke tests
   npx ts-node web/prod-tests/smoke/run-smoke-tests.ts
   
   # Run load tests
   npx ts-node web/prod-tests/load/run-load-tests.ts
   ```

4. **Verify Deployment**
   - Access the staging environment URL
   - Verify that the application loads correctly
   - Test all critical paths
   - Verify feature flags are working correctly
   - Check for any performance issues

## Canary Deployment

Canary deployments allow us to release changes to a small subset of users before rolling them out to everyone.

### Deployment Steps

1. **Prepare the Canary Deployment**
   ```bash
   # Ensure staging deployment is stable
   # Review all test results
   
   # Create a canary branch from staging
   git checkout staging
   git pull origin staging
   git checkout -b canary/v<version>
   git push origin canary/v<version>
   ```

2. **Deploy to Canary Environment**
   - Go to the Vercel dashboard
   - Create a new deployment from the canary branch
   - Set the deployment as a canary deployment

   Alternatively, use the canary API:
   ```bash
   # Using the canary API
   curl -X POST https://api.example.com/api/canary \
     -H "Content-Type: application/json" \
     -d '{
       "version": "v<version>",
       "deploymentUrl": "https://canary-deployment.vercel.app",
       "associatedFeatureFlags": ["new_feature", "improved_search"]
     }'
   ```

3. **Configure Traffic Routing**
   - Start with 5% of traffic routed to the canary
   - Monitor for issues
   - Gradually increase traffic if no issues are detected

   ```bash
   # Using the canary API to update traffic
   curl -X PUT https://api.example.com/api/canary/traffic \
     -H "Content-Type: application/json" \
     -d '{
       "percentage": 10
     }'
   ```

4. **Monitor Canary Health**
   - Monitor error rates
   - Monitor performance metrics
   - Monitor user feedback
   - Compare metrics with production

5. **Decision Point**
   - If issues are detected, roll back the canary deployment
   - If the canary is stable, proceed to production deployment

## Production Deployment

Production deployment makes the changes available to all users.

### Deployment Steps

1. **Promote Canary to Production**
   - If using the canary deployment approach:
   ```bash
   # Using the canary API to promote
   curl -X POST https://api.example.com/api/canary/promote \
     -H "Content-Type: application/json"
   ```

   - If deploying directly from staging:
   ```bash
   # Merge staging to main
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   ```

   The CI/CD pipeline will automatically deploy to production.

2. **Enable Feature Flags**
   - Gradually enable feature flags for all users
   - Monitor for issues as features are enabled

3. **Verify Production Deployment**
   - Access the production URL
   - Verify that the application loads correctly
   - Test all critical paths
   - Monitor error rates and performance

## Post-Deployment Verification

After deployment, perform these verification steps:

1. **Run Production Tests**
   ```bash
   # Run smoke tests against production
   PROD_TEST_BASE_URL=https://production.example.com npx ts-node web/prod-tests/smoke/run-smoke-tests.ts
   
   # Run load tests against production
   PROD_TEST_BASE_URL=https://production.example.com npx ts-node web/prod-tests/load/run-load-tests.ts
   ```

2. **Monitor Key Metrics**
   - Error rates
   - Response times
   - User engagement
   - Conversion rates
   - Resource utilization

3. **Complete Validation Report**
   - Fill out the [Post-Deployment Validation Report](./post-deployment-validation-template.md)
   - Document any issues encountered
   - Document test results
   - Get sign-off from stakeholders

## Rollback Procedures

If issues are detected after deployment, follow these rollback procedures:

### Application Code Rollback

1. **Identify the Last Known Good Deployment**
   - Check Vercel deployment history
   - Identify the deployment ID to roll back to

2. **Execute Rollback**
   ```bash
   # Using Vercel CLI
   vercel rollback --environment=production
   
   # Or using the Vercel API
   curl -X POST https://api.vercel.com/v1/deployments/{deployment-id}/rollback \
     -H "Authorization: Bearer $VERCEL_TOKEN"
   ```

3. **Verify Rollback**
   - Access the production URL
   - Verify that the application has reverted to the previous version
   - Test critical paths
   - Monitor error rates and performance

### Database Rollback

1. **Determine Rollback Strategy**
   - For schema changes: Execute down migrations
   - For data issues: Restore from backup

2. **Execute Down Migrations**
   ```bash
   # Using Prisma
   npx prisma migrate down --name=<migration-name>
   
   # Or execute custom down migration SQL
   npx prisma db execute --file=./down.sql
   ```

3. **Restore from Backup (if needed)**
   ```bash
   # Using Vercel Postgres restore functionality
   # This will vary based on your database provider
   ```

4. **Verify Database State**
   - Run database health checks
   - Verify data integrity
   - Test application functionality with rolled back database

### Feature Flag Rollback

1. **Disable Problematic Feature Flags**
   ```bash
   # Using the feature flag API
   curl -X PUT https://api.example.com/api/feature-flags/{flag-key} \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": false
     }'
   ```

2. **Verify Feature Flags**
   - Confirm that the feature is disabled
   - Test application functionality without the feature
   - Monitor error rates and performance

## Database Migration Procedures

Database migrations require special handling during deployments:

### Preparing Database Migrations

1. **Create Migrations**
   ```bash
   # Using Prisma
   npx prisma migrate dev --name=<migration-name>
   ```

2. **Test Migrations**
   ```bash
   # Apply migrations to a test database
   DATABASE_URL=<test-database-url> npx prisma migrate deploy
   
   # Verify database state
   npx prisma db pull
   ```

3. **Create Down Migrations**
   ```bash
   # Generate down migration SQL
   npx prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-migrations prisma/migrations \
     --script > down.sql
   ```

### Applying Migrations in Production

1. **Backup the Database**
   ```bash
   # This will vary based on your database provider
   # For Vercel Postgres, use the dashboard to create a backup
   ```

2. **Apply Migrations**
   ```bash
   # Using Prisma
   npx prisma migrate deploy
   ```

3. **Verify Migration Success**
   ```bash
   # Check migration history
   npx prisma migrate status
   
   # Verify database state
   npx prisma db pull
   ```

4. **Rollback Plan**
   - Have the down migration SQL ready
   - Have the backup restoration procedure ready
   - Test the rollback procedure in a non-production environment