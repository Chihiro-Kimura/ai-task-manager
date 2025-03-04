import { type ReactElement } from 'react';

export default function ErrorState(): ReactElement {
  return (
    <div className="flex items-center justify-center h-[80vh] text-rose-400">
      <p>エラーが発生しました。再度お試しください。</p>
    </div>
  );
}
