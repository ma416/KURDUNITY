import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const DISCORD_INVITE = "https://discord.gg/8dneyD2U";

const firebaseConfig = {
  apiKey: "AIzaSyBlv6kWlW6J3GJfWgSvtW6AG3iD8ZhcoFo",
  authDomain: "kurdistan-unity.firebaseapp.com",
  projectId: "kurdistan-unity",
  storageBucket: "kurdistan-unity.firebasestorage.app",
  messagingSenderId: "318084941464",
  appId: "1:318084941464:web:67e976d1272fea8cbe32ed",
  measurementId: "G-XWWXXRZ0SN"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const adminLoginView = document.getElementById('adminLoginView');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginState = document.getElementById('adminLoginState');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminSessionLabel = document.getElementById('adminSessionLabel');
const statUsers = document.getElementById('statUsers');
const statAdmins = document.getElementById('statAdmins');
const statMembers = document.getElementById('statMembers');
const roleAssignForm = document.getElementById('roleAssignForm');
const roleAssignState = document.getElementById('roleAssignState');
const roleUsersList = document.getElementById('roleUsersList');
const websiteAccountsList = document.getElementById('websiteAccountsList');
const accountSearchInput = document.getElementById('accountSearchInput');
const accountDirectoryState = document.getElementById('accountDirectoryState');
const siteContentForm = document.getElementById('siteContentForm');
const siteContentState = document.getElementById('siteContentState');
const refreshAdminData = document.getElementById('refreshAdminData');
const adminActionState = document.getElementById('adminActionState');
const applications = document.getElementById('applications');

const siteContentInputs = {
  homeHeroTitle: document.getElementById('homeHeroTitle'),
  homeHeroText: document.getElementById('homeHeroText'),
  shopTitle: document.getElementById('shopTitle'),
  shopIntro: document.getElementById('shopIntro'),
  staffTitle: document.getElementById('staffTitle'),
  staffIntro: document.getElementById('staffIntro'),
  adminTitle: document.getElementById('adminTitleInput'),
  adminIntro: document.getElementById('adminIntroInput')
};

const adminState = {
  connected: false,
  username: '',
  defaultAdminUsername: '',
  adminConfigured: false,
  cachedUsers: []
};

function getBackendBase() {
  const metaBase = document.querySelector('meta[name="discord-backend"]')?.content?.trim();
  if (metaBase && metaBase !== 'auto') return metaBase.replace(/\/$/, '');

  if (window.location.port === '3000') return window.location.origin;

  const host = window.location.hostname || '127.0.0.1';
  if (host === '127.0.0.1' || host === 'localhost') {
    return `${window.location.protocol}//${host}:3000`;
  }

  return window.location.origin;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const raw = await response.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { message: raw };
    }
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed: ${response.status}`);
  }

  return data;
}

function setLoginState(message, isError = false) {
  if (!adminLoginState) return;
  adminLoginState.textContent = message;
  adminLoginState.classList.toggle('error-pill', Boolean(isError));
}

function setActionState(message, isError = false) {
  if (!adminActionState) return;
  adminActionState.textContent = message;
  adminActionState.classList.toggle('error-pill', Boolean(isError));
}

function toggleAdminViews() {
  if (adminLoginView) adminLoginView.classList.toggle('admin-hidden', adminState.connected);
  if (adminDashboard) adminDashboard.classList.toggle('admin-hidden', !adminState.connected);
  if (adminSessionLabel) adminSessionLabel.textContent = adminState.connected ? adminState.username : 'Not connected';
}

function renderUsers(users = []) {
  if (!roleUsersList) return;

  if (!users.length) {
    roleUsersList.innerHTML = '<p class="muted-note">هێشتا هیچ بەکارهێنەرێک نییە. سەرەتا user بە Discord بچێتە ژوورەوە یان بە ID role بۆ دروست بکە.</p>';
    return;
  }

  roleUsersList.innerHTML = users.map((user) => `
    <article class="feed-item glass user-role-card">
      <div class="user-role-top">
        <div>
          <strong>${escapeHtml(user.name || 'Discord User')}</strong>
          <p class="muted-note">ID: ${escapeHtml(user.id || '-')}</p>
        </div>
        <span class="role-badge ${user.accessRole === 'admin' ? 'admin' : 'support'}">${user.accessRole === 'admin' ? 'Admin' : 'KU Member'}</span>
      </div>
      <p><strong>Profile Role:</strong> ${escapeHtml(user.role || '-')}</p>
      <p><strong>Permissions:</strong> ${Array.isArray(user.permissions) ? escapeHtml(user.permissions.join(', ')) : '-'}</p>
      <div class="inline-role-actions">
        <select data-user-role="${escapeHtml(user.id)}">
          <option value="ku_member" ${user.accessRole === 'ku_member' ? 'selected' : ''}>KU Member</option>
          <option value="admin" ${user.accessRole === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        <button class="btn btn-secondary" type="button" data-save-role="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.name || 'Discord User')}">Update</button>
      </div>
    </article>
  `).join('');

  roleUsersList.querySelectorAll('[data-save-role]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const userId = btn.getAttribute('data-save-role') || '';
      const userName = btn.getAttribute('data-user-name') || 'Discord User';
      const select = roleUsersList.querySelector(`[data-user-role="${CSS.escape(userId)}"]`);
      if (!(select instanceof HTMLSelectElement)) return;
      await updateUserRole(userId, select.value, userName);
    });
  });
}

function renderAccountDirectory(users = [], query = '') {
  if (!websiteAccountsList || !accountDirectoryState) return;

  const normalizedQuery = String(query || '').trim().toLowerCase();
  const filtered = users.filter((user) => {
    const name = String(user.name || '').toLowerCase();
    const id = String(user.id || '').toLowerCase();
    return !normalizedQuery || name.includes(normalizedQuery) || id.includes(normalizedQuery);
  });

  accountDirectoryState.textContent = filtered.length
    ? `${filtered.length} account دۆزرایەوە`
    : 'هیچ account ـێک بەم گەڕانە نەدۆزرایەوە';

  if (!filtered.length) {
    websiteAccountsList.innerHTML = '<p class="muted-note">هێشتا هیچ account ـێک نەدۆزرایەوە یان ئەم گەڕانە هیچ ئەنجامێکی نییە.</p>';
    return;
  }

  websiteAccountsList.innerHTML = filtered.map((user, index) => `
    <article class="feed-item glass user-role-card">
      <div class="user-role-top">
        <div>
          <strong>${index + 1}. ${escapeHtml(user.name || 'Discord User')}</strong>
          <p class="muted-note">ID: ${escapeHtml(user.id || '-')}</p>
        </div>
        <span class="role-badge ${user.accessRole === 'admin' ? 'admin' : 'support'}">${user.accessRole === 'admin' ? 'Admin' : 'KU Member'}</span>
      </div>
    </article>
  `).join('');
}

function fillSiteContentForm(content = {}) {
  Object.entries(siteContentInputs).forEach(([key, input]) => {
    if (input) input.value = content[key] || '';
  });
}

async function loadAdminSession() {
  try {
    const session = await fetchJson(`${getBackendBase()}/api/admin/session`, { method: 'GET' });
    adminState.connected = Boolean(session.connected);
    adminState.username = String(session.username || '');
    adminState.defaultAdminUsername = String(session.defaultAdminUsername || '');
    adminState.adminConfigured = Boolean(session.adminConfigured);
  } catch (error) {
    console.error('Admin session error:', error);
    adminState.connected = false;
    adminState.username = '';
    adminState.adminConfigured = false;
  }

  toggleAdminViews();

  if (!adminState.connected) {
    if (!adminState.adminConfigured) {
      setLoginState('Admin login لە .env دیاری نەکراوە. سەرەتا ADMIN_USERNAME و ADMIN_PASSWORD دابنێ.');
    } else {
      setLoginState(`login بکە${adminState.defaultAdminUsername ? ` • username: ${adminState.defaultAdminUsername}` : ''}`);
    }
  } else {
    setActionState(`Welcome ${adminState.username} — full admin access active`);
  }
}

async function loadStats() {
  if (!adminState.connected) return;
  try {
    const data = await fetchJson(`${getBackendBase()}/api/admin/stats`, { method: 'GET' });
    if (statUsers) statUsers.textContent = String(data.stats?.totalUsers ?? 0);
    if (statAdmins) statAdmins.textContent = String(data.stats?.admins ?? 0);
    if (statMembers) statMembers.textContent = String(data.stats?.kuMembers ?? 0);
  } catch (error) {
    console.error('Stats error:', error);
    setActionState('ناتوانرێت stats بخوێندرێتەوە', true);
  }
}

async function loadUsers() {
  if (!adminState.connected) return;
  try {
    const data = await fetchJson(`${getBackendBase()}/api/admin/users`, { method: 'GET' });
    const users = Array.isArray(data.users) ? data.users : [];
    adminState.cachedUsers = users;
    renderUsers(users);
    renderAccountDirectory(users, accountSearchInput?.value || '');
  } catch (error) {
    console.error('Users error:', error);
    adminState.cachedUsers = [];
    if (roleUsersList) roleUsersList.innerHTML = '<p class="muted-note">هەڵەیەک ڕوویدا لە خوێندنەوەی user ـەکان.</p>';
    if (websiteAccountsList) websiteAccountsList.innerHTML = '<p class="muted-note">هەڵەیەک ڕوویدا لە خوێندنەوەی account ـەکان.</p>';
    if (accountDirectoryState) accountDirectoryState.textContent = 'هەڵەیەک ڕوویدا';
  }
}

async function loadSiteContentAdmin() {
  if (!adminState.connected) return;
  try {
    const data = await fetchJson(`${getBackendBase()}/api/admin/site-content`, { method: 'GET' });
    fillSiteContentForm(data.content || {});
  } catch (error) {
    console.error('Site content error:', error);
    if (siteContentState) siteContentState.textContent = 'ناتوانرێت content بخوێندرێتەوە';
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendWebhookMessage(content) {
  try {
    await fetchJson(`${getBackendBase()}/api/admin/staff-webhook`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return true;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}

function getDecisionMessage(status, applicantName) {
  if (status === 'accepted') {
    return `سڵاو ${applicantName}، قبوڵ کرایت، تکایە سەردانی چەناڵی ستاف ڤۆیس بکە بۆ وەرگرتن. Discord: ${DISCORD_INVITE}`;
  }
  return `سڵاو ${applicantName}، ببورە وەر نەگیرایت.`;
}

async function handleDecision(id, applicantName, discordName, status, card) {
  const decisionMessage = getDecisionMessage(status, applicantName);

  try {
    await updateDoc(doc(db, 'staffApplications', id), {
      status,
      decisionMessage,
      decisionAt: Date.now()
    });

    const sent = await sendWebhookMessage(
      `📨 Staff Application Update\nName: ${applicantName}\nDiscord: ${discordName}\nStatus: ${status}\nMessage: ${decisionMessage}`
    );

    const statusEl = card.querySelector('[data-role="status"]');
    const messageEl = card.querySelector('[data-role="message"]');
    const actionsEl = card.querySelector('[data-role="actions"]');
    if (statusEl) statusEl.textContent = status === 'accepted' ? 'قبوڵ کراوە' : 'قبوڵ نەکراوە';
    if (messageEl) messageEl.textContent = decisionMessage + (sent ? ' • Discord webhook نێردرا' : '');
    if (actionsEl) actionsEl.innerHTML = '<span class="status-pill">بڕیار نێردرا</span>';

    alert(status === 'accepted' ? 'قبوڵ کرا و نامە ئامادە کرا ✅' : 'قبوڵ نەکرا و نامە ئامادە کرا ❌');
  } catch (error) {
    console.error('Decision error:', error);
    alert('هەڵەیەک ڕوویدا لە ناردنی بڕیار');
  }
}

async function loadApplications() {
  if (!applications || !adminState.connected) return;

  applications.innerHTML = "<p class='muted-note'>Loading...</p>";

  try {
    const snapshot = await getDocs(collection(db, 'staffApplications'));
    applications.innerHTML = '';

    if (snapshot.empty) {
      applications.innerHTML = "<p class='muted-note'>هێشتا هیچ staff application نییە.</p>";
      return;
    }

    const docs = snapshot.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .sort((a, b) => (b.time || 0) - (a.time || 0));

    docs.forEach((data) => {
      const card = document.createElement('article');
      card.className = 'glass panel top-space';
      const statusMap = {
        pending: 'چاوەڕوانی',
        accepted: 'قبوڵ کراوە',
        rejected: 'قبوڵ نەکراوە'
      };
      const currentStatus = statusMap[data.status] || 'چاوەڕوانی';
      const currentMessage = data.decisionMessage || 'هێشتا هیچ نامەیەک نەنێردراوە.';

      card.innerHTML = `
        <div class="section-mini-head"><span>APPLICATION</span><h3>${escapeHtml(data.name || '')}</h3></div>
        <p><strong>Discord:</strong> ${escapeHtml(data.discord || '')}</p>
        <p><strong>Reason:</strong> ${escapeHtml(data.reason || '')}</p>
        <p><strong>Status:</strong> <span data-role="status">${currentStatus}</span></p>
        <p><strong>Message:</strong> <span data-role="message">${escapeHtml(currentMessage)}</span></p>
        <p class="muted-note">Time: ${data.time ? new Date(data.time).toLocaleString() : ''}</p>
        <div class="decision-actions" data-role="actions"></div>
      `;

      const actions = card.querySelector('[data-role="actions"]');

      if (data.status === 'accepted' || data.status === 'rejected') {
        actions.innerHTML = '<span class="status-pill">بڕیار دراوە</span>';
      } else {
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn btn-primary';
        acceptBtn.type = 'button';
        acceptBtn.textContent = 'قبوڵ کرایەوە';

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn btn-secondary';
        rejectBtn.type = 'button';
        rejectBtn.textContent = 'قبوڵ نەکرایەوە';

        acceptBtn.addEventListener('click', () => handleDecision(data.id, data.name || 'Applicant', data.discord || '-', 'accepted', card));
        rejectBtn.addEventListener('click', () => handleDecision(data.id, data.name || 'Applicant', data.discord || '-', 'rejected', card));

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
      }

      applications.appendChild(card);
    });
  } catch (error) {
    console.error('Load error:', error);
    applications.innerHTML = "<p class='muted-note'>هەڵەیەک ڕوویدا لە خوێندنەوەی داتا.</p>";
  }
}

async function updateUserRole(userId, accessRole, userName = 'Discord User') {
  try {
    await fetchJson(`${getBackendBase()}/api/admin/users/${encodeURIComponent(userId)}/role`, {
      method: 'POST',
      body: JSON.stringify({ accessRole, name: userName })
    });
    if (roleAssignState) roleAssignState.textContent = `${userName} -> ${accessRole === 'admin' ? 'Admin' : 'KU Member'} نوێکرایەوە ✅`;
    await Promise.all([loadStats(), loadUsers()]);
  } catch (error) {
    console.error('Role update error:', error);
    if (roleAssignState) roleAssignState.textContent = 'نوێکردنەوەی role سەرکەوتوو نەبوو';
  }
}

async function bootstrapDashboard() {
  if (!adminState.connected) return;
  await Promise.all([loadStats(), loadUsers(), loadSiteContentAdmin()]);
  await loadApplications();
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('adminUsername')?.value?.trim() || '';
    const password = document.getElementById('adminPassword')?.value || '';

    try {
      await fetchJson(`${getBackendBase()}/api/admin/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setLoginState('login سەرکەوتوو بوو ✅');
      await loadAdminSession();
      await bootstrapDashboard();
      adminLoginForm.reset();
    } catch (error) {
      console.error('Admin login error:', error);
      if (error.message === 'admin_not_configured') {
        setLoginState('Admin login لە .env دیاری نەکراوە.', true);
      } else if (error.message === 'too_many_attempts') {
        setLoginState('هەوڵی زۆر کراوە. دوای چەند خولەکێک دووبارە هەوڵ بدە.', true);
      } else {
        setLoginState('username/password هەڵەیە', true);
      }
    }
  });
}

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener('click', async () => {
    try {
      await fetchJson(`${getBackendBase()}/api/admin/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Admin logout error:', error);
    }

    adminState.connected = false;
    adminState.username = '';
    toggleAdminViews();
    setLoginState(adminState.adminConfigured ? `logout کرا${adminState.defaultAdminUsername ? ` • username: ${adminState.defaultAdminUsername}` : ''}` : 'Admin login لە .env دیاری نەکراوە.');
    setActionState('Admin session داخرا', false);
  });
}

if (roleAssignForm) {
  roleAssignForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = document.getElementById('roleUserId')?.value?.trim() || '';
    const name = document.getElementById('roleUserName')?.value?.trim() || 'Discord User';
    const accessRole = document.getElementById('roleSelect')?.value || 'ku_member';

    try {
      await fetchJson(`${getBackendBase()}/api/admin/users/upsert`, {
        method: 'POST',
        body: JSON.stringify({ id, name, accessRole })
      });
      if (roleAssignState) roleAssignState.textContent = `${name} بە سەرکەوتوویی بوو بە ${accessRole === 'admin' ? 'Admin' : 'KU Member'} ✅`;
      roleAssignForm.reset();
      await Promise.all([loadStats(), loadUsers()]);
    } catch (error) {
      console.error('Role assign error:', error);
      if (roleAssignState) roleAssignState.textContent = 'زیادکردنی role سەرکەوتوو نەبوو';
    }
  });
}

if (siteContentForm) {
  siteContentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(siteContentInputs).map(([key, input]) => [key, input?.value || ''])
    );

    try {
      await fetchJson(`${getBackendBase()}/api/admin/site-content`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (siteContentState) siteContentState.textContent = 'content ـی website پاشەکەوت کرا ✅';
      setActionState('website content نوێکرایەوە');
    } catch (error) {
      console.error('Site content save error:', error);
      if (siteContentState) siteContentState.textContent = 'پاشەکەوتکردنی content سەرکەوتوو نەبوو';
    }
  });
}

if (refreshAdminData) {
  refreshAdminData.addEventListener('click', async () => {
    await bootstrapDashboard();
    setActionState('داتا نوێکرایەوە');
  });
}

if (accountSearchInput) {
  accountSearchInput.addEventListener('input', () => {
    renderAccountDirectory(adminState.cachedUsers, accountSearchInput.value);
  });
}

function initAdminUI() {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

async function bootstrap() {
  initAdminUI();
  await loadAdminSession();
  if (adminState.connected) {
    await bootstrapDashboard();
  }
}

bootstrap();
