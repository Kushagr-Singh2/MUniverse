// ─────────────────────────────────────────────────────
//  index.js  (Frontend)
//
//  This replaces your old localStorage version.
//  Now every action (post, like, comment) calls the backend API.
//
//  Key concept: fetch() sends HTTP requests from the browser
//  to your Express server. It's async, so we use async/await.
// ─────────────────────────────────────────────────────

const API = 'http://localhost:5000/api';   // your backend URL

// ── Get the token saved after login ──────────────────
// We store the JWT in localStorage after login.
// Every request that needs auth sends it in a header.
function getToken() {
  return localStorage.getItem('token');
}

// ── Build headers for authenticated requests ──────────
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

// ── Show/hide a simple loading state ─────────────────
function setLoading(on) {
  document.getElementById('feed').style.opacity = on ? '0.5' : '1';
}

// ─────────────────────────────────────────────────────
//  AUTH FLOW
//  On page load: check if user is logged in.
//  If not → show login/register UI.
//  If yes → load the feed.
// ─────────────────────────────────────────────────────

let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

function updateNavUI() {
  if (!currentUser) return;
  const ini = currentUser.username.slice(0, 2).toUpperCase();
  document.getElementById('createAvatar').textContent  = ini;
  document.getElementById('sidebarAvatar').textContent = ini;
  document.getElementById('sidebarName').textContent   = currentUser.username;
  document.getElementById('createLabel').textContent   = `Hey ${currentUser.username.split('_')[0]}, what's on your mind?`;
  document.getElementById('openSidebar').textContent   = currentUser.username.slice(0, 1).toUpperCase();
}

// ── LOGIN ─────────────────────────────────────────────
async function login(username, password) {
  const res  = await fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  // save token + user to localStorage
  localStorage.setItem('token', data.token);
  localStorage.setItem('user',  JSON.stringify(data.user));
  currentUser = data.user;
  return data;
}

// ── REGISTER ──────────────────────────────────────────
async function register(username, password) {
  const res  = await fetch(`${API}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);

  localStorage.setItem('token', data.token);
  localStorage.setItem('user',  JSON.stringify(data.user));
  currentUser = data.user;
  return data;
}

// ── LOGOUT ────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  location.reload();
}

// ─────────────────────────────────────────────────────
//  Simple inline login/register modal
//  (replace with a real page later when you learn routing)
// ─────────────────────────────────────────────────────
function showAuthModal() {
  // remove existing if any
  document.getElementById('auth-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.style.cssText = `
    position:fixed; inset:0; background:rgba(7,7,13,0.95);
    display:flex; align-items:center; justify-content:center;
    z-index:9999; font-family:'Poppins',sans-serif;
  `;
  modal.innerHTML = `
    <div style="background:#0e0e1a; border:1px solid rgba(255,255,255,0.08);
                border-radius:20px; padding:36px; width:340px; max-width:90vw;">
      <h2 style="color:#eeeef8; font-size:20px; margin-bottom:4px;">Welcome to MUniverse</h2>
      <p  style="color:rgba(200,200,230,0.5); font-size:13px; margin-bottom:24px;">Manipal University Jaipur</p>

      <div style="display:flex; gap:8px; margin-bottom:20px;">
        <button id="tab-login"    style="flex:1; padding:8px; border-radius:30px; border:none; cursor:pointer;
                                          background:#7c6fff; color:#fff; font-family:'Poppins',sans-serif; font-weight:600; font-size:13px;">Login</button>
        <button id="tab-register" style="flex:1; padding:8px; border-radius:30px; border:1px solid rgba(255,255,255,0.1);
                                          background:transparent; color:rgba(200,200,230,0.6); font-family:'Poppins',sans-serif; font-weight:600; font-size:13px; cursor:pointer;">Register</button>
      </div>

      <input id="auth-username" type="text"     placeholder="Username"
             style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);
                    background:#13131f; color:#eeeef8; font-family:'Poppins',sans-serif; font-size:14px;
                    outline:none; margin-bottom:10px; box-sizing:border-box;">
      <input id="auth-password" type="password" placeholder="Password"
             style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);
                    background:#13131f; color:#eeeef8; font-family:'Poppins',sans-serif; font-size:14px;
                    outline:none; margin-bottom:16px; box-sizing:border-box;">

      <p id="auth-error" style="color:#e879a0; font-size:12px; margin-bottom:12px; min-height:16px;"></p>

      <button id="auth-submit"
              style="width:100%; padding:12px; border-radius:30px; border:none; cursor:pointer;
                     background:linear-gradient(135deg,#7c6fff,#6050d0); color:#fff;
                     font-family:'Poppins',sans-serif; font-weight:600; font-size:14px;">
        Login
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  let mode = 'login';

  document.getElementById('tab-login').addEventListener('click', () => {
    mode = 'login';
    document.getElementById('tab-login').style.background    = '#7c6fff';
    document.getElementById('tab-login').style.color         = '#fff';
    document.getElementById('tab-register').style.background = 'transparent';
    document.getElementById('tab-register').style.color      = 'rgba(200,200,230,0.6)';
    document.getElementById('auth-submit').textContent       = 'Login';
    document.getElementById('auth-error').textContent        = '';
  });

  document.getElementById('tab-register').addEventListener('click', () => {
    mode = 'register';
    document.getElementById('tab-register').style.background = '#7c6fff';
    document.getElementById('tab-register').style.color      = '#fff';
    document.getElementById('tab-login').style.background    = 'transparent';
    document.getElementById('tab-login').style.color         = 'rgba(200,200,230,0.6)';
    document.getElementById('auth-submit').textContent       = 'Create Account';
    document.getElementById('auth-error').textContent        = '';
  });

  document.getElementById('auth-submit').addEventListener('click', async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errEl    = document.getElementById('auth-error');

    if (!username || !password) { errEl.textContent = 'Please fill in both fields.'; return; }

    try {
      document.getElementById('auth-submit').textContent = 'Please wait...';
      if (mode === 'login') await login(username, password);
      else                  await register(username, password);

      modal.remove();
      updateNavUI();
      loadFeed();
    } catch (err) {
      errEl.textContent = err.message;
      document.getElementById('auth-submit').textContent = mode === 'login' ? 'Login' : 'Create Account';
    }
  });

  // allow Enter key
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('auth-submit').click();
  });
}

