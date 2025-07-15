#!/bin/bash

# Fix Mantine v8 compatibility issues systematically

echo "Fixing Mantine v8 compatibility issues..."

# Fix spacing -> gap
echo "Fixing spacing -> gap..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/spacing="/gap="/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/spacing='/gap='/g"

# Fix weight -> fw
echo "Fixing weight -> fw..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/weight={/fw={/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/weight="/fw="/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/weight='/fw='/g"

# Fix position -> justify (for Group components)
echo "Fixing position -> justify..."
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/position="apart"/justify="space-between"/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/position="center"/justify="center"/g'
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/position='apart'/justify='space-between'/g"
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i "s/position='center'/justify='center'/g"

echo "Manual sx prop fixes needed for:"
grep -r "sx=" src/ --include="*.tsx" --include="*.ts" -l

echo "Done with automated fixes!"