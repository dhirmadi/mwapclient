#!/bin/bash

# Fix imports in src/pages/tenants/*.tsx files
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../../components/layout|../../components/layout|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../../components/common|../../components/common|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../../hooks/|../../hooks/|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../../types/|../../types/|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../hooks|../../hooks|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../components/layout|../../components/layout|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../components/common|../../components/common|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/tenants -name "*.tsx" | xargs sed -i 's|../../../types/|../../types/|g'

# Fix imports in src/pages/projects/*.tsx files
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../../components/layout|../../components/layout|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../../components/common|../../components/common|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../../hooks/|../../hooks/|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../../types/|../../types/|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../hooks|../../hooks|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../components/layout|../../components/layout|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../components/common|../../components/common|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/projects -name "*.tsx" | xargs sed -i 's|../../../types/|../../types/|g'

# Fix imports in src/pages/cloud-providers/*.tsx files
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../../components/layout|../../components/layout|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../../components/common|../../components/common|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../../hooks/|../../hooks/|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../../types/|../../types/|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../hooks|../../hooks|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../components/layout|../../components/layout|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../components/common|../../components/common|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/cloud-providers -name "*.tsx" | xargs sed -i 's|../../../types/|../../types/|g'

# Fix imports in src/pages/project-types/*.tsx files
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../../components/layout|../../components/layout|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../../components/common|../../components/common|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../../hooks/|../../hooks/|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../../types/|../../types/|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../hooks|../../hooks|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../components/layout|../../components/layout|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../components/common|../../components/common|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../context/AuthContext|../../context/AuthContext|g'
find src/pages/project-types -name "*.tsx" | xargs sed -i 's|../../../types/|../../types/|g'

# Fix imports in src/pages/*.tsx files
find src/pages -maxdepth 1 -name "*.tsx" | xargs sed -i 's|../../hooks/useAuth|../hooks/useAuth|g'
find src/pages -maxdepth 1 -name "*.tsx" | xargs sed -i 's|../../context/AuthContext|../context/AuthContext|g'
find src/pages -maxdepth 1 -name "*.tsx" | xargs sed -i 's|../../components/layout|../components/layout|g'
find src/pages -maxdepth 1 -name "*.tsx" | xargs sed -i 's|../../components/common|../components/common|g'
find src/pages -maxdepth 1 -name "*.tsx" | xargs sed -i 's|../../hooks/|../hooks/|g'
find src/pages -maxdepth 1 -name "*.tsx" | xargs sed -i 's|../../types/|../types/|g'

echo "Import paths fixed!"