# MWAP Documentation

## Overview

This documentation covers the architecture, components, and best practices for the MWAP (Modular Web Application Platform) application.

## Architecture

The MWAP application follows a modern React architecture with the following key features:

1. **Component-Based Structure**: The application is built using reusable React components
2. **Context-Based State Management**: Global state is managed using React Context
3. **React Query for Data Fetching**: Data fetching and caching are handled using React Query
4. **TypeScript for Type Safety**: The entire application is written in TypeScript
5. **Permission-Based Access Control**: Access to features is controlled using a permission system
6. **Standardized API Response Handling**: API responses are handled consistently across the application
7. **Centralized Cloud Provider Management**: Cloud provider operations are managed through a dedicated context

## Key Documentation

### Architecture and Patterns

- [Permission System](./PERMISSIONS.md): How the permission system works and how to use it
- [API Response Handling](./API_RESPONSE_HANDLING.md): How API responses are handled
- [Cloud Provider Context](./CLOUD_PROVIDER_CONTEXT.md): How cloud providers are managed

### Component Documentation

- [Components](./COMPONENTS.md): Overview of the main components
- [Hooks](./HOOKS.md): Custom hooks used in the application
- [Utilities](./UTILITIES.md): Utility functions and helpers

### Development Guides

- [Getting Started](./GETTING_STARTED.md): How to set up the development environment
- [Contributing](./CONTRIBUTING.md): Guidelines for contributing to the project
- [Testing](./TESTING.md): How to test the application

## Recent Changes

### Cloud Provider Integration Refactoring

We've made significant changes to how cloud provider and cloud provider integration is handled:

1. **Centralized Cloud Provider Context**: All cloud provider operations are now managed through a dedicated context
2. **Permission-Based Access Control**: Access to cloud provider features is now controlled using a permission system
3. **Standardized API Response Handling**: API responses are now handled consistently across the application
4. **Improved Error Handling**: Error handling for cloud provider operations has been improved
5. **Better Loading States**: Loading states for cloud provider operations are now more consistent

These changes have fixed several issues, including:

- SuperAdmin without a tenant can now create a tenant from the quick actions
- Cloud provider integration errors are now handled properly
- Loading states are more consistent across the application

## Best Practices

1. **Use the Permission System**: Always use the permission system for access control
2. **Use the API Response Handler**: Always use the API response handler for API calls
3. **Use the Cloud Provider Context**: Always use the Cloud Provider Context for cloud provider operations
4. **Handle Loading and Error States**: Always handle loading and error states in your components
5. **Use TypeScript**: Always use TypeScript for type safety
6. **Write Tests**: Always write tests for your components
7. **Follow the DRY Principle**: Don't repeat yourself - use reusable components and utilities
8. **Document Your Code**: Always document your code with comments and JSDoc

## Troubleshooting

If you encounter issues with the application:

1. Check the browser console for errors
2. Check the network tab for API errors
3. Check the application logs
4. Refer to the relevant documentation
5. Ask for help in the project's communication channels