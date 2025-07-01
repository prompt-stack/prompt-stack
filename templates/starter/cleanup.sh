#!/bin/bash

# This script removes duplicate files after migration

echo "Cleaning up duplicate files..."

# Remove root-level Next.js files that have been moved to frontend/
rm -f next.config.js
rm -f postcss.config.js
rm -f tailwind.config.js
rm -f tsconfig.json

# Remove root-level directories that have been moved
rm -rf app/
rm -rf lib/

echo "Cleanup complete!"
echo "The starter template is now properly structured."