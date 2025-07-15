#!/bin/bash

# Remove broken import lines
find src/features -name "*.tsx" -type f -exec sed -i "/\/\/ from.*\/\/ REMOVED/d" {} \;

echo "Broken import lines removed!"