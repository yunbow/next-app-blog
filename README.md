# next-app-blog

Next.js 16 + React 19 + Prisma で構築したブログアプリケーション。記事の投稿・編集・公開、コメント、リアクション、ブックマーク、通知、検索などの機能を備える。

## 技術スタック

| レイヤ              | 採用技術                                                     |
| ------------------- | ------------------------------------------------------------ |
| フレームワーク      | Next.js 16 (App Router, Turbopack)                           |
| UI                  | React 19, Tailwind CSS v4, Radix UI, shadcn/ui ベース        |
| 認証                | Auth.js (next-auth v5) + Prisma Adapter                      |
| DB / ORM            | SQLite + Prisma 6                                            |
| バリデーション      | Zod 4                                                        |
| データフェッチ      | TanStack Query                                               |
| フォーム            | react-hook-form + @hookform/resolvers                        |
| メール              | Nodemailer                                                   |
| 決済                | Stripe                                                       |
| ロギング            | Pino                                                         |
| テスト              | Vitest (unit / integration), Playwright (E2E)                |
| Lint                | ESLint 9 (flat config) + eslint-config-next                  |

Node.js **22.x** を前提とする。

## クイックスタート

```bash
git clone <repo-url> next-app-blog
cd next-app-blog
git submodule update --init --recursive

npm ci
cp .env.example .env          # NEXTAUTH_SECRET (32 文字以上) 等を設定
npm run db:migrate:dev
npm run db:seed
npm run dev                   # http://localhost:3000
```

詳細な手順・必須環境変数・トラブルシューティングは [`docs/usages/local-setup.md`](docs/usages/local-setup.md) を参照。

## ディレクトリ構成

```
.
├── prisma/                 # Prisma schema, migrations, seed
├── public/                 # 静的アセット
├── scripts/                # ローカル運用スクリプト
├── src/
│   ├── app/                # App Router (route groups: (public) / (protected))
│   │   └── api/            # Route Handlers
│   ├── components/         # 共通 UI コンポーネント
│   ├── features/           # 機能別モジュール (article / comment / search ...)
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── server/     # Server Actions
│   │       ├── services/   # ドメインロジック (server-only)
│   │       └── schema/     # Zod スキーマ
│   ├── hooks/              # 汎用 React フック
│   ├── lib/                # 横断ユーティリティ (auth / prisma / config / i18n ...)
│   ├── middleware.ts       # Next.js middleware (16 では proxy への移行警告あり)
│   ├── tests/              # Vitest 用テスト・モック・setup
│   └── types/              # 共通型定義
├── tests/e2e/              # Playwright E2E テスト
└── docs/                   # 開発ドキュメント (usages, ai-dev-os ガイドライン)
```

機能追加時は `src/features/<feature>/` 配下にディレクトリを切ることを推奨する。

## 主要コマンド

| コマンド                       | 用途                                       |
| ------------------------------ | ------------------------------------------ |
| `npm run dev`                  | 開発サーバー起動 (Turbopack)               |
| `npm run build`                | 本番ビルド                                 |
| `npm start`                    | ビルド成果物の起動                         |
| `npm run lint`                 | ESLint                                     |
| `npx tsc --noEmit`             | TypeScript 型チェック                      |
| `npm test`                     | Vitest (1 回実行)                          |
| `npm run test:watch`           | Vitest ウォッチモード                      |
| `npm run test:coverage`        | カバレッジ計測                             |
| `npm run test:e2e`             | Playwright E2E                             |
| `npm run test:e2e:ui`          | Playwright UI モード                       |
| `npm run db:migrate:dev`       | マイグレーション適用 + Prisma Client 生成  |
| `npm run db:migrate:deploy`    | 本番マイグレーション適用                   |
| `npm run db:migrate:status`    | マイグレーション状況確認                   |
| `npm run db:seed`              | 初期データ投入 (`prisma/seed.ts`)          |
| `npm run analyze`              | バンドル解析 (`@next/bundle-analyzer`)     |

## 環境変数

`src/lib/config/env.ts` で Zod により起動時に検証される。要点のみ:

- `DATABASE_URL` — 必須
- `NEXTAUTH_SECRET` — 必須、**32 文字以上**
- `NEXTAUTH_URL` — 必須、URL 形式
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — 任意。設定する場合は両方
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — 任意。設定する場合は両方
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` — 任意。設定する場合は 3 つすべて
- `CRON_SECRET` — 任意、32 文字以上
- `NEXT_PUBLIC_APP_URL` — 任意、URL 形式

詳細は [`docs/usages/local-setup.md`](docs/usages/local-setup.md#3-環境変数の設定) を参照。

## テスト

- **ユニット / 結合**: `src/tests/` 配下、Vitest + jsdom。`src/tests/setup.ts` で `server-only` / `next/cache` / `next/navigation` をモックし、`process.env` の必須キーをシードしている
- **E2E**: `tests/e2e/` 配下、Playwright。`playwright.config.ts` の `webServer` が `npm run dev` を起動する

## CI

`.github/workflows/ci.yml` で以下を実行:

1. **Lint** — ESLint
2. **Type Check** — `tsc --noEmit`
3. **Unit & Integration Tests** — Vitest (+ Codecov)
4. **E2E Tests** — Playwright
5. **Build** — `next build`

## ドキュメント

- [`docs/usages/local-setup.md`](docs/usages/local-setup.md) — ローカル環境構築手順
- [`docs/ai-dev-os/`](docs/ai-dev-os/) — AI Dev OS 開発ガイドライン (submodule)
- [`CLAUDE.md`](CLAUDE.md) — Claude Code 用プロジェクト指示
