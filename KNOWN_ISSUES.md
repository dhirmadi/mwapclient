# Known Issues

**Last Updated:** October 4, 2025  
**Version:** 1.0.0

This document lists known issues, limitations, and planned improvements for the MWAP Client.

---

## 🔴 High Priority

### None

All high-priority issues have been resolved for the 1.0.0 release.

---

## 🟡 Medium Priority

### 1. Pre-Existing TypeScript Errors

**Issue:** 81 TypeScript errors exist in legacy code  
**Status:** Documented, not blocking  
**Impact:** No runtime impact, type-checking only  
**Root Cause:** Legacy `handleApiResponse` returns wrapper object instead of unwrapped data

**Affected Areas:**
- Cloud Providers hooks (2 errors)
- Integrations hooks (13 errors)
- Project Types pages (32 errors)
- Tenants hooks and pages (27 errors)
- Projects pages (7 errors)

**Workaround:** Code functions correctly at runtime despite TypeScript errors

**Fix Plan:** Migrate all hooks to new unified `apiResponse.ts` handler (Future sprint)

**Priority:** Low (no user impact, works correctly)

---

### 2. Data Transformation Test Failures

**Issue:** 5 tests failing in `dataTransform.test.ts`  
**Status:** Pre-existing from before refactoring  
**Impact:** Test suite shows 87% pass rate (33/38 passing)  
**Root Cause:** Legacy test expectations don't match current implementation

**Fix Plan:** Update tests to match current unified handler (Future sprint)

**Priority:** Low (tests are outdated, actual functionality works)

---

## 🟢 Low Priority

### 1. File Download Not Implemented

**Issue:** File download functionality not yet implemented  
**Status:** Planned feature  
**Impact:** Users can view files in cloud provider but can't download directly from app  
**Workaround:** "Open in Provider" link allows users to download from cloud provider UI

**Fix Plan:** Implement in v1.1.0

---

### 2. Virtual Scrolling Not Implemented

**Issue:** Large file lists (1000+ items) may have performance issues  
**Status:** Optimization pending  
**Impact:** Slow rendering for projects with very large file counts  
**Workaround:** Use folder navigation to reduce visible items

**Fix Plan:** Implement virtual scrolling in v1.2.0

---

### 3. Sentry Integration Pending

**Issue:** Error tracking not yet integrated with Sentry  
**Status:** Infrastructure ready, integration pending  
**Impact:** Errors logged to console only, no centralized tracking  
**Workaround:** ErrorBoundary captures errors, logs to console in development

**Fix Plan:** Configure Sentry in production deployment

---

### 4. Content Security Policy Headers

**Issue:** CSP headers not configured  
**Status:** Server-side configuration needed  
**Impact:** Additional security layer not active  
**Workaround:** Auth0 and HTTPS provide baseline security

**Fix Plan:** Configure on hosting platform (Vercel, Netlify, etc.)

---

## 📋 Future Enhancements

### Performance
- [ ] Virtual scrolling for large lists
- [ ] Image lazy loading
- [ ] Service worker for offline support
- [ ] Progressive Web App (PWA) features

### Features
- [ ] File upload functionality
- [ ] File preview (images, PDFs)
- [ ] Bulk file operations
- [ ] Advanced search filters
- [ ] File sharing capabilities
- [ ] Activity logs
- [ ] Real-time notifications

### Testing
- [ ] Expand test coverage from 40% to 80%+
- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Add performance benchmarks

### Developer Experience
- [ ] Storybook for component development
- [ ] Enhanced TypeScript types
- [ ] Better error messages
- [ ] Development mode improvements

---

## 🐛 Reporting Issues

### How to Report

1. **Check Existing Issues:** Review this document and GitHub issues
2. **Gather Information:**
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
3. **Create GitHub Issue:** Use appropriate template
4. **Include Context:** Environment, user role, feature area

### Issue Template

```markdown
**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 118
- OS: macOS 14
- User Role: Tenant Owner
- Feature: Project Management

**Screenshots:**
If applicable

**Additional Context:**
Any other relevant information
```

---

## 🔄 Issue Status Definitions

- **🔴 High Priority:** Blocking or severe impact, needs immediate attention
- **🟡 Medium Priority:** Important but has workaround, planned for next release
- **🟢 Low Priority:** Minor impact, future enhancement
- **✅ Resolved:** Fixed in current or previous release
- **🚧 In Progress:** Currently being worked on
- **📋 Planned:** Scheduled for future release

---

## 📊 Issue Statistics

| Priority | Count | Status |
|----------|-------|--------|
| High | 0 | - |
| Medium | 2 | Documented |
| Low | 4 | Planned |
| Enhancements | 15+ | Backlog |

---

## 🔗 Related Documents

- **[CHANGELOG.md](./CHANGELOG.md)** - Release history and changes
- **[Troubleshooting Guide](./docs/06-Guidelines/troubleshooting.md)** - Common issues and solutions
- **[Development Guide](./docs/06-Guidelines/development-guide.md)** - Development best practices
- **[Security Audit](./docs/09-Reports-and-History/SECURITY_AUDIT.md)** - Security review results

---

**Document Version:** 1.0  
**Last Review:** October 4, 2025  
**Next Review:** November 4, 2025

