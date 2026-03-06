function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function shell(title, active, content, csrfToken = '') {
  return `
    <!DOCTYPE html>
    <html>
    <head>
    
  <meta charset="UTF-8">
  <title>${title}</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: white;
}

/* NAVIGATION */
nav {
  background: #111;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

nav form {
  margin-left: auto;
}

nav button {
  background: #e53935;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

main {
  padding: 40px;
}

h1 {
  margin-top: 0;
}

/* BUTTONS */
.btn {
  background: #111;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn--secondary {
  background: #555;
}

.btn--small {
  padding: 4px 8px;
  font-size: 13px;
}

/* GLASS CARD */
.card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.5);
}

/* TABLE DARK */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: white;
}

th, td {
  padding: 12px;
  text-align: left;
}

thead {
  background: rgba(255,255,255,0.15);
}

tbody tr {
  background: rgba(255,255,255,0.05);
}

tbody tr:nth-child(even) {
  background: rgba(255,255,255,0.08);
}

/* BADGES */
.tag {
  background: #4caf50;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tag--off {
  background: #ff9800;
}

/* ANIMATION */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s ease forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
  .btn--primary {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 242, 254, 0.4);
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 242, 254, 0.6);
}
</style>
  
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
    <body>

      <nav>
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/messages">Messages</a>
        <a href="/admin/services">Services</a>

        <form method="POST" action="/auth/logout" style="display:inline;">
          <input type="hidden" name="_csrf" value="${csrfToken}" />
          <button type="submit">Déconnexion</button>
        </form>
      </nav>

      <main>
        ${content}
      </main>

    </body>
    </html>
  `;
}

module.exports = {
  shell,
  escapeHtml
};