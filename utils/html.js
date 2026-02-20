const MessageModel = require('../models/MessageModel');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function shell(title, active, content) {
  return new Promise((resolve) => {

    MessageModel.countUnread((err, unreadCount = 0) => {

      const messagesLink = `
        <a href="/admin/messages" ${active === 'messages' ? 'class="active"' : ''}>
          Messages
          ${
            unreadCount > 0
              ? `<span class="notif-badge" id="notifBadge">${unreadCount}</span>`
              : ''
          }
        </a>
      `;

      resolve(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="/css/style.css">
<style>
.topbar{
  background:#0b0b0b;
  color:#fff;
  padding:18px 0;
}
.topbar__inner{
  max-width:1100px;
  margin:0 auto;
  padding:0 18px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
.nav a{
  color:#fff;
  margin-left:18px;
  text-decoration:none;
  position:relative;
}
.nav a.active{
  text-decoration:underline;
}
.page{
  max-width:1100px;
  margin:22px auto;
  padding:0 18px;
}
.card{
  background:#fff;
  border-radius:14px;
  padding:18px;
}

/* BADGE */
.notif-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#ef4444;
  color:#fff;
  font-size:12px;
  font-weight:700;
  min-width:20px;
  height:20px;
  padding:0 6px;
  border-radius:999px;
  margin-left:6px;
  animation:pulse 1.6s infinite;
}

/* PULSE */
@keyframes pulse{
  0%{transform:scale(1)}
  50%{transform:scale(1.15)}
  100%{transform:scale(1)}
}

/* BOUNCE AU CHARGEMENT */
.bounce{
  animation:bounce .6s ease;
}

@keyframes bounce{
  0%{transform:scale(1)}
  30%{transform:scale(1.4)}
  60%{transform:scale(.9)}
  100%{transform:scale(1)}
}
  .live-toast{
  position:fixed;
  bottom:30px;
  right:30px;
  background:#111;
  color:#fff;
  padding:14px 18px;
  border-radius:12px;
  box-shadow:0 15px 40px rgba(0,0,0,.2);
  opacity:0;
  transform:translateY(20px);
  transition:all .4s ease;
  z-index:9999;
}
.live-toast.show{
  opacity:1;
  transform:translateY(0);
}

</style>
</head>
<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();

socket.on('newMessage', async () => {

  // rafraîchir badge
  await refreshUnreadCount();

  // toast
  const toast = document.createElement('div');
  toast.className = 'live-toast';
  toast.innerHTML = "📩 Nouveau message reçu";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  setTimeout(() => {
    toast.remove();
  }, 4000);
});
</script>

<body>

<header class="topbar">
  <div class="topbar__inner">
    <div>Cabinet IT — Admin</div>
    <nav class="nav">
  ${messagesLink}
  <a href="/admin/settings" ${active === 'settings' ? 'class="active"' : ''}>Paramètres</a>
  <a href="/">Site</a>

  <form method="POST" action="/auth/logout" style="display:inline; margin-left:18px;">
    <button style="
      background:#ef4444;
      color:#fff;
      border:none;
      padding:6px 12px;
      border-radius:6px;
      cursor:pointer;
    ">
      Déconnexion
    </button>
  </form>
</nav>

  </div>
</header>

<main class="page">
  <div class="card">
    ${content}
  </div>
</main>

<script>
async function refreshUnreadCount(){
  try{
    const res = await fetch('/admin/api/unread-count');
    const data = await res.json();

    let badge = document.getElementById('notifBadge');

    if(data.count > 0){
      if(!badge){
        const link = document.querySelector('.nav a[href="/admin/messages"]');
        badge = document.createElement('span');
        badge.id = 'notifBadge';
        badge.className = 'notif-badge bounce';
        link.appendChild(badge);
      }
      badge.textContent = data.count;
    } else {
      if(badge){
        badge.remove();
      }
    }

  } catch(e){
    console.error('Erreur badge:', e);
  }
}

// première mise à jour
refreshUnreadCount();

// refresh toutes les 10 secondes
setInterval(refreshUnreadCount, 10000);
</script>

</body>
</html>`);
    });

  });
}

module.exports = { shell, escapeHtml };
