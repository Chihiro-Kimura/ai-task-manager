# AI Task Manager - メモ機能拡張

## 概要

AI Task Managerにメモ機能を追加し、タスク管理との連携を実現するプロジェクトです。
Notionライクなデータベース機能を持ち、タグによる効率的な情報管理を実現します。

## 開発フェーズ

### Phase 1: 基本的なメモ機能の実装

- [x] メモのCRUD操作
- [ ] 基本的なエディタ機能
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

   - [ ] リッチテキストエディタ
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

   - [ ] 適切なキャッシング
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
    - Google Gemini 1.5 Pro ($0.0025/1K tokens)
  - 無料/低コストモデル
    - OpenAI GPT-3.5 ($0.0005/1K tokens)
    - Google Gemini 1.5 Flash ($0.0005/1K tokens)
  - モデルごとの特性を活かした使い分け
  - コストパフォーマンスの最適化
  - APIキーの管理機能

## ライセンス

MIT License
