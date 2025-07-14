# Priority 2 Short-term Improvements - Detailed Implementation Plan

**Target Timeline:** 2-3 weeks (after Priority 1 completion)  
**Risk Level:** 🟡 **MODERATE** - Maintainability and scalability improvements  
**Prerequisites:** Priority 1 critical fixes must be completed first  

---

## Overview

This plan addresses architectural inconsistencies, code redundancy, and maintainability issues. These improvements will align the implementation with documented architecture and establish a solid foundation for future development.

---

## Improvement 1: Refactor to Feature-Based Architecture

### 1.1 Problem Analysis

**Current State:**
```
/src
  /components/common/
  /components/layout/
  /hooks/
  /pages/cloud-providers/
  /pages/project-types/
  /pages/projects/
  /pages/tenants/
  /types/
  /utils/
```

**Target State:**
```
/src
  /features/
    /auth/
    /tenants/
    /projects/
    /cloud-providers/
    /project-types/
    /files/
  /shared/
    /components/
    /hooks/
    /utils/
    /types/
  /core/
    /context/
    /router/
    /layouts/
```

**Benefits:**
- Better code organization and maintainability
- Clearer feature boundaries
- Easier testing and development
- Scalable architecture for future features

### 1.2 Migration Strategy

**Approach:** Incremental migration to minimize disruption

**Phase A:** Create new structure alongside existing
**Phase B:** Migrate features one by one
**Phase C:** Remove old structure

### 1.3 Implementation Steps

#### Step 1.3.1: Create New Directory Structure
**Timeline:** Day 1

**New Directories to Create:**
```bash
mkdir -p src/features/auth/{components,hooks,pages,types,utils}
mkdir -p src/features/tenants/{components,hooks,pages,types,utils}
mkdir -p src/features/projects/{components,hooks,pages,types,utils}
mkdir -p src/features/cloud-providers/{components,hooks,pages,types,utils}
mkdir -p src/features/project-types/{components,hooks,pages,types,utils}
mkdir -p src/features/files/{components,hooks,pages,types,utils}
mkdir -p src/shared/{components,hooks,utils,types}
mkdir -p src/core/{context,router,layouts,styles}
```

**Index Files to Create:**
- `src/features/auth/index.ts`
- `src/features/tenants/index.ts`
- `src/features/projects/index.ts`
- `src/features/cloud-providers/index.ts`
- `src/features/project-types/index.ts`
- `src/features/files/index.ts`
- `src/shared/index.ts`
- `src/core/index.ts`

#### Step 1.3.2: Migrate Auth Feature
**Timeline:** Days 2-3

**Files to Move/Refactor:**

**From → To:**
- `src/context/AuthContext.tsx` → `src/features/auth/context/AuthContext.tsx`
- `src/hooks/useAuth.ts` → `src/features/auth/hooks/useAuth.ts`
- `src/types/auth.ts` → `src/features/auth/types/auth.types.ts`
- `src/pages/Login.tsx` → `src/features/auth/pages/LoginPage.tsx`
- `src/pages/Profile.tsx` → `src/features/auth/pages/ProfilePage.tsx`

**New Files to Create:**
```typescript
// src/features/auth/index.ts
export { AuthProvider, useAuth } from './context/AuthContext';
export { LoginPage } from './pages/LoginPage';
export { ProfilePage } from './pages/ProfilePage';
export type { UserRolesResponse, ProjectRole } from './types/auth.types';
```

**Update Imports:**
- Update all imports of auth-related modules
- Use barrel exports from feature index

#### Step 1.3.3: Migrate Tenants Feature
**Timeline:** Days 4-5

**Files to Move/Refactor:**

**Components:**
- Create `src/features/tenants/components/TenantCard.tsx`
- Create `src/features/tenants/components/TenantForm.tsx`
- Create `src/features/tenants/components/TenantTable.tsx`
- Create `src/features/tenants/components/TenantIntegrationForm.tsx`

