import { Suspense } from 'react';
import { type ReactElement } from 'react';

import ErrorPage from '@/components/(common)/error/ErrorPage';

export default function AuthError(): ReactElement {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPage />
    </Suspense>
  );
}
