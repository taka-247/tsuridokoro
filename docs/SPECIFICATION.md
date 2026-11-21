# 釣りドコロ — 仕様・開発オンボーディングガイド

> AI釣果集計アプリの単一リファレンス。新規参加の開発者がこの1枚を読めば、**何を作るか（プロダクト）／どう動くか（アーキテクチャ）／どう開発・デプロイするか（運用）** を把握できることを目的とする。
> ステータス: MVP（アイデア検証フェーズ）
> 最終更新: 2026-11

---

## 0. 30秒サマリ

- **何のアプリか**: ユーザーが「魚種・エリア・期間」を選ぶと、**AI（Google Gemini + Google検索グラウンディング）** がWeb上の公開釣果情報を集計・分析し、「期待できる釣り場 TOP5」を提示する。日本国内・日本語専用。
- **構成**: npm workspaces のモノレポ。`frontend`（React SPA）＋ `backend`（Express の薄いBFF）＋ `shared`（型・バリデーション）。
- **ホスティング**: フロント = **Cloudflare Pages**、バックエンド = **Render (Web Service)**、AI = **Gemini API**。DBは持たず、結果はブラウザの **localStorage** のみ（その週の日曜日終わりで失効）。
- **現状**: 集計API（`POST /api/aggregate`）・フォーム・結果・履歴の主要フローは実装済み。残りはミニゲーム、コスト/レート制御、仕上げ・検証と追加機能（→ §15）。
- **主要リンク**: 設計モック → [docs/design/](design/) ／ Figma → https://www.figma.com/design/2qQ5O0sFzg3qCEYlbFDrTd ／ ロードマップ → [ROADMAP.md](ROADMAP.md)

---

## 1. 概要

### 1.1 アプリ名
釣りドコロ - AI釣果集計

### 1.2 目的
釣り人の「どこで・何を狙うか」の意思決定を手助けする。ユーザーが指定したエリア・魚種・期間について、**AI（Gemini）** が公開されている釣果情報を集計・分析し、「釣れる期待度」「釣れている場所」を分かりやすく提示する。

### 1.3 ターゲットユーザー
釣行先やターゲット魚を決めかねている釣り人（初心者〜中級者を主に想定）。

### 1.4 前提・制約
- **日本国内専用**（地名・魚種・言語すべて日本語）。
- **MVPフェーズ**: アイデアの有用性検証が最優先。作り込みより「分析が役に立つか」を最短で確かめる。
- **アカウントなし**。集計結果はブラウザの **localStorage** にのみ保存（サーバー側DBなし、週単位で失効 → §9.4）。
- 釣果データは **リクエスト時にGeminiのGoogle検索グラウンディングでリアルタイム取得**する（事前スクレイピング用のDBは持たない）。

---

## 2. 用語定義

| 用語 | 定義 |
|------|------|
| 集計 | フォーム入力（魚種・場所・期間）を条件に、Web上の釣果情報をAIが収集・分析する処理 |
| 期待度 | その釣り場で対象魚が「これから釣れそうか」の度合い。1〜5の5段階（`期待大`／`期待中`／`期待小` の言葉ラベルを併記）。**レビューの星評価と誤解されないよう、星ではなく信号強度風のメーター＋言葉で表現する**（→ §8.1 集計結果UI） |
| リソース／出典 | 釣果情報の出典（ANGLERS、SNS投稿、ブログ、釣具店の釣果情報など） |
| 集計結果 | 1回の集計で得られた分析結果一式（JSON、§9.2） |
| BFF | Backend for Frontend。APIキーを秘匿し、Gemini呼び出し・整形を担う `backend`（Express） |

---

## 3. スコープ

### 3.1 MVPに含む
- トップページ（フォーム → 集計 → 結果表示）
- 集計中のローディング（ミニゲーム付き）
- 集計結果UI（オススメ上位5ヶ所 ＋ 可能性のある釣り場の一覧）
- 履歴ページ（localStorageに保存された過去の集計結果の閲覧）

### 3.2 MVPに含まない（将来／v2 → §16）
- 天候・月齢・風向き等のオプション条件
- ユーザーアカウント／ログイン／サーバー側の永続化・ANGLERSログイン連携
- お気に入り・共有・通知
- 多言語対応

---

## 4. アーキテクチャ

### 4.1 全体像
フロントから直接AI APIを呼ぶと **APIキーが露出する**ため、キーを秘匿する薄いバックエンド（BFF）を挟む。