**Hooks:**
- `src/hooks/useTenants.ts` → `src/features/tenants/hooks/useTenants.ts`
- `src/hooks/useCreateTenant.ts` → `src/features/tenants/hooks/useCreateTenant.ts`
- `src/hooks/useUpdateTenant.ts` → `src/features/tenants/hooks/useUpdateTenant.ts`
- `src/hooks/useTenant.ts` → `src/features/tenants/hooks/useTenant.ts`

**Pages:**
- `src/pages/tenants/TenantList.tsx` → `src/features/tenants/pages/TenantListPage.tsx`
- `src/pages/tenants/TenantDetails.tsx` → `src/features/tenants/pages/TenantDetailsPage.tsx`
- `src/pages/tenants/TenantCreate.tsx` → `src/features/tenants/pages/TenantCreatePage.tsx`
- `src/pages/tenants/TenantEdit.tsx` → `src/features/tenants/pages/TenantEditPage.tsx`
- `src/pages/tenants/TenantSettings.tsx` → `src/features/tenants/pages/TenantSettingsPage.tsx`
- `src/pages/tenants/TenantIntegrations.tsx` → `src/features/tenants/pages/TenantIntegrationsPage.tsx`
- `src/pages/tenants/TenantManagement.tsx` → `src/features/tenants/pages/TenantManagementPage.tsx`

**Types:**
- `src/types/tenant.ts` → `src/features/tenants/types/tenant.types.ts`

**Utils:**
- Create `src/features/tenants/utils/tenantUtils.ts`

**Feature Index:**
```typescript
// src/features/tenants/index.ts
export { useTenants, useCreateTenant, useUpdateTenant } from './hooks';
export { TenantCard, TenantForm, TenantTable } from './components';
export { 
  TenantListPage, 
  TenantDetailsPage, 
  TenantCreatePage,
  TenantEditPage,
  TenantSettingsPage 
} from './pages';
export type { Tenant, TenantCreate, TenantUpdate } from './types/tenant.types';
```

#### Step 1.3.4: Migrate Projects Feature
**Timeline:** Days 6-7

**Similar structure to tenants:**

**Components:**
- `ProjectCard.tsx`
- `ProjectForm.tsx`
- `ProjectTable.tsx`
- `ProjectMemberForm.tsx`
- `ProjectFileExplorer.tsx`

**Hooks:**
- `useProjects.ts`
- `useProject.ts`
- `useCreateProject.ts`
- `useUpdateProject.ts`
- `useProjectAccess.ts`

**Pages:**
- `ProjectListPage.tsx`
- `ProjectDetailsPage.tsx`
- `ProjectCreatePage.tsx`
- `ProjectEditPage.tsx`
- `ProjectMembersPage.tsx`
- `ProjectFilesPage.tsx`

#### Step 1.3.5: Migrate Remaining Features
**Timeline:** Days 8-10

**Cloud Providers Feature:**
- Move all cloud provider related files
- Create feature-specific components and hooks
- Update imports and exports

**Project Types Feature:**
- Move all project type related files
- Create feature-specific components and hooks
- Update imports and exports

**Files Feature:**
- Move file-related components and hooks
- Create file management utilities
- Update imports and exports

#### Step 1.3.6: Move Shared Resources
**Timeline:** Days 11-12

**Shared Components:**
- `src/components/common/` → `src/shared/components/`
- `src/components/layout/` → `src/core/layouts/`
- `src/components/notifications/` → `src/shared/components/notifications/`

**Shared Hooks:**
- Move generic hooks to `src/shared/hooks/`
- Keep feature-specific hooks in their features

**Shared Utils:**
- `src/utils/api.ts` → `src/shared/utils/api.ts`
- `src/utils/notificationService.ts` → `src/shared/utils/notificationService.ts`

**Shared Types:**
- `src/types/api.ts` → `src/shared/types/api.types.ts`
- Move common types to shared

#### Step 1.3.7: Update Router Configuration
**Timeline:** Day 13

**File:** `src/core/router/AppRouter.tsx`

**Changes Required:**
- Update all imports to use new feature structure
- Use barrel exports from features
- Organize routes by feature

