# Git Automation Setup for EndorseMe

## Overview
This document explains the Git automation setup for the EndorseMe project, including auto-commit functionality, pre-push validation, and best practices.

## Quick Start

### 1. Initial Setup
```bash
# Configure Git user settings for commits
npm run git:setup

# Or manually:
git config --local user.name "Your Name"
git config --local user.email "your.email@example.com"
```

### 2. Manual Auto-Commit
```bash
# Run a one-time auto-commit of all changes
npm run commit

# This will:
# - Pull latest changes from main
# - Stage all changes
# - Create a descriptive commit message
# - Push to origin/main
```

### 3. Continuous Watching
```bash
# Start the file watcher (runs every 5 minutes)
npm run watch

# This will:
# - Monitor for file changes
# - Auto-commit when changes are detected
# - Push to GitHub automatically
# - Ignore node_modules, .env files, etc.
```

## Features

### 🤖 Auto-Commit Script (`scripts/auto-commit.sh`)
- Validates you're on the main branch
- Pulls latest changes before committing
- Generates descriptive commit messages
- Shows file statistics (insertions/deletions)
- Lists all changed files
- Pushes to origin automatically

### 👁️ File Watcher (`scripts/watch-and-commit.sh`)
- Checks for changes every 5 minutes
- Intelligent file categorization (docs, code, config)
- Ignores sensitive and build files
- Limits commits to 20 files at a time
- Smart commit message generation

### 🛡️ Pre-Push Hook
Automatically validates before pushing to main:
- ✅ TypeScript compilation check
- ⚠️ Console.log detection
- 🚫 Sensitive file prevention (.env, .key, etc.)
- 📏 Large file detection (>10MB)

## Usage Examples

### One-Time Commit
```bash
# After making changes:
npm run commit
```

### Continuous Development
```bash
# Start the watcher in a terminal tab
npm run watch

# Work normally in other tabs
# Changes are auto-committed every 5 minutes
```

### Manual Git Commands
```bash
# Traditional git workflow still works
git add .
git commit -m "Your message"
git push origin main
```

## Configuration

### Watcher Settings
Edit `scripts/watch-and-commit.sh` to customize:
```bash
WATCH_INTERVAL=300  # Check interval in seconds
MAX_FILES_PER_COMMIT=20  # Files per commit
```

### Ignored Patterns
The watcher ignores:
- `node_modules/`
- `.git/`
- `dist/` and `build/`
- `.env` and `.env.local`
- `*.log` files
- `.DS_Store`

### Adding More Ignores
Edit the `IGNORE_PATTERNS` array in `watch-and-commit.sh`:
```bash
IGNORE_PATTERNS=(
    "node_modules"
    ".git"
    "your-pattern-here"
)
```

## Best Practices

### 1. **Use Branches for Features**
While auto-commit works on main, use feature branches for larger changes:
```bash
git checkout -b feature/new-feature
# Work on feature
git checkout main
git merge feature/new-feature
```

### 2. **Review Before Auto-Commit**
The auto-commit shows what will be committed. Review the list before proceeding.

### 3. **Sensitive Files**
Never commit:
- `.env` files with secrets
- Private keys or certificates
- API keys in code

### 4. **Large Files**
Use Git LFS for files >10MB or store them externally.

### 5. **Commit Messages**
While auto-commit generates messages, you can always amend:
```bash
git commit --amend -m "Better message"
```

## Troubleshooting

### Permission Denied
```bash
chmod +x scripts/*.sh
chmod +x .git/hooks/*
```

### Push Failed
```bash
# Check remote
git remote -v

# Check branch
git branch

# Force sync with remote
git pull origin main --rebase
git push origin main
```

### Watcher Not Working
```bash
# Check if script is running
ps aux | grep watch-and-commit

# Kill if needed
pkill -f watch-and-commit
```

### Pre-Push Hook Failing
```bash
# Skip hooks temporarily (use cautiously)
git push --no-verify

# Fix issues and push normally
```

## CI/CD Integration

### GitHub Actions
The auto-commits trigger GitHub Actions workflows. Ensure:
1. Workflows are configured for main branch
2. Secrets are set in repository settings
3. Build/test passes before deployment

### Vercel Integration
Each push to main:
1. Triggers Vercel preview build
2. Runs build checks
3. Deploys if successful

## Security Notes

1. **Never commit secrets** - Use environment variables
2. **Review auto-commits** - Check GitHub regularly
3. **Rotate credentials** - If accidentally committed
4. **Use .gitignore** - Keep it updated

## Advanced Usage

### Custom Commit Templates
Create `.gitmessage` for consistent formatting:
```
[Type] Subject (50 chars max)

Body (72 chars per line)

Refs: #issue
```

### Git Aliases
Add to `.git/config`:
```ini
[alias]
    ac = !npm run commit
    watch = !npm run watch
    undo = reset HEAD~1
```

### Hook Customization
Add more checks to `.git/hooks/pre-push`:
- Linting
- Test execution
- Security scanning

## Maintenance

### Weekly Tasks
- Review auto-commit history
- Clean up unnecessary commits
- Update ignore patterns

### Monthly Tasks
- Audit committed files
- Check for sensitive data
- Update documentation

## Summary

The Git automation setup for EndorseMe:
- ✅ Simplifies commit workflow
- ✅ Maintains code quality
- ✅ Prevents common mistakes
- ✅ Keeps repository clean
- ✅ Enables continuous integration

Use `npm run commit` for one-time commits or `npm run watch` for continuous automation. The system is designed to be helpful but not restrictive—you can always use standard Git commands when needed.