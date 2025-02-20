# パフォーマンス最適化ガイドライン

## 1. Server Components の最適化

### 1.1 基本原則

- デフォルトで Server Components を使用
- Client Components は必要な場合のみ使用
- コンポーネントの責務を明確に分離

### 1.2 実装パターン

```typescript
// 良い例：データフェッチを含むServer Component
async function ProductList(): Promise<JSX.Element> {
  const products = await fetchProducts();
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// 良い例：インタラクションを含むClient Component
('use client');
function ProductCard({ product }): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  return <div onClick={() => setIsExpanded(!isExpanded)}>{/* UI実装 */}</div>;
}
```

### 1.3 最適化のポイント

- Server Components でのデータフェッチは Parallel Fetching を活用
- Client Components は可能な限り小さく保つ
- Suspense を使用して読み込み状態を管理

## 2. データフェッチの最適化

### 2.1 SWR の効果的な使用

```typescript
// 基本的な使用方法
const { data, error } = useSWR('/api/tasks', fetcher);

// 最適化された使用方法
const { data, error } = useSWR('/api/tasks', fetcher, {
  revalidateOnFocus: false, // フォーカス時の再検証を無効化
  dedupingInterval: 2000, // 2秒間は重複リクエストを防ぐ
  keepPreviousData: true, // 新しいデータ取得中も前のデータを表示
});
```

### 2.2 キャッシュ戦略

- Route Segment Config を使用したキャッシュ制御
- Revalidation 期間の適切な設定
- Mutation 後の適切な Revalidation

```typescript
// ページレベルでのキャッシュ制御
export const revalidate = 3600; // 1時間

// 動的ルートでのキャッシュ制御
export const dynamic = 'force-dynamic';
```

## 3. 画像最適化

### 3.1 next/image の使用

```typescript
import Image from 'next/image';

// 良い例
function OptimizedImage(): JSX.Element {
  return (
    <Image
      src="/path/to/image.jpg"
      alt="説明的な代替テキスト"
      width={800}
      height={600}
      placeholder="blur"
      priority={true} // LCPの画像の場合
      loading="lazy" // フォールド下の画像の場合
    />
  );
}
```

### 3.2 画像最適化のベストプラクティス

- 適切なサイズと形式の使用
- レスポンシブ画像の実装
- プレースホルダーの活用

## 4. バンドルサイズの最適化

### 4.1 Code Splitting

```typescript
// 動的インポートの使用
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // クライアントサイドでのみ必要な場合
});
```

### 4.2 バンドル最適化のポイント

- 不要なライブラリの削除
- Tree Shaking の活用
- モジュールの遅延読み込み

## 5. レンダリングの最適化

### 5.1 メモ化の使用

```typescript
// コンポーネントのメモ化
const MemoizedComponent = memo(
  function Component({ prop }) {
    return <div>{prop}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.prop === nextProps.prop;
  }
);

// 関数のメモ化
const memoizedFunction = useCallback(
  () => {
    // 複雑な処理
  },
  [
    /* 依存配列 */
  ]
);

// 値のメモ化
const memoizedValue = useMemo(() => {
  return expensiveCalculation(prop);
}, [prop]);
```

### 5.2 レンダリング最適化のポイント

- 不要なレンダリングの防止
- 適切な依存配列の設定
- パフォーマンスモニタリング

## 6. Web Vitals の最適化

### 6.1 LCP（Largest Contentful Paint）

- 重要なコンテンツの優先読み込み
- 画像の最適化
- サーバーレスポンスの最適化

### 6.2 FID（First Input Delay）

- JavaScript 実行時間の最適化
- インタラクションの分割
- メインスレッドのブロッキング防止

### 6.3 CLS（Cumulative Layout Shift）

- 画像サイズの事前指定
- フォントの最適化
- プレースホルダーの使用

## 7. パフォーマンスモニタリング

### 7.1 モニタリングツール

- Chrome DevTools
- Lighthouse
- Next.js Analytics

### 7.2 主要な指標

- TTFB（Time to First Byte）
- FCP（First Contentful Paint）
- TTI（Time to Interactive）
- TBT（Total Blocking Time）