**Example:**
```typescript
// Before
import TenantList from '../pages/tenants/TenantList';
import TenantCreate from '../pages/tenants/TenantCreate';

// After
import { TenantListPage, TenantCreatePage } from '../features/tenants';
```

#### Step 1.3.8: Update Main App File
**Timeline:** Day 14

**File:** `src/App.tsx`

**Changes Required:**
- Update imports to use new structure
- Use barrel exports from core and features
- Ensure all functionality still works

#### Step 1.3.9: Clean Up Old Structure
**Timeline:** Day 15

**Tasks:**
- Remove old directories after confirming everything works
- Update any remaining imports
- Clean up unused files
- Update documentation

### 1.4 Testing Strategy

**After Each Migration Step:**
- [ ] Verify all imports resolve correctly
- [ ] Test affected functionality manually
- [ ] Run build process to catch any issues
- [ ] Check for TypeScript errors

**Final Integration Testing:**
- [ ] Test all user flows
- [ ] Verify no functionality is broken
- [ ] Check bundle size hasn't increased significantly
- [ ] Ensure development server works correctly

---

## Improvement 2: Separate AuthContext Responsibilities

### 2.1 Problem Analysis

**Current AuthContext Issues:**
```typescript
// Current AuthContext handles too many concerns
interface AuthContextType {
  // Authentication
  isAuthenticated: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  getToken: () => Promise<string>;
  
  // Authorization
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  roles: UserRolesResponse;
  hasProjectRole: () => boolean;
  
  // Loading states
  isLoading: boolean;
}
```

**Problems:**
- Single context with too many responsibilities
- Tight coupling between authentication and authorization
- Performance issues due to unnecessary re-renders
- Difficult to test and maintain

### 2.2 Solution Strategy

**Separate into focused contexts:**
1. **AuthContext:** Pure authentication (login, logout, token management)
2. **RoleContext:** User roles and permissions
3. **UIContext:** UI state and notifications

### 2.3 Implementation Steps

#### Step 2.3.1: Create New AuthContext
**Timeline:** Days 1-2
**File:** `src/features/auth/context/AuthContext.tsx`

```typescript
interface AuthContextType {
  // Pure authentication concerns only
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
  error: Error | null;
}
```

**Responsibilities:**
- Auth0 integration
- Token management
- User profile data
- Authentication state

#### Step 2.3.2: Create RoleContext
**Timeline:** Days 3-4
**File:** `src/features/auth/context/RoleContext.tsx`

```typescript
interface RoleContextType {
  roles: UserRolesResponse | null;
  isLoading: boolean;
  error: Error | null;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  hasProjectRole: (projectId: string, role: ProjectRole) => boolean;
  canManageTenants: boolean;
  canManageProjects: (projectId?: string) => boolean;
  refetchRoles: () => void;
}
```

**Responsibilities:**
- Fetching user roles from API
- Role-based permission checking
- Permission utilities
- Role state management

#### Step 2.3.3: Create UIContext
**Timeline:** Day 5
**File:** `src/shared/context/UIContext.tsx`

```typescript
interface UIContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  notifications: Notification[];
  showNotification: (notification: Notification) => void;
  hideNotification: (id: string) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}
```

**Responsibilities:**
- Theme management
- Global notifications
- Global loading states
- UI preferences

#### Step 2.3.4: Create Context Provider Composition
**Timeline:** Day 6
**File:** `src/core/context/AppProviders.tsx`

```typescript
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RoleProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </RoleProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

#### Step 2.3.5: Create Convenience Hooks
**Timeline:** Day 7
**File:** `src/features/auth/hooks/index.ts`

```typescript
// Convenience hooks that combine contexts
export const useAuthWithRoles = () => {
  const auth = useAuth();
  const roles = useRoles();
  return { ...auth, ...roles };
};

