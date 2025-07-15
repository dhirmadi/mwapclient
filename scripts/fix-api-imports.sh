#!/bin/bash

echo "🔧 Fixing API imports to use shared/utils/api instead of utils/api..."

# Find all files that import from utils/api and update them to use shared/utils/api
find src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "from.*utils/api" "$file"; then
        echo "  Updating $file"
        sed -i "s|from.*utils/api|from '../../shared/utils/api'|g" "$file"
        # Also handle different relative path depths
        sed -i "s|from.*\.\./\.\./utils/api|from '../../shared/utils/api'|g" "$file"
        sed -i "s|from.*\.\./utils/api|from '../shared/utils/api'|g" "$file"
    fi
done

echo "✅ API imports updated to use shared/utils/api"

# Now we can move the old api.ts to archive since it's no longer used
if [ -f "src/utils/api.ts" ]; then
    echo "📦 Moving old src/utils/api.ts to archive (replaced by shared/utils/api.ts)"
    mv src/utils/api.ts archive/src/utils/
fi

# Remove utils directory if empty
if [ -d "src/utils" ] && [ -z "$(ls -A src/utils)" ]; then
    echo "🗑️ Removing empty src/utils directory"
    rmdir src/utils
fi

echo "🎉 API import fixes completed!"