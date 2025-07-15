#!/bin/bash

# Fix imports in all TypeScript and TypeScript React files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/hooks|../hooks|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/components|../components|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/context|../context|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/utils|../utils|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/types|../types|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/assets|../assets|g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/styles|../styles|g'

# Fix relative paths
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../hooks|../../hooks|g'
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../components|../../components|g'
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../context|../../context|g'
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../utils|../../utils|g'
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../types|../../types|g'
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../assets|../../assets|g'
find src/pages -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../styles|../../styles|g'

# Fix nested pages
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../hooks|../../../hooks|g'
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../components|../../../components|g'
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../context|../../../context|g'
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../utils|../../../utils|g'
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../types|../../../types|g'
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../assets|../../../assets|g'
find src/pages/*/. -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|../../styles|../../../styles|g'

echo "Import paths fixed!"