export const usePermissions = () => {
  const { roles, isSuperAdmin, isTenantOwner } = useRoles();
  
  return {
    canManageTenants: isSuperAdmin,
    canManageCloudProviders: isSuperAdmin,
    canManageProjectTypes: isSuperAdmin,
    canViewTenant: (tenantId: string) => 
      isSuperAdmin || (isTenantOwner && roles?.tenantId === tenantId),
    canEditTenant: (tenantId: string) => 
      isSuperAdmin || (isTenantOwner && roles?.tenantId === tenantId),
    canManageProject: (projectId: string) => 
      isSuperAdmin || hasProjectRole(projectId, 'OWNER'),
    canEditProject: (projectId: string) => 
      isSuperAdmin || hasProjectRole(projectId, 'OWNER') || hasProjectRole(projectId, 'DEPUTY'),
    canViewProject: (projectId: string) => 
      isSuperAdmin || hasProjectRole(projectId, 'OWNER') || 
      hasProjectRole(projectId, 'DEPUTY') || hasProjectRole(projectId, 'MEMBER'),
  };
};
```

#### Step 2.3.6: Update All Components
**Timeline:** Days 8-10

**Strategy:** Update components to use specific contexts

**Examples:**
```typescript
// Before
const { isAuthenticated, isSuperAdmin, user } = useAuth();

// After - Use specific contexts
const { isAuthenticated, user } = useAuth();
const { isSuperAdmin } = useRoles();

