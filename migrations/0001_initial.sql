-- 0001_initial.sql: 인사이트 랩 & 전문 보고서 DB 스키마

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'author', -- 'admin', 'editor', 'author', 'reader'
  bio TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- '테크·AI', '시니어·트렌드', '노마드·경제', '여행·지역개발'
  tags TEXT, -- Comma separated tags
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  image_url TEXT,
  reading_time INTEGER DEFAULT 5,
  is_published INTEGER DEFAULT 1,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS archives (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  sector TEXT NOT NULL,
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- 초기 관리자 및 예시 작성자 데이터
INSERT OR IGNORE INTO users (id, email, password_hash, salt, name, role, bio) VALUES
('usr_admin', 'admin@insightlab.kr', '4a80e14a1e9df646d65c05c0d51086432bf28b6d056bc1b1bc37b58c73c8ef78', 'salt1234', '김선임 수석연구원', 'admin', '인사이트 랩 대표 리서처 & AI 정책 동향 선행 연구'),
('usr_editor', 'editor@insightlab.kr', '4a80e14a1e9df646d65c05c0d51086432bf28b6d056bc1b1bc37b58c73c8ef78', 'salt1234', '박지민 트렌드 에디터', 'editor', '라이프스타일, 시니어 트렌드 및 지역 경제 분석 전문 에디터');

-- 기본 보고서 데이터
INSERT OR IGNORE INTO posts (id, slug, title, summary, content, category, tags, author_id, author_name, image_url, reading_time, views_count, likes_count) VALUES
(
  'post_1',
  'smart-city-tech-horizon-2025',
  '2025 스마트시티 & 스마트폰 테크 트렌드 리포트: 도시 공간과 모바일 지능의 결합',
  '현대적인 고층 빌딩 숲과 모바일 에지 AI가 연결하는 미래 스마트 팩토리, 엣지 컴퓨팅, 실시간 커넥티드 서비스에 대한 산업 분석 보고서입니다.',
  '## 1. Executive Summary\n도시 인프라와 스마트 디바이스의 융합은 2025년 산업 트렌드의 핵심입니다. 초고속 5G/6G 통신 네트워크를 기반으로 개인 모바일 기기가 스마트시티의 실시간 에지 센서 역할을 담당하게 됩니다.\n\n## 2. 주요 시사점\n- **스마트폰 기반 에지 컴퓨팅**: 중앙 서버에 전송하지 않고 온디바이스 AI로 자율주행, 관제 데이터 즉시 처리\n- **도시 공간 데이터의 경제적 가치**: 빌딩 숲 모니터링 시스템과 커넥티드 모빌리티 연동 확대\n- **보안 및 프라이버시**: 영지식 증명(Zero-Knowledge Proof)을 활용한 개인정보 보호 인증\n\n## 3. 향후 시장 전망\n글로벌 스마트시티 솔루션 시장은 연평균 18.4% 성장이 예상되며, 모바일 지능화 애플리케이션 분야가 가장 가파른 성장을 보일 것으로 분석됩니다.',
  '테크·AI',
  '스마트시티,모바일,AI,엣지컴퓨팅,미래산업',
  'usr_admin',
  '김선임 수석연구원',
  'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/7iLRc6oD_1793769907772',
  8,
  1420,
  89
),
(
  'post_2',
  'senior-park-golf-trend-analysis',
  '액티브 시니어 시대의 스포츠 라이프: 파크골프 인구 급증과 세대 통합 레저 경제',
  '어린 손자부터 조부모까지 온 세대가 교감하는 파크골프의 확산 현상과 시니어 헬스케어 레저 산업의 최신 소비 동향 보고서.',
  '## 1. 분석 배경\n파크골프가 새로운 국민 스포츠로 떠오르고 있습니다. 조부모와 손주가 함께 라운딩을 즐기며 파크골프 채 잡는 법부터 예절까지 나누는 세대 교감형 레저 문화가 전국 지자체로 빠르게 확산 중입니다.\n\n## 2. 세대 통합 스포츠의 경제적 효과\n- **지역 체육 인프라 혁신**: 전국 350여 개 파크골프장 조성 및 관광 연계 상품 활성화\n- **시니어 용품 & 헬스케어**: 경량 파크골프 클럽, 맞춤 신발, 헬스 모니터링 웨어러블 수요 증가\n- **가족 단위 문화 공간**: 3세대가 함께 방문하는 종합 힐링 클럽하우스 등장\n\n## 3. 정책적 결언 및 권고사항\n지자체 차원의 안전 가이드라인 수립과 무료 파크골프 교육 프로그램 확대를 통해 건전한 국민 건강 생태계 조성이 필요합니다.',
  '시니어·트렌드',
  '파크골프,시니어,세대전통,헬스케어,레저경제',
  'usr_editor',
  '박지민 트렌드 에디터',
  'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/7iLRc6oD_1792646356477',
  6,
  980,
  64
),
(
  'post_3',
  'chiang-mai-ai-developer-digital-nomad',
  'AI 개발자를 위한 치앙마이: 경제적 자유와 연구 몰입을 향한 스마트한 거주 가이드',
  '낮은 생활비, 뛰어난 코워킹 공간, 강력한 글로벌 테크 커뮤니티를 지닌 치앙마이가 AI 개발자와 독립 리서처들의 거점지로 떠오르는 이유.',
  '## 1. 개요 및 분석 목적\n글로벌 디지털 노마드 및 1인 AI 스타트업 창업가들이 치앙마이를 새로운 원격 연구 거점으로 선택하고 있습니다. 본 보고서는 비용 대비 삶의 질, 통신 인프라, 테크 네트워킹 환경을 정량 분석하였습니다.\n\n## 2. 주요 핵심 요소\n- **비용 최적화**: 월 120~150만원 수준으로 최고급 작업 공간 및 하우징 확보 가능\n- **개발자 커뮤니티**: 매주 열리는 AI Meetup, LLM 해커톤 및 오픈소스 연구 그룹\n- **스마트 거주 여건**: 시원한 님만해민 코워킹 스페이스 및 고속 섬유 광통신망 네트워크 구축\n\n## 3. 최종 요약\n독립적인 AI 서비스 개발 및 논문 스터디에 집중하고자 하는 글로벌 탤런트에게 치앙마이는 생산성과 생계비를 동시에 충족하는 최적의 전략 거점입니다.',
  '노마드·경제',
  '치앙마이,AI개발자,디지털노마드,원격근무,노마드경제',
  'usr_admin',
  '김선임 수석연구원',
  'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/external_94a1885a0d4a9c8ba6a33e6386efb089365f1515a44c0bd10084d0a5512a41a9',
  7,
  2150,
  135
),
(
  'post_4',
  'gangwon-2days-travel-course-recommendation',
  '1박 2일 강원도 힐링·투자기회 여행 코스: 동해안 로컬 브랜드와 관광 경제 맵 분석',
  '자연 힐링과 동해안 신흥 로컬 비즈니스 핫스팟을 결합한 1박 2일 강원도 관광·지역경제 조사 리포트.',
  '## 1. 리포트 개요\n강원도는 KTX 및 고속도로망 확충으로 메트로폴리탄 접근성이 극대화되었습니다. 본 리포트는 1박 2일 동안 즐길 수 있는 대표 여행 코스와 함께 동해안 로컬 브랜드의 창업 생태계를 진단합니다.\n\n## 2. 추천 1박 2일 동선 및 스팟\n- **Day 1 (강릉-양양)**: 정동진 해변 조망, 양양 서피비치 로컬 카페 생태계, 바다 부채길 걷기\n- **Day 2 (속초-고성)**: 속초 관광수산시장 먹거리 탐방, 고성 아야진 해변 및 로컬 팝업스토어\n\n## 3. 지역 경제 시사점\n로컬 크리에이터와 연계한 문화 관광 상품이 강원도 방문객의 재방문율을 42% 증대시킨 것으로 집계되었습니다.',
  '여행·지역개발',
  '강원도,여행코스,로컬브랜드,관광경제,힐링여행',
  'usr_editor',
  '박지민 트렌드 에디터',
  'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/vizbot_25399a703b2f6fc89897cf5d4be8f080fe6bb1d313f0b5d5bf49288bb0ece6ab',
  5,
  1670,
  92
);
