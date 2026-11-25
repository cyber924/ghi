# Insight Lab & Professional Reports (인사이트 랩 & 전문 보고서 플랫폼)

Cloudflare Workers + D1 + Cloudflare Assets 기반의 전문 블로그 & 아카이빙 분석 보고서 플랫폼 프로젝트입니다.

---

## 🛠 1. Cloudflare D1 바인딩 및 데이터베이스 생성 가이드

이 프로젝트는 D1 데이터베이스 ID를 임의로 하드코딩하지 않습니다. 본인 계정에 Cloudflare D1을 생성 후 `wrangler.jsonc`에 `database_id`를 입력하셔야 데이터베이스 기능이 활성화됩니다.

### Step 1: D1 데이터베이스 생성
터미널에서 아래 명령어를 실행하여 D1 데이터베이스를 생성합니다:
```bash
npx wrangler d1 create insight_db
```

실행 결과로 출력되는 `database_id` 값을 확인하세요:
```text
[[d1_databases]]
binding = "DB"
database_name = "insight_db"
database_id = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 2: `wrangler.jsonc` 수정
`wrangler.jsonc` 파일의 `database_id` 항목을 생성한 ID로 교체합니다:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "insight-lab-reports",
  "main": "src/worker.js",
  "compatibility_date": "2024-03-01",
  "assets": {
    "directory": "./public",
    "binding": "ASSETS"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "insight_db",
      "database_id": "YOUR_ACTUAL_D1_DATABASE_ID"
    }
  ]
}
```

---

## 🗄 2. 마이그레이션 실행

### 로컬 개발 환경 마이그레이션
```bash
npx wrangler d1 execute insight_db --local --file=./migrations/0001_initial.sql
```

### 상용(Production) 마이그레이션
```bash
npx wrangler d1 execute insight_db --remote --file=./migrations/0001_initial.sql
```

---

## 💻 3. 로컬 테스트 및 배포 명령어

### 로컬 개발 서버 실행
```bash
npm run dev
# 또는 npx wrangler dev
```

### Cloudflare Workers 배포
```bash
npm run deploy
# 또는 npx wrangler deploy
```

---

## 🔑 4. AI 초안 생성 기능 (선택 항목)
Cloudflare Workers AI 바인딩 및 Secret 사용을 원하는 경우 아래와 같이 명령어를 수행합니다:

```bash
# Cloudflare Secrets 등록 예시
npx wrangler secret put AI_API_KEY
```

D1 DB가 연결되지 않은 로컬 정적 프리뷰 환경에서도 프론트엔드 모의(Fallback) 데이터가 내장되어 안전하게 페이지 UI 및 예시 문서를 확인할 수 있습니다.
