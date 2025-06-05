import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { RCodeValidator } from '../utils/RCodeValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RSession {
  constructor(id, options = {}) {
    this.id = id;
    this.process = null;
    this.busy = false;
    this.createdAt = new Date();
    this.lastUsed = new Date();
    this.options = {
      timeout: options.timeout || 30000, // 30 seconds default
      maxMemory: options.maxMemory || '512M',
      ...options
    };
    this.queue = [];
  }

  async start() {
    try {
      this.process = spawn('Rscript', [
        '--vanilla',
        '--slave',
        path.join(__dirname, '../../r-scripts/session.R')
      ], {
        env: {
          ...process.env,
          R_MAX_MEM_SIZE: this.options.maxMemory
        }
      });

      this.process.on('error', (err) => {
        logger.error(`R session ${this.id} error:`, err);
      });

      this.process.on('exit', (code) => {
        logger.info(`R session ${this.id} exited with code ${code}`);
        this.process = null;
      });

      // Wait for R to be ready
      await this.waitForReady();
      
      return true;
    } catch (error) {
      logger.error(`Failed to start R session ${this.id}:`, error);
      throw error;
    }
  }

  async waitForReady() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('R session startup timeout'));
      }, 5000);

      const checkReady = () => {
        if (this.process && this.process.pid) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  }

  async execute(code, options = {}) {
    if (!this.process) {
      throw new Error('R session not started');
    }

    if (this.busy) {
      throw new Error('R session is busy');
    }

    this.busy = true;
    this.lastUsed = new Date();

    const executionId = uuidv4();
    const timeout = options.timeout || this.options.timeout;

    return new Promise((resolve, reject) => {
      let output = '';
      let error = '';
      let timeoutHandle;

      const cleanup = () => {
        this.busy = false;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        this.process.stdout.removeListener('data', onData);
        this.process.stderr.removeListener('data', onError);
      };

      const onData = (data) => {
        output += data.toString();
        
        // Check for completion marker
        if (output.includes(`EXECUTION_COMPLETE_${executionId}`)) {
          cleanup();
          const result = output.replace(`EXECUTION_COMPLETE_${executionId}`, '').trim();
          resolve({
            success: true,
            output: result,
            executionTime: new Date() - this.lastUsed
          });
        }
      };

      const onError = (data) => {
        error += data.toString();
      };

      // Set timeout
      timeoutHandle = setTimeout(() => {
        cleanup();
        reject(new Error(`R execution timeout after ${timeout}ms`));
      }, timeout);

      // Listen for output
      this.process.stdout.on('data', onData);
      this.process.stderr.on('data', onError);

      // Send code to R
      const wrappedCode = `
tryCatch({
${code}
cat("\\nEXECUTION_COMPLETE_${executionId}")
}, error = function(e) {
  cat("ERROR:", conditionMessage(e), "\\n")
  cat("EXECUTION_COMPLETE_${executionId}")
})
`;
      
      this.process.stdin.write(wrappedCode + '\n');
    });
  }

  async terminate() {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }

  isAlive() {
    return this.process && !this.process.killed;
  }

  getStats() {
    return {
      id: this.id,
      busy: this.busy,
      createdAt: this.createdAt,
      lastUsed: this.lastUsed,
      alive: this.isAlive()
    };
  }
}

export class RSessionManager {
  constructor(options = {}) {
    this.sessions = new Map();
    this.options = {
      maxSessions: options.maxSessions || 5,
      sessionTimeout: options.sessionTimeout || 300000, // 5 minutes
      cleanupInterval: options.cleanupInterval || 60000, // 1 minute
      ...options
    };
    this.validator = new RCodeValidator();
    this.cleanupTimer = null;
    this.rAvailable = false;
  }

  async initialize() {
    // Check if R is available
    try {
      await this.checkRAvailability();
      this.rAvailable = true;
      
      // Start cleanup timer
      this.cleanupTimer = setInterval(() => {
        this.cleanupInactiveSessions();
      }, this.options.cleanupInterval);

      logger.info('R Session Manager initialized');
    } catch (error) {
      logger.error('Failed to initialize R Session Manager:', error);
      this.rAvailable = false;
      // Don't throw error, just log it - app can run without R
    }
  }