// Or use convenience hook
const { isAuthenticated, user, isSuperAdmin } = useAuthWithRoles();
```

**Components to Update:**
- All page components
- All feature components
- Router components
- Layout components

#### Step 2.3.7: Update Router Protection
**Timeline:** Day 11
**File:** `src/core/router/ProtectedRoute.tsx`

```typescript
const ProtectedRoute = ({ requiredRoles, children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { canManageTenants, canManageProjects } = usePermissions();
  
  // Implementation with separated concerns
};
```

### 2.4 Testing Strategy

**Context Isolation Testing:**
- [ ] Test AuthContext independently
- [ ] Test RoleContext independently
- [ ] Test UIContext independently
- [ ] Test context composition

**Integration Testing:**
- [ ] Test convenience hooks
- [ ] Test permission hooks
- [ ] Test component updates
- [ ] Test router protection

---

## Improvement 3: Implement Atomic Design Component Structure

### 3.1 Problem Analysis

**Current Issues:**
- No consistent component organization
- Mixed levels of abstraction
- Difficult to reuse components
- Inconsistent design patterns

**Current Structure:**
```
/components
  /common
    Button.tsx (but using Mantine Button)
    LoadingSpinner.tsx
    ErrorDisplay.tsx
  /layout
    Navbar.tsx
    Footer.tsx
```

### 3.2 Target Atomic Design Structure

```
/shared/components
  /atoms              # Basic building blocks
    Button/
    Input/
    Badge/
    Avatar/
    Icon/
  /molecules          # Combinations of atoms
    FormField/
    SearchBar/
    Pagination/
    StatusBadge/
    UserInfo/
  /organisms          # Complex UI sections
    DataTable/
    Navigation/
    FormSection/
    ResourceList/
  /templates          # Page layouts
    DashboardTemplate/
    FormPageTemplate/
    ListPageTemplate/
```

### 3.3 Implementation Steps

#### Step 3.3.1: Create Atoms
**Timeline:** Days 1-2

**Button Atom:**
```typescript
// src/shared/components/atoms/Button/Button.tsx
interface ButtonProps extends Omit<MantineButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  const variantMap = {
    primary: 'filled',
    secondary: 'outline',
    danger: 'filled',
    ghost: 'subtle',
  };

  return (
    <MantineButton
      variant={variantMap[variant]}
      size={size}
      loading={isLoading}
      disabled={disabled || isLoading}
      color={variant === 'danger' ? 'red' : undefined}
      {...props}
    >
      {children}
    </MantineButton>
  );
};
```

**Input Atom:**
```typescript
// src/shared/components/atoms/Input/Input.tsx
interface InputProps extends Omit<TextInputProps, 'error'> {
  error?: string | boolean;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  error,
  helperText,
  ...props
}) => (
  <TextInput
    error={typeof error === 'string' ? error : error ? 'Invalid input' : undefined}
    description={helperText}
    {...props}
  />
);
```

**Other Atoms to Create:**
- `Badge` - Wrapper around Mantine Badge with consistent styling
- `Avatar` - User avatar component
- `Icon` - Icon wrapper with consistent sizing
- `Text` - Typography component
- `Card` - Basic card component

#### Step 3.3.2: Create Molecules
**Timeline:** Days 3-4

**FormField Molecule:**
```typescript
// src/shared/components/molecules/FormField/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helperText,
  children,
}) => (
  <div className="form-field">
    <label className={`form-label ${required ? 'required' : ''}`}>
      {label}
    </label>
    {children}
    {helperText && <Text size="sm" color="dimmed">{helperText}</Text>}
    {error && <Text size="sm" color="red">{error}</Text>}
  </div>
);
```

**SearchBar Molecule:**
```typescript
// src/shared/components/molecules/SearchBar/SearchBar.tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
}) => (
  <div className="search-bar">
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftSection={<Icon name="search" />}
      rightSection={
        value && onClear ? (
          <Button variant="ghost" size="xs" onClick={onClear}>
            <Icon name="x" />
          </Button>
        ) : null
      }
    />
  </div>
);
```

**StatusBadge Molecule:**
```typescript
// src/shared/components/molecules/StatusBadge/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'archived';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const colorMap = {
    active: 'green',
    inactive: 'red',
    pending: 'yellow',
    archived: 'gray',
  };

  return (
    <Badge color={colorMap[status]} size={size}>
      {status.toUpperCase()}
    </Badge>
  );
};
```

**Other Molecules to Create:**
- `Pagination` - Enhanced pagination component
- `UserInfo` - User avatar with name and role
- `ActionMenu` - Dropdown menu for actions
- `ConfirmDialog` - Confirmation dialog molecule

#### Step 3.3.3: Create Organisms
**Timeline:** Days 5-7

**DataTable Organism:**
```typescript
// src/shared/components/organisms/DataTable/DataTable.tsx
interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: Error | null;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export const DataTable = <T extends { id: string }>({
  data,
  columns,
  isLoading,
  error,
  onRowClick,
  actions,
  emptyMessage = "No data available",
}: DataTableProps<T>) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data.length) return <EmptyState message={emptyMessage} />;

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          {columns.map((column) => (
            <Table.Th key={String(column.key)} style={{ width: column.width }}>
              {column.title}
            </Table.Th>
          ))}
          {actions && <Table.Th>Actions</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((item) => (
          <Table.Tr
            key={item.id}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map((column) => (
              <Table.Td key={String(column.key)}>
                {column.render 
                  ? column.render(item[column.key], item)
                  : String(item[column.key])
                }
              </Table.Td>
            ))}
            {actions && (
              <Table.Td>
                {actions(item)}
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
```

**ResourceList Organism:**
```typescript
// src/shared/components/organisms/ResourceList/ResourceList.tsx
interface ResourceListProps<T> {
  title: string;
  data: T[];
  isLoading?: boolean;
  error?: Error | null;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  searchable?: boolean;
  filterable?: boolean;
}

export const ResourceList = <T extends { id: string; name: string }>({
  title,
  data,
  isLoading,
  error,
  onCreateNew,
  createButtonLabel = "Create New",
  renderItem,
  emptyMessage,
  searchable = false,
  filterable = false,
}: ResourceListProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = searchable 
    ? data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  return (
    <div className="resource-list">
      <PageHeader title={title}>
        {onCreateNew && (
          <Button onClick={onCreateNew}>{createButtonLabel}</Button>
        )}
      </PageHeader>
      
      {searchable && (
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Search ${title.toLowerCase()}...`}
        />
      )}
      
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay error={error} />}
      {!isLoading && !error && filteredData.length === 0 && (
        <EmptyState 
          message={emptyMessage || `No ${title.toLowerCase()} found`}
          actionText={createButtonLabel}
          onAction={onCreateNew}
        />
      )}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="resource-list-items">
          {filteredData.map(renderItem)}
        </div>
      )}
    </div>
  );
};
```

**Other Organisms to Create:**
- `Navigation` - Main navigation component
- `FormSection` - Reusable form sections
- `FileExplorer` - File browsing component
- `UserMenu` - User dropdown menu

#### Step 3.3.4: Create Templates
**Timeline:** Days 8-9

**DashboardTemplate:**
```typescript
// src/shared/components/templates/DashboardTemplate/DashboardTemplate.tsx
interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title,
  subtitle,
  actions,
  sidebar,
  children,
}) => (
  <div className="dashboard-template">
    <PageHeader title={title} subtitle={subtitle}>
      {actions}
    </PageHeader>
    
    <div className="dashboard-content">
      {sidebar && (
        <aside className="dashboard-sidebar">
          {sidebar}
        </aside>
      )}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  </div>
);
```

**ListPageTemplate:**
```typescript
// src/shared/components/templates/ListPageTemplate/ListPageTemplate.tsx
interface ListPageTemplateProps<T> {
  title: string;
  data: T[];
  isLoading?: boolean;
  error?: Error | null;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  renderItem: (item: T) => React.ReactNode;
  searchable?: boolean;
  filterable?: boolean;
}

export const ListPageTemplate = <T extends { id: string; name: string }>(
  props: ListPageTemplateProps<T>
) => (
  <DashboardTemplate title={props.title}>
    <ResourceList {...props} />
  </DashboardTemplate>
);
```

#### Step 3.3.5: Update Feature Components
**Timeline:** Days 10-12

**Update Tenant Components:**
```typescript
// src/features/tenants/pages/TenantListPage.tsx
export const TenantListPage: React.FC = () => {
  const { tenants, isLoading, error } = useTenants();
  const navigate = useNavigate();
  
  return (
    <ListPageTemplate
      title="Tenants"
      data={tenants}
      isLoading={isLoading}
      error={error}
      onCreateNew={() => navigate('/admin/tenants/create')}
      createButtonLabel="Create Tenant"
      renderItem={(tenant) => <TenantCard key={tenant.id} tenant={tenant} />}
      searchable
    />
  );
};
```

**Update Project Components:**
```typescript
// src/features/projects/pages/ProjectListPage.tsx
export const ProjectListPage: React.FC = () => {
  const { projects, isLoading, error } = useProjects();
  const navigate = useNavigate();
  
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'type', title: 'Type', render: (type) => type?.name || 'Custom' },
    { key: 'status', title: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'createdAt', title: 'Created', render: (date) => new Date(date).toLocaleDateString() },
  ];

  return (
    <DashboardTemplate title="Projects">
      <DataTable
        data={projects}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRowClick={(project) => navigate(`/projects/${project.id}`)}
        actions={(project) => (
          <Group gap="xs">
            <Button size="xs" onClick={() => navigate(`/projects/${project.id}`)}>
              View
            </Button>
            <Button size="xs" variant="secondary" onClick={() => navigate(`/projects/${project.id}/edit`)}>
              Edit
            </Button>
          </Group>
        )}
      />
    </DashboardTemplate>
  );
};
```

### 3.4 Component Documentation

**Create Storybook-style Documentation:**
- Document each component with examples
- Show different variants and states
- Provide usage guidelines
- Include accessibility information

---

## Improvement 4: Reduce Code Redundancy

### 4.1 Problem Analysis

**Current Redundancy Issues:**
1. **Similar Page Patterns:** List, Create, Edit, Details pages follow same patterns
2. **Repeated API Patterns:** Similar hooks for different resources
3. **Form Handling:** Repeated form validation and submission logic
4. **Table Components:** Similar table structures across features

### 4.2 Solution Strategy

**Create Generic Patterns:**
1. **Generic CRUD Hooks:** Reusable hooks for common operations
2. **Form Abstractions:** Generic form handling utilities
3. **Page Templates:** Reusable page layouts
4. **API Utilities:** Generic API operation patterns

### 4.3 Implementation Steps

#### Step 4.3.1: Create Generic CRUD Hooks
**Timeline:** Days 1-2
**File:** `src/shared/hooks/useCrud.ts`

```typescript
interface CrudOptions<T, TCreate, TUpdate> {
  resource: string;
  queryKey: string[];
  apiMethods: {
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T>;
    create: (data: TCreate) => Promise<T>;
    update: (id: string, data: TUpdate) => Promise<T>;
    delete: (id: string) => Promise<void>;
  };
}

export const useCrud = <T extends { id: string }, TCreate, TUpdate>(
  options: CrudOptions<T, TCreate, TUpdate>
) => {
  const queryClient = useQueryClient();
  
  // List query
  const listQuery = useQuery({
    queryKey: options.queryKey,
    queryFn: options.apiMethods.getAll,
  });
  
  // Single item query
  const useItem = (id?: string) => useQuery({
    queryKey: [...options.queryKey, id],
    queryFn: () => options.apiMethods.getById(id!),
    enabled: !!id,
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: options.apiMethods.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) =>
      options.apiMethods.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
      queryClient.invalidateQueries({ queryKey: [...options.queryKey, variables.id] });
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: options.apiMethods.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
  
  return {
    // Data
    items: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    
    // Single item
    useItem,
    
    // Mutations
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
```

#### Step 4.3.2: Update Feature Hooks to Use Generic Pattern
**Timeline:** Days 3-4

**Example - Update useTenants:**
```typescript
// src/features/tenants/hooks/useTenants.ts
export const useTenants = () => {
  return useCrud<Tenant, TenantCreate, TenantUpdate>({
    resource: 'tenants',
    queryKey: ['tenants'],
    apiMethods: {
      getAll: () => api.fetchTenants(),
      getById: (id: string) => api.fetchTenantById(id),
      create: (data: TenantCreate) => api.createTenant(data),
      update: (id: string, data: TenantUpdate) => api.updateTenant(id, data),
      delete: (id: string) => api.deleteTenant(id),
    },
  });
};
```

#### Step 4.3.3: Create Generic Form Hook
**Timeline:** Day 5
**File:** `src/shared/hooks/useForm.ts`

```typescript
interface FormOptions<T> {
  initialValues: T;
  validationSchema: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useForm = <T>({
  initialValues,
  validationSchema,
  onSubmit,
  onSuccess,
  onError,
}: FormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validate = () => {
    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as keyof T] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  return {
    values,
    errors,
    isSubmitting,
    setValue,
    handleSubmit,
    validate,
    reset: () => setValues(initialValues),
  };
};
```

#### Step 4.3.4: Create Generic Page Components
**Timeline:** Days 6-7

**Generic CRUD Pages:**
```typescript
// src/shared/components/templates/CrudTemplate/CrudTemplate.tsx
interface CrudTemplateProps<T, TCreate, TUpdate> {
  resource: string;
  title: string;
  useCrudHook: () => ReturnType<typeof useCrud<T, TCreate, TUpdate>>;
  columns: Column<T>[];
  CreateForm: React.ComponentType<{ onSuccess: () => void }>;
  EditForm: React.ComponentType<{ item: T; onSuccess: () => void }>;
  DetailsView: React.ComponentType<{ item: T }>;
}

export const CrudTemplate = <T extends { id: string }, TCreate, TUpdate>({
  resource,
  title,
  useCrudHook,
  columns,
  CreateForm,
  EditForm,
  DetailsView,
}: CrudTemplateProps<T, TCreate, TUpdate>) => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'details'>('list');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const crud = useCrudHook();
  
  const renderView = () => {
    switch (view) {
      case 'create':
        return <CreateForm onSuccess={() => setView('list')} />;
      case 'edit':
        return selectedItem ? (
          <EditForm item={selectedItem} onSuccess={() => setView('list')} />
        ) : null;
      case 'details':
        return selectedItem ? <DetailsView item={selectedItem} /> : null;
      default:
        return (
          <DataTable
            data={crud.items}
            columns={columns}
            isLoading={crud.isLoading}
            error={crud.error}
            onRowClick={(item) => {
              setSelectedItem(item);
              setView('details');
            }}
            actions={(item) => (
              <Group gap="xs">
                <Button size="xs" onClick={() => {
                  setSelectedItem(item);
                  setView('edit');
                }}>
                  Edit
                </Button>
                <Button size="xs" variant="danger" onClick={() => crud.delete(item.id)}>
                  Delete
                </Button>
              </Group>
            )}
          />
        );
    }
  };
  
  return (
    <DashboardTemplate
      title={title}
      actions={
        view === 'list' ? (
          <Button onClick={() => setView('create')}>
            Create {resource}
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setView('list')}>
            Back to List
          </Button>
        )
      }
    >
      {renderView()}
    </DashboardTemplate>
  );
};
```

#### Step 4.3.5: Update Feature Pages to Use Templates
**Timeline:** Days 8-10

**Example - Tenant Pages:**
```typescript
// src/features/tenants/pages/TenantManagementPage.tsx
export const TenantManagementPage: React.FC = () => {
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'ownerId', title: 'Owner' },
    { key: 'status', title: 'Status', render: (status) => <StatusBadge status={status} /> },
    { key: 'createdAt', title: 'Created', render: (date) => new Date(date).toLocaleDateString() },
  ];

  return (
    <CrudTemplate
      resource="tenant"
      title="Tenants"
      useCrudHook={useTenants}
      columns={columns}
      CreateForm={TenantCreateForm}
      EditForm={TenantEditForm}
      DetailsView={TenantDetailsView}
    />
  );
};
```

### 4.4 Testing Strategy

**Generic Component Testing:**
- [ ] Test CRUD hooks with different resource types
- [ ] Test form hook with various validation schemas
- [ ] Test template components with different configurations
- [ ] Ensure backward compatibility

**Integration Testing:**
- [ ] Test updated feature pages
- [ ] Verify all functionality still works
- [ ] Check performance improvements
- [ ] Test error handling

---

## Implementation Timeline

### Week 1: Architecture Migration
**Days 1-3:** Create new directory structure and migrate auth feature
**Days 4-5:** Migrate tenants feature
**Days 6-7:** Migrate projects feature

### Week 2: Complete Migration and Context Separation
**Days 8-10:** Migrate remaining features (cloud providers, project types, files)
**Days 11-12:** Move shared resources and update router
**Days 13-15:** Separate AuthContext responsibilities

### Week 3: Atomic Design and Redundancy Reduction
**Days 16-18:** Implement atomic design components (atoms, molecules)
**Days 19-21:** Create organisms and templates
**Days 22-24:** Create generic CRUD patterns and update feature components

---

## Success Criteria

### Architecture
- [ ] Feature-based directory structure implemented
- [ ] Clear separation of concerns between features
- [ ] Proper barrel exports for all features
- [ ] Clean import paths throughout application

### Context Management
- [ ] Separated authentication and authorization contexts
- [ ] Improved performance (fewer unnecessary re-renders)
- [ ] Better testability of individual contexts
- [ ] Cleaner component code

### Component Structure
- [ ] Atomic design pattern implemented
- [ ] Reusable component library established
- [ ] Consistent design patterns across features
- [ ] Reduced component duplication

### Code Quality
- [ ] Significant reduction in code duplication
- [ ] Generic patterns for common operations
- [ ] Improved maintainability
- [ ] Better developer experience

### Performance
- [ ] No performance regressions
- [ ] Improved bundle organization
- [ ] Better code splitting opportunities
- [ ] Optimized re-render patterns

---

## Risk Mitigation

### High-Risk Areas
1. **Large-scale refactoring:** Risk of breaking existing functionality
2. **Import path changes:** Risk of missing imports during migration
3. **Context changes:** Risk of breaking component dependencies

### Mitigation Strategies
1. **Incremental migration:** Migrate one feature at a time
2. **Comprehensive testing:** Test after each migration step
3. **Backup strategy:** Keep old structure until migration is complete
4. **Team coordination:** Ensure all team members understand changes

### Rollback Plan
- Keep old structure in parallel during migration
- Use feature flags for new components
- Maintain backward compatibility during transition
- Have rollback scripts ready

---

*This plan should be executed carefully with thorough testing at each step. The goal is to improve code organization and maintainability without breaking existing functionality.*