// src/worker.js - Cloudflare Worker backend for InsightLab (전문 블로그 & 보고서 플랫폼)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // API Routes
    if (pathname.startsWith('/api/')) {
      try {
        // Origin verification for state-changing requests
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          const origin = request.headers.get('Origin');
          const host = request.headers.get('Host');
          if (origin && host) {
            const originHost = new URL(origin).host;
            if (originHost !== host) {
              return jsonResponse({ error: 'Invalid Origin / CSRF protection triggered' }, 403);
            }
          }
        }

        // Database health check helper
        const dbAvailable = !!env.DB;

        // Route routing
        if (pathname === '/api/auth/register' && method === 'POST') {
          return await handleRegister(request, env);
        }
        if (pathname === '/api/auth/login' && method === 'POST') {
          return await handleLogin(request, env);
        }
        if (pathname === '/api/auth/logout' && method === 'POST') {
          return await handleLogout(request, env);
        }
        if (pathname === '/api/auth/me' && method === 'GET') {
          return await handleMe(request, env);
        }
        if (pathname === '/api/posts' && method === 'GET') {
          return await handleGetPosts(request, env, url);
        }
        if (pathname === '/api/posts' && method === 'POST') {
          return await handleCreatePost(request, env);
        }
        if (pathname.match(/^\/api\/posts\/([^\/]+)$/) && method === 'GET') {
          const id = pathname.split('/')[3];
          return await handleGetPostDetail(request, env, id);
        }
        if (pathname.match(/^\/api\/posts\/([^\/]+)$/) && method === 'PUT') {
          const id = pathname.split('/')[3];
          return await handleUpdatePost(request, env, id);
        }
        if (pathname.match(/^\/api\/posts\/([^\/]+)$/) && method === 'DELETE') {
          const id = pathname.split('/')[3];
          return await handleDeletePost(request, env, id);
        }
        if (pathname.match(/^\/api\/posts\/([^\/]+)\/like$/) && method === 'POST') {
          const id = pathname.split('/')[3];
          return await handleLikePost(request, env, id);
        }
        if (pathname.match(/^\/api\/posts\/([^\/]+)\/comments$/) && method === 'GET') {
          const id = pathname.split('/')[3];
          return await handleGetComments(request, env, id);
        }
        if (pathname.match(/^\/api\/posts\/([^\/]+)\/comments$/) && method === 'POST') {
          const id = pathname.split('/')[3];
          return await handleAddComment(request, env, id);
        }
        if (pathname === '/api/archives' && method === 'GET') {
          return await handleGetArchives(request, env, url);
        }
        if (pathname === '/api/ai/summarize' && method === 'POST') {
          return await handleAISummarize(request, env);
        }
        if (pathname === '/api/admin/users' && method === 'GET') {
          return await handleAdminGetUsers(request, env);
        }
        if (pathname.match(/^\/api\/admin\/users\/([^\/]+)\/role$/) && method === 'PUT') {
          const id = pathname.split('/')[4];
          return await handleAdminUpdateRole(request, env, id);
        }

        return jsonResponse({ error: 'API Endpoint not found' }, 404);
      } catch (err) {
        console.error('API Error:', err);
        return jsonResponse({
          error: err.message || 'Internal Server Error',
          detail: 'Check D1 connection or environment configuration in wrangler.jsonc'
        }, 500);
      }
    }

    // Static Asset fallback handling via env.ASSETS
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          return assetResponse;
        }
      } catch (e) {
        console.warn('ASSETS.fetch failed, serving fallback logic', e);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

// JSON helper response
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders
    }
  });
}

