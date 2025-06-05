# Quick Start Guide

## 🚀 One-Command Setup

Choose the appropriate command for your system:

### Windows
```batch
# Option 1: Double-click setup-dev.bat

# Option 2: PowerShell
powershell -ExecutionPolicy Bypass -File setup-dev.ps1

# Option 3: If Node.js IS installed
npm run setup
```

### Mac/Linux
```bash
# Make script executable (first time only)
chmod +x setup-dev.sh

# Run setup
./setup-dev.sh

# OR if Node.js is installed:
npm run setup
```

### Using VS Code or GitHub Codespaces
```bash
# Node.js is pre-installed
npm run setup
```

## 🎯 Manual Setup (if scripts don't work)

1. **Install Prerequisites**
   - Node.js 16+ from https://nodejs.org/
   - R (optional) from https://www.r-project.org/

2. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   ```

3. **Start Development**
   ```bash
   # Option 1: Start everything
   npm run start:all

   # Option 2: Start separately (recommended)
   # Terminal 1:
   cd backend && npm run dev
   
   # Terminal 2:
   npm run dev
   ```

4. **Open Browser**
   Navigate to http://localhost:5173

## 🔧 Common Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Complete setup (requires Node.js) |
| `npm run start:all` | Start frontend and backend |
| `npm run dev` | Start frontend only |
| `npm run build` | Build for production |
| `npm run test:setup` | Verify installation |

## ❓ Troubleshooting

- **"npm is not recognized"**: Install Node.js first
- **"R not found"**: R is optional, app works without it
- **Port 3001 in use**: Change port in `backend/.env`
- **Can't upload files**: Check file is CSV or JSON format

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 📁 Sample Data

Test files are in the `data/` directory:
- `population.csv` - Simple CSV example
- `sales.json` - JSON format example

## 🆘 Need Help?

1. Run `npm run test:setup` to diagnose issues
2. Check console (F12) for errors
3. Refer to documentation:
   - [README.md](README.md) - Full documentation
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
   - [backend/README.md](backend/README.md) - Backend details 