```
[ブラウザ / React SPA]  ── Cloudflare Pages で配信
      │  (1) POST /api/aggregate  {targetFish, prefecture, city, lookbackDays}
      ▼   （本番はCORSでRenderの絶対URLへ）
[Express BFF]  ── Render (Web Service)、GEMINI_API_KEY を保持
      │  (2) Gemini API を Google検索グラウンディング付きで呼び出し
      ▼
[Gemini API + Google Search grounding]
      │  (3) 集計結果を生成
      ▼
[Express BFF] ──(4) 整形済みJSON──▶ [ブラウザ]
                                       │ (5) localStorageに保存 → /results で結果UI描画
```

### 4.2 技術スタック
| レイヤ | 採用技術 | ホスティング |
|--------|----------|-------------|
| フロントエンド | React 19 + TypeScript + Vite + Tailwind CSS 4 + Headless UI、Zustand（状態）、react-hook-form + Zod、axios | **Cloudflare Pages** |
| バックエンド | Express 5 + TypeScript（CommonJS）、`@google/genai`（Gemini SDK）、cors | **Render (Web Service)** |
| 共有 | `shared` パッケージ（`@app/shared`）: 型・Zodバリデーション・API定数 | — |
| AI | Google **Gemini**（`gemini-3.6-flash` を第一候補）+ Google検索グラウンディング | Google（Gemini API） |
| 地図 | Google Maps 埋め込み（APIキー不要の keyless iframe `output=embed`） | — |
| 地域マスタ | [geolonia/japanese-addresses](https://github.com/geolonia/japanese-addresses)（都道府県→市区町村、実行時にfetch） | — |
| 永続化 | ブラウザ **localStorage** のみ（DBなし） | — |

### 4.3 なぜこの構成か（背景メモ）
- **BFFが必須**: フロントは静的配信（Cloudflare Pages）で、AIキーをブラウザに置けない。よってMVPでもExpressの1エンドポイントが必要。
- **AIにGeminiを採用した理由**: 検索の質が要。Geminiは **Google検索グラウンディング** を内蔵し、Googleのインデックス（日本語の釣具店ブログ・個人ブログ等のロングテールに強い）で1コールで検索＋分析できる。CloudflareのフロントとRenderのバックは、この判断とは独立。
- **Renderを選んだ理由**: 集計は **30秒〜2分** かかり得る長時間リクエスト。サーバーレスのタイムアウト制約を避けられる常駐Nodeプロセスが向く。

---

## 5. リポジトリ構成（モノレポ）

npm workspaces（`frontend` / `backend` / `shared`）。

```
tsuridokoro/
├── package.json            # ルート。workspaces と横断スクリプト（dev, share）
├── render.yaml             # Render Blueprint（バックエンド定義の参照）
├── .github/workflows/      # ci / deploy / playwright / chromatic
├── frontend/               # React + Vite SPA（→ Cloudflare Pages）
│   ├── public/_redirects   # SPAフォールバック（/* /index.html 200）
│   ├── src/pages/          # Home / Results / History / Profile（雛形）/ PrivacyPolicy
│   ├── src/components/     # ui/・layout/・results/（SpotCard, DailyChart, ExpectationMeter, MapEmbed 等）
│   ├── src/api/myAxios.ts  # axiosラッパ（baseURL は src/config.tsx: dev='' / 本番=VITE_API_BASE_URL）
│   ├── src/hooks/useRegions.ts # 都道府県→市区町村マスタの取得
│   ├── src/storage/results.ts  # 集計結果の localStorage 保存（§9.4）
│   ├── src/store/          # Zustand（トースト、集計済みフラグ）
│   ├── src/constants.ts    # 魚種マスタ FISH、LOOKBACK_DAYS
│   ├── tests/              # Playwright E2E
│   └── vite.config.ts      # dev時 /api を http://localhost:3001 へproxy
├── backend/                # Express BFF（→ Render）
│   └── src/
│       ├── index.ts        # process.env.PORT で listen
│       ├── app.ts          # cors + express.json + /api ルータ
│       ├── config.ts       # 環境変数（PORT, GEMINI_API_KEY, GEMINI_API_MODE, ALLOWED_ORIGIN）
│       └── routes/
│           ├── index.ts    # GET /api, GET /api/health
│           └── aggregate/  # POST /api/aggregate
│               ├── aggregate.ts           # ルート（入力検証 → live/mock 切替）
│               ├── aggregateSearch.ts     # Gemini 呼び出し・JSON抽出・スキーマ検証
│               ├── aggregateSearchMock.ts # モックデータ（GEMINI_API_MODE=mock）
│               ├── prompt.md              # 集計プロンプト（ビルド時に dist へコピー）
│               └── aggregate.test.ts
├── shared/                 # @app/shared（型・Zodスキーマ・API定数）
└── docs/
    ├── SPECIFICATION.md    # 本書
    ├── ROADMAP.md          # 開発ロードマップ
    └── design/             # 画面デザイン（PNG。01〜04 = モバイル、web_01〜04 = Web）
```

---

## 6. ローカル開発

前提: Node 24（CI・Render の `NODE_VERSION` と揃える）。ルートで依存を入れる（workspacesがリンクされる）。

```bash
npm install            # 全workspaceを一括インストール
npm run share          # shared を先にビルド（frontend/backend が参照）
npm run dev            # frontend(:5173) と backend(:3001) を同時起動
```

- **フロント単体**: `npm run dev --workspace=frontend`（Vite :5173）。dev時は `/api/*` を `http://localhost:3001` にプロキシするのでCORS不要。
- **バックエンド単体**: `npm run dev --workspace=backend`（ts-node-dev :3001）。
- **単一テスト**: `cd frontend && npx vitest run src/components/ui/Button.stories.tsx` / `cd backend && npx vitest run src/routes/aggregate/aggregate.test.ts`。

主要スクリプト:

| 場所 | コマンド | 内容 |
|------|----------|------|
| root | `npm run dev` / `npm run share` | 同時起動 / shared ビルド |
| frontend | `npm run build` / `lint` / `test:run` / `test:e2e` / `storybook` | tsc+vite / eslint / vitest / playwright / storybook |
| backend | `npm run build` / `start` / `test:run` | tsc / `node dist/index.js` / vitest |

---

## 7. 環境変数

| 変数 | 使う場所 | ローカル | 本番 | 用途 |
|------|----------|---------|------|------|
| `VITE_API_BASE_URL` | フロント（**ビルド時**にバンドルへ焼き込み） | 未設定でOK（`/` → Viteプロキシ） | GitHub Actions Secret | フロントが叩くRenderの絶対URL。例 `https://tsuridokoro-backend.onrender.com` |
| `GEMINI_API_KEY` | バックエンド（実行時） | `backend/.env`（gitignore済） | Render の Environment（secret） | Gemini APIキー。**フロントには絶対に置かない**。※グラウンディング利用にはキーの属する GCP プロジェクトに**課金アカウント紐付けが必要**（§10）。`backend/src/index.ts` が `dotenv/config` で `.env` を読む |
| `GEMINI_API_MODE` | バックエンド（実行時） | `backend/.env` | Render の Environment | `live` = Gemini を呼ぶ / `mock` = モックデータを返す。それ以外の値は集計が 502 になる |
| `ALLOWED_ORIGIN` | バックエンド（実行時） | 未設定なら全許可 | Render の Environment | CORS許可オリジン。例 `https://tsuridokoro.pages.dev`（末尾スラッシュなし） |
| `PORT` | バックエンド（実行時） | 3001 にフォールバック | Render が自動注入 | listen ポート。**本番では設定しない**（Renderが与える） |
| `NODE_VERSION` | バックエンド（Render） | — | `24` | RenderのNodeバージョン固定 |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | CI（Actions） | — | GitHub Secret | Cloudflare Pagesデプロイ用 |
| `CHROMATIC_PROJECT_TOKEN` | CI（Actions） | — | GitHub Secret | Chromatic ビジュアル回帰 |

> ⚠️ `render.yaml` は **Blueprint作成時のみ**適用される。現状のRenderサービスは**手動作成**のため、`ALLOWED_ORIGIN` / `GEMINI_API_KEY` などは **Renderダッシュボードの Environment に手で設定**する必要がある（`render.yaml` は参照用）。

---

## 8. 機能要件

### 8.1 トップページ

#### 入力フォーム
| 項目 | 種別 | 必須 | 補足 |
|------|------|------|------|
| 魚種 | **セレクトボックス** | 必須 | 定義済み一覧（`frontend/src/constants.ts` の `FISH`）から選択（表記ゆれ防止）。例: ブリ、シーバス、アオリイカ |
| 都道府県 | **セレクトボックス** | 必須 | 47都道府県（geolonia/japanese-addresses から取得） |
| 市町村 | **セレクトボックス（連動）** | 必須 | 選択中の都道府県に属する市町村のみ表示。都道府県変更で選択肢が切替＋市町村選択リセット |
| 過去何日分 | 選択（**1 / 3 / 5 / 7日**） | 必須 | 集計対象期間 |

- バリデーション: 未入力があれば集計前に警告。市町村まで必須のため広域指定は発生しない。
- 「集計」ボタンで集計開始。既定値は ブリ／静岡県／伊東市／3日。

#### 集計処理フロー
1. フォーム内容を `POST /api/aggregate` へ送信。
2. BFFがGemini（Google検索グラウンディング付き）を実行し、JSONを取得・整形。
3. 結果を localStorage に保存（→ §9.4）し、セッション内の「集計済み」フラグを立てる（ナビに結果リンクを表示）。
4. 結果ページ（`/results`）へ遷移して結果UIを描画。失敗時はエラートーストを表示。

#### ローディング（集計中・ミニゲーム）
- 集計は 30秒〜2分かかり得るため、待ち時間を退屈させないミニゲームを表示する。
- **現状**: ミニゲームは未実装。集計中は `LoadingOverlay`（スピナー＋「集計中…」、main領域の操作をブロック）を表示している。
- ミニゲーム仕様（MVP・簡易版、未実装）:
  - 水面にウキ（オレンジの実釣用ウキ）が浮き、魚影が近づく（あつまれ どうぶつの森の釣りのイメージ）。
  - アタリの瞬間、ウキの上に「!!」の吹き出し（ポケモンの釣りのイメージ）。
  - 「!!」が出た瞬間（ウキが沈む前）にタップで「ヒット」。スコアの常時表示・保存はしない。
- **プログレスバーは置かない**。集計完了で自動的に結果へ遷移。

#### 集計結果UI（`/results`）
`/results` は最新の集計を表示する（`?i=<index>` で履歴の任意の集計を表示）。上部に集計サマリを **3項目**: `〈魚種〉の釣果`（合計・匹）／`釣り場`（ヒット数・ヶ所）／`サイズ`（帯・cm）。※「参照した釣果件数」はサマリに出さない。

**オススメ上位5ヶ所**（釣果数の多い順）。各件で:
| 要素 | 説明 |
|------|------|
| 期待度 | 信号強度風メーター＋言葉ラベル（`期待大`/`期待中`/`期待小`）。星評価ではない |
| 場所の名前 | 特定可能な地点名 |
| 期間内の釣果数（サマリ） | 「過去◯日間で釣れた〈魚種〉は **N匹**」を1行で強調 |
| Google Map | 地図埋め込み（緯度経度 or 地名クエリ） |
| 日別の釣果数 | 独立ブロック。日別棒グラフ。**サイズ帯（例 40〜60cm、最大◯cm）はこのブロック内のキャプションとして併記**（単独のサイズ表示は置かない） |
| 出典 | 日別釣果数とは**別の独立ブロック**。出典リンク複数可 |
| 特記事項・コメント | 引用コメント。**複数可**（出典・日付付き）。**カード最下部に全幅ブロック**。Web=2カラム／モバイル=縦積み |

- 並び順・サイズの内包・コメント2カラムは モバイル [design/03_results.png](design/03_results.png) / Web [design/web_03_results.png](design/web_03_results.png) を参照。
- `dataConfidence: low` の場合は注意表示を出す。

**可能性のある釣り場**（上位5件以外）: **釣り場名のみ**を一覧表示（詳細トグルなし）。

### 8.2 履歴ページ（`/history`）
- localStorageに保存された過去の集計（今週分）を閲覧。
- ドロップダウンで選択。ラベル例: `ブリ・伊東市・過去3日`＋集計時刻（`2026-08-01 12:34`、モバイルは `08-01 12:34`）。
- 選択すると結果UI（サマリ＋釣り場カード）を表示。空なら「履歴はまだありません」。
- `/results` に結果が無い場合は「まだ集計結果がありません」を表示。

### 8.2.1 その他のページ
- `/profile`: 雛形のみ（中身なし）。
- `/privacy-policy`: `Layout2`（最小レイアウト）で表示。

### 8.3 画面遷移
```
トップ(/) ──[集計]──▶ (ローディング) ──▶ 結果(/results)
   └──[ナビ]──▶ 履歴(/history)（localStorageから選択して表示）
```

---

## 9. API契約・データモデル

BFF ⇄ フロント間の契約であり、Geminiの出力を整形するターゲット構造。

### 9.0 エンドポイント一覧
| メソッド・パス | 用途 | 状態 |
|----------------|------|------|
| `GET /api`, `GET /api/health` | ヘルスチェック（`/api/health` は Renderの healthCheckPath）。`{"status":"ok"}` | ✅ 実装済 |
| `POST /api/aggregate` | 集計本体（§9.1→§9.2）。成功 `201`、入力不正 `400 {errorMessage}`、集計失敗 `502 {errorMessage}` | ✅ 実装済 |

### 9.1 集計リクエスト（フロント → BFF）
スキーマは `Shared.validation.aggregateSchema`。`lookbackDays` は `1 | 3 | 5 | 7` のいずれか。
```json
{ "targetFish": "ブリ", "prefecture": "静岡県", "city": "伊東市", "lookbackDays": 3 }
```

### 9.2 集計結果（BFF → フロント / localStorage保存本体）
スキーマは `Shared.validation.aggregateResultSchema`（型 `AggregateResult`）。
```json
{
  "meta": {
    "targetFish": "ブリ", "prefecture": "静岡県", "city": "伊東市", "lookbackDays": 3,
    "aggregatedAt": "2026-08-01T12:34:56+09:00",
    "dataConfidence": "medium",
    "totalCatchCount": 28, "spotCount": 9, "sizeRange": "40〜60cm", "sourceCount": 38
  },
  "spots": [
    {
      "rank": 1, "name": "宇佐美港",
      "expectation": 5, "expectationLabel": "期待大",
      "location": { "lat": 34.9876, "lng": 139.1234, "query": "宇佐美港" },
      "totalCatchCount": 12,
      "dailyCatchCounts": [
        { "date": "2026-07-30", "count": 3 },
        { "date": "2026-07-31", "count": 5 },
        { "date": "2026-08-01", "count": 4 }
      ],
      "size": "40〜60cm", "maxSize": "68cm",
      "sources": [ { "title": "ANGLERSの釣果", "url": "https://..." } ],
      "notes": [
        { "text": "朝マズメにナブラが出て青物が連発", "source": "釣具店ブログ", "date": "2026-07-31", "url": "https://..." }
      ]
    }
  ],
  "otherSpots": ["八幡野港", "赤沢港", "富戸港", "城ヶ崎海岸"]
}
```

### 9.3 フィールド定義（抜粋）
- `meta.totalCatchCount / spotCount / sizeRange`: 結果上部サマリ3項目に使用。`meta.sourceCount` は内部保持（サマリ非表示）。
- `dataConfidence`: `"high"|"medium"|"low"`。`low` はUIで注意表示（空UIにしない）。
- `expectation`: 1〜5 の整数（**期待度レベル**、信号強度メーターで表現）。`expectationLabel` は言葉ラベル。
- `location.lat/lng`: 取れなければ `null` → 地図は `query`（地名）で埋め込み。
- `dailyCatchCounts`: 期間の各日。データなし日も `count:0` で埋める（軸安定）。
- `size` / `maxSize`: 日別釣果数ブロック内キャプションとして表示。不明なら空文字。
- `sources`: **実在URLのみ**（0件許容）。
- `notes`: コメント配列 `{text, source, date, url}[]`（複数可、無ければ `[]`）。カード最下部に表示（Web2カラム/モバイル縦積み）。
- `otherSpots`: 名前だけの `string[]`（UI見出し「可能性のある釣り場」）。

### 9.4 ブラウザ保存形式
- **集計結果（localStorage）**: キー `tsuridokoro:results`、値 `{ expiresAt: number, items: AggregateResult[] }`（`items` は新しい順）。実装は `frontend/src/storage/results.ts`。
  - `expiresAt` = 保存した週の **日曜日 23:59:59.999**（端末のローカル時刻、週は月曜始まり）。期限切れ・形式不正なら読み込み時に丸ごと破棄。
  - 容量超過やプライベートモードで保存できない場合は保存を諦め、表示は継続する。
- **集計済みフラグ（sessionStorage）**: キー `tsuridokoro:searched` = `'1'`。このタブで一度集計したかを表し、ナビの結果リンク表示に使う（`useSearchedStore`）。

---

## 10. AI集計（Gemini）の仕組み

- **モデル**: `gemini-3.6-flash`（コスト・速度重視の第一候補。品質が要れば上位 Flash/Pro を検討）。旧 `gemini-2.5-flash` は新規キーでは利用不可（404）になったため 3.6 系に更新済み。
- **検索**: Google **検索グラウンディング**（`tools: [{ googleSearch: {} }]`）を有効化。1コールで検索＋分析。
- **⚠️ 課金アカウント必須**: グラウンディングは **課金アカウント（クレジットカード登録）を紐付けたキーでのみ利用可**。無料枠のみのキーはグラウンディング呼び出しが `429 RESOURCE_EXHAUSTED` で弾かれる（モデル単体の呼び出しは無料枠で可）。課金を有効化してもグラウンディングは **月5,000コールまで無料**、超過分は 1,000コールあたり約 $14。テスト段階の実利用は実質 $0。Cloud Console の Budgets & alerts で上限アラートを設定して運用する。
- **SDK**: バックエンドで `@google/genai`（旧 `@google/generative-ai` は使わない）。
- **構造化出力の注意**: Geminiは **グラウンディングツールと厳密な `responseSchema` の同時使用が不可**なことが多い。対策は次のどちらか:
  1. プロンプトでJSON出力を指示し、フェンス除去して `JSON.parse`（**現在の実装**）。
  2. 不安定なら **2コール**: ①グラウンディングで収集・分析 → ②ツールなし＋`responseMimeType:'application/json'`＋`responseSchema` で §9.2 に整形。
- **実装**（`backend/src/routes/aggregate/aggregateSearch.ts`）:
  - プロンプトは `prompt.md`。`{{targetFish}}` `{{prefecture}}` `{{city}}` `{{lookbackDays}}` `{{today}}` `{{startDate}}`（JST）を置換する。文言だけ直せば挙動を調整できる。
  - 応答からJSONを抽出（コードフェンス or 最初の `{`〜最後の `}`）→ `JSON.parse`。
  - `meta` の入力値（魚種・都道府県・市町村・日数）と `aggregatedAt`（JST）は**サーバーが上書き**する（AIの取り違えを信用しない）。
  - `aggregateResultSchema` で検証し、不一致・パース失敗は例外 → ルートで `502`。
  - `GEMINI_API_MODE=mock` では Gemini を呼ばずモックデータを返す（`aggregateSearchMock.ts`）。
- **プロンプト方針**:
  - 収集対象: ANGLERS・釣具店ブログ・個人ブログ・釣果掲載サイト（X/Instagramはログイン必須のため任意）。
  - 「鹿島灘」等の広域名は不採用（特定できる地点のみ）。
  - 出典URL・引用は**実在するもののみ**。不確かなら該当フィールドを空に（ハルシネーション抑制）。
  - データが乏しい場合は `dataConfidence:"low"` で正直に示す。
- **コスト管理**: 検索回数の上限、同一セッション/IPのレート制限、直近同一入力の抑制。目安は 1集計あたり数十円未満。**現状いずれも未実装**。詳細は [ROADMAP.md](ROADMAP.md) / §12。

---

## 11. デザイン

### 11.1 デザイン方針（"Sonar"）
魚群探知機（フィッシュファインダー）着想のマリン系AIツール。ヒーロー／集計中は深海グラデーションで没入、フォーム／結果は明るいカードで可読性優先。
- カラー: 深海インク `#08283A` / 潮 `#0E5A7D` / ソナー・アクア `#27C4D9`（アクセント）/ シグナル・コーラル `#FF7A4D`（好調・高期待度）/ フォーム面 `#EDF3F5`。
- タイポ: 見出し・本文 = Zen Kaku Gothic New、数値・ラベル = Space Grotesk。
- シグネチャ: **期待度メーター**（信号強度風バー＋言葉ラベル。星評価に見えないことを意図）。

### 11.2 画面デザイン（モック）
- モバイル(390px): [design/](design/) の `01_top_form.png` / `02_loading_minigame.png` / `03_results.png` / `04_history.png`
- Web(1440px): [design/](design/) の `web_01`〜`web_04`（同上）
- Figma（8画面を取り込み済）: https://www.figma.com/design/2qQ5O0sFzg3qCEYlbFDrTd
- ※モック内のデータ（12匹・68cm 等）は**サンプル**であり実出力ではない。

---

## 12. 非機能要件

| 区分 | 方針 |
|------|------|
| パフォーマンス | 集計30秒〜2分想定。ローディング＋ミニゲームで体感緩和。タイムアウト上限（例3分）超過はエラー表示（**未実装**：現状クライアント・サーバーともタイムアウト設定なし）。集計中はSSE等でストリームし進捗を出すのが望ましい |
| コスト | 検索回数上限、セッション/IPレート制限、直近同一入力の抑制（**未実装**） |
| レスポンシブ / a11y | **スマホ第一**。Headless UIでキーボード操作・フォーカス管理 |
| 法務（要確認） | X/Instagram/ANGLERS等の取得・引用が各規約に反しないか要確認。引用は出典明示・最小限（→ §16） |

### エラー・エッジケース
| ケース | 挙動 |
|--------|------|
| 該当釣果がほぼ無い | `dataConfidence:"low"` ＋「情報が少ない」表示。空UIにしない |
| AI APIエラー/タイムアウト | BFFは `502`、フロントはエラートーストを表示（再試行はフォームから再実行。専用の再試行ボタンは未実装）。localStorageは汚さない |
| 地名が広域すぎる | 市町村まで必須のため発生しない（Zodで未選択を検証） |
| JSONスキーマ不一致 | BFFで検証し、フロントには整形済みのみ返す |
| 緯度経度が取れない | 地名クエリで地図表示 |

---

## 13. デプロイ & CI/CD

### 13.1 フロント → Cloudflare Pages
- **GitHub Actions**（[.github/workflows/deploy.yml](../.github/workflows/deploy.yml)）が `main` push で `cloudflare/wrangler-action` を実行し、`frontend/dist` を **Direct Upload**（`wrangler pages deploy … --project-name=tsuridokoro`）。
- ビルド: `npm ci && npm run share && npm run build --workspace=frontend`（`GITHUB_PAGES` は付けない＝`base:'/'`）。
- ビルド時に `VITE_API_BASE_URL`（Secret）を注入 → フロントがRenderを叩けるように。
- SPAフォールバック: `frontend/public/_redirects` = `/* /index.html 200`（deep-link更新でも404しない）。
- 必要Secret: `CLOUDFLARE_API_TOKEN`（Pages:Edit）、`CLOUDFLARE_ACCOUNT_ID`、`VITE_API_BASE_URL`。
- **Pagesプロジェクトは Direct Upload型**であること（Git連携で作るとWorkerになり `pages deploy` が対象を見つけられない）。

### 13.2 バックエンド → Render (Web Service)
Renderは **自前のGit連携で自動デプロイ**（Actionsとは別系統）。手動作成のため設定はダッシュボードで:
- **Root Directory: 空（リポジトリルート）** ← workspaces（`@app/shared`）解決に必須。
- Build: `npm ci && npm run share && npm run build --workspace=backend`
- Start: `npm run start --workspace=backend`
- Env: `NODE_VERSION=24`、`ALLOWED_ORIGIN`、`GEMINI_API_KEY`（secret）。`PORT` はRenderが注入。
- Health Check Path: `/api/health`。無料プランは**スリープ**するため初回リクエストにコールドスタート（〜30–60秒）。
- 参照用に [render.yaml](../render.yaml) あり（Blueprint作成時のみ有効）。

### 13.3 パス別デプロイ（フロントとバックを分離）※推奨設定・**現状未設定**（`deploy.yml` に `paths` フィルタなし）
- フロント: `deploy.yml` の `on.push.paths` を `frontend/**`, `shared/**`, ルート `package.json`/`package-lock.json` に限定。
- バックエンド: Render の **Build Filters** に `backend/**`, `shared/**` を設定。
- `shared/**` は両方に含める（両者に影響するため）。

### 13.4 CORS
- フロント（Cloudflare）とバック（Render）は**別オリジン**なので **CORS必須**。プロキシは使わない方針。
- バック: `app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(',') ?? true }))`（[backend/src/app.ts](../backend/src/app.ts)）。本番は `ALLOWED_ORIGIN=https://tsuridokoro.pages.dev`。
- フロント: `myAxios` の `baseURL = import.meta.env.VITE_API_BASE_URL ?? '/'`（本番はRender絶対URL、dev は `/`＋Viteプロキシ）。
- 確認: `curl -i https://<render>/api/health -H "Origin: https://tsuridokoro.pages.dev"` に `access-control-allow-origin` が返ればOK。

### 13.5 その他のワークフロー
- [ci.yml](../.github/workflows/ci.yml)（PR）: lint + frontend/backend テスト + E2E。
- [playwright.yml](../.github/workflows/playwright.yml): E2E。
- [chromatic.yml](../.github/workflows/chromatic.yml): Storybook のビジュアル回帰（`CHROMATIC_PROJECT_TOKEN` 必要）。

---

## 14. テスト
- フロント: Storybook のストーリーを `@storybook/addon-vitest` で Vitest 実行（headless Chromium / Playwright）。API は `msw-storybook-addon` でモック（`parameters.msw.handlers`、既定は `Shared.api.handlers`）。jsdom のテストプロジェクトは現状なし。
- バックエンド: Vitest + Supertest（`app` に対して）。
- E2E: Playwright（`frontend/tests/`、dev serverを自動起動）。
- ビジュアル回帰: Storybook + Chromatic。
- 注意: バックエンドのビルドはテストファイルを除外済（`tsconfig` の `exclude`）。集計エンドポイントのテストは Gemini 呼び出しを**モック**する。

---

## 15. 現状ステータス（オンボーディング時の把握用）

| 項目 | 状態 |
|------|------|
| モノレポ雛形（frontend/backend/shared） | ✅ |
| ホスティング決定＆デプロイ（Cloudflare Pages + Render） | ✅ |
| バックエンド: `PORT`対応 / CORS / `/api/health` | ✅ |
| フロント: `myAxios` を `VITE_API_BASE_URL` に配線 | ✅ |
| AIプロバイダ決定（Gemini + Google検索グラウンディング） | ✅ |
| デザイン（モック＋Figma取り込み） | ✅ |
| `POST /api/aggregate`（Gemini集計、live/mock 切替） | ✅ |
| フォーム → 集計 → localStorage → 結果UI（`/results`）の結線 | ✅ |
| 履歴ページ（`/history`） | ✅ |
| 魚種マスタ（`FISH`）／市町村マスタ（geolonia）、Google Maps埋め込み | ✅ |
| ローディング表示 | ✅（スピナー） |
| ミニゲーム | ⏳ 未 |
| コスト/レート制御・タイムアウト | ⏳ 未 |
| Profile ページ | ⏳ 雛形のみ |
| 法務確認（引用・規約） | ⏳ 未 |

**既知の問題**: `backend/src/routes/aggregate/aggregate.test.ts` が存在しない `./gemini` を import しており失敗する。フロントは型エラーが4件（`APITest.stories.tsx`・`History.tsx`・`Home.tsx`）。E2E `frontend/tests/home.spec.ts` はテンプレ由来の内容のまま。

**次にやるべきこと**: 上記の既知の問題を解消したうえで、残タスク（ミニゲーム、コスト/レート制御、仕上げ・検証）と追加機能に着手する。詳細は [ROADMAP.md](ROADMAP.md)。

---

## 16. 未確定・設計時に決める事項（Open Questions）
1. ~~**Google Maps** の埋め込み方式~~ → keyless iframe（`output=embed`）で決定。公式 Maps Embed API に切り替える場合は `VITE_GOOGLE_MAPS_EMBED_KEY` を導入する。
2. ~~**セレクト選択肢マスタ**~~ → 魚種は `constants.ts` の静的配列、都道府県→市町村は geolonia/japanese-addresses を実行時取得で決定。外部取得に失敗すると選択肢が空になる点は要検討。
3. **構造化出力**: 現状はプロンプト整形＋1コール（§10）。不安定なら2コール方式へ移行するかを実運用で判断。
4. **法務**: スクレイピング/引用の各サービス規約適合性。
5. **ミニゲーム**の作り込み度合い（MVPは最小、反応が良ければ拡張）。
6. **コスト上限**: 検索回数・レート制限の具体値。

---

## 17. v2 以降

### トップページ フォームのオプション追加
- **天候**: 雨→シーバス⭕️/イカ❌、少しの波浪→捕食者⭕️、曇天→捕食者⭕️
- **最近の風向きによるベイトの寄り可能性**
- **月齢**: 満月→イカ⭕️
- **過去3年間の同時期実績**（ANGLERSログイン連携）

### その他候補
- サーバー側での結果永続化・アカウント
- お気に入り／共有／通知
- 事前ingestionパイプライン（利用増でコスト最適化が必要になった場合）

---

## 付録: 関連ドキュメント
- 開発ロードマップ: [ROADMAP.md](ROADMAP.md)
- 画面デザイン: [design/](design/)（mobile / web）／ Figma: https://www.figma.com/design/2qQ5O0sFzg3qCEYlbFDrTd
- リポジトリ運用メモ: ルート [CLAUDE.md](../CLAUDE.md)