// Password Hashing via Web Crypto API (PBKDF2)
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const saltStr = saltHex || bytesToHex(salt);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  const hashHex = bytesToHex(new Uint8Array(derivedKey));
  return { hash: hashHex, salt: saltStr };
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Opaque server-side sessions; only a SHA-256 token digest is stored.
async function ensureSessions(env) {
  requireDB(env);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL)").run();
}
async function tokenHash(token) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))));
}
async function createSessionCookie(env, userId) {
  await ensureSessions(env);
  const token = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(await tokenHash(token), userId, Date.now() + 604800000).run();
  return `session_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;
}
async function parseSessionCookie(request, env) {
  const match = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)session_auth=([0-9a-f]{64})(?:;|$)/);
  if (!match || !env.DB) return null;
  await ensureSessions(env);
  return await env.DB.prepare('SELECT users.id AS userId, users.role FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?').bind(await tokenHash(match[1]), Date.now()).first();
}
async function handleLogout(request, env) {
  const match = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)session_auth=([0-9a-f]{64})(?:;|$)/);
  if (match && env.DB) {
    await ensureSessions(env);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await tokenHash(match[1])).run();
  }
  return jsonResponse({ message: '로그아웃되었습니다.' }, 200, { 'Set-Cookie': 'session_auth=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
}

function requireDB(env) {
  if (!env.DB) {
    throw new Error('D1 Database binding (env.DB) is missing. Please run wrangler d1 migrations and set binding.');
  }
}

// AUTH HANDLERS
async function handleRegister(request, env) {
  requireDB(env);
  const body = await request.json();
  const { email, password, name, bio, role = 'author' } = body;

  if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || !email.trim() || !name.trim() || password.length < 8 || password.length > 256) {
    return jsonResponse({ error: '이름과 이메일을 입력하고 비밀번호는 8자 이상으로 설정해 주세요.' }, 400);
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return jsonResponse({ error: '이미 등록된 이메일 주소입니다.' }, 409);
  }

  const { hash, salt } = await hashPassword(password);
  const userId = 'usr_' + crypto.randomUUID().slice(0, 12);
  const userRole = 'author';

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, salt, name, role, bio) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, email, hash, salt, name, userRole, bio || '').run();

  const cookieStr = await createSessionCookie(env, userId);
  return jsonResponse({
    message: '회원가입이 성공적으로 완료되었습니다.',
    user: { id: userId, email, name, role: userRole }
  }, 201, { 'Set-Cookie': cookieStr });
}

async function handleLogin(request, env) {
  requireDB(env);
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return jsonResponse({ error: '이메일과 비밀번호를 입력해주세요.' }, 400);
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) {
    return jsonResponse({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const { hash } = await hashPassword(password, user.salt);
  if (hash !== user.password_hash) {
    return jsonResponse({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401);
  }

  const cookieStr = await createSessionCookie(env, user.id);
  return jsonResponse({
    message: '로그인되었습니다.',
    user: { id: user.id, email: user.email, name: user.name, role: user.role, bio: user.bio, avatar_url: user.avatar_url }
  }, 200, { 'Set-Cookie': cookieStr });
}

async function handleMe(request, env) {
  const session = await parseSessionCookie(request, env);
  if (!session) {
    return jsonResponse({ user: null });
  }

  if (!env.DB) {
    return jsonResponse({ user: { id: session.userId, role: session.role, name: '예시 사용자 (DB 미연결)' } });
  }

  const user = await env.DB.prepare('SELECT id, email, name, role, bio, avatar_url FROM users WHERE id = ?').bind(session.userId).first();
  if (!user) {
    return jsonResponse({ user: null });
  }

  return jsonResponse({ user });
}

// POSTS HANDLERS
async function handleGetPosts(request, env, url) {
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  if (!env.DB) {
    return jsonResponse({ error: 'DB_NOT_BOUND', message: 'D1 DB가 바인딩되지 않았습니다.' }, 503);
  }

  let query = 'SELECT * FROM posts WHERE is_published = 1';
  const params = [];

  if (category && category !== '전체') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const stmt = env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all();
  return jsonResponse({ posts: results || [] });
}

async function handleCreatePost(request, env) {
  const session = await parseSessionCookie(request, env);
  if (!session) {
    return jsonResponse({ error: '로그인이 필요합니다.' }, 401);
  }
  requireDB(env);

  const body = await request.json();
  const { title, summary, content, category, tags, image_url, reading_time = 5, status = 'published' } = body;

  if (!title || !content || !category) {
    return jsonResponse({ error: '제목, 카테고리, 본문 내용은 필수입니다.' }, 400);
  }

  const user = await env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(session.userId).first();
  const authorName = user ? user.name : '인사이트 연구원';
  const postId = 'post_' + crypto.randomUUID().slice(0, 10);
  const slug = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').slice(0, 50) + '-' + Date.now().toString().slice(-4);

  await env.DB.prepare(
    `INSERT INTO posts (id, slug, title, summary, content, category, tags, author_id, author_name, image_url, reading_time, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    postId, slug, title, summary || title.slice(0, 100), content, category, Array.isArray(tags) ? tags.join(', ') : (tags || ''), session.userId, authorName, image_url || '', reading_time, status === 'draft' ? 0 : 1
  ).run();

  // Only published reports are added to the public archive.
  if (status !== 'draft') {
    const now = new Date();
    const year = now.getFullYear();
    const q = Math.ceil((now.getMonth() + 1) / 3) + '분기';
    await env.DB.prepare(
      `INSERT INTO archives (id, post_id, sector, year, quarter) VALUES (?, ?, ?, ?, ?)`
    ).bind('arc_' + crypto.randomUUID().slice(0, 8), postId, category, year, q).run();
  }

  return jsonResponse({ message: status === 'draft' ? '임시 저장되었습니다.' : '보고서가 등록되었습니다.', id: postId }, 201);
}

