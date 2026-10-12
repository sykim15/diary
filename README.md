# 감정 일기 — React + Supabase

하루의 감정과 짧은 기록을 남기고, 다른 기기에서도 같은 기록을 확인할 수 있는 웹 앱입니다.
실습 절차와 Supabase 설정은 [`guide.md`](./guide.md)를 참고하세요.

## 소개

감정 5가지 중 하나를 선택하고 오늘의 짧은 기록을 저장할 수 있습니다. 저장한 기록은
최신순으로 표시되며, 전체 기록 또는 감정별로 필터링하고 삭제할 수 있습니다.

입력 검증, 불러오는 중 상태, 저장 중 상태, 오류 메시지, 기록이 없을 때의 빈 상태도
화면에 표시합니다.

## 어떻게 만들었나요

Copilot Plan 모드에서 PRD를 먼저 정리한 뒤 Agent 모드로 구현했습니다.

1. 기존 Vite + React 템플릿과 프로젝트 설정을 확인했습니다.
2. `@supabase/supabase-js`와 Tailwind CSS의 Vite 플러그인을 설정했습니다.
3. Supabase 클라이언트를 [`src/lib/supabase.js`](./src/lib/supabase.js)에 한 곳에서 생성했습니다.
4. 조회·추가·삭제 로직을 [`src/api/diaries.js`](./src/api/diaries.js)에 분리했습니다.
5. React 화면에서 감정 선택, 기록 작성, 필터, 삭제, 로딩·오류·빈 상태를 구현했습니다.
6. `npm run lint`와 `npm run build`로 검증했습니다.

## 데이터는 어디에 저장되나요

Supabase의 `diaries` 테이블에 저장합니다.

| 컬럼 | 설명 |
| --- | --- |
| `id` | 데이터베이스가 자동 생성하는 일기 식별자 |
| `content` | 필수 기록 내용 |
| `emotion` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나의 감정 값 |
| `created_at` | 데이터베이스가 자동 생성하는 작성 시각 |

6주차 To-Do는 브라우저의 `localStorage`에 저장되어 같은 브라우저에서만 확인할 수
있었습니다. 이 앱은 온라인 Supabase 데이터베이스를 사용하므로 같은 Supabase 프로젝트에
연결된 다른 기기나 브라우저에서도 기록을 확인할 수 있습니다.

## 보안에서 확인한 것

Supabase URL과 Publishable Key는 `.env.local`에 저장하고 `.gitignore`로 Git에 올라가지
않도록 했습니다. 환경변수 이름은 `VITE_SUPABASE_URL`과
`VITE_SUPABASE_PUBLISHABLE_KEY`입니다. 실제 값은 코드에 직접 작성하지 않습니다.

다만 프론트엔드 앱에서 사용하는 값이므로 Publishable Key는 브라우저 개발자 도구의
Network 요청에서 보일 수 있습니다. 이 키 자체를 비밀 키로 취급하는 것이 아니라,
Supabase의 RLS 정책과 테이블 권한으로 데이터를 보호해야 합니다.

현재 실습 정책이 모든 사용자의 읽기·추가·삭제를 허용하는 형태라면 배포 주소를 아는
누구나 기록을 읽거나 삭제할 수 있습니다. 실제 서비스에서는 Supabase Auth를 추가하고,
사용자 ID를 저장한 뒤 본인이 작성한 기록만 조회·삭제하도록 RLS 정책을 제한해야 합니다.

## 실행 방법

### 로컬 실행

1. 의존성을 설치합니다.

	```bash
	npm install
	```

2. `.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트 값을 입력합니다.

	```bash
	cp .env.example .env.local
	```

3. 개발 서버를 실행합니다.

	```bash
	npm run dev
	```

추가 검증 명령은 다음과 같습니다.

```bash
npm run lint
npm run build
```

### 배포

현재 README 작성 시점에는 Netlify 배포 링크가 없습니다. Netlify에 배포할 때는
`VITE_SUPABASE_URL`과 `VITE_SUPABASE_PUBLISHABLE_KEY`를 배포 환경변수로 등록해야 합니다.

## 커스터마이징한 부분

기본 요구사항에 다음 내용을 추가하거나 다듬었습니다.

- 감정별 색상과 이모지를 사용한 선택 버튼 및 필터 탭
- 모바일과 데스크톱을 고려한 반응형 2단 레이아웃
- 기록이 없을 때 안내하는 빈 상태 화면
- 삭제 중 상태와 공통 오류 메시지
- Tailwind CSS와 `Fraunces`, `DM Sans` 글꼴을 사용한 따뜻한 일기장 분위기의 디자인
