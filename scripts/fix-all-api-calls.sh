#!/bin/bash

# Function to fix a file with proper async/await patterns
fix_file() {
    local file=$1
    echo "Fixing $file..."
    
    # Replace simple query functions
    sed -i 's/queryFn: () => api\.\([^(]*\)()/queryFn: async () => { const response = await api.get("\/\1"); return response.data; }/g' "$file"
    
    # Replace mutation functions with data parameter
    sed -i 's/mutationFn: ([^)]*) => api\.\([^(]*\)(/mutationFn: async (data) => { const response = await api.post("\/\1", data); return response.data; }/g' "$file"
    
    # Manual fixes for specific patterns
    if [[ "$file" == *"useCloudProviders.ts" ]]; then
        # Fix specific cloud provider API calls
        sed -i 's/api\.updateCloudProvider(/api.put(`\/cloud-providers\/${id}`, /g' "$file"
        sed -i 's/api\.deleteCloudProvider(/api.delete(`\/cloud-providers\/${/g' "$file"
        sed -i 's/api\.fetchCloudProviderById(/api.get(`\/cloud-providers\/${/g' "$file"
    fi
    
    if [[ "$file" == *"useFiles.ts" ]]; then
        sed -i 's/api\.fetchProjectFiles(/api.get(`\/projects\/${/g' "$file"
    fi
    
    if [[ "$file" == *"useProject.ts" ]]; then
        sed -i 's/api\.fetchProjectById(/api.get(`\/projects\/${/g' "$file"
    fi
}

# Find and fix all hook files
find src/features -name "*.ts" -path "*/hooks/*" | while read file; do
    fix_file "$file"
done

echo "All API calls fixed!"