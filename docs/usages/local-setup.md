# ローカル環境構築手順

next-app-blog をローカルで開発するための手順。

## 前提

| ツール | バージョン | 備考 |
| --- | --- | --- |
| Node.js | 22.x | Dockerfile の `NODE_VERSION=22-alpine` に揃える |
| npm | 10 以上 | Node.js 22 に同梱 |
| Docker Desktop | 最新 | PostgreSQL / MinIO の起動に必要 |

---

## セットアップ手順

### 1. リポジトリの取得

```bash
git clone <repo-url> next-app-blog
cd next-app-blog
```

### 2. 依存関係のインストール

```bash
npm ci
```

`postinstall` に `prisma generate` が紐付いているため、Prisma クライアントは自動生成される。

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を開いて以下の必須項目を確認・設定する。

**必須項目**

| Key | 値の例 | 備考 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://app:app@localhost:54321/app?schema=public` | docker compose で起動する PostgreSQL |
| `NEXTAUTH_SECRET` | 32 文字以上のランダム文字列 | **32 文字未満で起動失敗**。下記コマンドで生成 |
| `NEXTAUTH_URL` | `http://localhost:3111` | URL 形式必須 |

```bash
# NEXTAUTH_SECRET 生成
openssl rand -base64 48
```

**任意項目** (片方だけ設定するとエラーになる組み合わせに注意)

| 機能 | Key |
| --- | --- |
| Google OAuth | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — **両方セット or 両方空** |
| GitHub OAuth | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — **両方セット or 両方空** |
| SMTP メール | `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` — **3 つすべてセット or すべて空** |
| Cron 認証 | `CRON_SECRET` (32 文字以上、本番では必須) |
| 公開 URL | `NEXT_PUBLIC_APP_URL` (OG 画像・sitemap に使用) |

**画像ストレージ (R2 / MinIO)**

4 つすべてセットすると R2/MinIO へのアップロードが有効になる。未設定の場合は `public/uploads/` へのローカル保存にフォールバックする。

| Key | ローカル (MinIO) | 本番 (Cloudflare R2) |
| --- | --- | --- |
| `R2_ACCESS_KEY_ID` | `minioadmin` | R2 API トークンの Access Key ID |
| `R2_SECRET_ACCESS_KEY` | `minioadmin` | R2 API トークンの Secret Access Key |
| `R2_BUCKET_NAME` | `blog` | バケット名 |
| `R2_ENDPOINT` | `http://localhost:9000` | `https://<accountid>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | `http://localhost:9000/blog` | `https://<カスタムドメイン or r2.dev URL>` |

`.env.example` にローカル用のデフォルト値が入っているので、`cp .env.example .env` 後そのまま使える。

### 4. Docker サービスの起動

```bash
docker compose up -d
```

起動するサービス:

| サービス | ポート | 用途 |
| --- | --- | --- |
| PostgreSQL | `54321` | アプリの DB |
| MinIO (S3 API) | `9000` | 画像ストレージ |
| MinIO (コンソール) | `9001` | 管理 UI (`http://localhost:9001`) |

起動確認:

```bash
docker compose ps
```

`STATUS` 列が `Up (healthy)` になっていれば OK。`(starting)` の間は接続失敗するので数秒待つ。

MinIO の初回バケット作成は `minio-init` コンテナが自動で行う。

### 5. データベース初期化

```bash
# マイグレーション適用
npm run db:migrate:dev

# 開発用テストデータ投入 (任意)
npm run db:seed:dev
```

シードコマンドの違い:

| コマンド | 内容 |
| --- | --- |
| `npm run db:seed:dev` | マスタ + テストユーザー 2 名・記事 4 件・タグ・コメント・リアクション |
| `npm run db:seed:prod` | マスタのみ (本番用) |

シードはすべて upsert ベースで冪等なので、何度実行しても安全。

**開発用ログイン情報** (`db:seed:dev` 投入後)

| メールアドレス | パスワード |
| --- | --- |
| `alice@example.com` | `password123` |
| `bob@example.com` | `password123` |

### 6. 開発サーバーの起動

```bash
npm run dev -- -p 3111
```

`http://localhost:3111` で起動する。

> 既存セッション Cookie を持ったまま `NEXTAUTH_SECRET` を変えると `JWTSessionError` が出る。DevTools → Application → Cookies で `authjs.session-token` を削除するか、シークレットウィンドウで開く。

---

## テスト実行

### ユニット / 結合テスト (Vitest)

```bash
npm test                # 1 回実行
npm run test:watch      # ウォッチモード
npm run test:coverage   # カバレッジ計測
```

### E2E テスト (Playwright)

初回のみブラウザを取得:

```bash
npx playwright install --with-deps
```

```bash
npm run test:e2e          # ヘッドレス
npm run test:e2e:ui       # UI モード
npm run test:e2e:debug    # デバッグモード
```

`playwright.config.ts` の `webServer` が `npm run dev` を自動起動するため、別途 dev サーバーを立ち上げる必要はない。

---

## Lint / 型チェック

```bash
npm run lint
npx tsc --noEmit
```

---

## Docker ライフサイクル

| 操作 | コマンド | 備考 |
| --- | --- | --- |
| 停止 (データ保持) | `docker compose stop` | `start` で即復帰 |
| 再開 | `docker compose start` | |
| 完全停止＋コンテナ削除 | `docker compose down` | ボリュームは残る |
| **DB / MinIO を完全リセット** | `docker compose down -v` | ⚠ 全データ消失 |
| ログ追跡 | `docker compose logs -f` | `-f db` / `-f minio` で絞り込み可 |

DB をリセットしたい場合:

```bash
docker compose down -v
docker compose up -d
npm run db:migrate:dev
npm run db:seed:dev
```

複数の `next-app-*` プロジェクトは `name:` フィールドとホスト側ポートが個別割当になっているため、同時起動できる。

---

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `Invalid environment variables: NEXTAUTH_SECRET must be at least 32 chars` | `.env` の `NEXTAUTH_SECRET` を 32 文字以上にする |
| `Google OAuth keys must be all-set or all-unset` | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` の両方を設定するか両方を空にする (GitHub / SMTP も同様) |
| `JWTSessionError: no matching decryption secret` | ブラウザの `authjs.session-token` Cookie を削除 |
| `P1001: Can't reach database server` | `docker compose ps` で healthy を確認 / `.env` の `DATABASE_URL` ポートが `54321` か確認 |
| `port is already allocated` | `docker compose down` 後に再起動、または `lsof -ti :54321 \| xargs kill -9` |
| `Unable to acquire lock at .next/dev/lock` | 既存の `next dev` プロセスを終了: `pkill -f "next dev"` |
