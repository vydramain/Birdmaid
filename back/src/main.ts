import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable cookie parser for HttpOnly cookie support
  app.use(cookieParser());
  
  // CORS configuration
  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : ['*'];
  
  app.enableCors({ 
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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
        // Development: allow all origins (including localhost:5173)
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
      'Access-Control-Request-Headers',
      'Cookie'
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
  
  await app.listen(3000, '0.0.0.0'); // Listen on all network interfaces
  console.log('Backend server listening on http://0.0.0.0:3000');
  console.log('CORS enabled for all origins');
}

bootstrap();
