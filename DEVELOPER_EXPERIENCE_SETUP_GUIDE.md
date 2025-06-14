# Developer Experience Setup Guide

## Quick Start

The enhanced developer experience is now configured with automated code quality tools, formatting, and pre-commit hooks.

## Manual Setup Steps

Due to system restrictions, complete the setup with these commands:

### 1. Initialize Git Hooks
```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### 2. Add Package Scripts
Add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run test:run"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix --max-warnings 0"
    ],
    "*.{json,md,yml,yaml}": ["prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

## Development Workflow

### Daily Development
```bash
# Start development
npm run dev

# Before committing
npm run validate

# Fix formatting issues
npm run format

# Fix linting issues
npm run lint:fix
```

### Pre-Commit Automation
Once git hooks are enabled:
1. Stage your changes: `git add .`
2. Commit: `git commit -m "message"`
3. Hooks automatically run:
   - Format staged files
   - Fix linting issues
   - Prevent commit if errors exist

### Quality Assurance
```bash
# Full validation pipeline
npm run validate

# Individual checks
npm run type-check    # TypeScript validation
npm run lint          # Code quality check
npm run format:check  # Formatting validation
npm test              # Run test suite
```

## Configuration Files

### ESLint (eslint.config.js)
- Modern flat config format
- TypeScript and React support
- Zero-warning policy
- Automatic fixing capabilities

### Prettier (.prettierrc)
- Consistent code formatting
- 80-character line width
- 2-space indentation
- Double quotes for strings

### Lint-Staged (lint-staged.config.js)
- Pre-commit file processing
- Automatic formatting and linting
- Prevents low-quality commits

## Benefits

### Code Quality
- Zero-tolerance linting policy
- Automatic formatting
- TypeScript validation
- Comprehensive testing

### Team Collaboration
- Consistent code style
- Automated quality gates
- Reduced review friction
- Professional standards

### Developer Productivity
- One-command validation
- Automatic fixes
- Clear error messages
- Fast feedback loops

## Troubleshooting

### ESLint Issues
```bash
npm run lint:fix    # Auto-fix problems
npm run lint        # Check for issues
```

### Formatting Problems
```bash
npm run format      # Fix all files
npm run format:check # Check compliance
```

### Test Failures
```bash
npm test            # Interactive mode
npm run test:run    # Single run
```

### Type Errors
```bash
npm run type-check  # TypeScript validation
```

The developer experience enhancement provides a robust foundation for maintaining code quality and team productivity.