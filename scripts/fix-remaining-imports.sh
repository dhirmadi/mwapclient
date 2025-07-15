#!/bin/bash

# Fix project-types imports
find src/features/project-types -name "*.tsx" -type f -exec sed -i "s|from '../../hooks/useProjectTypes'|from '../hooks/useProjectTypes'|g" {} \;
find src/features/project-types -name "*.tsx" -type f -exec sed -i "s|from '../../types/project-type'|from '../../../types/project-type'|g" {} \;
find src/features/project-types -name "*.tsx" -type f -exec sed -i "s|from '../../utils/notificationService'|// from '../../utils/notificationService' // REMOVED|g" {} \;
find src/features/project-types -name "*.tsx" -type f -exec sed -i "s|from '../../components/layout'|// from '../../components/layout' // REMOVED|g" {} \;
find src/features/project-types -name "*.tsx" -type f -exec sed -i "s|from '../../components/common'|// from '../../components/common' // REMOVED|g" {} \;

# Fix projects imports
find src/features/projects -name "*.tsx" -type f -exec sed -i "s|from '../../hooks/useProjects'|from '../hooks/useProjects'|g" {} \;
find src/features/projects -name "*.tsx" -type f -exec sed -i "s|from '../../types/project'|from '../../../types/project'|g" {} \;
find src/features/projects -name "*.tsx" -type f -exec sed -i "s|from '../../utils/notificationService'|// from '../../utils/notificationService' // REMOVED|g" {} \;
find src/features/projects -name "*.tsx" -type f -exec sed -i "s|from '../../components/layout'|// from '../../components/layout' // REMOVED|g" {} \;
find src/features/projects -name "*.tsx" -type f -exec sed -i "s|from '../../components/common'|// from '../../components/common' // REMOVED|g" {} \;

# Fix tenants imports
find src/features/tenants -name "*.tsx" -type f -exec sed -i "s|from '../../hooks/useTenants'|from '../hooks/useTenants'|g" {} \;
find src/features/tenants -name "*.tsx" -type f -exec sed -i "s|from '../../types/tenant'|from '../../../types/tenant'|g" {} \;
find src/features/tenants -name "*.tsx" -type f -exec sed -i "s|from '../../utils/notificationService'|// from '../../utils/notificationService' // REMOVED|g" {} \;
find src/features/tenants -name "*.tsx" -type f -exec sed -i "s|from '../../components/layout'|// from '../../components/layout' // REMOVED|g" {} \;
find src/features/tenants -name "*.tsx" -type f -exec sed -i "s|from '../../components/common'|// from '../../components/common' // REMOVED|g" {} \;

echo "Import paths fixed!"