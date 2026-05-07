import { Request, Response, NextFunction } from 'express';

/**
 * Request logger middleware
 * Logs incoming requests with method, path, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields from logs
    if (sanitizedBody.password) {
      sanitizedBody.password = '***REDACTED***';
    }
    if (sanitizedBody.token) {
      sanitizedBody.token = '***REDACTED***';
    }

    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    console.log(
      `${statusColor}[${res.statusCode}]${resetColor} ${req.method} ${req.path} - ${duration}ms`
    );
  });

  next();
};

/**
 * Request logger with more details (for development)
 */
export const detailedRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  console.log('\n--- Incoming Request ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`IP: ${req.ip}`);
  console.log(`User-Agent: ${req.get('user-agent')}`);
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query Params:', JSON.stringify(req.query, null, 2));
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';
    if (sanitizedBody.token) sanitizedBody.token = '***REDACTED***';
    console.log('Body:', JSON.stringify(sanitizedBody, null, 2));
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`\n--- Response ---`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log('--- End Request ---\n');
  });

  next();
};
