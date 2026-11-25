// public/app.js - InsightLab Professional Frontend Logic & Fallback Data

// Selected Images Mapping
const PRESET_IMAGES = {
  tech_urban: 'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/7iLRc6oD_1793769907772',
  lifestyle_parkgolf: 'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/7iLRc6oD_1792646356477',
  nomad_chiangmai: 'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/external_94a1885a0d4a9c8ba6a33e6386efb089365f1515a44c0bd10084d0a5512a41a9',
  travel_gangwon: 'https://image-hub-studio.herestay-4226.chatgpt.site/api/images/vizbot_25399a703b2f6fc89897cf5d4be8f080fe6bb1d313f0b5d5bf49288bb0ece6ab'
};

// Fallback Mock Posts for Static Preview & Offline Execution
const MOCK_POSTS = [
  {
    id: 'post_1',
    slug: 'digital-finance-smartphone-transformation',
    title: '현대 도시 스마트 금융과 모바일 테크놀로지의 혁신 전망',
    summary: '초연결 도시 생태계와 스마트폰 중심의 개인화 금융 서비스, 그리고 블록체인 및 AI 트렌드가 만드는 차세대 핀테크 리포트입니다.',
    content: `<h2>1. 서론: 초연결 도상에서의 모바일 핀테크</h2>
<p>현대 도시 생활자들의 일상에서 스마트폰은 단순한 통신 기기를 넘어 뱅킹, 자산 관리, 증권 거래를 아우르는 종합 금융 허브로 자리매김했습니다. 5G/6G 기술 고도화와 함께 고속 데이터 인프라가 구축된 도시 환경에서는 실시간 데이터 처리와 초개인화 AI 분석이 대중화되고 있습니다.</p>

<h2>2. 핵심 분석 요소</h2>
<ul>
  <li><strong>모바일 우선 바이오 인증:</strong> 생체 인식 기술과 보안 칩셋 결합으로 안전성 극대화</li>
  <li><strong>실시간 자산 리밸런싱:</strong> 고도화된 머신러닝 알고리즘을 통한 시장 변화 대응</li>
  <li><strong>글로벌 간편 결제 통합:</strong> 국경 없는 모바일 수수료 절감 메커니즘</li>
</ul>

<blockquote>"모바일 스마트 뱅킹은 단순히 앱 형태를 넘어서 도시 인프라 전체와의 실시간 상호작용 플랫폼으로 진화하고 있습니다."</blockquote>

<h2>3. 결론 및 정책 시사점</h2>
<p>금융 데이터 보안 규제 개선과 데이터 주권(MyData) 확립을 통해 디지털 금융 양극화를 방지하는 포용적 인프라 수립이 시급합니다.</p>`,
    category: 'IT·테크',
    tags: '스마트폰, 핀테크, AI금융, 도시인프라',
    author_name: '김지훈 수석연구원',
    image_url: PRESET_IMAGES.tech_urban,
    views_count: 1420,
    likes_count: 98,
    reading_time: 6,
    created_at: '2025-02-18 10:30:00'
  },
  {
    id: 'post_2',
    slug: 'parkgolf-senior-wellness-generation-guide',
    title: '시니어 웰니스 리포트: 손자 세대와 함께하는 파크골프 스포츠 문화',
    summary: '세대 간 소통과 액티브 시니어 계층의 신체·정신적 건강 증진을 가져오는 파크골프의 확산과 지자체 체육 인프라 조성 보고서입니다.',
    content: `<h2>1. 파크골프의 급성장과 세대 통합적 가치</h2>
<p>파크골프는 도심 인근 공원과 하천 부지에 조성되어 접근성이 뛰어나며, 장비 비용 부담이 적어 액티브 시니어 층을 중심으로 폭발적인 인기몰이를 하고 있습니다. 특히 어린 손자, 손녀 세대와 할아버지·할머니가 한 라운드를 돌며 자연스러운 유대감을 형성하는 세대 통합형 스포츠로 부각되고 있습니다.</p>

<h2>2. 웰니스 효과 분석</h2>
<ul>
  <li><strong>유산소 운동과 관절 보호:</strong> 평지 위주의 잔디 코스로 노년층 관절 무리 최소화</li>
  <li><strong>정신적 만족도 증대:</strong> 손자에게 파크골프 클럽 잡는 법과 규칙을 가르쳐주며 자아효능감 상승</li>
  <li><strong>지자체 예산 효율성:</strong> 일반 골프장 대비 1/10 비용으로 시민 공공 복지 증진</li>
</ul>

<h2>3. 발전 과제 및 추천 장소</h2>
<p>전국 파크골프장 예약 시스템의 디지털화와 안전 가이드라인 수립으로 누구나 안전하게 즐길 수 있는 환경이 조성되어야 합니다.</p>`,
    category: '라이프·웰니스',
    tags: '파크골프, 시니어, 세대소통, 웰니스',
    author_name: '박민정 시니어위원',
    image_url: PRESET_IMAGES.lifestyle_parkgolf,
    views_count: 890,
    likes_count: 74,
    reading_time: 4,
    created_at: '2025-02-15 14:15:00'
  },
  {
    id: 'post_3',
    slug: 'chiangmai-ai-developer-digital-nomad-guide',
    title: 'AI 개발자를 위한 치앙마이 워케이션: 경제적 자유와 개발 생산성 전략',
    summary: '동남아시아 대표 디지털 노마드 허브 치앙마이에서 글로벌 AI 개발자들이 누리는 경제적 자유, 코워킹 인프라, 커뮤니티 생태계 조사 보고서.',
    content: `<h2>1. 왜 AI 노마드들은 치앙마이로 향하는가?</h2>
<p>치앙마이는 저렴한 생활비, 뛰어난 인터넷 속도, 풍부한 카페 문화, 그리고 전 세계에서 몰려든 노마드 개발자 네트워크를 보유하고 있습니다. 생성형 AI 트렌드로 어디서나 개발이 가능한 시대에 최고의 생산성 거점으로 꼽힙니다.</p>

<h2>2. 경제적 분석 및 라이프스타일 비교</h2>
<ul>
  <li><strong>월 생활비 비교:</strong> 샌프란시스코/서울 대비 최대 70% 비용 절감</li>
  <li><strong>코워킹 스페이스:</strong> Punspace, Yellow 등 24시간 1Gbps 속도 제공 거점</li>
  <li><strong>커뮤니티 미업:</strong> 주간 AI 헤카톤 및 LLM 프롬프트 엔지니어링 스터디 매주 개최</li>
</ul>

<h2>3. 성공적인 워케이션을 위한 3가지 조언</h2>
<p>적합한 장기 숙소 계약, 태국 노마드 비자(DTV) 준비, 그리고 집중 조율 시간을 확보하여 몰입감을 유지하세요.</p>`,
    category: '글로벌·트렌드',
    tags: '치앙마이, AI개발자, 워케이션, 디지털노마드',
    author_name: '최현우 리드 엔지니어',
    image_url: PRESET_IMAGES.nomad_chiangmai,
    views_count: 2310,
    likes_count: 185,
    reading_time: 7,
    created_at: '2025-02-10 09:00:00'
  },
  {
    id: 'post_4',
    slug: 'gangwon-1night-2days-travel-course-recommendation',
    title: '1박 2일 강원도 힐링 여행 코스 추천: 자연과 로컬 에코 투어리즘',
    summary: '강릉, 속초, 양양을 잇는 동해안 1박 2일 동선 분석. 바다 전망 로컬 카페, 에코 트레킹, 청정 지역 특산물 가이드.',
    content: `<h2>1. 동해안 1박 2일 기획 배경</h2>
<p>수도권 KTX 및 고속도로망 확충으로 강원도는 단기 힐링 여행의 대표 목적지입니다. 바쁜 현대인을 위해 과도한 이동을 피하고 자연 속 쉼에 집중한 1박 2일 루트를 제시합니다.</p>

<h2>2. 일정별 추천 동선</h2>
<ul>
  <li><strong>1일차:</strong> 강릉 KTX 도착 -> 안목해변 커피거리 -> 경포호수 자전거 트레킹 -> 오션뷰 펜션 입실</li>
  <li><strong>2일차:</strong> 속초 중앙시장 로컬 푸드 탐방 -> 설악산 자락 영랑호 수변 산책 -> 양양 휴휴암 관람 후 복귀</li>
</ul>

<h2>3. 예산 및 팁</h2>
<p>비수기 및 주중 방문 시 30% 비용 절감이 가능하며, 지자체 통합 모바일 관광 패스를 이용하면 관광지 입장이 간편합니다.</p>`,
    category: '여행·문화',
    tags: '강원도, 1박2일, 강릉속초, 로컬투어',
    author_name: '이수진 컬럼니스트',
    image_url: PRESET_IMAGES.travel_gangwon,
    views_count: 1150,
    likes_count: 82,
    reading_time: 5,
    created_at: '2025-02-05 16:40:00'
  }
];

