#!/bin/bash

# Fix cloud providers hooks
sed -i 's/api\.fetchCloudProviders()/api.get("\/cloud-providers").then(r => r.data)/g' src/features/cloud-providers/hooks/useCloudProviders.ts
sed -i 's/api\.createCloudProvider(/api.post("\/cloud-providers", /g' src/features/cloud-providers/hooks/useCloudProviders.ts
sed -i 's/api\.updateCloudProvider(/api.put(`\/cloud-providers\/${id}`, /g' src/features/cloud-providers/hooks/useCloudProviders.ts
sed -i 's/api\.deleteCloudProvider(/api.delete(`\/cloud-providers\/${/g' src/features/cloud-providers/hooks/useCloudProviders.ts
sed -i 's/api\.createTenantIntegration(/api.post("\/tenant\/integrations", /g' src/features/cloud-providers/hooks/useCloudProviders.ts
sed -i 's/api\.deleteTenantIntegration(/api.delete(`\/tenant\/integrations\/${/g' src/features/cloud-providers/hooks/useCloudProviders.ts
sed -i 's/api\.fetchCloudProviderById(/api.get(`\/cloud-providers\/${/g' src/features/cloud-providers/hooks/useCloudProviders.ts

# Fix files hooks
sed -i 's/api\.fetchProjectFiles(/api.get(`\/projects\/${/g' src/features/files/hooks/useFiles.ts

# Fix project types hooks
sed -i 's/api\.fetchProjectTypes()/api.get("\/project-types").then(r => r.data)/g' src/features/project-types/hooks/useProjectTypes.ts
sed -i 's/api\.fetchProjectTypeById(/api.get(`\/project-types\/${/g' src/features/project-types/hooks/useProjectTypes.ts
sed -i 's/api\.createProjectType(/api.post("\/project-types", /g' src/features/project-types/hooks/useProjectTypes.ts
sed -i 's/api\.updateProjectType(/api.put(`\/project-types\/${id}`, /g' src/features/project-types/hooks/useProjectTypes.ts
sed -i 's/api\.deleteProjectType(/api.delete(`\/project-types\/${/g' src/features/project-types/hooks/useProjectTypes.ts

# Fix projects hooks
sed -i 's/api\.createProject(/api.post("\/projects", /g' src/features/projects/hooks/useCreateProject.ts
sed -i 's/api\.fetchProjectById(/api.get(`\/projects\/${/g' src/features/projects/hooks/useProject.ts
sed -i 's/api\.updateProject(/api.put(`\/projects\/${id}`, /g' src/features/projects/hooks/useUpdateProject.ts
sed -i 's/api\.fetchProjects()/api.get("\/projects").then(r => r.data)/g' src/features/projects/hooks/useProjects.ts

# Fix tenants hooks
sed -i 's/api\.fetchTenants()/api.get("\/tenants").then(r => r.data)/g' src/features/tenants/hooks/useTenants.ts
sed -i 's/api\.fetchTenantById(/api.get(`\/tenants\/${/g' src/features/tenants/hooks/useTenants.ts
sed -i 's/api\.createTenant(/api.post("\/tenants", /g' src/features/tenants/hooks/useTenants.ts
sed -i 's/api\.updateTenant(/api.put(`\/tenants\/${id}`, /g' src/features/tenants/hooks/useTenants.ts

echo "API calls fixed!"