// ─────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ─────────────────────────────────────────────────────
//  LOAD FEED — fetch posts from backend
// ─────────────────────────────────────────────────────
async function loadFeed() {
  setLoading(true);
  try {
    const res   = await fetch(`${API}/posts`, {
      headers: getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {},
    });
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    document.getElementById('feed').innerHTML =
      `<div class="empty-state"><p>Could not load posts. Is the backend running?</p></div>`;
  } finally {
    setLoading(false);
  }
}

// ─────────────────────────────────────────────────────
//  RENDER POSTS (same structure as before, same CSS classes)
// ─────────────────────────────────────────────────────
function renderPosts(posts) {
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  if (!posts.length) {
    feed.innerHTML = `<div class="empty-state"><div class="big-icon">🌌</div><p>No posts yet. Be the first!</p></div>`;
    return;
  }

  posts.forEach((post, idx) => {
    const card = document.createElement('div');
    card.className = 'post-card';

    const header  = document.createElement('div');  header.className  = 'post-header';
    const headerL = document.createElement('div');  headerL.className = 'post-header-left';

    const av = document.createElement('div');
    av.className = 'avatar';
    av.style.cssText = 'width:32px;height:32px;font-size:12px;';
    av.textContent = post.username.slice(0, 2).toUpperCase();

    const uInfo = document.createElement('div');
    const uName = document.createElement('div');  uName.className = 'post-user';  uName.textContent = post.username;
    const uTime = document.createElement('div');  uTime.className = 'timestamp';
    const d     = new Date(post.createdAt);
    let ts = d.toLocaleString([], { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true });
    if (post.edited) ts += ' · edited';
    uTime.textContent = ts;
    uInfo.appendChild(uName); uInfo.appendChild(uTime);
    headerL.appendChild(av); headerL.appendChild(uInfo);

    const menuBtn = document.createElement('button'); menuBtn.className = 'menu-btn'; menuBtn.textContent = '⋯';
    const dd      = document.createElement('div');    dd.className      = 'dropdown';
    const editOpt = document.createElement('div');    editOpt.className = 'dropdown-item'; editOpt.innerHTML = '<span>✏️</span> Edit post';
    const delOpt  = document.createElement('div');    delOpt.className  = 'dropdown-item danger'; delOpt.innerHTML = '<span>🗑️</span> Delete post';
    dd.appendChild(editOpt); dd.appendChild(delOpt);
    header.appendChild(headerL); header.appendChild(menuBtn);
    card.appendChild(header); card.appendChild(dd);

    const textEl = document.createElement('div'); textEl.className = 'post-text'; textEl.textContent = post.text;
    card.appendChild(textEl);

    const acts    = document.createElement('div');    acts.className    = 'post-actions';
    const likeBtn = document.createElement('button'); likeBtn.className = 'action-btn like-btn' + (post.liked ? ' liked' : '');
    likeBtn.innerHTML = `<span class="icon">❤</span> <span>${post.likes}</span>`;
    const cmtBtn  = document.createElement('button'); cmtBtn.className  = 'action-btn';
    cmtBtn.innerHTML = `<span class="icon">💬</span> <span>${post.comments.length}</span>`;
    acts.appendChild(likeBtn); acts.appendChild(cmtBtn);
    card.appendChild(acts);

    const cmtSection = document.createElement('div'); cmtSection.className = 'comment-section';
    const inner      = document.createElement('div'); inner.className      = 'comments-inner';

    post.comments.forEach(c => {
      const row = document.createElement('div'); row.className = 'single-comment';
      row.innerHTML = `
        <div class="comment-avatar">${(c.username||'?').slice(0,1).toUpperCase()}</div>
        <div class="comment-body">
          <div class="comment-text"><strong>${c.username}</strong> ${c.text}</div>
          <div class="comment-time">${c.time}</div>
        </div>`;
      inner.appendChild(row);
    });

    const inRow  = document.createElement('div');    inRow.className  = 'comment-input-row';
    const cInput = document.createElement('input');  cInput.className = 'comment-input'; cInput.placeholder = 'Add a comment...';
    const repBtn = document.createElement('button'); repBtn.className = 'reply-btn'; repBtn.textContent = 'Reply';
    inRow.appendChild(cInput); inRow.appendChild(repBtn);
    inner.appendChild(inRow); cmtSection.appendChild(inner); card.appendChild(cmtSection);

    // ── EVENTS ──────────────────────────────────────

    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      dd.classList.toggle('show');
      card.classList.toggle('active');
    });

    // DELETE POST
    delOpt.addEventListener('click', async () => {
      if (!currentUser) { showToast('Please log in first.'); return; }
      if (!confirm('Delete this post?')) return;
      try {
        const res = await fetch(`${API}/posts/${post.id}`, {
          method: 'DELETE', headers: authHeaders(),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        showToast('Post deleted');
        loadFeed();
      } catch (err) { showToast(err.message); }
    });

    // EDIT POST
    editOpt.addEventListener('click', e => {
      if (!currentUser) { showToast('Please log in first.'); return; }
      e.stopPropagation(); dd.classList.remove('show');
      textEl.contentEditable = true; textEl.focus();
      const range = document.createRange(); range.selectNodeContents(textEl); range.collapse(false);
      window.getSelection().removeAllRanges(); window.getSelection().addRange(range);

      textEl.addEventListener('blur', async function () {
        const newText = textEl.innerText.trim();
        textEl.contentEditable = false;
        if (!newText || newText === post.text) return;
        try {
          const res = await fetch(`${API}/posts/${post.id}`, {
            method: 'PUT', headers: authHeaders(), body: JSON.stringify({ text: newText }),
          });
          if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
          showToast('Post updated');
          loadFeed();
        } catch (err) { showToast(err.message); textEl.textContent = post.text; }
      }, { once: true });

      textEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }});
    });

    // LIKE
    likeBtn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!currentUser) { showToast('Log in to like posts.'); return; }
      try {
        const res  = await fetch(`${API}/posts/${post.id}/like`, { method: 'PUT', headers: authHeaders() });
        const data = await res.json();
        // optimistic update without full re-render
        post.liked = data.liked; post.likes = data.likes;
        likeBtn.className = 'action-btn like-btn' + (data.liked ? ' liked' : '');
        likeBtn.innerHTML = `<span class="icon">❤</span> <span>${data.likes}</span>`;
      } catch (err) { showToast('Could not like post.'); }
    });

    // COMMENT TOGGLE
    cmtBtn.addEventListener('click', e => { e.stopPropagation(); cmtSection.classList.toggle('open'); });

    // ADD COMMENT
    repBtn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!currentUser) { showToast('Log in to comment.'); return; }
      if (!cInput.value.trim()) return;
      try {
        const res  = await fetch(`${API}/posts/${post.id}/comments`, {
          method: 'POST', headers: authHeaders(), body: JSON.stringify({ text: cInput.value.trim() }),
        });
        const newComment = await res.json();
        // add comment to UI without full reload
        const row = document.createElement('div'); row.className = 'single-comment';
        row.innerHTML = `
          <div class="comment-avatar">${newComment.username.slice(0,1).toUpperCase()}</div>
          <div class="comment-body">
            <div class="comment-text"><strong>${newComment.username}</strong> ${newComment.text}</div>
            <div class="comment-time">${newComment.time}</div>
          </div>`;
        inner.insertBefore(row, inRow);
        cInput.value = '';
        cmtBtn.innerHTML = `<span class="icon">💬</span> <span>${post.comments.length + 1}</span>`;
      } catch (err) { showToast('Could not add comment.'); }
    });

    cInput.addEventListener('keydown', e => { if (e.key === 'Enter') repBtn.click(); });
    feed.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────