async function handleGetPostDetail(request, env, id) {
  if (!env.DB) {
    return jsonResponse({ error: 'DB_NOT_BOUND' }, 503);
  }

  const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ? OR slug = ?').bind(id, id).first();
  if (!post) {
    return jsonResponse({ error: '해당 문서/보고서를 찾을 수 없습니다.' }, 404);
  }

  // Increment view count
  await env.DB.prepare('UPDATE posts SET views_count = views_count + 1 WHERE id = ?').bind(post.id).run();

  return jsonResponse({ post });
}

async function handleUpdatePost(request, env, id) {
  const session = await parseSessionCookie(request, env);
  if (!session) return jsonResponse({ error: '인증이 필요합니다.' }, 401);
  requireDB(env);

  const existing = await env.DB.prepare('SELECT author_id FROM posts WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: '문서를 찾을 수 없습니다.' }, 404);

  if (session.role !== 'admin' && session.userId !== existing.author_id) {
    return jsonResponse({ error: '수정 권한이 없습니다.' }, 403);
  }

  const body = await request.json();
  const { title, summary, content, category, tags, image_url, status = 'published' } = body;
  const isPublished = status === 'draft' ? 0 : 1;

  await env.DB.prepare(
    `UPDATE posts SET title = ?, summary = ?, content = ?, category = ?, tags = ?, image_url = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(title, summary, content, category, Array.isArray(tags) ? tags.join(', ') : (tags || ''), image_url || '', isPublished, id).run();

  if (!isPublished) {
    await env.DB.prepare('DELETE FROM archives WHERE post_id = ?').bind(id).run();
  } else {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.ceil((now.getMonth() + 1) / 3) + '분기';
    await env.DB.prepare(
      `INSERT INTO archives (id, post_id, sector, year, quarter) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM archives WHERE post_id = ?)`
    ).bind('arc_' + crypto.randomUUID().slice(0, 8), id, category, year, quarter, id).run();
  }

  return jsonResponse({ message: '보고서가 성공적으로 수정되었습니다.' });
}

async function handleDeletePost(request, env, id) {
  const session = await parseSessionCookie(request, env);
  if (!session) return jsonResponse({ error: '인증이 필요합니다.' }, 401);
  requireDB(env);

  const existing = await env.DB.prepare('SELECT author_id FROM posts WHERE id = ?').bind(id).first();
  if (!existing) return jsonResponse({ error: '문서를 찾을 수 없습니다.' }, 404);

  if (session.role !== 'admin' && session.userId !== existing.author_id) {
    return jsonResponse({ error: '삭제 권한이 없습니다.' }, 403);
  }

  await env.DB.prepare('DELETE FROM archives WHERE post_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM comments WHERE post_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();

  return jsonResponse({ message: '보고서가 삭제되었습니다.' });
}

async function handleLikePost(request, env, id) {
  requireDB(env);
  await env.DB.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').bind(id).run();
  const post = await env.DB.prepare('SELECT likes_count FROM posts WHERE id = ?').bind(id).first();
  return jsonResponse({ likes_count: post ? post.likes_count : 0 });
}

async function handleGetComments(request, env, postId) {
  if (!env.DB) return jsonResponse({ comments: [] });
  const { results } = await env.DB.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC').bind(postId).all();
  return jsonResponse({ comments: results || [] });
}

async function handleAddComment(request, env, postId) {
  requireDB(env);
  const session = await parseSessionCookie(request, env);
  const body = await request.json();
  const { content, userName } = body;

  if (!content) return jsonResponse({ error: '댓글 내용을 입력해주세요.' }, 400);

  let authorName = userName || '비공개 분석자';
  if (session) {
    const user = await env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(session.userId).first();
    if (user) authorName = user.name;
  }

  const commentId = 'cmt_' + crypto.randomUUID().slice(0, 8);
  await env.DB.prepare(
    `INSERT INTO comments (id, post_id, user_name, content) VALUES (?, ?, ?, ?)`
  ).bind(commentId, postId, authorName, content).run();

  return jsonResponse({ message: '피드백이 등록되었습니다.', comment: { id: commentId, post_id: postId, user_name: authorName, content, created_at: new Date().toISOString() } });
}

// ARCHIVES HANDLERS
async function handleGetArchives(request, env, url) {
  if (!env.DB) {
    return jsonResponse({ error: 'DB_NOT_BOUND' }, 503);
  }
  const sector = url.searchParams.get('sector');
  let query = `
    SELECT a.*, p.title, p.summary, p.author_name, p.image_url, p.views_count, p.created_at as post_date
    FROM archives a
    JOIN posts p ON a.post_id = p.id
  `;
  const params = [];
  if (sector && sector !== '전체') {
    query += ' WHERE a.sector = ?';
    params.push(sector);
  }
  query += ' ORDER BY a.year DESC, a.quarter DESC, p.created_at DESC';

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse({ archives: results || [] });
}

// AI SUMMARIZE HANDLER
async function handleAISummarize(request, env) {
  const body = await request.json();
  const { content, title } = body;

  if (!content) {
    return jsonResponse({ error: '요약할 문단이나 본문 텍스트를 제공해 주세요.' }, 400);
  }

  // Check if Workers AI or external OpenAI API Key is available
  if (env.AI && typeof env.AI.run === 'function') {
    try {
      const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: '너는 전문 시니어 연구원이자 트렌드 분석가이다. 제출된 보고서 본문을 3줄 요약 및 3가지 핵심 시사점으로 정교하게 정리하라. 한국어로 명확하고 고급스러운 어조로 답하라.' },
          { role: 'user', content: `제목: ${title || '무제'}\n본문:\n${content.slice(0, 3000)}` }
        ]
      });
      return jsonResponse({ summary: response.response || response.result });
    } catch (e) {
      console.warn('Workers AI call failed, falling back', e);
    }
  }

  if (env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '전문 연구원으로서 제시된 본문을 핵심 요약과 정책/비즈니스 시사점으로 정교하게 요약하라.' },
            { role: 'user', content: content.slice(0, 3000) }
          ]
        })
      });
      const data = await res.json();
      if (data.choices && data.choices[0]) {
        return jsonResponse({ summary: data.choices[0].message.content });
      }
    } catch (e) {
      console.warn('OpenAI call failed', e);
    }
  }

  // Fast Rule-based / Smart Summariser Fallback
  const paragraphs = content.split('\n').filter(p => p.trim().length > 10);
  const bullets = paragraphs.slice(0, 3).map((p, i) => `• **포인트 ${i + 1}**: ${p.replace(/^#+\s*/, '').slice(0, 140)}...`);
  const autoSummary = `[AI 핵심 분석 리포트]\n\n` +
    `1. 본 보고서는 주요 현안 및 트렌드의 정량·정성적 분석 결과를 포함하고 있습니다.\n\n` +
    `2. 주요 시사점:\n${bullets.join('\n')}\n\n` +
    `3. 종합 제언: 지속적인 모니터링과 선제적 대응 전략 수립이 요구됩니다.`;

  return jsonResponse({ summary: autoSummary, mode: 'rule-based-insight' });
}

// ADMIN HANDLERS
async function handleAdminGetUsers(request, env) {
  const session = await parseSessionCookie(request, env);
  if (!session || session.role !== 'admin') {
    return jsonResponse({ error: '관리자 권한이 필요합니다.' }, 403);
  }
  requireDB(env);

  const { results } = await env.DB.prepare('SELECT id, email, name, role, bio, created_at FROM users ORDER BY created_at DESC').all();
  return jsonResponse({ users: results || [] });
}

async function handleAdminUpdateRole(request, env, targetUserId) {
  const session = await parseSessionCookie(request, env);
  if (!session || session.role !== 'admin') {
    return jsonResponse({ error: '관리자 권한이 필요합니다.' }, 403);
  }
  requireDB(env);

  const body = await request.json();
  const { role } = body;
  if (!['admin', 'editor', 'author', 'reader'].includes(role)) {
    return jsonResponse({ error: '유효하지 않은 역할입니다.' }, 400);
  }

  await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, targetUserId).run();
  return jsonResponse({ message: '사용자 권한이 성공적으로 수정되었습니다.' });
}
