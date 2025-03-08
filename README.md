# AI Task Manager - メモ機能拡張

## 概要

AI Task Managerにメモ機能を追加し、タスク管理との連携を実現するプロジェクトです。
Notionライクなデータベース機能を持ち、タグによる効率的な情報管理を実現します。

### 開発状況

- 現在の開発ブランチ: `feature`
- 開発環境: Node.js 20.x
- データベース: PostgreSQL (Supabase)
- 認証: NextAuth.js (Google OAuth)

### 重要な注意点

- 環境変数は`.env.local`に設定が必要
  - `DATABASE_URL`: PostgreSQL接続文字列
  - `DIRECT_URL`: Supabase直接接続用URL
  - `NEXTAUTH_URL`: 認証用URL
  - `GOOGLE_CLIENT_ID`: Google OAuth用
  - `GOOGLE_CLIENT_SECRET`: Google OAuth用
  - 各AIプロバイダーのAPIキー（今後実装）

## 開発フェーズ

### Phase 1: 基本的なメモ機能の実装

- [x] メモのCRUD操作
- [x] 基本的なエディタ機能
- [x] メモ一覧表示
- [x] 検索機能

### Phase 2: タグシステムの統合

- [x] 既存タスクのタグシステムとの統合
- [ ] タグの階層構造の実装
- [x] タグによるフィルタリング機能
- [ ] タグの使用状況分析

### Phase 3: タスクとメモの連携

- [ ] タスクからメモの参照
- [ ] メモからタスクの作成
- [ ] 関連コンテンツの表示
- [ ] 統合ビューの実装

### Phase 4: AI機能の実装

- [ ] 自動タグ付け
- [ ] 関連コンテンツの提案
- [ ] 優先度の分析
- [ ] カテゴリ分類

### Phase 5: 高度な機能

- [ ] バージョン管理
- [ ] 階層構造
- [ ] コラボレーション機能
- [ ] エクスポート/インポート

## 技術スタック

- [x] Next.js (App Router)
- [x] TypeScript
- [x] Prisma (PostgreSQL)
- [x] Tailwind CSS
- [x] Shadcn UI
- [ ] AI機能 (OpenAI API)

## データモデル

### Note

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'diary' | 'idea' | 'reference' | 'task_note';
  priority?: Priority;
  tags: Tag[];
  relatedTasks?: Task[];
  parentNoteId?: string;
  version: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 主要機能

1. メモ管理

   - [x] リッチテキストエディタ
   - [x] タグ付け
   - [ ] バージョン管理
   - [ ] 階層構造

2. タスク連携

   - [ ] タスクからメモの参照
   - [ ] メモからタスクの作成
   - [ ] 関連コンテンツの表示

3. タグシステム

   - [ ] 階層構造
   - [ ] タグの自動提案
   - [ ] 使用状況分析

4. AI機能
   - [ ] コンテンツ分析
   - [ ] タグ提案
   - [ ] 関連付け提案

## 開発ガイドライン

1. コーディング規約

   - [x] TypeScriptの厳格な型付け
   - [x] 関数コンポーネントの使用
   - [x] サーバーコンポーネントの優先使用

2. パフォーマンス

   - [x] 適切なキャッシング
   - [x] 遅延読み込みの活用
   - [ ] バンドルサイズの最適化

3. セキュリティ
   - [x] 適切な認証・認可
   - [x] XSS対策
   - [x] CSRF対策

## 開発フロー

1. 各フェーズの開発

   - [x] 機能仕様の詳細化
   - [x] コンポーネント設計
   - [ ] テスト実装
   - [ ] レビュー

2. デプロイメント
   - [ ] ステージング環境でのテスト
   - [ ] 本番環境への段階的デプロイ
   - [ ] パフォーマンスモニタリング

## 今後の展開

- [ ] モバイルアプリ対応
- [ ] オフライン対応
- [ ] API公開
- [ ] プラグイン機能
- [ ] AIモデル選択機能
  - 有料モデル
    - OpenAI GPT-4 ($0.03/1K tokens)
      - 高度な推論と複雑なタスクの処理
      - 長文の分析や高品質な提案
    - Google Gemini 1.5 Pro ($0.0025/1K tokens)
      - マルチモーダル処理
      - 長いコンテキスト処理
  - 無料/低コストモデル
    - OpenAI GPT-3.5 ($0.0005/1K tokens)
      - 基本的な分析や提案
      - 高速なレスポンス
    - Google Gemini 1.5 Flash ($0.0005/1K tokens)
      - 効率的な処理
      - コストパフォーマンスに優れた基本機能
  - 実装予定の機能
    - モデル切り替えUI
    - APIキーの安全な管理（環境変数）
    - 使用量とコストの監視
    - モデルごとのレスポンスキャッシュ
    - エラーハンドリングとフォールバック

## ライセンス

MIT License

## データベース管理機能

### データベースビュー

1. メタデータ管理

   - [ ] タグの階層構造と関係性の可視化
   - [ ] カテゴリーの管理と統計
   - [ ] ステータスのカスタマイズとワークフロー定義
   - [ ] プロパティの型定義とバリデーション

2. データの関連付け

   - [ ] タグ/カテゴリ/ステータスごとのアイテム一覧
   - [ ] アイテム間の関連性の可視化
   - [ ] 双方向リンクの管理
   - [ ] 関連アイテムのプレビュー

3. 分析と統計

   - [ ] タグの使用頻度分析
   - [ ] カテゴリごとの集計
   - [ ] ステータスの遷移分析
   - [ ] 時系列での変化の追跡

