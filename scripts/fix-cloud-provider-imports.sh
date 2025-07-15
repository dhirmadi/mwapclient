#!/bin/bash

# Fix cloud provider page imports
cd /workspace/mwapclient

# Fix CloudProviderCreate.tsx
sed -i 's|../../../../components/layout|../../../shared/components|g' src/pages/cloud-providers/CloudProviderCreate.tsx
sed -i 's|../../../../hooks/useCloudProviders|../../../features/cloud-providers/hooks|g' src/pages/cloud-providers/CloudProviderCreate.tsx
sed -i 's|../../../../types/cloud-provider|../../../features/cloud-providers/types|g' src/pages/cloud-providers/CloudProviderCreate.tsx
sed -i 's|../../../../utils/notificationService|../../../shared/utils/notifications|g' src/pages/cloud-providers/CloudProviderCreate.tsx

# Fix CloudProviderEdit.tsx
sed -i 's|../../../../utils/notificationService|../../../shared/utils/notifications|g' src/pages/cloud-providers/CloudProviderEdit.tsx
sed -i 's|../../../../components/layout|../../../shared/components|g' src/pages/cloud-providers/CloudProviderEdit.tsx

# Fix CloudProviderList.tsx
sed -i 's|../../../../components/layout|../../../shared/components|g' src/pages/cloud-providers/CloudProviderList.tsx
sed -i 's|../../../../hooks/useCloudProviders|../../../features/cloud-providers/hooks|g' src/pages/cloud-providers/CloudProviderList.tsx
sed -i 's|../../../../types/cloud-provider|../../../features/cloud-providers/types|g' src/pages/cloud-providers/CloudProviderList.tsx
sed -i 's|../../../../utils/notificationService|../../../shared/utils/notifications|g' src/pages/cloud-providers/CloudProviderList.tsx

echo "Cloud provider imports fixed"