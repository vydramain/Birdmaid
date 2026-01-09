import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Request, Response, NextFunction } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enhanced CORS configuration for local network access
  app.enableCors({ 
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
      if (!origin) {
        return callback(null, true);
      }
      // Allow all origins for development (localhost, local IPs, etc.)
      // In production, you should restrict this to specific domains
      callback(null, true);
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
  
  // Add global CORS headers manually as fallback (NestJS enableCors should handle this, but this ensures it works)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    // When credentials: true, we must use specific origin, not '*'
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // For requests without origin (like Postman), allow all
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    
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