4. カスタムビュー

   - [ ] テーブル/ボード/カレンダー/ギャラリー表示
   - [ ] カスタムフィルターの保存
   - [ ] ソート条件の組み合わせ
   - [ ] グループ化と集計

5. バッチ操作
   - [ ] 一括タグ付け
   - [ ] 一括カテゴリ変更
   - [ ] 一括ステータス更新
   - [ ] 一括アーカイブ/削除

### データモデルの拡張

```typescript
// メタデータの定義
interface MetaProperty {
  id: string;
  name: string;
  type: 'tag' | 'category' | 'status' | 'custom';
  config: {
    color?: string;
    icon?: string;
    validation?: {
      required?: boolean;
      pattern?: string;
      min?: number;
      max?: number;
    };
    options?: {
      id: string;
      label: string;
      value: string;
    }[];
  };
  parentId?: string;
  children?: MetaProperty[];
  createdAt: Date;
  updatedAt: Date;
}

// アイテム間の関連付け
interface ItemRelation {
  id: string;
  sourceId: string;
  sourceType: 'note' | 'task';
  targetId: string;
  targetType: 'note' | 'task';
  relationType: 'reference' | 'parent' | 'custom';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// カスタムビューの設定
interface CustomView {
  id: string;
  name: string;
  type: 'table' | 'board' | 'calendar' | 'gallery';
  config: {
    filters: FilterCondition[];
    sorts: SortCondition[];
    groupBy?: string[];
    visibleColumns?: string[];
    aggregations?: AggregationConfig[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 主要コンポーネント

1. データベースエクスプローラー

   ```tsx
   // components/(database)/explorer/DatabaseExplorer.tsx
   export function DatabaseExplorer() {
     // メタデータツリーの表示
     // アイテム一覧の表示
     // フィルター/ソート/グループ化の制御
     // バッチ操作の実行
   }
   ```

2. メタデータエディタ

   ```tsx
   // components/(database)/metadata/MetadataEditor.tsx
   export function MetadataEditor() {
     // プロパティの定義
     // バリデーションの設定
     // 階層構造の管理
   }
   ```

3. 関連性ビューアー

   ```tsx
   // components/(database)/relations/RelationViewer.tsx
   export function RelationViewer() {
     // アイテム間の関連性の可視化
     // 関連の編集
     // プレビューの表示
   }
   ```

4. 分析ダッシュボード
   ```tsx
   // components/(database)/analytics/AnalyticsDashboard.tsx
   export function AnalyticsDashboard() {
     // 使用状況の集計
     // グラフの表示
     // トレンドの分析
   }
   ```

### API設計

1. メタデータ管理API

   ```typescript
   // app/api/database/metadata/route.ts
   // メタデータのCRUD操作
   // 階層構造の管理
   // バリデーション
   ```

2. 関連付けAPI

   ```typescript
   // app/api/database/relations/route.ts
   // アイテム間の関連付け
   // 双方向リンクの管理
   // 関連性の検索
   ```

3. 分析API
   ```typescript
   // app/api/database/analytics/route.ts
   // 使用状況の集計
   // トレンド分析
   // レポート生成
   ```

### 実装の優先順位

1. 第一フェーズ

   - [ ] 基本的なメタデータ管理UI
   - [ ] シンプルなテーブルビュー
   - [ ] 基本的なフィルター/ソート機能

2. 第二フェーズ

   - [ ] 階層構造の実装
   - [ ] カスタムビューの保存
   - [ ] バッチ操作機能

3. 第三フェーズ
   - [ ] 関連性の可視化
   - [ ] 分析ダッシュボード
   - [ ] 高度なカスタマイズ

## 改善計画

### システム基盤の強化

1. データの整合性と同期

   - [ ] イベントベースの同期システム
   - [ ] Prismaミドルウェアによる自動更新
   - [ ] WebSocketによるリアルタイム更新

2. パフォーマンスとスケーラビリティ

   - [ ] DataLoaderパターンの導入
   - [ ] エッジキャッシング
   - [ ] 仮想スクロール
   - [ ] バックグラウンド処理

3. セキュリティとデータ保護
   - [ ] きめ細かなアクセス制御
   - [ ] 監査ログ
   - [ ] データの暗号化
   - [ ] バックアップ/復元機能

### ユーザー体験の向上

1. 検索とナビゲーション

   - [ ] 全文検索エンジン導入
   - [ ] ファセット検索
   - [ ] ブックマーク機能
   - [ ] 表示履歴

2. 使いやすさの改善

   - [ ] オンボーディング
   - [ ] コンテキストヘルプ
   - [ ] ショートカット機能
   - [ ] カスタマイズ可能なダッシュボード

3. オフライン対応
   - [ ] Service Worker
   - [ ] オフラインファースト設計
   - [ ] 同期の競合解決

### 拡張性と自動化

1. 外部連携

   - [ ] プラグインシステム
   - [ ] Webhook対応
   - [ ] 公開API
   - [ ] カスタムスクリプト

2. ワークフロー自動化
   - [ ] カスタムワークフロー
   - [ ] 自動タグ付け
   - [ ] バッチ処理
   - [ ] スケジュール実行

### 実装優先順位

1. 第一優先（〜2024年6月）

   - データの整合性と同期システム
   - 基本的なパフォーマンス最適化
   - セキュリティ強化

2. 第二優先（〜2024年9月）

   - 検索機能の強化
   - UX改善
   - バックアップ/復元

3. 第三優先（〜2024年12月）
   - 拡張性対応
   - オフライン機能
   - 高度な分析機能
