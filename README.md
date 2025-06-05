# Data Visualization App with R Integration

A modern data visualization application built with React, featuring advanced R integration for statistical analysis and visualizations through natural language prompts.

## 🚀 Quick Start

**New to the project?** See [QUICK_START.md](QUICK_START.md) for the fastest setup!

```bash
# One-command setup (choose based on your system)
npm run setup              # Cross-platform (requires Node.js)
./setup-dev.sh            # Mac/Linux
./setup-dev.ps1           # Windows PowerShell
```

## Features

### Core Features
- 📊 **Interactive Charts**: Create bar, line, and scatter charts with Chart.js
- 📁 **Multiple File Formats**: Support for CSV, JSON, and Excel files
- 🗂️ **Multi-Dataset Management**: Work with multiple datasets using tabs
- 💾 **Data Persistence**: Automatic saving with IndexedDB
- ⏮️ **Undo/Redo**: Full command history with Ctrl+Z/Y
- 📥 **Export Options**: Export data as CSV/JSON or charts as PNG

### R Integration Features
- 🔬 **R Studio Integration**: Execute R code directly from the browser
- 💬 **Natural Language Prompts**: Generate visualizations using plain English
- 📈 **Advanced Statistics**: Access R's powerful statistical packages
- 🎨 **R Visualizations**: Create ggplot2, plotly, and other R-based charts
- 🔐 **Secure Execution**: Sandboxed R environment with code validation

### Security Features
- ✅ File validation and size limits (50MB max)
- ✅ Content sanitization to prevent XSS
- ✅ Secure R code execution with whitelisted packages
- ✅ Rate limiting and resource constraints
- ✅ Comprehensive error handling with boundaries

## Prerequisites

- Node.js 16+ and npm
- R 4.0+ (for R integration features)
- Modern web browser

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/hannah-ric/data-vis.git
cd data-vis
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Install R packages (optional, for R features)
```bash
Rscript -e "install.packages(c('ggplot2', 'dplyr', 'tidyr', 'corrplot', 'plotly', 'forecast', 'cluster', 'randomForest', 'base64enc'))"
```

## Running the Application

### Option 1: Frontend Only (Basic Features)
```bash
npm run dev
```
Visit http://localhost:5173

### Option 2: Full Application with R Integration

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

Visit http://localhost:5173

## Usage Guide

### Basic Data Visualization
1. Upload a data file using the file upload area
2. Select X and Y axes from the dropdown menus
3. Choose a chart type (bar, line, or scatter)
4. View and interact with your visualization

### R Integration Features
1. Click the "🔬 R Studio" button in the toolbar
2. Use natural language prompts:
   - "Show correlation matrix of all numeric variables"
   - "Create a scatter plot with trend line"
   - "Visualize distribution of sales data"
3. Or write custom R code in the code editor
4. Press Ctrl+Enter to execute

### Working with Multiple Datasets
- Each uploaded file creates a new tab
- Click tabs to switch between datasets
- Right-click tabs for export options
- Delete datasets with the × button

### Keyboard Shortcuts
- `Ctrl+Z`: Undo last action
- `Ctrl+Y`: Redo action
- `Ctrl+Enter`: Execute R code (in R editor)

## Project Structure

```
data-vis/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── backend/               # Backend server for R integration
│   ├── src/
│   │   ├── services/      # R session management
│   │   ├── routes/        # API endpoints
│   │   └── utils/         # Backend utilities
│   └── r-scripts/         # R execution scripts
├── public/                # Static assets
└── tests/                 # Test files
```

## Troubleshooting

### R Integration Not Working
1. Ensure R is installed: `R --version`
2. Check if backend is running on port 3001
3. Verify R packages are installed
4. Check browser console for WebSocket errors

### File Upload Issues
- Ensure file is under 50MB
- Check file format (CSV, JSON, or XLSX)
- Try a smaller sample of your data

### Performance Issues
- Large datasets may slow down rendering
- Consider filtering or sampling data
- Use Chrome/Firefox for best performance

## Development

### Adding New Visualizations
1. Add chart type to `ChartConfiguration.jsx`
2. Implement rendering logic in `Visualization.jsx`
3. Add R template in `backend/src/routes/r.routes.js`

### Adding R Packages
1. Add package name to whitelist in `backend/src/utils/RCodeValidator.js`
2. Install package on server: `R -e "install.packages('package_name')"`
3. Add templates/examples for the package

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## Sample Data

The `data/` directory contains sample datasets for testing:
- `population.csv` - Population statistics
- `sales.json` - Sales data example
- `bar-data.json`, `line-data.json`, `scatter-data.json` - Chart-ready data samples

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and Vite
- R integration powered by Node.js child processes
- Charts rendered with Chart.js and D3.js
- Data parsing by PapaParse
