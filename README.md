# 서울, 우리의 한마디

행사에서 함께 활용하도록 만든 실시간 워드클라우드 웹앱입니다.
참여자는 QR코드로 접속해 최대 3개의 단어를 제출하고, 진행자는 대형 화면에서 결과를 확인합니다.

## 이번 최신본

- 해치 캐릭터 중심의 새 랜딩페이지
- 공부·생각·응원하는 해치 이미지와 다섯 친구 디자인
- 응답 초기화 및 기존 QR코드 재참여
- 고정된 150개·150명 표시 삭제, 실제 참여 인원 표시

## 포함 기능

- 참여방 생성, QR코드와 참여 링크
- 약 2.5초 간격 실시간 결과 갱신
- 같은 단어에 응답한 참여자 수에 따른 글자 크기
- 1인 최대 3개 단어, 각 10자 제한과 중복 제출 방지
- 진행자 응답 마감/재개, 단어 숨기기
- 응답 초기화: 확인창에서 승인하면 현재 방의 모든 응답과 숨김 설정을 삭제하고 다시 시작
- 초기화 후 기존 참여자도 같은 QR코드로 재참여 가능
- 결과 이미지 PNG 및 집계 CSV 다운로드

## GitHub에 업로드하기

1. ZIP 파일의 압축을 풉니다.
2. 압축을 푼 폴더 안의 `package.json`, `app`, `db`, `drizzle` 등이 저장소 최상위에 위치하도록 업로드합니다.
3. ZIP 파일 자체만 올리면 소스코드가 자동으로 풀리지 않습니다.
4. `.openai`, `.gitignore`, `.npmrc` 등 점으로 시작하는 파일/폴더도 함께 포함해야 합니다. 파일이 많으므로 Git 또는 GitHub Desktop을 이용하는 편이 편리합니다.

새 빈 GitHub 저장소에 Git으로 올리는 예시입니다. 기존 저장소에 올리는 경우 기존 파일과 이력을 먼저 확인하세요.

```bash
git init
git add .
git commit -m "Add Seoul word cloud app with reset"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

## 실행 환경과 배포

- React 19 / Vinext / Cloudflare Workers
- Cloudflare D1 (SQLite 호환 데이터베이스)
- Node.js 22.13 이상, 프로젝트 `packageManager`에 명시된 pnpm 버전

이 프로젝트는 서버와 공용 데이터베이스가 필요한 전체 소스입니다. **GitHub에 업로드하는 것만으로 서비스가 배포되지는 않습니다. GitHub Pages용 정적 HTML이나 Vercel 전용 프로젝트가 아닙니다.**
현재 제공한 사이트는 ChatGPT Sites에서 실행됩니다. 다른 호스팅으로 이전할 때는 Worker와 D1 데이터베이스를 별도로 연결해야 합니다.
GitHub용 ZIP에는 사용자 계정에 연결된 Sites 프로젝트 ID, 실행 데이터, 진행자 링크, 인증 토큰이 포함되어 있지 않습니다.

```bash
pnpm install --frozen-lockfile
pnpm run build
```

로컬 데이터베이스 설정 후 개발 화면 실행:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_brown_nuke.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_fantastic_zzzax.sql
pnpm run dev
```

각 마이그레이션은 새 로컬 DB에서 순서대로 한 번씩만 적용하세요. 실제 배포에서는 호스팅의 마이그레이션 적용 기능을 이용합니다. D1 바인딩 이름은 `DB`입니다.

## 주요 파일

- `app/page.tsx`: 참여, 워드클라우드, 진행자 관리 화면
- `app/globals.css`: 반응형 화면 스타일
- `app/api/rooms/route.ts`: 참여방 생성
- `app/api/room/route.ts`: 집계, 제출, 관리 및 초기화 API
- `db/schema.ts`: 데이터 구조
- `drizzle/`: 데이터베이스 마이그레이션
- `.openai/hosting.json`: 논리적 데이터베이스 바인딩

## 초기화 사용법

진행자 링크로 접속 → 진행자 관리 → 응답 초기화 → 모두 지우고 다시 시작.
초기화는 해당 참여방에만 적용됩니다. 다른 방, QR코드, 진행자 링크는 유지됩니다.
이전 응답은 복구할 수 없으므로 필요한 경우 먼저 이미지나 집계표를 저장하세요.
실행 중이던 참여 화면에는 약 2.5초 안에 새 회차가 반영됩니다. 이전 버전의 화면을 계속 켜 두었던 참여자는 새로고침이 필요할 수 있습니다.

## 검증 범위

타입 검사와 프로덕션 빌드, SQLite 기반 실제 API 처리 테스트로 초기화 권한, 방 격리, 재참여, 이전 회차 제출 차단, 중복 초기화 요청의 안전성을 확인했습니다.
실제 행사 환경에서 150대 기기의 동시 접속 부하는 별도 검증이 필요합니다.
