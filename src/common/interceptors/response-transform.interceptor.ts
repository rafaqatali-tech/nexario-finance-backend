import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { PaginatedResult } from '../interfaces/paginated-result.interface';

interface ResponseMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

interface ApiResponse<T> {
  status: 'success';
  data: T;
  meta?: ResponseMeta;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const page = this.getPositiveIntFromQuery(req.query.page, 1);
    const limit = this.getPositiveIntFromQuery(req.query.limit, 10);

    return next.handle().pipe(
      map((data: unknown): ApiResponse<unknown> => {
        if (
          data !== null &&
          typeof data === 'object' &&
          'status' in data &&
          'data' in data
        ) {
          return data as ApiResponse<unknown>;
        }

        if (this.isPaginatedResult(data)) {
          const currentPage = data.page || page;
          const itemsPerPage = data.limit || limit;
          const totalItems = data.total;
          const itemCount = data.results.length;
          const meta: ResponseMeta = {
            itemCount,
            totalItems,
            itemsPerPage,
            totalPages: Math.max(1, Math.ceil(totalItems / itemsPerPage)),
            currentPage,
          };

          return {
            status: 'success',
            data: this.convertDatesToIso(data.results),
            meta,
          };
        }

        return {
          status: 'success',
          data: this.convertDatesToIso(data),
        };
      }),
    );
  }

  private isPaginatedResult(data: unknown): data is PaginatedResult<unknown> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'results' in data &&
      Array.isArray((data as { results: unknown }).results) &&
      'total' in data &&
      typeof (data as { total: unknown }).total === 'number'
    );
  }

  private convertDatesToIso(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.convertDatesToIso(item));
    }

    if (value !== null && typeof value === 'object') {
      const converted: Record<string, unknown> = {};
      for (const [key, nested] of Object.entries(value)) {
        converted[key] = this.convertDatesToIso(nested);
      }
      return converted;
    }

    return value;
  }

  private getPositiveIntFromQuery(value: unknown, fallback: number): number {
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      const parsed = Number.parseInt(value[0], 10);
      return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
    }

    return fallback;
  }
}
