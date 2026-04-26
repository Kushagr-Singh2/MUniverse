# MUniverse Backend — Setup Guide

## Your folder structure when done

```
muniverse/
│
├── frontend/              ← your existing HTML/CSS/JS files
│   ├── index.html
│   ├── css/index.css
│   ├── js/index.js        ← REPLACE with frontend-index.js
│   └── images/
│
└── muniverse-backend/     ← this new folder
    ├── package.json
    ├── .env
    └── src/
        ├── server.js
        ├── models/
        │   ├── User.js
        │   └── Post.js
        ├── routes/
        │   ├── auth.js
        │   └── posts.js
        └── middleware/
            └── auth.js
```

---

## STEP 1 — Install Node.js

Download from: https://nodejs.org  
Pick the LTS version. Run installer. Done.

Check it worked: open terminal and type:
```
node --version
npm --version
```
Both should print a version number.

---

## STEP 2 — Get MongoDB Atlas (free cloud database)

1. Go to https://mongodb.com/atlas and sign up free
2. Create a free cluster (M0 — the free tier is plenty)
3. Click "Connect" → "Connect your application"
4. Copy the connection string. It looks like:
   `mongodb+srv://yourname:yourpassword@cluster0.abcde.mongodb.net/`
5. Paste it into your `.env` file as MONGO_URI
6. Replace `<password>` in the string with your actual password
7. In Atlas → Security → Network Access → Add IP Address → Allow Access From Anywhere

---

## STEP 3 — Install backend dependencies

Open terminal, navigate to this folder:
```bash
cd muniverse-backend
npm install
```
This reads package.json and installs all libraries into a node_modules folder.

---

## STEP 4 — Start the backend

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

Test it: open http://localhost:5000/api/health in your browser.
You should see: `{ "status": "MUniverse API is running 🚀" }`

---

## STEP 5 — Connect frontend

1. Copy `frontend-index.js` → paste into your `js/index.js` (replace old file)
2. Open your frontend with Live Server (VS Code extension)
   - Right click index.html → "Open with Live Server"
   - It runs at http://127.0.0.1:5500

3. Make sure .env has:  CLIENT_URL=http://127.0.0.1:5500
   (this is the CORS setting that allows your frontend to talk to backend)

Now open your site. You'll see a login/register popup. Create an account and start posting!

---

## How the connection works (the simple version)

```
Browser (your HTML/CSS/JS)
    │
    │  fetch('http://localhost:5000/api/posts')
    │  ───────────────────────────────────────►
    │                                          Express Server (Node.js)
    │                                               │
    │                                               │  Post.find()
    │                                               │  ──────────►
    │                                               │              MongoDB Atlas
    │                                               │  ◄──────────
    │                                               │  returns posts
    │  ◄───────────────────────────────────────
    │  gets back JSON array of posts
    │
  renderPosts() draws them on screen
```

---

## API Reference — what endpoints exist

| Method | URL                              | Auth? | What it does            |
|--------|----------------------------------|-------|-------------------------|
| POST   | /api/auth/register               | No    | Create new account      |
| POST   | /api/auth/login                  | No    | Login, get token        |
| GET    | /api/auth/me                     | Yes   | Get current user        |
| GET    | /api/posts                       | No    | Get all posts           |
| POST   | /api/posts                       | Yes   | Create a post           |
| PUT    | /api/posts/:id                   | Yes   | Edit a post             |
| DELETE | /api/posts/:id                   | Yes   | Delete a post           |
| PUT    | /api/posts/:id/like              | Yes   | Toggle like             |
| POST   | /api/posts/:id/comments          | Yes   | Add a comment           |
| DELETE | /api/posts/:id/comments/:cid     | Yes   | Delete a comment        |

"Auth? Yes" means you must send the token in the Authorization header.

---

## Common errors and fixes

**"Cannot connect to MongoDB"**
→ Check your MONGO_URI in .env. Check your Atlas password has no special characters, or URL-encode them.

**"CORS error" in browser console**
→ Make sure CLIENT_URL in .env matches exactly where your frontend runs (check port number).

**"Token expired"**
→ Log out and log in again. JWT_EXPIRE in .env controls how long tokens last.

**Posts not showing**
→ Open browser DevTools → Network tab → look at the /api/posts request → check what error comes back.
