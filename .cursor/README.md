# MWAP Client - Cursor AI Configuration

## 🎯 Welcome to MWAP Client Cursor Configuration

This directory contains comprehensive Cursor AI IDE configuration for the **Modular Web Application Platform (MWAP) Client** - a production-ready React TypeScript application with extensive documentation and feature-based architecture.

## 📁 Configuration Files Overview

### Core Configuration Files

| File | Purpose | Use Case |
|------|---------|----------|
| **[cursor-rules.md](./cursor-rules.md)** | Core development rules and guidelines | General development, code quality standards |
| **[instructions.md](./instructions.md)** | Detailed implementation instructions | Feature development, task execution |
| **[composer.md](./composer.md)** | Multi-file editing configuration | Complex refactoring, architecture changes |
| **[chat.md](./chat.md)** | Chat interaction guidelines | Code analysis, debugging, Q&A |
| **[docs.md](./docs.md)** | Documentation navigation guide | Understanding project structure |
| **[prompts.md](./prompts.md)** | Optimized prompts and templates | Specific development tasks |

## 🚀 Quick Start Guide

### For New Developers
1. **Start Here**: Read [`cursor-rules.md`](./cursor-rules.md) for core principles
2. **Implementation**: Review [`instructions.md`](./instructions.md) for detailed guidance
3. **Documentation**: Use [`docs.md`](./docs.md) to navigate project docs
4. **Chat Help**: Reference [`chat.md`](./chat.md) for AI assistance patterns

### For Experienced Developers
1. **Rules**: [`cursor-rules.md`](./cursor-rules.md) - Core development standards
2. **Prompts**: [`prompts.md`](./prompts.md) - Optimized prompt templates
3. **Composer**: [`composer.md`](./composer.md) - Multi-file editing guidance

## 🏗️ Project Architecture Context

### Feature-Based Structure
```
src/features/[module]/
├── hooks/          # Business logic hooks
├── pages/          # UI components
├── types/          # TypeScript definitions
└── index.ts        # Feature exports
```

### Current Features
- **auth**: Authentication and user management
- **tenants**: Multi-tenant organization management
- **projects**: Project creation and management
- **project-types**: Project type definitions
- **cloud-providers**: Cloud storage integrations
- **files**: File browsing and management

### Technology Stack
- **React 19+** with TypeScript
- **Mantine UI v8** for components
- **React Query** for server state
- **Auth0** for authentication
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zod** for validation

## 📚 Essential Documentation