const MOCK_ARCHIVES = [
  { id: 'arc_1', sector: 'IT·테크', year: 2025, quarter: '1분기', title: MOCK_POSTS[0].title, summary: MOCK_POSTS[0].summary, author_name: MOCK_POSTS[0].author_name, image_url: MOCK_POSTS[0].image_url, views_count: 1420, post_date: '2025-02-18', post_id: 'post_1' },
  { id: 'arc_2', sector: '라이프·웰니스', year: 2025, quarter: '1분기', title: MOCK_POSTS[1].title, summary: MOCK_POSTS[1].summary, author_name: MOCK_POSTS[1].author_name, image_url: MOCK_POSTS[1].image_url, views_count: 890, post_date: '2025-02-15', post_id: 'post_2' },
  { id: 'arc_3', sector: '글로벌·트렌드', year: 2025, quarter: '1분기', title: MOCK_POSTS[3].title, summary: MOCK_POSTS[2].summary, author_name: MOCK_POSTS[2].author_name, image_url: MOCK_POSTS[2].image_url, views_count: 2310, post_date: '2025-02-10', post_id: 'post_3' },
  { id: 'arc_4', sector: '여행·문화', year: 2025, quarter: '1분기', title: MOCK_POSTS[3].title, summary: MOCK_POSTS[3].summary, author_name: MOCK_POSTS[3].author_name, image_url: MOCK_POSTS[3].image_url, views_count: 1150, post_date: '2025-02-05', post_id: 'post_4' }
];

