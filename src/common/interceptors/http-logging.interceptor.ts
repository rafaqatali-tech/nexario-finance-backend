import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const path = req.originalUrl ?? req.url;
    const { method } = req;
    const started = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const ms = Date.now() - started;
        this.logger.log(`${method} ${path} ${res.statusCode} ${ms}ms`);
      }),
    );
  }
}
