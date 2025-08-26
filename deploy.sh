#!/bin/bash

echo "🚀 MariThon Backend Deployment Script"
echo "====================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run this script from your project root."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit or stash them first."
    echo "   Run: git add . && git commit -m 'Your commit message'"
    exit 1
fi

# Check if we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  You're not on the main branch. Current branch: $CURRENT_BRANCH"
    read -p "Do you want to switch to main branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        echo "✅ Switched to main branch"
    else
        echo "❌ Deployment cancelled. Please switch to main branch manually."
        exit 1
    fi
fi

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
    echo ""
    echo "🎉 Deployment initiated!"
    echo "📱 Your backend will be automatically deployed on Render."
    echo "🌐 Frontend will be updated on GitHub Pages."
    echo ""
    echo "⏳ Deployment typically takes 2-5 minutes."
    echo "🔍 Check your Render dashboard for deployment status."
else
    echo "❌ Failed to push code. Please check your git configuration."
    exit 1
fi

echo ""
echo "📚 Next steps:"
echo "1. Check Render dashboard for backend deployment status"
echo "2. Verify your frontend is updated on GitHub Pages"
echo "3. Test the API endpoints"
echo "4. Update your frontend to use the new backend URL"
