#!/bin/bash

# Data Visualization Platform - Development Setup Script for Linux/Mac

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${2}${1}${NC}\n"
}

print_success() {
    print_color "✅ $1" "$GREEN"
}

print_error() {
    print_color "❌ $1" "$RED"
}

print_warning() {
    print_color "⚠️  $1" "$YELLOW"
}

print_info() {
    print_color "ℹ️  $1" "$CYAN"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Header
print_color "🚀 Data Visualization Platform - Development Setup" "$CYAN"
print_color "=================================================" "$CYAN"
echo

# Step 1: Check prerequisites
print_color "1️⃣  Checking prerequisites..." "$YELLOW"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found"
    print_info "Install Node.js:"
    print_info "  - Mac: brew install node"
    print_info "  - Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    print_info "  - Other: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check R (optional)
if command_exists Rscript; then
    print_success "R is installed"
else
    print_warning "R not found (optional for R features)"
    print_info "Install R:"
    print_info "  - Mac: brew install r"
    print_info "  - Ubuntu/Debian: sudo apt-get install r-base"
    print_info "  - Other: https://www.r-project.org/"
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_warning "Git not found"
    print_info "Install Git:"
    print_info "  - Mac: brew install git"
    print_info "  - Ubuntu/Debian: sudo apt-get install git"
fi

echo
print_color "2️⃣  Setting up project structure..." "$YELLOW"

# Create necessary directories
DIRECTORIES=(
    "backend/logs"
    "backend/temp"
    "src/components"
    "src/hooks"
    "src/utils"
)

for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    fi
done

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
EOF
    print_success "Created .env file"
fi

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
SESSION_SECRET=dev-secret-change-in-production
MAX_FILE_SIZE=52428800
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
    print_success "Created backend/.env file"
fi

echo
print_color "3️⃣  Installing dependencies..." "$YELLOW"

# Install frontend dependencies
print_color "Installing frontend dependencies..." "$CYAN"
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo
print_color "Installing backend dependencies..." "$CYAN"
if (cd backend && npm install); then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install R packages if R is available
if command_exists Rscript; then
    echo
    print_color "4️⃣  Installing R packages (this may take a few minutes)..." "$YELLOW"
    
    R_SCRIPT='
packages <- c("ggplot2", "dplyr", "tidyr", "corrplot", "plotly", "base64enc")
install_if_missing <- function(p) {
  if (!require(p, character.only = TRUE, quietly = TRUE)) {
    install.packages(p, repos = "https://cran.rstudio.com/", quiet = TRUE)
  }
}
invisible(lapply(packages, install_if_missing))
cat("R packages checked/installed\n")
'
    
    if echo "$R_SCRIPT" | Rscript -; then
        print_success "R packages installed"
    else
        print_warning "Some R packages may have failed to install"
    fi
fi

echo
print_color "5️⃣  Running setup verification..." "$YELLOW"
if node test-setup.js; then
    echo
else
    print_warning "Setup verification encountered issues"
fi

echo
print_color "🎉 Setup complete!" "$GREEN"
echo
print_color "📋 Next steps:" "$CYAN"
print_color "1. Start the development servers:" "$NC"
print_color "   Option A: Run both servers together" "$NC"
print_color "   $ npm run start:all" "$YELLOW"
echo
print_color "   Option B: Run servers separately (recommended for development)" "$NC"
print_color "   Terminal 1:" "$NC"
print_color "   $ cd backend && npm run dev" "$YELLOW"
echo
print_color "   Terminal 2:" "$NC"
print_color "   $ npm run dev" "$YELLOW"
echo
print_color "2. Open http://localhost:5173 in your browser" "$NC"
echo
print_color "📚 Documentation:" "$CYAN"
print_color "   - README.md for general information" "$NC"
print_color "   - TROUBLESHOOTING.md for common issues" "$NC"
print_color "   - backend/README.md for backend details" "$NC"
echo

# Offer to start the application
read -p "Would you like to start the application now? (Y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_color "Starting application..." "$GREEN"
    npm run start:all
fi 