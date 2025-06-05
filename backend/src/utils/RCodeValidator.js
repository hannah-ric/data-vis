export class RCodeValidator {
  constructor() {
    // Dangerous functions that should be blocked
    this.dangerousFunctions = [
      'system', 'system2', 'shell', 'shell.exec',
      'file.remove', 'unlink', 'file.rename',
      'download.file', 'install.packages',
      'source', 'eval', 'parse',
      'save', 'save.image', 'saveRDS',
      'load', 'readRDS',
      'setwd', 'getwd',
      'Sys.setenv', 'Sys.unsetenv',
      'q', 'quit',
      'library\\s*\\(\\s*["\']parallel["\']\\s*\\)',
      'library\\s*\\(\\s*["\']foreach["\']\\s*\\)',
      'mclapply', 'parLapply', 'clusterApply'
    ];

    // Allowed packages
    this.allowedPackages = [
      'ggplot2', 'dplyr', 'tidyr', 'readr',
      'corrplot', 'plotly', 'lattice',
      'stats', 'graphics', 'grDevices',
      'utils', 'methods', 'base',
      'scales', 'viridis', 'RColorBrewer',
      'gridExtra', 'patchwork',
      'forecast', 'tseries', 'xts',
      'caret', 'randomForest', 'e1071',
      'cluster', 'factoextra',
      'igraph', 'network',
      'leaflet', 'sf', 'sp',
      'base64enc' // For image encoding
    ];

    // File system access patterns
    this.fileSystemPatterns = [
      /file\s*\.\s*(create|remove|rename|copy|exists|info)/i,
      /dir\s*\.\s*(create|exists)/i,
      /read\s*\.\s*(csv|table|delim|xlsx|json)/i,
      /write\s*\.\s*(csv|table|xlsx|json)/i,
      /scan\s*\(/i,
      /sink\s*\(/i,
      /connection\s*\(/i
    ];

    // Network access patterns
    this.networkPatterns = [
      /url\s*\(/i,
      /download\s*\.\s*file/i,
      /httr::/i,
      /RCurl::/i,
      /curl::/i
    ];

    // Maximum allowed code length
    this.maxCodeLength = 10000;
  }

  validate(code) {
    // Check code length
    if (code.length > this.maxCodeLength) {
      return {
        safe: false,
        reason: 'Code exceeds maximum allowed length'
      };
    }

    // Check for dangerous functions
    for (const func of this.dangerousFunctions) {
      const pattern = new RegExp(`\\b${func}\\s*\\(`, 'i');
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: `Dangerous function detected: ${func}`
        };
      }
    }

    // Check for file system access
    for (const pattern of this.fileSystemPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: 'File system access is not allowed'
        };
      }
    }

    // Check for network access
    for (const pattern of this.networkPatterns) {
      if (pattern.test(code)) {
        return {
          safe: false,
          reason: 'Network access is not allowed'
        };
      }
    }

    // Check for backticks (command execution)
    if (/`[^`]+`/.test(code)) {
      return {
        safe: false,
        reason: 'Backtick command execution is not allowed'
      };
    }

    // Check for system command patterns
    if (/system\s*\(|shell\s*\(|pipe\s*\(/.test(code)) {
      return {
        safe: false,
        reason: 'System command execution is not allowed'
      };
    }

    // Check library calls
    const libraryPattern = /library\s*\(\s*["']([^"']+)["']\s*\)/g;
    let match;
    while ((match = libraryPattern.exec(code)) !== null) {
      const packageName = match[1];
      if (!this.allowedPackages.includes(packageName)) {
        return {
          safe: false,
          reason: `Package '${packageName}' is not allowed`
        };
      }
    }

    // Check require calls
    const requirePattern = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
    while ((match = requirePattern.exec(code)) !== null) {
      const packageName = match[1];
      if (!this.allowedPackages.includes(packageName)) {
        return {
          safe: false,
          reason: `Package '${packageName}' is not allowed`
        };
      }
    }

    // Check for infinite loops (basic detection)
    if (/while\s*\(\s*TRUE\s*\)/.test(code) || 
        /while\s*\(\s*T\s*\)/.test(code) ||
        /repeat\s*\{/.test(code)) {
      return {
        safe: false,
        reason: 'Potentially infinite loops are not allowed'
      };
    }

    // Check for large number generation
    if (/seq\s*\([^)]*1e[6-9]|seq\s*\([^)]*\d{7,}/.test(code)) {
      return {
        safe: false,
        reason: 'Generation of very large sequences is not allowed'
      };
    }

    return {
      safe: true,
      reason: null
    };
  }

  sanitizeDataFrameName(name) {
    // Only allow alphanumeric characters and underscores
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  wrapInSandbox(code, dataVariableName = 'data') {
    // Wrap code in a sandboxed environment
    return `
# Sandboxed execution environment
local({
  # Limit memory usage
  options(expressions = 5000)
  
  # Disable external connections
  options(download.file.method = "none")
  
  # Execute user code
  ${code}
})`
  }

  generateSafeDataLoad(data, variableName = 'data') {
    // Generate safe R code to load data
    const sanitizedName = this.sanitizeDataFrameName(variableName);
    
    return `
# Load data safely
${sanitizedName} <- data.frame(
  ${Object.keys(data[0] || {}).map(key => {
    const sanitizedKey = this.sanitizeDataFrameName(key);
    return `${sanitizedKey} = c(${data.map(row => {
      const value = row[key];
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value ?? 'NA';
    }).join(', ')})`;
  }).join(',\n  ')}
)`;
  }
}

export default RCodeValidator; 