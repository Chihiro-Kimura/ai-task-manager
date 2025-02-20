# コーディングガイドライン

## 1. ディレクトリ構造

```
src/
├── app/                    # Next.js App Router pages
├── components/            # Reactコンポーネント
│   ├── ui/               # 共通UIコンポーネント
│   ├── features/         # 機能別コンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ関数
├── types/                # 型定義
└── store/                # 状態管理
```

## 2. コンポーネントの構造化

### 2.1 基本ルール

- 1 ファイル 1 コンポーネント
- コンポーネント名は PascalCase
- ファイル名はコンポーネント名と同じ
- 拡張子は `.tsx`

### 2.2 コンポーネントの構成

```typescript
// 1. インポート
import { useState, useEffect } from 'react'
import type { ComponentProps } from './types'

// 2. 型定義
interface IProps {
  // ...
}

// 3. 定数・ヘルパー関数
const CONSTANTS = {
  // ...
}

// 4. コンポーネント
export function ComponentName({ prop1, prop2 }: IProps): JSX.Element {
  // 4.1 フック
  const [state, setState] = useState()

  // 4.2 副作用
  useEffect(() => {
    // ...
  }, [])

  // 4.3 イベントハンドラ
  const handleClick = (): void => {
    // ...
  }

  // 4.4 レンダリング
  return (
    // ...
  )
}
```

## 3. 状態管理

### 3.1 基本方針

- ローカル状態には `useState` を使用
- グローバル状態には `zustand` を使用
- サーバー状態には `SWR` を使用

### 3.2 Zustand ストアの構造

```typescript
interface IStore {
  // 状態
  state: State;
  // アクション
  actions: {
    actionName: () => void;
  };
}
```

## 4. Server Components

### 4.1 使用基準

- データフェッチが主目的のコンポーネント
- SEO が重要なコンポーネント
- クライアントサイドのインタラクションが不要なコンポーネント

### 4.2 Client Components

以下の場合のみ 'use client' を使用:

- ブラウザ API を使用する場合
- イベントリスナーが必要な場合
- React のステート/エフェクトを使用する場合

## 5. パフォーマンス最適化

### 5.1 基本原則

- 不要なレンダリングを防ぐ
- 適切なキャッシング戦略を使用
- 画像の最適化

### 5.2 具体的な施策

- メモ化（React.memo, useMemo, useCallback）
- Code Splitting（dynamic import）
- 画像最適化（next/image）

## 6. エラーハンドリング

### 6.1 基本方針

- エラーは早期に検出
- ユーザーフレンドリーなエラーメッセージ
- エラー状態の適切な表示

### 6.2 実装例

```typescript
try {
  await someAsyncOperation();
} catch (error) {
  if (error instanceof CustomError) {
    // 特定のエラー処理
  } else {
    // 一般的なエラー処理
  }
}
```

## 7. テスト

### 7.1 テスト方針

- ユニットテスト：重要なロジック
- 統合テスト：主要なユーザーフロー
- E2E テスト：クリティカルなパス

### 7.2 テストの構造

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // ...
  });

  it('should handle user interactions', () => {
    // ...
  });
});
```
