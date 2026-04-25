# next-app-blog

Next.js + React 19 + Prisma で構築したブログアプリケーション。記事の投稿・編集・公開、コメント、リアクション、ブックマーク、通知、検索などの機能を備える。

## 技術スタック

| レイヤ              | 採用技術                                                     |
| ------------------- | ------------------------------------------------------------ |
| フレームワーク      | Next.js 16 (App Router, Turbopack)                           |
| UI                  | React 19, Tailwind CSS v4, Radix UI, shadcn/ui ベース        |
| 認証                | Auth.js (next-auth v5) + Prisma Adapter                      |
| DB / ORM            | PostgreSQL 16 + Prisma 6                                     |
| バリデーション      | Zod 4                                                        |
| フォーム            | react-hook-form + @hookform/resolvers                        |
| メール              | Nodemailer                                                   |
| 画像ストレージ      | Cloudflare R2 (本番) / MinIO (ローカル開発)                  |
| 決済                | Stripe                                                       |
| ロギング            | Pino                                                         |
| テスト              | Vitest (unit / integration), Playwright (E2E)                |
| Lint                | ESLint 9 (flat config) + eslint-config-next                  |

Node.js **22.x** を前提とする。

## クイックスタート

```bash
git clone <repo-url> next-app-blog
cd next-app-blog

npm ci
cp .env.example .env          # NEXTAUTH_SECRET (32 文字以上) 等を設定

docker compose up -d          # PostgreSQL / MinIO / stripe-mock を起動

npm run db:migrate:dev
npm run db:seed:dev
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
│   ├── middleware.ts        # Next.js middleware (CSP, CSRF, 認証ガード)
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
| `npm run db:seed:dev`          | 開発用テストデータ投入                     |
| `npm run db:seed:prod`         | 本番用マスタデータ投入                     |
| `npm run upload:static`        | 静的画像を R2/MinIO にアップロード         |
| `npm run analyze`              | バンドル解析 (`@next/bundle-analyzer`)     |

## 環境変数

`src/lib/config/env.ts` で Zod により起動時に検証される。`.env.example` にローカル用のデフォルト値が設定済み。

**必須**

| Key | 備考 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 接続文字列 |
| `NEXTAUTH_SECRET` | **32 文字以上**。`openssl rand -base64 48` で生成 |
| `NEXTAUTH_URL` | URL 形式。例: `http://localhost:3000` |

**任意: OAuth**（片方だけ設定するとエラー）

| Key | 備考 |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | 両方セット or 両方空 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | 両方セット or 両方空 |

**任意: SMTP メール**（`HOST` / `USER` / `PASSWORD` の 3 つをセット or すべて空）

| Key | 備考 |
| --- | --- |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` | 3 つすべてセット or すべて空 |
| `SMTP_PORT` | デフォルト `587` |
| `SMTP_FROM_EMAIL` / `SMTP_FROM_NAME` | 送信元アドレス・表示名 |

**任意: 画像ストレージ R2/MinIO**（4 つすべてセットで有効）

| Key | ローカル (MinIO) | 本番 (Cloudflare R2) |
| --- | --- | --- |
| `R2_ACCESS_KEY_ID` | `minioadmin` | R2 API トークンの Access Key ID |
| `R2_SECRET_ACCESS_KEY` | `minioadmin` | R2 API トークンの Secret Access Key |
| `R2_BUCKET_NAME` | `blog` | バケット名 |
| `R2_ENDPOINT` | `http://localhost:9000` | `https://<accountid>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | `http://localhost:9000/blog` | `https://<カスタムドメイン or r2.dev URL>` |

**任意: Stripe**

| Key | 備考 |
| --- | --- |
| `STRIPE_SECRET_KEY` | サーバーサイドのシークレットキー |
| `STRIPE_WEBHOOK_SECRET` | Webhook 署名シークレット |
| `STRIPE_BASIC_PRICE_ID` / `STRIPE_PREMIUM_PRICE_ID` | プランの Price ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | クライアント公開キー |
| `STRIPE_API_URL` | `localhost` でローカルの stripe-mock に接続。本番では空にする |

**任意: その他**

| Key | 備考 |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | OG 画像・sitemap の絶対 URL |
| `CRON_SECRET` | Cron API 認証。本番では 32 文字以上 |

詳細は [`docs/usages/local-setup.md`](docs/usages/local-setup.md#3-環境変数の設定) を参照。

## テスト

- **ユニット / 結合**: `src/tests/` 配下、Vitest + jsdom。`src/tests/setup.ts` で `server-only` / `next/cache` / `next/navigation` をモックし、`process.env` の必須キーをシードしている
- **E2E**: `tests/e2e/` 配下、Playwright。`playwright.config.ts` の `webServer` が `npm run dev` を起動する

## CI

`.github/workflows/ci.yml` で以下を実行:

1. **Lint** — ESLint
2. **Type Check** — `tsc --noEmit`
3. **Unit & Integration Tests** — Vitest (+ Codecov)

## ドキュメント

- [`docs/usages/local-setup.md`](docs/usages/local-setup.md) — ローカル環境構築手順
- [`docs/ai-dev-os/`](docs/ai-dev-os/) — AI Dev OS 開発ガイドライン (submodule)

## ライセンス

[MIT License](LICENSE) © 2026 yunbow
