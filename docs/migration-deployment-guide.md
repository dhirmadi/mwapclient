# Migration & Deployment Guide: Integration Management Feature

## Overview

This guide provides comprehensive instructions for migrating from the legacy tenant-based integration system to the new standalone Integration Management feature, along with deployment procedures and rollback plans.

## Migration Overview

### What Changed
- **Feature Extraction**: Integration functionality moved from `src/features/tenants/` to `src/features/integrations/`
- **Route Changes**: Integration routes moved from `/tenant/integrations` to `/integrations`
- **API Updates**: New dedicated integration endpoints with enhanced functionality
- **Enhanced Security**: PKCE-enabled OAuth flow with improved CSRF protection
- **Improved UX**: Dedicated integration management interface

### Migration Benefits
- **Clean Architecture**: Better separation of concerns
- **Enhanced Security**: PKCE OAuth implementation with comprehensive token management
- **Improved Performance**: Optimized React Query caching and background updates
- **Better UX**: Dedicated integration interface with advanced features
- **Maintainability**: Easier to maintain and extend integration functionality

## Pre-Migration Checklist

### Development Environment
- [ ] Node.js 18+ installed
- [ ] npm dependencies up to date (`npm install`)
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] Development server running without errors (`npm run dev`)
- [ ] All existing tests passing (`npm test`)

### Backend Dependencies
- [ ] Backend API supports new integration endpoints
- [ ] OAuth providers configured with new redirect URIs
- [ ] Database migrations completed (if required)
- [ ] API rate limits configured appropriately

### Security Requirements
- [ ] OAuth client credentials updated for PKCE support
- [ ] CSRF protection mechanisms verified
- [ ] Token storage security reviewed
- [ ] SSL/TLS certificates valid and up to date

## Migration Process

### Phase 1: Pre-Migration Preparation

#### 1.1 Backup Current State
```bash
# Create backup branch
git checkout -b backup/pre-integration-migration
git push origin backup/pre-integration-migration

# Document current integration state
npm run build
npm run test
```

#### 1.2 Update Dependencies
```bash
# Ensure all dependencies are current
npm install
npm audit fix

# Verify TypeScript compilation
npx tsc --noEmit
```

#### 1.3 Environment Configuration
```bash
# Verify environment variables
echo $AUTH0_client_id
echo $AUTH0_client_secret

# Check API connectivity
curl -H "Authorization: Bearer $TOKEN" https://mwapss.shibari.photo/api/v1/integrations
```

### Phase 2: Code Migration

#### 2.1 Feature Structure Migration
The integration feature has been completely restructured:

```bash
# Old structure (removed)
src/features/tenants/
├── hooks/useTenants.ts (integration hooks removed)
├── pages/TenantIntegrationsPage.tsx (deleted)
└── types/tenant.types.ts (integration types removed)

# New structure (created)
src/features/integrations/
├── hooks/
│   ├── useIntegrations.ts
│   ├── useCreateIntegration.ts
│   ├── useUpdateIntegration.ts
│   ├── useDeleteIntegration.ts
│   ├── useOAuthFlow.ts
│   └── useTokenManagement.ts
├── pages/
│   ├── IntegrationListPage.tsx
│   ├── IntegrationCreatePage.tsx
│   └── IntegrationDetailsPage.tsx
├── components/
│   ├── IntegrationCard.tsx
│   ├── TokenStatusBadge.tsx
│   ├── ProviderSelector.tsx
│   └── OAuthButton.tsx
├── types/
│   ├── integration.types.ts
│   └── oauth.types.ts
└── utils/
    ├── constants.ts
    ├── integrationUtils.ts
    └── oauthUtils.ts
```

#### 2.2 Route Migration
Routes have been updated for better organization:

```typescript
// Old routes (deprecated)
/tenant/integrations          → /integrations
/tenant/integrations/create   → /integrations/create
/tenant/integrations/:id      → /integrations/:id

// Automatic redirects implemented
<Route path="/tenant/integrations/*" element={<RedirectRoute to="/integrations" />} />
```

#### 2.3 API Endpoint Migration
API endpoints have been restructured:

```typescript
// Old endpoints (deprecated)
GET    /api/tenants/{tenantId}/integrations
POST   /api/tenants/{tenantId}/integrations
PATCH  /api/tenants/{tenantId}/integrations/{id}
DELETE /api/tenants/{tenantId}/integrations/{id}

// New endpoints (current)
GET    /api/integrations
POST   /api/integrations
PATCH  /api/integrations/{id}
DELETE /api/integrations/{id}
POST   /api/integrations/{id}/oauth/initiate
POST   /api/integrations/{id}/tokens/refresh
GET    /api/integrations/{id}/health
```