//  TEXTAREA AUTO-RESIZE
// ─────────────────────────────────────────────────────
const postInput = document.getElementById('postInput');
postInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// ─────────────────────────────────────────────────────
//  POST BUTTON
// ─────────────────────────────────────────────────────
document.getElementById('postBtn').addEventListener('click', async () => {
  if (!currentUser) { showToast('Please log in to post.'); return; }
  const text = postInput.value.trim();
  if (!text) return;

  try {
    const res  = await fetch(`${API}/posts`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ text }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    postInput.value = ''; postInput.style.height = 'auto';
    showToast('Posted! ✦');
    loadFeed();
  } catch (err) { showToast(err.message); }
});

// ─────────────────────────────────────────────────────
//  SIDEBAR
// ─────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const openBtn = document.getElementById('openSidebar');
openBtn.addEventListener('click', e => { e.stopPropagation(); sidebar.classList.add('active'); });
document.addEventListener('click', e => {
  if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) sidebar.classList.remove('active');
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Log out?')) logout();
});

// ─────────────────────────────────────────────────────
//  INITIALISE
// ─────────────────────────────────────────────────────
if (!currentUser) {
  showAuthModal();   // not logged in → show login/register
} else {
  updateNavUI();     // already logged in → set up nav
  loadFeed();        // load posts from API
}
