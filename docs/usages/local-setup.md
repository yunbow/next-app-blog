# ローカル環境構築手順

next-app-blog をローカルで開発するための手順をまとめる。

## 前提

- Node.js **22.x** (Dockerfile の `NODE_VERSION=22-alpine` に揃える)
- npm 10 以上 (Node.js 22 に同梱)
- Git
- (任意) macOS / Linux / WSL のいずれか。Windows ネイティブでも動作するが、本リポジトリの開発は bash 系シェルを前提としている

## 1. リポジトリの取得

```bash
git clone <repo-url> next-app-blog
cd next-app-blog
git submodule update --init --recursive   # docs/ai-dev-os の取得
```

## 2. 依存関係のインストール

```bash
npm ci    # 既存の package-lock.json を厳密に再現する
```

`postinstall` に `prisma generate` が紐付いているため、Prisma クライアントは自動生成される。

## 3. 環境変数の設定

ルートに `.env` を作成する。テンプレートとして `.env.example` をコピーすると早い。

```bash
cp .env.example .env
```

最低限、以下 3 つを埋めれば dev サーバーは起動する。

| Key               | 値の例                                          | 備考                                                                 |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`    | `file:./prisma/dev.db`                          | Prisma datasource は SQLite。任意のローカルパスでよい                |
| `NEXTAUTH_SECRET` | 32 文字以上のランダム文字列                     | **32 文字未満で起動失敗する**。`openssl rand -base64 48` 等で生成    |
| `NEXTAUTH_URL`    | `http://localhost:3000`                         | URL 形式必須                                                         |

任意項目（`src/lib/config/env.ts` のスキーマで検証される）:

- **OAuth**: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` の **両方** をセット (片方だけはエラー)。GitHub も同様
- **SMTP**: `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` の **3 つすべて** をセット (一部だけはエラー)
- `CRON_SECRET`: 32 文字以上
- `NEXT_PUBLIC_APP_URL`: クライアントから参照する公開 URL

`NEXTAUTH_SECRET` 生成例:

```bash
openssl rand -base64 48
# または
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## 4. データベース初期化

### マイグレーション

```bash
# マイグレーション適用 + Prisma Client 再生成
npm run db:migrate:dev
```

スキーマは `prisma/schema.prisma` を参照。

### シード投入

シードは用途別に分かれている (`prisma/seeds/` 配下、ディスパッチャは `prisma/seed.ts`)。

| コマンド               | 内容                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `npm run db:seed:dev`  | カテゴリ等のマスタ + **テストユーザー2名・記事4件・タグ・コメント・リアクション・相互フォロー** |
| `npm run db:seed:prod` | カテゴリ等のマスタのみ (本番用)                                                              |
| `npm run db:seed`      | `NODE_ENV` で自動判別 (`production` なら prod、それ以外は dev)                              |

ローカルで起動直後にすぐ動作確認したい場合は `db:seed:dev` を使う。すべて upsert ベースで冪等なので何度実行しても安全。

### 開発用ログイン情報 (`db:seed:dev` 投入後)

| メールアドレス       | パスワード    | ユーザー名 |
| -------------------- | ------------- | ---------- |
| `alice@example.com`  | `password123` | alice      |
| `bob@example.com`    | `password123` | bob        |

各ユーザーは公開記事を 2 件ずつ持ち、相互フォロー / コメント / リアクションも投入済み。サインインフォームから上記のメールアドレスとパスワードでそのままログインできる。

> `NODE_ENV=production` のときに `db:seed:dev` を実行すると、安全装置が働いてエラー終了する (事故防止のための明示的な仕様)。

### DB リセット

```bash
rm prisma/dev.db
npm run db:migrate:dev
npm run db:seed:dev
```

## 5. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` で起動する。

> 既存セッション Cookie を持ったまま `NEXTAUTH_SECRET` を変えると `JWTSessionError: no matching decryption secret` が出る。DevTools → Application → Cookies で `authjs.session-token` を削除するか、シークレットウィンドウで開く。

## 6. テスト実行

### ユニット / 結合テスト (Vitest)

```bash
npm test               # 1 回実行
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジ計測
```

### E2E テスト (Playwright)

初回のみブラウザを取得:

```bash
npx playwright install --with-deps
```

実行:

```bash
npm run test:e2e          # ヘッドレス
npm run test:e2e:ui       # UI モード
npm run test:e2e:debug    # デバッグモード
```

`playwright.config.ts` の `webServer` が `npm run dev` を起動するため、別途 dev サーバーを立ち上げる必要はない。

## 7. Lint / 型チェック

```bash
npm run lint
npx tsc --noEmit
```

## トラブルシューティング

| 症状                                                                                       | 対処                                                                                                              |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `Invalid environment variables: NEXTAUTH_SECRET must be at least 32 chars`                 | `.env` の `NEXTAUTH_SECRET` を 32 文字以上にする                                                                  |
| `Google OAuth keys must be all-set or all-unset`                                           | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` の両方を設定するか、両方を空にする (GitHub / SMTP も同型のエラーあり) |
| `JWTSessionError: no matching decryption secret`                                           | ブラウザの `authjs.session-token` Cookie を削除                                                                   |
| `git submodule add ... already exists in the index` (`npx ai-dev-os init` 実行時)         | サブモジュールは初回 init で追加済み。再実行は不要 (commit するだけで OK)                                          |
| `The "middleware" file convention is deprecated`                                            | Next.js 16 の警告。動作には影響なし。`middleware.ts` → `proxy.ts` への移行は別タスク                              |
