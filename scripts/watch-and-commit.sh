#!/bin/bash

# EndorseMe File Watcher with Auto-Commit
# Watches for file changes and automatically commits them

# Configuration
WATCH_INTERVAL=300  # Check every 5 minutes
MAX_FILES_PER_COMMIT=20  # Max files to include in one commit
IGNORE_PATTERNS=(
    "node_modules"
    ".git"
    "dist"
    "build"
    ".env"
    ".env.local"
    "*.log"
    ".DS_Store"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}👁️  EndorseMe File Watcher${NC}"
echo "=========================="
echo -e "Watching for changes every ${YELLOW}$WATCH_INTERVAL seconds${NC}"
echo -e "Press ${RED}Ctrl+C${NC} to stop"
echo

# Function to check if file should be ignored
should_ignore() {
    local file=$1
    for pattern in "${IGNORE_PATTERNS[@]}"; do
        if [[ $file == *"$pattern"* ]]; then
            return 0
        fi
    done
    return 1
}

# Function to generate smart commit message
generate_commit_message() {
    local files=("$@")
    local message="Auto-update: "
    
    # Categorize changes
    local docs=0
    local code=0
    local config=0
    local other=0
    
    for file in "${files[@]}"; do
        if [[ $file == *.md ]]; then
            ((docs++))
        elif [[ $file == *.ts || $file == *.tsx || $file == *.js || $file == *.jsx ]]; then
            ((code++))
        elif [[ $file == *.json || $file == *.yaml || $file == *.yml || $file == *.toml ]]; then
            ((config++))
        else
            ((other++))
        fi
    done
    
    # Build message based on changes
    local parts=()
    [[ $docs -gt 0 ]] && parts+=("$docs docs")
    [[ $code -gt 0 ]] && parts+=("$code code files")
    [[ $config -gt 0 ]] && parts+=("$config config")
    [[ $other -gt 0 ]] && parts+=("$other other")
    
    message+=$(IFS=", "; echo "${parts[*]}")
    message+=" updated"
    
    echo "$message"
}

# Main watch loop
while true; do
    # Check for changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}🔍 Changes detected!${NC}"
        
        # Get list of changed files
        mapfile -t changed_files < <(git status --porcelain | awk '{print $2}')
        
        # Filter out ignored files
        files_to_commit=()
        for file in "${changed_files[@]}"; do
            if ! should_ignore "$file"; then
                files_to_commit+=("$file")
            fi
        done
        
        if [ ${#files_to_commit[@]} -gt 0 ]; then
            echo -e "${BLUE}📝 Files to commit:${NC}"
            printf '%s\n' "${files_to_commit[@]}" | head -20
            
            if [ ${#files_to_commit[@]} -gt $MAX_FILES_PER_COMMIT ]; then
                echo -e "${YELLOW}⚠️  Too many files (${#files_to_commit[@]}), committing first $MAX_FILES_PER_COMMIT${NC}"
                files_to_commit=("${files_to_commit[@]:0:$MAX_FILES_PER_COMMIT}")
            fi
            
            # Stage files
            for file in "${files_to_commit[@]}"; do
                git add "$file"
            done
            
            # Generate commit message
            commit_msg=$(generate_commit_message "${files_to_commit[@]}")
            timestamp=$(date +"%Y-%m-%d %H:%M:%S")
            
            # Commit
            git commit -m "$commit_msg - $timestamp" > /dev/null 2>&1
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Committed: $commit_msg${NC}"
                
                # Push to origin
                echo -e "${YELLOW}🚀 Pushing to origin/main...${NC}"
                if git push origin main > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ Pushed successfully${NC}"
                else
                    echo -e "${RED}❌ Push failed - will retry next cycle${NC}"
                fi
            else
                echo -e "${RED}❌ Commit failed${NC}"
            fi
        else
            echo -e "${BLUE}ℹ️  All changes are in ignored files${NC}"
        fi
    fi
    
    # Show next check time
    next_check=$(date -d "+$WATCH_INTERVAL seconds" +"%H:%M:%S")
    echo -e "${BLUE}⏰ Next check at $next_check${NC}"
    echo
    
    # Wait
    sleep $WATCH_INTERVAL
done