### Phase 3: Testing Migration

#### 3.1 Unit Testing
```bash
# Run integration feature tests
npm test -- --testPathPattern=integrations

# Run affected component tests
npm test -- --testPathPattern="(tenant|integration|oauth)"

# Run full test suite
npm test
```

#### 3.2 Integration Testing
```bash
# Test OAuth flow end-to-end
# 1. Navigate to /integrations
# 2. Click "Create Integration"
# 3. Select cloud provider
# 4. Complete OAuth flow
# 5. Verify integration created

# Test token management
# 1. Navigate to integration details
# 2. Click "Refresh Token"
# 3. Verify token status updated
# 4. Test connection functionality
```

#### 3.3 User Acceptance Testing
```bash
# Test user workflows
# 1. Tenant owner login
# 2. Navigate to integrations
# 3. Create new integration
# 4. Manage existing integrations
# 5. Test bulk operations
# 6. Verify file access still works
```

### Phase 4: Deployment

#### 4.1 Pre-Deployment Verification
```bash
# Build production bundle
npm run build

# Verify build output
ls -la dist/
du -sh dist/

# Test production build locally
npm run preview
```

#### 4.2 Deployment Steps
```bash
# 1. Deploy to staging environment
git checkout cloud-provider-integration
git pull origin cloud-provider-integration
npm ci
npm run build
# Deploy to staging

# 2. Run staging tests
npm run test:e2e:staging

# 3. Deploy to production
# Deploy to production environment
# Update DNS/CDN if necessary
# Monitor application startup
```

#### 4.3 Post-Deployment Verification
```bash
# Verify application health
curl -f https://your-domain.com/health

# Test critical paths
# 1. User authentication
# 2. Integration creation
# 3. OAuth flow completion
# 4. File access functionality

# Monitor error rates
# Check application logs
# Verify performance metrics
```

## Rollback Procedures

### Emergency Rollback Plan

#### Immediate Rollback (< 5 minutes)
```bash
# 1. Revert to previous deployment
git checkout backup/pre-integration-migration
npm ci
npm run build
# Deploy previous version

# 2. Update DNS/CDN if necessary
# 3. Verify application functionality
# 4. Communicate rollback to users
```

#### Database Rollback (if required)
```sql
-- If database changes were made, rollback schema
-- This should be coordinated with backend team
-- Example rollback commands (adjust as needed)
-- ALTER TABLE integrations RENAME TO tenant_integrations;
-- UPDATE routes SET path = '/tenant/integrations' WHERE path = '/integrations';
```

### Partial Rollback Options

#### Route-Only Rollback
```typescript
// Temporarily redirect new routes to old routes
<Route path="/integrations/*" element={<RedirectRoute to="/tenant/integrations" />} />

// Re-enable old tenant integration page
import { TenantIntegrationsPage } from './features/tenants/pages/TenantIntegrationsPage';
```

#### Feature Flag Rollback
```typescript
// Use feature flags to control integration feature
const useNewIntegrations = process.env.REACT_APP_NEW_INTEGRATIONS === 'true';

export const IntegrationsRouter = () => {
  if (useNewIntegrations) {
    return <NewIntegrationsRoutes />;
  }
  return <LegacyIntegrationsRoutes />;
};
```

## Monitoring & Alerting

### Key Metrics to Monitor

#### Application Performance
- **Page Load Times**: Monitor integration page load performance
- **API Response Times**: Track integration API endpoint performance
- **Error Rates**: Monitor 4xx/5xx error rates for integration endpoints
- **User Engagement**: Track integration creation and usage rates

#### OAuth Flow Monitoring
- **OAuth Success Rate**: Monitor successful OAuth completions
- **Token Refresh Rate**: Track automatic token refresh success
- **Integration Health**: Monitor integration connection health
- **PKCE Implementation**: Verify PKCE security measures

#### User Experience Metrics
- **Route Transition Success**: Monitor redirect success rates
- **Feature Adoption**: Track new integration feature usage
- **User Feedback**: Monitor support tickets and user feedback
- **Performance Impact**: Track bundle size and load time impact

### Alerting Configuration
```yaml
# Example alerting rules (adjust for your monitoring system)
alerts:
  - name: IntegrationAPIErrors
    condition: error_rate > 5%
    duration: 5m
    action: notify_team
    
  - name: OAuthFlowFailures
    condition: oauth_success_rate < 90%
    duration: 10m
    action: escalate
    
  - name: IntegrationPageLoadTime
    condition: page_load_time > 3s
    duration: 5m
    action: investigate
```

## Troubleshooting Guide

### Common Issues and Solutions

