#!/bin/bash

# Cleanup script to move unused files to archive after refactoring
# This script moves old structure files that are no longer used to /archive

echo "🧹 Starting codebase cleanup..."

# Create archive directory structure
mkdir -p archive/src

# Files that are still being used and should NOT be moved:
# - src/pages/Home.tsx (used in core/router/AppRouter.tsx)
# - src/pages/Dashboard.tsx (used in core/router/AppRouter.tsx)  
# - src/pages/NotFound.tsx (used in core/router/AppRouter.tsx)
# - src/pages/Unauthorized.tsx (used in core/router/AppRouter.tsx)
# - src/components/notifications/ (used in App.tsx and utils)

echo "📁 Moving unused pages to archive..."

# Move unused individual page files
if [ -f "src/pages/Login.tsx" ]; then
    echo "  Moving src/pages/Login.tsx (replaced by features/auth/pages/LoginPage.tsx)"
    mv src/pages/Login.tsx archive/src/
fi

if [ -f "src/pages/Profile.tsx" ]; then
    echo "  Moving src/pages/Profile.tsx (replaced by features/auth/pages/ProfilePage.tsx)"
    mv src/pages/Profile.tsx archive/src/
fi

# Move entire page subdirectories (these are all replaced by features)
echo "📁 Moving page subdirectories to archive..."

if [ -d "src/pages/tenants" ]; then
    echo "  Moving src/pages/tenants/ (replaced by features/tenants/pages/)"
    mkdir -p archive/src/pages
    mv src/pages/tenants archive/src/pages/
fi

if [ -d "src/pages/projects" ]; then
    echo "  Moving src/pages/projects/ (replaced by features/projects/pages/)"
    mkdir -p archive/src/pages
    mv src/pages/projects archive/src/pages/
fi

if [ -d "src/pages/cloud-providers" ]; then
    echo "  Moving src/pages/cloud-providers/ (replaced by features/cloud-providers/pages/)"
    mkdir -p archive/src/pages
    mv src/pages/cloud-providers archive/src/pages/
fi

if [ -d "src/pages/project-types" ]; then
    echo "  Moving src/pages/project-types/ (replaced by features/project-types/pages/)"
    mkdir -p archive/src/pages
    mv src/pages/project-types archive/src/pages/
fi

echo "🔧 Moving unused hooks to archive..."

# Move old hooks directory (replaced by feature-specific hooks)
if [ -d "src/hooks" ]; then
    echo "  Moving src/hooks/ (replaced by feature-specific hooks in features/*/hooks/)"
    mv src/hooks archive/src/
fi

echo "📝 Moving unused types to archive..."

# Move old types directory (replaced by feature-specific types)
if [ -d "src/types" ]; then
    echo "  Moving src/types/ (replaced by feature-specific types in features/*/types/)"
    mv src/types archive/src/
fi

echo "🔄 Moving unused router to archive..."

# Move old router directory (replaced by core/router)
if [ -d "src/router" ]; then
    echo "  Moving src/router/ (replaced by core/router/)"
    mv src/router archive/src/
fi

echo "🔐 Moving unused context to archive..."

# Move old context directory (replaced by core/context)
if [ -d "src/context" ]; then
    echo "  Moving src/context/ (replaced by core/context/)"
    mv src/context archive/src/
fi

echo "🛠️ Moving unused utils to archive..."

# Check which utils are still being used
mkdir -p archive/src/utils

# Move specific unused utils
if [ -f "src/utils/notificationService.ts" ]; then
    echo "  Moving src/utils/notificationService.ts (replaced by shared/utils/notificationUtils.ts)"
    mv src/utils/notificationService.ts archive/src/utils/
fi

if [ -f "src/utils/apiResponseHandler.ts" ]; then
    echo "  Moving src/utils/apiResponseHandler.ts (replaced by shared/utils/apiResponseHandler.ts)"
    mv src/utils/apiResponseHandler.ts archive/src/utils/
fi

if [ -f "src/utils/notificationUtils.ts" ]; then
    echo "  Moving src/utils/notificationUtils.ts (replaced by shared/utils/notificationUtils.ts)"
    mv src/utils/notificationUtils.ts archive/src/utils/
fi

# Check if api.ts is still being used
if [ -f "src/utils/api.ts" ]; then
    # Check if it's being imported anywhere
    if ! grep -r "from.*utils/api" src/ >/dev/null 2>&1; then
        echo "  Moving src/utils/api.ts (replaced by shared/utils/api.ts)"
        mv src/utils/api.ts archive/src/utils/
    else
        echo "  Keeping src/utils/api.ts (still being imported)"
    fi
fi

# Remove utils directory if empty
if [ -d "src/utils" ] && [ -z "$(ls -A src/utils)" ]; then
    echo "  Removing empty src/utils directory"
    rmdir src/utils
fi

echo "🧩 Moving unused components to archive..."

# Move old components that are not notifications (notifications still used in App.tsx)
if [ -d "src/components/common" ]; then
    echo "  Moving src/components/common/ (replaced by shared/components/)"
    mkdir -p archive/src/components
    mv src/components/common archive/src/components/
fi

if [ -d "src/components/layout" ]; then
    echo "  Moving src/components/layout/ (replaced by core/layouts/)"
    mkdir -p archive/src/components
    mv src/components/layout archive/src/components/
fi

# Check if components directory only has notifications left
if [ -d "src/components" ]; then
    remaining=$(find src/components -mindepth 1 -maxdepth 1 -type d | grep -v notifications | wc -l)
    if [ "$remaining" -eq 0 ]; then
        echo "  Only notifications remain in src/components/ (still needed)"
    fi
fi

echo "📊 Cleanup summary:"
echo "✅ Moved unused page files and directories to archive/"
echo "✅ Moved old hooks directory to archive/"
echo "✅ Moved old types directory to archive/"
echo "✅ Moved old router directory to archive/"
echo "✅ Moved old context directory to archive/"
echo "✅ Moved unused utils to archive/"
echo "✅ Moved unused components to archive/"

echo ""
echo "📁 Files still in src/ (actively used):"
echo "  src/pages/Home.tsx - Used in core/router/AppRouter.tsx"
echo "  src/pages/Dashboard.tsx - Used in core/router/AppRouter.tsx"
echo "  src/pages/NotFound.tsx - Used in core/router/AppRouter.tsx"
echo "  src/pages/Unauthorized.tsx - Used in core/router/AppRouter.tsx"
echo "  src/components/notifications/ - Used in App.tsx"
echo "  src/features/ - New feature-based structure"
echo "  src/shared/ - New shared components, hooks, utils, types"
echo "  src/core/ - New core application structure"

echo ""
echo "🎉 Cleanup completed successfully!"
echo "📦 All unused files moved to archive/ directory"
echo "🚀 Application should still work with cleaned up structure"