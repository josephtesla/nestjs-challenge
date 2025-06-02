import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class RecordsHttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();

    if (req.method !== 'GET' || !req.originalUrl.startsWith('/records')) {
      return undefined;
    }

    const hash = createHash('sha256').update(req.originalUrl).digest('hex');
    return `records:${hash}`; // key = records:<hash(full-url)>
  }
}
