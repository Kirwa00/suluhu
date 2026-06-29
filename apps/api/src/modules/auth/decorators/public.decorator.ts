import { SetMetadata } from '@nestjs/common';

/** Metadata key marking a route as accessible without authentication. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a controller or handler as public (bypasses the global auth guard). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
