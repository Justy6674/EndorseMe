#!/bin/bash

# EndorseMe Auto-Commit Script
# This script automatically commits and pushes changes to the main branch

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🤖 EndorseMe Auto-Commit Script${NC}"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on main branch (current: $CURRENT_BRANCH)${NC}"
    read -p "Switch to main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        echo -e "${RED}❌ Aborting: Must be on main branch for auto-commit${NC}"
        exit 1
    fi
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ No changes to commit${NC}"
    exit 0
fi

# Show what will be committed
echo -e "${YELLOW}📝 Changes to be committed:${NC}"
git status --short

# Add all changes
git add -A

# Generate commit message
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
FILE_COUNT=$(git diff --cached --numstat | wc -l)
INSERTIONS=$(git diff --cached --numstat | awk '{sum+=$1} END {print sum}')
DELETIONS=$(git diff --cached --numstat | awk '{sum+=$2} END {print sum}')

# Build commit message
COMMIT_MSG="Auto-commit: $TIMESTAMP

Changes:
- Modified $FILE_COUNT files
- $INSERTIONS insertions(+), $DELETIONS deletions(-)

Files changed:"

# Add file list to commit message
for file in $(git diff --cached --name-only); do
    COMMIT_MSG="$COMMIT_MSG
- $file"
done

# Commit changes
echo -e "${YELLOW}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

# Push to origin
echo -e "${YELLOW}🚀 Pushing to origin/main...${NC}"
if git push origin main; then
    echo -e "${GREEN}✅ Successfully pushed to main branch!${NC}"
    
    # Show commit hash
    COMMIT_HASH=$(git rev-parse HEAD)
    echo -e "${GREEN}📌 Commit: $COMMIT_HASH${NC}"
else
    echo -e "${RED}❌ Failed to push to origin${NC}"
    exit 1
fi

echo -e "${GREEN}✨ Auto-commit completed successfully!${NC}"