### Primary Documentation (Always Reference First)
- **[`../DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md)** - Complete project overview
- **[`../docs/architecture/README.md`](../docs/architecture/README.md)** - System architecture
- **[`../docs/development/README.md`](../docs/development/README.md)** - Coding standards
- **[`../docs/api/README.md`](../docs/api/README.md)** - API integration (CRITICAL)
- **[`../docs/security/README.md`](../docs/security/README.md)** - Security patterns
- **[`../docs/features/README.md`](../docs/features/README.md)** - Feature specifications

### Quick Reference
- **[`../docs/troubleshooting.md`](../docs/troubleshooting.md)** - Common issues
- **[`../docs/getting-started.md`](../docs/getting-started.md)** - Setup guide
- **[`../docs/contributing.md`](../docs/contributing.md)** - Contribution guidelines

## 🔧 Development Standards

### Core Principles
- 🧠 **Documentation First**: Always read relevant docs before coding
- 🔁 **Pattern Reuse**: Follow established components, hooks, types
- ✅ **Type Safety**: Maintain strict TypeScript compliance
- 🔐 **Security First**: Never skip authentication/authorization
- 🚫 **No Duplication**: Reuse existing functions, services, types
- 🧪 **Input Validation**: Use Zod for all user inputs
- 🧱 **Modular Structure**: Follow feature-based organization

### Critical Configuration
- **API Base URL**: `/api` (configured in `src/shared/utils/api.ts`)
- **Vite Proxy**: DO NOT MODIFY `vite.config.ts` proxy configuration
- **Auth0 Integration**: Use established PKCE flow patterns
- **TypeScript**: Maintain strict mode compliance

## 🎯 Using Cursor Configuration

### For Code Development
1. **Read Rules**: [`cursor-rules.md`](./cursor-rules.md) - Understand core principles
2. **Follow Instructions**: [`instructions.md`](./instructions.md) - Implementation guidance
3. **Use Prompts**: [`prompts.md`](./prompts.md) - Optimized prompt templates
4. **Reference Docs**: [`docs.md`](./docs.md) - Navigate documentation

### For Multi-File Editing
1. **Composer Config**: [`composer.md`](./composer.md) - Multi-file editing guidelines
2. **Architecture Understanding**: Know file relationships and dependencies
3. **Pattern Consistency**: Maintain established patterns across files
4. **Quality Gates**: Ensure all changes meet project standards

### For Chat Assistance
1. **Chat Guidelines**: [`chat.md`](./chat.md) - Effective AI interaction
2. **Context Setting**: Provide relevant project context
3. **Specific Questions**: Ask targeted questions with code examples
4. **Documentation Reference**: Always reference relevant docs

## 🚨 Critical Warnings

### Never Do These
- ❌ Modify Vite proxy configuration in `vite.config.ts`
- ❌ Skip authentication/authorization checks
- ❌ Create duplicate functions or components
- ❌ Ignore TypeScript errors or warnings
- ❌ Skip input validation with Zod
- ❌ Hardcode API URLs (use configured client)

### Always Do These
- ✅ Read documentation before coding
- ✅ Follow established patterns
- ✅ Reuse existing components/hooks
- ✅ Implement proper error handling
- ✅ Use TypeScript strictly
- ✅ Validate all user inputs
- ✅ Test implementations thoroughly

## 🔄 Common Workflows

### Adding New Feature
1. **Plan**: Review [`../docs/features/README.md`](../docs/features/README.md)
2. **Structure**: Create feature directory in `src/features/`
3. **Types**: Define TypeScript interfaces
4. **Hooks**: Implement business logic
5. **Components**: Build UI components
6. **Integration**: Update routing and navigation
7. **Testing**: Verify functionality
8. **Documentation**: Update relevant docs

### Bug Fixing
1. **Analyze**: Check [`../docs/troubleshooting.md`](../docs/troubleshooting.md)
2. **Understand**: Review architecture and patterns
3. **Fix**: Implement solution following standards
4. **Test**: Verify fix doesn't break other functionality
5. **Document**: Update troubleshooting if needed

### Performance Optimization
1. **Identify**: Find performance bottlenecks
2. **Analyze**: Review current implementation
3. **Optimize**: Apply React performance patterns
4. **Measure**: Verify improvements
5. **Document**: Update performance notes

## 📋 Quality Checklist

### Every Implementation Should
- [ ] Follow established patterns and conventions
- [ ] Maintain TypeScript strict compliance
- [ ] Implement proper security measures
- [ ] Reuse existing components and utilities
- [ ] Handle errors gracefully
- [ ] Provide good user experience
- [ ] Be well-documented and maintainable
- [ ] Pass all quality gates

### Code Review Checklist
- [ ] Follows project coding standards
- [ ] Implements proper error handling
- [ ] Uses established security patterns
- [ ] Maintains performance standards
- [ ] Includes proper TypeScript types
- [ ] Reuses existing components/patterns
- [ ] Updates relevant documentation

## 🎨 UI/UX Standards

### Mantine UI Framework
- **Version**: Mantine v8
- **Components**: Use consistently throughout
- **Theme**: Follow established configuration
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG compliance required

### Styling Approach
- **Tailwind CSS**: Primary utility framework
- **Component Styles**: Keep close to components
- **Design System**: Follow established tokens
- **Performance**: Optimize bundle size

## 🔒 Security Standards

### Authentication
- **Auth0 PKCE Flow**: Use established patterns
- **Role-Based Access**: Implement RBAC consistently
- **Token Management**: Secure handling and refresh
- **Route Protection**: Based on authentication state

### Input Validation
- **Zod Schemas**: For all user inputs
- **Sanitization**: Prevent XSS and injection
- **Error Handling**: Secure error messages
- **Data Protection**: Sensitive information handling

## 🎯 Success Metrics

Your development is successful when:
- ✅ Code follows established patterns
- ✅ TypeScript compliance is maintained
- ✅ Security measures are implemented
- ✅ Performance standards are met
- ✅ User experience is excellent
- ✅ Documentation is updated
- ✅ Tests pass (when available)
- ✅ Code is maintainable and scalable

## 🔗 External Resources

### Framework Documentation
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Vite**: https://vitejs.dev/
- **Mantine UI**: https://mantine.dev/

### Library Documentation
- **React Query**: https://tanstack.com/query/
- **Auth0 React**: https://auth0.com/docs/quickstart/spa/react
- **Zod**: https://zod.dev/
- **Tailwind CSS**: https://tailwindcss.com/

## 📞 Support and Community

### Getting Help
1. **Documentation**: Check comprehensive project docs
2. **Troubleshooting**: Review common issues guide
3. **Chat AI**: Use configured chat guidelines
4. **Community**: Follow contribution guidelines

### Contributing
1. **Read**: [`../docs/contributing.md`](../docs/contributing.md)
2. **Follow**: Established patterns and standards
3. **Test**: Verify all functionality works
4. **Document**: Update relevant documentation

---

**Welcome to the MWAP Client development environment! This Cursor configuration is designed to help you build high-quality, maintainable code following established patterns and comprehensive documentation. Happy coding! 🚀**