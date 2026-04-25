# next-app-blog — 完了レポート

このドキュメントはリリース可否の判断材料として、テストカバレッジと canonical guard
の結果をまとめる。数値はリポジトリ共通スクリプト `scripts/update-coverage-report.mjs`
で再計測する。手動編集で上書きしてよいのは「備考」セクションのみ。

## テストカバレッジ

最終計測日: 2026-05-09

| 指標 | カバレッジ | 備考 |
|---|---|---|
| Line | 60.17 % | vitest --coverage の `lines.pct` |
| Branch | 50.26 % | vitest --coverage の `branches.pct` |
| Function | 56.52 % | vitest --coverage の `functions.pct` |

**再計測コマンド**: プロジェクトルートで
```
node scripts/update-coverage-report.mjs next-app-blog
```
を実行する。上のテーブルと最終計測日が自動更新される。初回は
`npm install --save-dev @vitest/coverage-v8` で coverage プロバイダを入れること
（未インストール時は NOT_YET_MEASURED のまま据え置き、guard は shape のみ検証する）。

### ファイル別詳細 (2026-05-09)

| ファイル | Stmts | Branch | Funcs | Lines | 未カバー行 |
|---|---|---|---|---|---|
| api/check-username/route.ts | 80 % | 91.66 % | 100 % | 80 % | 28-35 |
| features/article/schema/article-schema.ts | 100 % | 50 % | 100 % | 100 % | 18 |
| features/article/server/article-actions.ts | 61.53 % | 54.11 % | 46.15 % | 61.44 % | 73-179, 216-239 |
| features/article/services/slug-utils.ts | 53.84 % | 25 % | 66.66 % | 53.84 % | 28-41, 47 |
| features/user/schema/username-schema.ts | 100 % | 100 % | 100 % | 100 % | — |
| lib/logger.ts | 20 % | 33.33 % | 11.11 % | 20 % | 41-116 |
| lib/actions/action-helpers.ts | 44 % | 31.81 % | 75 % | 44 % | 49-79, 92 |
| lib/config/env.ts | 84.61 % | 53.84 % | 100 % | 84.61 % | 68, 79, 90-95 |
| lib/security/rate-limit.ts | 39.47 % | 45.45 % | 40 % | 41.66 % | 11-52, 65, 86-105 |

### テスト実行サマリ

| 項目 | 結果 |
|---|---|
| テストファイル数 | 4 passed |
| テストケース数 | 29 passed |
| 実行日時 | 2026-05-09 13:18:25 |
| 所要時間 | 18.37 s |

## Canonical guard の通過状況

このアプリが配線されている guard は CI (`canonical-guards.yml`) で自動検証される。
全アプリ共通の guard は README を参照。アプリ固有の逸脱は次の「備考」に記す。

## 備考

カバレッジが低い主要ファイルと対応方針:

| ファイル | 現状 | 対応方針 |
|---|---|---|
| `lib/logger.ts` (Line 20 %) | Pino の設定ロジックが多く、テスト環境でのモックが必要 | ロガー初期化のユニットテスト追加を検討 |
| `lib/security/rate-limit.ts` (Line 39 %) | Upstash Redis への依存があり結合テストが必要 | Redis モック or インメモリ実装でカバレッジ拡大を検討 |
| `features/article/server/article-actions.ts` (Line 61 %) | Server Action の未テストパス（エラー系・スケジュール公開等）| エラーケースのテストケース追加 |
