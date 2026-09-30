import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response already contains pagination object
        if (res && typeof res === 'object' && 'pagination' in res && 'data' in res) {
          return {
            success: true,
            data: res.data,
            pagination: res.pagination,
          };
        }

        // If response already has success flag
        if (res && typeof res === 'object' && 'success' in res) {
          return res;
        }

        return {
          success: true,
          data: res,
        };
      }),
    );
  }
}
