# Data Visualization Backend with R Integration

This backend service provides R integration for the data visualization application, enabling advanced statistical visualizations through natural language prompts and direct R code execution.

## Prerequisites

- Node.js 16+ 
- R 4.0+ installed and available in PATH
- Required R packages (install these before running):

```R
install.packages(c(
  "ggplot2", "dplyr", "tidyr", "corrplot", 
  "plotly", "forecast", "cluster", "randomForest",
  "base64enc"
))
```

## Installation

1. Install Node.js dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file (already provided with defaults)

3. Ensure R is installed and accessible:
```bash
Rscript --version
```

## Running the Backend

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The backend will start on http://localhost:3001

## API Endpoints

### REST API

- `GET /api/health` - Health check
- `POST /api/r/execute` - Execute R code
- `POST /api/r/prompt` - Execute R code from natural language prompt
- `GET /api/r/packages` - Get available R packages
- `GET /api/r/templates` - Get R code templates
- `POST /api/visualizations/create` - Create visualization from config
- `POST /api/visualizations/suggest` - Get visualization suggestions

### WebSocket API

Connect to `ws://localhost:3001` for real-time R execution.

Message types:
- `execute_code` - Execute R code
- `execute_prompt` - Execute from prompt
- `cancel_execution` - Cancel running execution
- `get_session_stats` - Get session statistics

## Security Features

- R code validation and sanitization
- Sandboxed R execution environment
- Resource limits (memory, CPU time)
- Rate limiting for API endpoints
- Package whitelist enforcement

## Architecture

```
backend/
├── src/
│   ├── index.js           # Main server entry
│   ├── services/          # Business logic
│   │   ├── RSessionManager.js
│   │   └── websocket.js
│   ├── routes/            # API routes
│   │   ├── r.routes.js
│   │   └── visualization.routes.js
│   ├── middleware/        # Express middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   └── utils/             # Utilities
│       ├── logger.js
│       └── RCodeValidator.js
├── r-scripts/             # R scripts
│   └── session.R
└── logs/                  # Application logs
```

## Troubleshooting

### R not found
- Ensure R is installed: https://www.r-project.org/
- Add R to system PATH
- Restart terminal/IDE after installation

### Missing R packages
Install required packages in R:
```R
install.packages("package_name")
```

### WebSocket connection issues
- Check if backend is running
- Verify CORS settings in `.env`
- Check firewall/proxy settings

## Development

### Adding New R Templates
Edit `src/routes/r.routes.js` and add to the templates object.

### Adding New Allowed R Packages
Edit `src/utils/RCodeValidator.js` and add to the `allowedPackages` array.

### Logging
Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only 