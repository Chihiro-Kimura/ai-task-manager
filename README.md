# AI Task Manager

Next.js App Router と TypeScript を使用したタスク管理アプリケーション

## 開発環境のセットアップ

### 必要な環境

- Node.js 18.17.0 以上
- npm 9.6.7 以上

### インストール

```bash
# リポジトリのクローン
git clone [repository-url]
cd ai-task-manager

# 依存パッケージのインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## コーディング規約

このプロジェクトでは、以下のコーディング規約を採用しています：

### TypeScript

- 厳密な型チェックを有効化
- `any`型の使用を禁止
- 関数の戻り値の型を明示的に指定
- 未使用の変数を禁止（`_`プレフィックスは除外）

### React コンポーネント

- 関数コンポーネントを使用
- 名前付きエクスポートを推奨
- コンポーネントの型定義を明示的に記述

### import の順序

以下の順序で import を記述します：

1. Node.js ビルトインモジュール
2. サードパーティパッケージ
3. アプリケーション内モジュール（@/から始まるパス）
4. 親ディレクトリからのインポート
5. 同じディレクトリからのインポート

### コードスタイル

- console の使用は`warn`と`error`のみ許可
- 再代入されない変数は`const`を使用
- `var`の使用を禁止

## ディレクトリ構造

```
app/
├── (routes)/           # ルーティング
│   ├── (auth)/        # 認証関連
│   └── (dashboard)/   # ダッシュボード
├── api/               # APIルート
components/
├── (auth)/            # 認証関連コンポーネント
├── (common)/          # 共通コンポーネント
├── (dashboard)/       # ダッシュボード関連
├── (tasks)/           # タスク関連
└── ui/               # UIコンポーネント
```

## ESLint と Prettier の設定

コードの一貫性を保つため、ESLint と Prettier を使用しています。
VSCode を使用している場合、以下の設定を推奨します：

1. VSCode 拡張機能のインストール

   - ESLint
   - Prettier

2. ワークスペースの設定（.vscode/settings.json）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
