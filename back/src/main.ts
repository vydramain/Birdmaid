import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parser for HttpOnly cookie support
  app.use(cookieParser());
  
  // CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : ['*'];
  
  app.enableCors({ 
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, iframe requests with Origin: null)
      // This is important for build file requests from iframes
      if (!origin || origin === 'null') {
        return callback(null, true);
      }
      // In production, check against CORS_ORIGIN env var
      if (process.env.NODE_ENV === 'production' && corsOrigin) {
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        // Development: allow all origins
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  });
  
  // Global request logging middleware (for debugging)
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[GlobalMiddleware] ${req.method} ${req.url} - Path: ${req.path}, Query:`, req.query);
    next();
  });
  
  // Add global CORS headers manually as fallback (NestJS enableCors should handle this, but this ensures it works)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const isBuildAssetRoute = /\/games\/[^\/]+\/build\//.test(req.url || req.path || '');
    
    // When credentials: true, we must use specific origin, not '*'
    // But for iframe requests (Origin: null), we need to allow them
    if (origin && origin !== 'null') {
      if (process.env.NODE_ENV === 'production' && corsOrigin) {
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
      } else {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    } else {
      // For requests without origin or with Origin: null (opaque origin from sandboxed iframe)
      // CRITICAL: For build asset routes with Origin: null, we MUST respond with
      // Access-Control-Allow-Origin: "null" (the literal string "null") for CORS to work.
      // This is required by the CORS specification for opaque origins.
      if (isBuildAssetRoute && (!origin || origin === 'null')) {
        res.setHeader('Access-Control-Allow-Origin', 'null');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        // For other routes with Origin: null, use standard handling
        if (process.env.NODE_ENV === 'production' && corsOrigin && !allowedOrigins.includes('*')) {
          // Use first allowed origin or wildcard
          const allowOrigin = allowedOrigins[0] || '*';
          res.setHeader('Access-Control-Allow-Origin', allowOrigin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        } else {
          // Development or wildcard: allow all
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
      }
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers, Cookie');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Vary header is required when ACAO can change based on Origin
    if (isBuildAssetRoute) {
      res.setHeader('Vary', 'Origin');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });
  
  await app.listen(3000, '0.0.0.0'); // Listen on all network interfaces
  console.log('Backend server listening on http://0.0.0.0:3000');
  console.log('CORS enabled for all origins');
}

bootstrap();
