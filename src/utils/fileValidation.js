// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = ['.csv', '.json']; // .xlsx temporarily disabled until implemented
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'text/plain' // Some browsers report CSV as text/plain
];

// Malicious pattern detection
const MALICIOUS_PATTERNS = [
  /<script[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
];

export class FileValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'FileValidationError';
    this.code = code;
  }
}

export const validateFile = (file) => {
  // Check if file exists
  if (!file) {
    throw new FileValidationError('No file provided', 'NO_FILE');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new FileValidationError(
      `File size (${sizeMB}MB) exceeds maximum allowed size of 50MB`,
      'FILE_TOO_LARGE'
    );
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new FileValidationError(
      `File type '${extension}' is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      'INVALID_EXTENSION'
    );
  }

  // Check MIME type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    // Allow empty MIME type as some systems don't set it correctly
    if (file.type !== '') {
      console.warn(`Unexpected MIME type: ${file.type}. Proceeding with caution.`);
    }
  }

  return true;
};

export const validateFileContent = async (content, fileType) => {
  // Check for malicious patterns
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(contentStr)) {
      throw new FileValidationError(
        'File contains potentially malicious content',
        'MALICIOUS_CONTENT'
      );
    }
  }

  // Type-specific validation
  switch (fileType) {
    case '.csv':
      validateCSVContent(contentStr);
      break;
    case '.json':
      validateJSONContent(content);
      break;
    case '.xlsx':
      // XLSX validation happens during parsing
      break;
  }

  return true;
};

const validateCSVContent = (content) => {
  // Basic CSV validation
  if (!content || content.trim().length === 0) {
    throw new FileValidationError('CSV file is empty', 'EMPTY_FILE');
  }

  // Check for reasonable line count (prevent DoS)
  const lines = content.split('\n');
  if (lines.length > 1000000) {
    throw new FileValidationError(
      'CSV file has too many rows (max 1,000,000)',
      'TOO_MANY_ROWS'
    );
  }

  // Check for reasonable column count
  const firstLine = lines[0];
  const columns = firstLine.split(',');
  if (columns.length > 1000) {
    throw new FileValidationError(
      'CSV file has too many columns (max 1,000)',
      'TOO_MANY_COLUMNS'
    );
  }
};

const validateJSONContent = (content) => {
  // Ensure it's valid JSON (should already be parsed, but double-check)
  if (typeof content === 'string') {
    try {
      JSON.parse(content);
    } catch (e) {
      throw new FileValidationError('Invalid JSON format', 'INVALID_JSON');
    }
  }

  // Check for reasonable size
  const str = JSON.stringify(content);
  if (str.length > 100 * 1024 * 1024) { // 100MB when stringified
    throw new FileValidationError(
      'JSON data is too large',
      'JSON_TOO_LARGE'
    );
  }

  // Check nesting depth to prevent stack overflow
  const checkDepth = (obj, maxDepth = 50, currentDepth = 0) => {
    if (currentDepth > maxDepth) {
      throw new FileValidationError(
        'JSON nesting is too deep',
        'JSON_TOO_DEEP'
      );
    }

    if (Array.isArray(obj)) {
      obj.forEach(item => checkDepth(item, maxDepth, currentDepth + 1));
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(value => checkDepth(value, maxDepth, currentDepth + 1));
    }
  };

  checkDepth(content);
};

export const sanitizeData = (data) => {
  if (typeof data === 'string') {
    // Remove potential XSS vectors
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[sanitizeData(key)] = sanitizeData(value);
    }
    return sanitized;
  }
  
  return data;
}; 