# Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Connection Issues

#### Symptom: "Backend server not running" message
**Solution:**
1. Ensure the backend is running: `cd backend && npm run dev`
2. Check if port 3001 is available: `netstat -an | grep 3001`
3. Verify `.env` file has correct URLs

#### Symptom: WebSocket connection fails
**Solution:**
1. Check browser console for specific errors
2. Ensure CORS is properly configured
3. Try clearing browser cache
4. Check firewall settings for port 3001

### 2. R Integration Issues

#### Symptom: "R is not installed" error
**Solution:**
1. Install R from https://www.r-project.org/
2. Add R to system PATH:
   - Windows: Add `C:\Program Files\R\R-4.x.x\bin` to PATH
   - Mac: R is usually in PATH after installation
   - Linux: `sudo apt-get install r-base` or equivalent
3. Restart terminal/IDE after installation
4. Verify: `Rscript --version`

#### Symptom: R packages missing
**Solution:**
```R
# Install all required packages at once
install.packages(c(
  "ggplot2", "dplyr", "tidyr", "corrplot", 
  "plotly", "forecast", "cluster", "randomForest",
  "base64enc"
))
```

#### Symptom: R plots not showing
**Solution:**
1. Ensure `base64enc` package is installed
2. Check R console output for errors
3. Try a simple plot first: `plot(1:10)`

### 3. File Upload Issues

#### Symptom: "File validation failed"
**Solution:**
1. Check file size (must be under 50MB)
2. Ensure file format is CSV or JSON
3. For Excel files, save as CSV first

#### Symptom: Data not parsing correctly
**Solution:**
1. Check CSV delimiter (should be comma)
2. Ensure first row contains column headers
3. Remove special characters from headers
4. Check for encoding issues (use UTF-8)

### 4. Performance Issues

#### Symptom: Slow with large datasets
**Solution:**
1. Sample your data: use first 10,000 rows
2. Remove unnecessary columns
3. Use Chrome/Firefox for better performance
4. Close other browser tabs

#### Symptom: Browser freezing
**Solution:**
1. Reduce data size
2. Disable browser extensions
3. Clear browser cache
4. Use production build: `npm run build`

### 5. Development Issues

#### Symptom: Changes not reflecting
**Solution:**
1. Clear browser cache
2. Restart dev server
3. Check for compilation errors
4. Delete `node_modules` and reinstall

#### Symptom: Module not found errors
**Solution:**
1. Run `npm install` in project root
2. Run `cd backend && npm install`
3. Check import paths are correct
4. Ensure file extensions are included

### 6. Deployment Issues

#### Symptom: Works locally but not in production
**Solution:**
1. Update `.env.production` with correct URLs
2. Build with production flag: `npm run build`
3. Ensure backend URL uses HTTPS in production
4. Check server logs for errors

### Verification Steps

Run the setup verification:
```bash
npm run test:setup
```

This will check:
- Node.js version
- R installation
- Required files
- Dependencies
- Environment configuration

### Getting Help

If issues persist:
1. Check browser console (F12) for errors
2. Check backend logs in `backend/logs/`
3. Run with debug logging: `LOG_LEVEL=debug npm run dev`
4. Create an issue with:
   - Error messages
   - Steps to reproduce
   - System information
   - Browser version 