// Auth & User Helper
let currentUser = null;

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
    }
  } catch (e) {
    console.log('Using local fallback state due to preview or offline mode');
    // Read local stored session if any
    const saved = localStorage.getItem('insight_user');
    if (saved) {
      try { currentUser = JSON.parse(saved); } catch (e) {}
    }
  }
  updateNavUserUI();
}

function updateNavUserUI() {
  const container = document.getElementById('nav-user-actions');
  if (!container) return;

  if (currentUser) {
    let adminBtn = '';
    if (currentUser.role === 'admin') {
      adminBtn = `<a href="./admin.html" class="btn btn-outline btn-sm">관리자 센터</a>`;
    }
    container.innerHTML = `
      <a href="./editor.html" class="btn btn-primary btn-sm">✍️ 새 보고서 작성</a>
      ${adminBtn}
      <span class="user-greeting" style="font-size:0.875rem; font-weight:600; color:#334155;">👋 ${escapeHtml(currentUser.name)}님</span>
      <button onclick="handleLogout()" class="btn btn-outline btn-sm">로그아웃</button>
    `;
  } else {
    container.innerHTML = `
      <a href="./login.html" class="btn btn-outline btn-sm">로그인</a>
      <a href="./signup.html" class="btn btn-primary btn-sm">회원가입</a>
    `;
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem('insight_user');
  currentUser = null;
  alert('로그아웃 되었습니다.');
  window.location.href = './index.html';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Global UI Helper: Active Nav
function setActiveNav(pageName) {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(l => {
    if (l.getAttribute('href') && l.getAttribute('href').includes(pageName)) {
      l.classList.add('active');
    }
  });
}

// Render Report Card Template
function createReportCardHTML(post) {
  return `
    <article class="report-card">
      <div class="card-image-wrap">
        <img src="${post.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600'}" alt="${escapeHtml(post.title)}" loading="lazy" />
        <span class="card-category-badge">${escapeHtml(post.category || '전문 보고서')}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span>📅 ${post.created_at ? post.created_at.slice(0, 10) : '2025-02-18'}</span>
          <span>⏱️ ${post.reading_time || 5}분 읽기</span>
          <span>👁️ ${post.views_count || 0}</span>
        </div>
        <h3 class="card-title">
          <a href="./post.html?id=${post.id}">${escapeHtml(post.title)}</a>
        </h3>
        <p class="card-summary">${escapeHtml(post.summary)}</p>
        <div class="card-footer">
          <div class="author-info">
            <span style="display:inline-block; width:22px; height:22px; border-radius:50%; background:#2563eb; color:#fff; text-align:center; line-height:22px; font-size:11px;">
              ${(post.author_name || '인')[0]}
            </span>
            <span>${escapeHtml(post.author_name || '인사이트 연구원')}</span>
          </div>
          <a href="./post.html?id=${post.id}" style="color:var(--accent-blue); font-weight:700;">읽어보기 →</a>
        </div>
      </div>
    </article>
  `;
}

// Expose utilities to global scope
window.PRESET_IMAGES = PRESET_IMAGES;
window.MOCK_POSTS = MOCK_POSTS;
window.MOCK_ARCHIVES = MOCK_ARCHIVES;
window.checkAuth = checkAuth;
window.handleLogout = handleLogout;
window.createReportCardHTML = createReportCardHTML;
window.escapeHtml = escapeHtml;
window.setActiveNav = setActiveNav;
