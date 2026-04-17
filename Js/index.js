

// --- USERNAME ---
let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Welcome to MUniverse! Enter your username:") || "Guest";
  localStorage.setItem("username", username);
}
const initials = username.slice(0,2).toUpperCase();
document.getElementById('createAvatar').textContent = initials;
document.getElementById('sidebarAvatar').textContent = initials;
document.getElementById('sidebarName').textContent = username;
document.getElementById('createLabel').textContent = `Hey ${username}, what's on your mind?`;
document.getElementById('openSidebar').textContent = initials.slice(0,1);

// --- STATE ---
let posts = JSON.parse(localStorage.getItem("posts")) || [];

// --- TOAST ---
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// --- TEXTAREA AUTO-RESIZE ---
const postInput = document.getElementById("postInput");
postInput.addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// --- RENDER ---
function renderPosts() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  const sorted = [...posts].sort((a,b) => b.createdAt - a.createdAt);

  if (sorted.length === 0) {
    feed.innerHTML = `<div class="empty-state"><div class="big-icon">🌌</div><p>No posts yet. Be the first to post!</p></div>`;
    return;
  }

  sorted.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";

    // Header
    const header = document.createElement("div");
    header.className = "post-header";
    const headerLeft = document.createElement("div");
    headerLeft.className = "post-header-left";

    const av = document.createElement("div");
    av.className = "avatar";
    av.style.width = "32px"; av.style.height = "32px"; av.style.fontSize = "12px";
    av.textContent = post.username.slice(0,2).toUpperCase();

    const userInfo = document.createElement("div");
    const userEl = document.createElement("div");
    userEl.className = "post-user";
    userEl.textContent = post.username;
    const timeEl = document.createElement("div");
    timeEl.className = "timestamp";
    const d = new Date(post.createdAt);
    let timeStr = d.toLocaleString([], { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true });
    if (post.edited) timeStr += " · edited";
    timeEl.textContent = timeStr;

    userInfo.appendChild(userEl);
    userInfo.appendChild(timeEl);
    headerLeft.appendChild(av);
    headerLeft.appendChild(userInfo);

    const menuBtn = document.createElement("button");
    menuBtn.className = "menu-btn";
    menuBtn.textContent = "⋯";
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";

    const editOpt = document.createElement("div");
    editOpt.className = "dropdown-item";
    editOpt.innerHTML = `<span>✏️</span> Edit post`;
    const delOpt = document.createElement("div");
    delOpt.className = "dropdown-item danger";
    delOpt.innerHTML = `<span>🗑️</span> Delete post`;

    dropdown.appendChild(editOpt);
    dropdown.appendChild(delOpt);
    header.appendChild(headerLeft);
    header.appendChild(menuBtn);
    card.appendChild(header);
    card.appendChild(dropdown);

    // Text
    const textEl = document.createElement("div");
    textEl.className = "post-text";
    textEl.textContent = post.text;
    card.appendChild(textEl);

    // Actions
    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likeBtn = document.createElement("button");
    likeBtn.className = "action-btn like-btn" + (post.liked ? " liked" : "");
    likeBtn.innerHTML = `<span class="icon">❤</span> <span class="lc">${post.likes ?? 0}</span>`;

    const commentBtn = document.createElement("button");
    commentBtn.className = "action-btn";
    commentBtn.innerHTML = `<span class="icon">💬</span> <span class="cc">${post.comments?.length || 0}</span>`;

    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    card.appendChild(actions);

    // Comment section
    const commentSection = document.createElement("div");
    commentSection.className = "comment-section";
    const inner = document.createElement("div");
    inner.className = "comments-inner";

    (post.comments || []).forEach(c => {
      const row = document.createElement("div");
      row.className = "single-comment";
      row.innerHTML = `
        <div class="comment-avatar">${c.username ? c.username.slice(0,1).toUpperCase() : '?'}</div>
        <div class="comment-body">
          <div class="comment-text">${c.text}</div>
          <div class="comment-time">${c.time}</div>
        </div>`;
      inner.appendChild(row);
    });

    const inputRow = document.createElement("div");
    inputRow.className = "comment-input-row";
    const cInput = document.createElement("input");
    cInput.className = "comment-input";
    cInput.placeholder = "Add a comment...";
    const replyBtn = document.createElement("button");
    replyBtn.className = "reply-btn";
    replyBtn.textContent = "Reply";
    inputRow.appendChild(cInput);
    inputRow.appendChild(replyBtn);
    inner.appendChild(inputRow);
    commentSection.appendChild(inner);
    card.appendChild(commentSection);

    // --- EVENTS ---
    menuBtn.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
      card.classList.toggle("active");
    });

    delOpt.addEventListener("click", () => {
      if (!confirm("Delete this post?")) return;
      posts = posts.filter(p => p.id !== post.id);
      localStorage.setItem("posts", JSON.stringify(posts));
      showToast("Post deleted");
      renderPosts();
    });

    editOpt.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.classList.remove("show");
      textEl.contentEditable = true;
      textEl.focus();
      const range = document.createRange();
      range.selectNodeContents(textEl);
      range.collapse(false);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      textEl.addEventListener("blur", function() {
        const newText = textEl.innerText.trim();
        post.text = newText || post.text;
        post.edited = true;
        post.editedAt = Date.now();
        textEl.contentEditable = false;
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts();
      }, { once: true });
      textEl.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); textEl.blur(); }});
    });

    likeBtn.addEventListener("click", e => {
      e.stopPropagation();
      post.liked = !post.liked;
      post.likes = (post.likes ?? 0) + (post.liked ? 1 : -1);
      localStorage.setItem("posts", JSON.stringify(posts));
      renderPosts();
    });

    commentBtn.addEventListener("click", e => {
      e.stopPropagation();
      commentSection.classList.toggle("open");
    });

    replyBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (!cInput.value.trim()) return;
      if (!post.comments) post.comments = [];
      post.comments.push({
        id: Date.now(),
        username: username,
        text: cInput.value.trim(),
        time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:true })
      });
      localStorage.setItem("posts", JSON.stringify(posts));
      renderPosts();
      // re-open comment section
      setTimeout(() => {
        const cards = document.querySelectorAll(".post-card");
        // find matching
      }, 50);
    });

    cInput.addEventListener("keydown", e => { if (e.key === "Enter") replyBtn.click(); });

    feed.appendChild(card);
  });
}

// --- POST BTN ---
document.getElementById("postBtn").addEventListener("click", () => {
  const text = postInput.value.trim();
  if (!text) return;
  posts.push({ id:Date.now(), username, text, likes:0, liked:false, comments:[], createdAt:Date.now() });
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
  postInput.value = "";
  postInput.style.height = "auto";
  showToast("Posted! ✦");
});

// --- SIDEBAR ---
const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
openBtn.addEventListener("click", e => { e.stopPropagation(); sidebar.classList.add("active"); });
document.addEventListener("click", e => {
  if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) sidebar.classList.remove("active");
  document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("show"));
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  if (confirm("Log out?")) {
    localStorage.removeItem("username");
    location.reload();
  }
});

renderPosts();