#### OAuth Flow Issues
```typescript
// Issue: OAuth callback fails with PKCE error
// Solution: Verify PKCE implementation
const pkceChallenge = generatePKCEChallenge();
console.log('PKCE Challenge:', pkceChallenge);

// Issue: CSRF token validation fails
// Solution: Check state parameter generation
const oauthState = createOAuthState(integrationId);
console.log('OAuth State:', oauthState);
```

#### Route Redirect Issues
```typescript
// Issue: Old routes not redirecting properly
// Solution: Verify redirect component implementation
<Route 
  path="/tenant/integrations/*" 
  element={<RedirectRoute to="/integrations" />} 
/>

// Issue: Breadcrumb navigation broken
// Solution: Update breadcrumb configuration
const breadcrumbs = useBreadcrumbs();
console.log('Current breadcrumbs:', breadcrumbs);
```

#### API Integration Issues
```typescript
// Issue: Integration endpoints returning 404
// Solution: Verify API base URL configuration
console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);

// Issue: Token refresh failing
// Solution: Check token management implementation
const tokenHealth = await checkTokenHealth(integrationId);
console.log('Token Health:', tokenHealth);
```

### Performance Issues
```typescript
// Issue: Slow integration page loading
// Solution: Implement code splitting
const IntegrationListPage = lazy(() => import('./pages/IntegrationListPage'));

// Issue: Memory leaks in OAuth flow
// Solution: Cleanup event listeners and timers
useEffect(() => {
  const cleanup = setupOAuthListener();
  return cleanup;
}, []);
```

## User Communication Plan

### Pre-Migration Communication
```markdown
Subject: Upcoming Enhancement: Improved Integration Management

Dear MWAP Users,

We're excited to announce an upcoming enhancement to our cloud provider integration system. This update will provide:

- Enhanced security with improved OAuth implementation
- Better user interface for managing integrations
- Improved performance and reliability
- New features for bulk operations and health monitoring

Timeline:
- Deployment: [Date]
- Expected downtime: < 5 minutes
- New features available immediately after deployment

What to expect:
- Integration management will move to a dedicated section
- All existing integrations will be preserved
- Improved OAuth flow with better security
- Enhanced token management capabilities

If you have any questions, please contact our support team.

Best regards,
MWAP Development Team
```

### Post-Migration Communication
```markdown
Subject: Integration Management Enhancement Complete

Dear MWAP Users,

We've successfully deployed the enhanced Integration Management system. Here's what's new:

New Features:
✅ Dedicated integration management interface
✅ Enhanced OAuth security with PKCE
✅ Improved token management and health monitoring
✅ Bulk operations for managing multiple integrations
✅ Better error handling and user feedback

What Changed:
- Integration management is now in its own section
- Improved security for OAuth flows
- Better performance and user experience
- Enhanced monitoring and troubleshooting tools

Getting Started:
1. Navigate to the "Integrations" section in the main menu
2. Your existing integrations are preserved and ready to use
3. Create new integrations with the improved wizard
4. Explore new features like bulk operations and health monitoring

Need Help?
- Check our updated documentation: [Link]
- Contact support: [Email/Phone]
- Watch tutorial videos: [Link]

Thank you for your patience during this enhancement.

Best regards,
MWAP Development Team
```

## Success Criteria

### Technical Success Metrics
- [ ] Zero data loss during migration
- [ ] All existing integrations functional post-migration
- [ ] OAuth flow success rate > 95%
- [ ] Page load times improved or maintained
- [ ] Error rates < 1% for integration operations
- [ ] TypeScript compilation with zero errors
- [ ] Test coverage maintained or improved

### User Experience Success Metrics
- [ ] User adoption of new integration interface > 80%
- [ ] Support ticket volume related to integrations decreased
- [ ] User satisfaction scores improved
- [ ] Feature discovery and usage increased
- [ ] Time to create new integrations reduced

### Security Success Metrics
- [ ] PKCE implementation verified and functional
- [ ] CSRF protection working correctly
- [ ] Token security enhanced (no localStorage usage)
- [ ] OAuth state validation functioning properly
- [ ] Security audit passed with no critical issues

## Conclusion

This migration guide provides a comprehensive approach to deploying the new Integration Management feature while maintaining system stability and user experience. The phased approach ensures minimal risk and provides multiple rollback options if issues arise.

Key success factors:
1. **Thorough Testing**: Comprehensive testing at each phase
2. **Monitoring**: Continuous monitoring of key metrics
3. **Communication**: Clear communication with users throughout the process
4. **Rollback Readiness**: Well-defined rollback procedures
5. **Documentation**: Complete documentation for troubleshooting

The new Integration Management feature represents a significant improvement in architecture, security, and user experience while maintaining full backward compatibility during the transition period.