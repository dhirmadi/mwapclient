#!/bin/bash

# Fix projects hooks imports
find src/features/projects/hooks -name "*.ts" -type f -exec sed -i "s|from '../utils/api'|from '../../../shared/utils/api'|g" {} \;
find src/features/projects/hooks -name "*.ts" -type f -exec sed -i "s|from '../types/project'|from '../../../types/project'|g" {} \;
find src/features/projects/hooks -name "*.ts" -type f -exec sed -i "s|from '../types/auth'|from '../../../types/auth'|g" {} \;
find src/features/projects/hooks -name "*.ts" -type f -exec sed -i "s|from './useAuth'|from '../../auth/hooks/useAuth'|g" {} \;

echo "Projects hooks imports fixed!"