  async checkRAvailability() {
    return new Promise((resolve, reject) => {
      const checkProcess = spawn('Rscript', ['--version']);
      
      checkProcess.on('error', () => {
        reject(new Error('R is not installed or not in PATH'));
      });

      checkProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('R check failed'));
        }
      });
    });
  }

  async getOrCreateSession(sessionId) {
    // Try to get existing session
    let session = this.sessions.get(sessionId);
    
    if (!session || !session.isAlive()) {
      // Create new session
      session = new RSession(sessionId);
      await session.start();
      this.sessions.set(sessionId, session);
      
      // Check session limit
      if (this.sessions.size > this.options.maxSessions) {
        this.removeOldestSession();
      }
    }

    return session;
  }

  async executeCode(sessionId, code, options = {}) {
    // Validate code
    const validation = this.validator.validate(code);
    if (!validation.safe) {
      throw new Error(`Unsafe R code: ${validation.reason}`);
    }

    // Get or create session
    const session = await this.getOrCreateSession(sessionId);
    
    // Execute code
    return await session.execute(code, options);
  }

  async executePrompt(sessionId, prompt, data, options = {}) {
    // Generate R code from prompt
    const code = await this.generateRCode(prompt, data);
    
    // Execute generated code
    return await this.executeCode(sessionId, code, options);
  }

  async generateRCode(prompt, data) {
    // This is a simplified version - in production, you'd use
    // a more sophisticated NLP/LLM approach
    
    const templates = {
      correlation: (vars) => `
        library(corrplot)
        cor_matrix <- cor(data[, c(${vars.map(v => `"${v}"`).join(', ')})], use = "complete.obs")
        print(round(cor_matrix, 2))
        corrplot(cor_matrix, method = "circle", type = "upper", 
                 order = "hclust", tl.cex = 0.8, tl.col = "black",
                 title = "Correlation Matrix", mar = c(0,0,1,0))
      `,
      
      scatter: (x, y) => `
        library(ggplot2)
        p <- ggplot(data, aes(x = ${x}, y = ${y})) +
          geom_point(alpha = 0.7, size = 3) +
          geom_smooth(method = "lm", se = TRUE, color = "blue") +
          theme_minimal() +
          labs(title = paste("Scatter Plot:", "${x}", "vs", "${y}"),
               x = "${x}", y = "${y}")
        print(p)
      `,
      
      histogram: (var) => `
        library(ggplot2)
        p <- ggplot(data, aes(x = ${var})) +
          geom_histogram(aes(y = ..density..), bins = 30, 
                        fill = "lightblue", color = "black", alpha = 0.7) +
          geom_density(color = "red", size = 1) +
          theme_minimal() +
          labs(title = paste("Distribution of", "${var}"),
               x = "${var}", y = "Density")
        print(p)
      `,
      
      summary: () => `
        cat("Data Summary:\\n")
        cat("============\\n")
        print(summary(data))
        cat("\\nData Structure:\\n")
        cat("===============\\n")
        str(data)
        cat("\\nMissing Values:\\n")
        cat("===============\\n")
        print(colSums(is.na(data)))
      `
    };

    // Simple pattern matching for demonstration
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('correlation')) {
      const vars = Object.keys(data[0] || {}).filter(k => 
        typeof data[0][k] === 'number'
      );
      return templates.correlation(vars);
    }
    
    if (lowerPrompt.includes('scatter')) {
      const vars = Object.keys(data[0] || {});
      if (vars.length >= 2) {
        return templates.scatter(vars[0], vars[1]);
      }
    }
    
    if (lowerPrompt.includes('histogram')) {
      const numericVars = Object.keys(data[0] || {}).filter(k => 
        typeof data[0][k] === 'number'
      );
      if (numericVars.length > 0) {
        return templates.histogram(numericVars[0]);
      }
    }
    
    // Default to summary
    return templates.summary();
  }

  removeOldestSession() {
    let oldest = null;
    let oldestTime = new Date();

    for (const [id, session] of this.sessions) {
      if (session.lastUsed < oldestTime && !session.busy) {
        oldest = id;
        oldestTime = session.lastUsed;
      }
    }

    if (oldest) {
      const session = this.sessions.get(oldest);
      session.terminate();
      this.sessions.delete(oldest);
      logger.info(`Removed oldest session: ${oldest}`);
    }
  }

  cleanupInactiveSessions() {
    const now = new Date();
    const timeout = this.options.sessionTimeout;

    for (const [id, session] of this.sessions) {
      const inactiveTime = now - session.lastUsed;
      
      if (inactiveTime > timeout && !session.busy) {
        session.terminate();
        this.sessions.delete(id);
        logger.info(`Cleaned up inactive session: ${id}`);
      }
    }
  }

  async cleanup() {
    // Stop cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Terminate all sessions
    for (const [id, session] of this.sessions) {
      await session.terminate();
    }
    
    this.sessions.clear();
    logger.info('R Session Manager cleaned up');
  }

  isRAvailable() {
    return this.rAvailable;
  }

  getActiveSessionCount() {
    return this.sessions.size;
  }

  getSessionStats() {
    const stats = [];
    for (const [id, session] of this.sessions) {
      stats.push(session.getStats());
    }
    return stats;
  }
} 