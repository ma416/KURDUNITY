import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
window.firebaseApp = firebaseApp;
window.firebaseDb = db;
console.log('Firebase connected');

const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const copyLink = document.getElementById('copyLink');
const revealItems = document.querySelectorAll('.reveal');
const counters = document.querySelectorAll('.counter');
const cursorGlow = document.querySelector('.cursor-glow');
const tiltCards = document.querySelectorAll('.tilt-card');
const authModal = document.getElementById('authModal');
const profileName = document.getElementById('profileName');
const authOpenButtons = [document.getElementById('authOpen'), document.getElementById('authOpen2')].filter(Boolean);
const authClose = document.getElementById('authClose');
const musicToggle = document.getElementById('musicToggle');
const profileRole = document.getElementById('profileRole');
const profileAvatarImg = document.getElementById('profileAvatarImg');
const profileAvatarWrap = document.getElementById('profileAvatarWrap');
const navProfileAvatar = document.getElementById('navProfileAvatar');
const navProfileLabel = document.getElementById('navProfileLabel');
const navProfileSub = document.getElementById('navProfileSub');
const profilePreviewAvatar = document.getElementById('profilePreviewAvatar');
const profileBanner = document.getElementById('profileBanner');
const profilePreviewBanner = document.getElementById('profilePreviewBanner');
const profilePreviewName = document.getElementById('profilePreviewName');
const profilePreviewRole = document.getElementById('profilePreviewRole');
const profileTags = [document.getElementById('profileTag1'), document.getElementById('profileTag2'), document.getElementById('profileTag3')];
const profileEditBtn = document.getElementById('profileEditBtn');
const profileForm = document.getElementById('profileForm');
const resetProfileBtn = document.getElementById('resetProfileBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const postForm = document.getElementById('postForm');
const feedList = document.getElementById('feedList');
const friendForm = document.getElementById('friendForm');
const friendList = document.getElementById('friendList');
const webhookForm = document.getElementById('webhookForm');
const webhookState = document.getElementById('webhookState');
const staffPosts = document.getElementById('staffPosts');
const applyForm = document.getElementById('applyForm');

const STORAGE = {
  posts: 'ku_posts',
  friends: 'ku_friends',
  profile: 'ku_profile',
  discordSession: 'ku_discord_session'
};

const DISCORD_INVITE = 'https://discord.gg/SPA8RXs9';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const DEFAULT_PROFILE = {
  name: 'Kurdistan unity',
  role: 'Unity Member',
  tags: ['FiveM Ready', 'Discord Sync', 'Kurdish unity']
};

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
}

if (copyLink) {
  copyLink.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('cfx.re/join/YOUR_SERVER_LINK');
      copyLink.textContent = 'کۆپی کرا';
    } catch {
      copyLink.textContent = 'Copy Error';
    }
    setTimeout(() => copyLink.textContent = 'Copy CFX', 1800);
  });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: .15 });
revealItems.forEach(item => revealObserver.observe(item));

function animateCounter(el) {
  const target = Number(el.dataset.target || 0);
  const start = performance.now();
  const duration = 1400;
  function frame(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .5 });
counters.forEach(counter => counterObserver.observe(counter));

if (cursorGlow) {
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });
}

tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 14;
    const rotateX = ((y / rect.height) - 0.5) * -14;
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

function openAuth() { if (authModal) authModal.classList.add('open'); }
function closeAuth() { if (authModal) authModal.classList.remove('open'); }
authOpenButtons.forEach(btn => btn.addEventListener('click', openAuth));
if (authClose) authClose.addEventListener('click', closeAuth);
if (authModal) authModal.addEventListener('click', e => { if (e.target === authModal) closeAuth(); });

const discordStatus = document.getElementById('discordStatus');
const googleButtons = document.querySelectorAll('.google-btn');
const authStatus = document.getElementById('authStatus');
const discordLoginLinks = document.querySelectorAll('[data-discord-login]');
let currentGoogleUser = null;
let discordSessionState = {
  configured: false,
  connected: false,
  id: '',
  username: '',
  avatar: '',
  joined: 'unknown',
  banner: '',
  bannerColor: ''
};
let profileState = { ...DEFAULT_PROFILE };

function getDiscordBackendBase() {
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

function buildReturnToUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function buildDiscordLoginUrl() {
  const params = new URLSearchParams({ return_to: buildReturnToUrl() });
  return `${getDiscordBackendBase()}/auth/discord/start?${params.toString()}`;
}

function wireDiscordLoginLinks() {
  discordLoginLinks.forEach(link => {
    if (!(link instanceof HTMLAnchorElement)) return;
    link.href = buildDiscordLoginUrl();
    link.addEventListener('click', event => {
      event.preventDefault();
      window.location.href = buildDiscordLoginUrl();
    });
  });
}

function getDefaultProfile(session = discordSessionState) {
  if (session.connected) {
    return {
      name: session.username || DEFAULT_PROFILE.name,
      role: 'Discord Member • Server Saved Profile',
      tags: ['Discord Login', 'Server Saved', 'Kurdish unity']
    };
  }
  return { ...DEFAULT_PROFILE };
}

function normalizeProfile(profile = {}, session = discordSessionState) {
  const fallback = getDefaultProfile(session);
  const tags = Array.isArray(profile.tags) ? profile.tags.slice(0, 3) : [];
  while (tags.length < 3) tags.push(fallback.tags[tags.length]);
  return {
    name: String(profile.name || fallback.name).trim() || fallback.name,
    role: String(profile.role || fallback.role).trim() || fallback.role,
    tags: tags.map((tag, index) => String(tag || fallback.tags[index] || '').trim() || fallback.tags[index])
  };
}

function setAuthStatus(message) {
  if (authStatus) authStatus.textContent = message;
}

function renderProfileAvatar() {
  const hasDiscordAvatar = Boolean(discordSessionState.connected && discordSessionState.avatar);
  const avatarSrc = hasDiscordAvatar ? discordSessionState.avatar : 'assets/logo.png';
  const avatarAlt = hasDiscordAvatar
    ? `${discordSessionState.username || 'Discord User'} avatar`
    : 'Kurdistan Unity Profile';

  [profileAvatarImg, navProfileAvatar, profilePreviewAvatar].forEach(image => {
    if (!image) return;
    image.src = avatarSrc;
    image.alt = avatarAlt;
    image.classList.toggle('discord-avatar', hasDiscordAvatar);
  });

  profileAvatarWrap?.classList.toggle('discord-avatar-wrap', hasDiscordAvatar);
}


function renderProfileBanner() {
  const fallbackBanner = 'assets/kurdistan-flag.gif';
  const hasDiscordBanner = Boolean(discordSessionState.connected && discordSessionState.banner);
  const bannerSrc = hasDiscordBanner ? discordSessionState.banner : fallbackBanner;
  const accent = discordSessionState.bannerColor || 'rgba(85,222,255,.32)';

  [profileBanner, profilePreviewBanner].forEach(element => {
    if (!element) return;
    element.style.setProperty('--profile-banner-accent', accent);
    element.style.backgroundImage = `linear-gradient(135deg, rgba(3,7,18,.24), rgba(3,7,18,.58)), url("${bannerSrc}")`;
    element.classList.toggle('is-discord-banner', hasDiscordBanner);
  });
}

function renderAccountButtons() {
  let label = 'Account';
  let sub = 'Discord Profile';

  if (discordSessionState.connected && discordSessionState.username) {
    label = discordSessionState.username.split(' ')[0];
    sub = 'Connected';
  } else if (currentGoogleUser) {
    const name = currentGoogleUser.displayName || currentGoogleUser.email || 'Google User';
    label = name.split(' ')[0];
    sub = 'Google Demo';
  }

  if (navProfileLabel) navProfileLabel.textContent = label;
  if (navProfileSub) navProfileSub.textContent = sub;

  authOpenButtons.forEach(btn => {
    if (btn && btn.id !== 'authOpen') btn.textContent = label;
  });
}

function renderDiscordSession() {
  if (discordStatus) {
    if (discordSessionState.connected) {
      let label = `Discord: ${discordSessionState.username || 'Connected'}`;
      if (discordSessionState.joined === 'failed') {
        label += ' • Join failed';
      }
      discordStatus.textContent = label;
    } else if (!discordSessionState.configured) {
      discordStatus.textContent = 'please created account in discord';
    } else {
      discordStatus.textContent = 'Discord: Not connected';
    }
  }

  if (discordSessionState.connected) {
    setAuthStatus(`Discord: ${discordSessionState.username}`);
  } else if (currentGoogleUser) {
    const name = currentGoogleUser.displayName || currentGoogleUser.email || 'Google User';
    setAuthStatus(` ${name}`);
  } else if (!discordSessionState.configured) {
    setAuthStatus('Discord backend/env is not ready');
  } else {
    setAuthStatus('Discord: Not connected');
  }

  renderProfileAvatar();
  renderProfileBanner();
  renderAccountButtons();
}

async function loadSessionFromServer() {
  try {
    const data = await fetchJson(`${getDiscordBackendBase()}/api/session`, {
      method: 'GET'
    });

    discordSessionState = {
      configured: Boolean(data.configured),
      connected: Boolean(data.connected),
      id: String(data.id || ''),
      username: String(data.username || ''),
      avatar: String(data.avatar || ''),
      banner: String(data.banner || ''),
      bannerColor: data.bannerColor ? String(data.bannerColor) : '',
      joined: String(data.joined || 'unknown')
    };
  } catch (error) {
    console.error('Session load error:', error);
    discordSessionState = {
      configured: false,
      connected: false,
      id: '',
      username: '',
      avatar: '',
      banner: '',
      bannerColor: '',
      joined: 'unknown'
    };
  }

  return discordSessionState;
}

async function loadProfileFromServer() {
  if (!discordSessionState.connected) {
    profileState = normalizeProfile(getDefaultProfile());
    applyProfile(profileState);
    return profileState;
  }

  try {
    const data = await fetchJson(`${getDiscordBackendBase()}/api/profile`, {
      method: 'GET'
    });
    profileState = normalizeProfile(data.profile || data, discordSessionState);
  } catch (error) {
    console.error('Profile load error:', error);
    profileState = normalizeProfile(getDefaultProfile(), discordSessionState);
  }

  applyProfile(profileState);
  return profileState;
}

async function consumeDiscordAuthFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const discord = params.get('discord');
  const joined = params.get('joined');
  const reason = params.get('reason');

  if (discord !== 'success' && discord !== 'error') return;

  ['discord', 'joined', 'reason'].forEach(key => params.delete(key));
  const clean = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
  window.history.replaceState({}, '', clean);

  await loadSessionFromServer();
  if (joined) discordSessionState.joined = joined;
  renderDiscordSession();
  await loadProfileFromServer();

  if (discord === 'success') {
    closeAuth();
    if (joined === 'failed') {
      alert('Login کرا، بەڵام auto join سەرکەوتوو نەبوو. دەتوانیت بە invite link جوین بیت.');
    }
  } else if (reason === 'config') {
    alert('backend/.env هێشتا تەواو دانەندرابوو.');
  } else {
    alert('Discord login سەرکەوتوو نەبوو.');
  }
}

function applyProfile(profileData = profileState) {
  const profile = normalizeProfile(profileData, discordSessionState);
  profileState = profile;

  if (profileName) profileName.textContent = profile.name;
  if (profileRole) profileRole.textContent = profile.role;
  if (profilePreviewName) profilePreviewName.textContent = profile.name;
  if (profilePreviewRole) profilePreviewRole.textContent = profile.role;
  profileTags.forEach((el, index) => {
    if (el) el.textContent = profile.tags[index] || DEFAULT_PROFILE.tags[index];
  });

  renderProfileAvatar();

  const nameInput = document.getElementById('editProfileName');
  const roleInput = document.getElementById('editProfileRole');
  const tagInputs = [document.getElementById('editTag1'), document.getElementById('editTag2'), document.getElementById('editTag3')];
  if (nameInput) nameInput.value = profile.name;
  if (roleInput) roleInput.value = profile.role;
  tagInputs.forEach((input, index) => {
    if (input) input.value = profile.tags[index] || '';
  });
}

async function bootstrapAuthAndProfile() {
  wireDiscordLoginLinks();
  await loadSessionFromServer();
  renderDiscordSession();
  applyProfile(getDefaultProfile());
  await consumeDiscordAuthFromUrl();
  await loadSessionFromServer();
  renderDiscordSession();
  await loadProfileFromServer();
}

bootstrapAuthAndProfile();

onAuthStateChanged(auth, user => {
  currentGoogleUser = user || null;
  renderDiscordSession();
});

googleButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuth();
    } catch (error) {
      console.error(error);
      alert('Google login هەڵەی تێدایە. لە Firebase Authentication دا Google enable بکە.');
    }
  });
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try { await signOut(auth); } catch (error) { console.error(error); }
    try {
      await fetchJson(`${getDiscordBackendBase()}/api/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    await loadSessionFromServer();
    renderDiscordSession();
    profileState = normalizeProfile(getDefaultProfile());
    applyProfile(profileState);
    closeAuth();
  });
}

if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', async () => {
    if (!discordSessionState.connected || !discordSessionState.id) {
      alert('سەرەتا Login with Discord بکە.');
      return;
    }

    const sure = confirm('دڵنیایت دەتەوێت هەموو داتای ئەم ئەکاونتە بسڕیتەوە؟');
    if (!sure) return;

    try {
      let deleted = false;

      try {
        await fetchJson(`${getDiscordBackendBase()}/api/account/delete`, {
          method: 'POST'
        });
        deleted = true;
      } catch (primaryError) {
        console.warn('Primary delete route failed, falling back to reset+logout.', primaryError);
        await fetchJson(`${getDiscordBackendBase()}/api/profile/reset`, {
          method: 'POST'
        });
        await fetchJson(`${getDiscordBackendBase()}/api/logout`, {
          method: 'POST'
        });
        deleted = true;
      }

      if (!deleted) throw new Error('Delete failed');

      try { await signOut(auth); } catch (googleError) { console.warn('Google signout warning:', googleError); }
      try { localStorage.removeItem(STORAGE.profile); } catch {}
      try { localStorage.removeItem(STORAGE.discordSession); } catch {}

      discordSessionState = {
        configured: discordSessionState.configured,
        connected: false,
        id: '',
        username: '',
        avatar: '',
        banner: '',
        bannerColor: '',
        joined: 'unknown'
      };
      profileState = normalizeProfile(getDefaultProfile());
      applyProfile(profileState);
      renderDiscordSession();
      closeAuth();
      alert('Account data سڕایەوە و logout کرایت.');
      setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Delete account سەرکەوتوو نەبوو. backend/server.js دووبارە start بکە.');
    }
  });
}

if (profileEditBtn) profileEditBtn.addEventListener('click', openAuth);

if (profileForm) {
  profileForm.addEventListener('input', () => {
    const liveProfile = normalizeProfile({
      name: document.getElementById('editProfileName')?.value || '',
      role: document.getElementById('editProfileRole')?.value || '',
      tags: [
        document.getElementById('editTag1')?.value || '',
        document.getElementById('editTag2')?.value || '',
        document.getElementById('editTag3')?.value || ''
      ]
    }, discordSessionState.connected ? discordSessionState : null);

    if (profilePreviewName) profilePreviewName.textContent = liveProfile.name;
    if (profilePreviewRole) profilePreviewRole.textContent = liveProfile.role;
    renderProfileBanner();
  });

  profileForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!discordSessionState.connected || !discordSessionState.id) {
      alert('سەرەتا Login with Discord بکە، پاشان پرۆفایلەکەت دەستکاری بکە.');
      return;
    }

    const nextProfile = normalizeProfile({
      name: document.getElementById('editProfileName')?.value || '',
      role: document.getElementById('editProfileRole')?.value || '',
      tags: [
        document.getElementById('editTag1')?.value || '',
        document.getElementById('editTag2')?.value || '',
        document.getElementById('editTag3')?.value || ''
      ]
    }, discordSessionState);

    try {
      const result = await fetchJson(`${getDiscordBackendBase()}/api/profile`, {
        method: 'POST',
        body: JSON.stringify(nextProfile)
      });
      profileState = normalizeProfile(result.profile || nextProfile, discordSessionState);
      applyProfile(profileState);
      closeAuth();
      alert('پرۆفایلەکە بۆ هەژماری Discord ـەکەت لە server ـدا پاشەکەوت کرا ✅');
    } catch (error) {
      console.error('Profile save error:', error);
      alert('پاشەکەوتکردنی پرۆفایل سەرکەوتوو نەبوو. backend/server بکەرەوە.');
    }
  });
}

if (resetProfileBtn) {
  resetProfileBtn.addEventListener('click', async () => {
    if (!discordSessionState.connected || !discordSessionState.id) {
      alert('سەرەتا Login with Discord بکە.');
      return;
    }

    try {
      const result = await fetchJson(`${getDiscordBackendBase()}/api/profile/reset`, {
        method: 'POST'
      });
      profileState = normalizeProfile(result.profile || getDefaultProfile(), discordSessionState);
      applyProfile(profileState);
      alert('پرۆفایل گەڕایەوە بۆ دۆخی بنەڕەتی و لە server ـدا نوێکرایەوە ✅');
    } catch (error) {
      console.error('Profile reset error:', error);
      alert('Reset سەرکەوتوو نەبوو. backend/server بکەرەوە.');
    }
  });
}

const bgMusic = document.getElementById('bgMusic');
let musicOn = false;
if (bgMusic) {
  bgMusic.volume = 0.45;
}
function startAmbientMusic() {
  if (!bgMusic) return;
  bgMusic.play().then(() => {
    musicOn = true;
    if (musicToggle) musicToggle.textContent = 'Music: ON';
  }).catch(() => {
    if (musicToggle) musicToggle.textContent = 'Music: ERROR';
  });
}
function stopAmbientMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  musicOn = false;
  if (musicToggle) musicToggle.textContent = 'Music: OFF';
}
if (musicToggle) {
  musicToggle.addEventListener('click', () => musicOn ? stopAmbientMusic() : startAmbientMusic());
}
if (bgMusic) {
  bgMusic.addEventListener('ended', () => {
    musicOn = false;
    if (musicToggle) musicToggle.textContent = 'Music: OFF';
  });
}


function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

const defaultPosts = [
  { author: 'Unity Staff', role: 'Staff', text: 'Welcome to Kurdistan Unity RP — update و event ی نوێ لە ڕێگایە.' },
  { author: 'City Player', role: 'Player', text: 'ئەم دیزاینە زۆر جوانە، من ئامادەم بۆ جوین بوون.' }
];
function renderPosts(targetEl, filterRole = null) {
  if (!targetEl) return;
  const posts = readJson(STORAGE.posts, defaultPosts).filter(post => !filterRole || post.role === filterRole || post.role === 'Admin');
  targetEl.innerHTML = posts.slice().reverse().map(post => `
    <article class="post-card">
      <div class="post-head">
        <strong>${escapeHtml(post.author)}</strong>
        <span class="post-role">${escapeHtml(post.role)}</span>
      </div>
      <p>${escapeHtml(post.text)}</p>
    </article>`).join('');
}
renderPosts(feedList);
renderPosts(staffPosts, 'Staff');

if (postForm) {
  postForm.addEventListener('submit', e => {
    e.preventDefault();
    const author = document.getElementById('postAuthor').value.trim();
    const role = document.getElementById('postRole').value;
    const text = document.getElementById('postText').value.trim();
    if (!author || !text) return;
    const posts = readJson(STORAGE.posts, defaultPosts);
    posts.push({ author, role, text });
    saveJson(STORAGE.posts, posts);
    postForm.reset();
    renderPosts(feedList);
    renderPosts(staffPosts, 'Staff');
  });
}

function renderFriends() {
  if (!friendList) return;
  const friends = readJson(STORAGE.friends, []);
  friendList.innerHTML = friends.length
    ? friends.map(friend => `<div class="chip">${escapeHtml(friend.name)}${friend.tag ? ` • ${escapeHtml(friend.tag)}` : ''}</div>`).join('')
    : '<p class="muted-note">هێشتا هاوڕێت زیاد نەکردووە.</p>';
}
renderFriends();
if (friendForm) {
  friendForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('friendName').value.trim();
    const tag = document.getElementById('friendTag').value.trim();
    if (!name) return;
    const friends = readJson(STORAGE.friends, []);
    friends.push({ name, tag });
    saveJson(STORAGE.friends, friends);
    friendForm.reset();
    renderFriends();
  });
}

function renderWebhook() {
  if (!webhookState) return;

}
renderWebhook();
if (webhookForm) {
  webhookForm.addEventListener('submit', e => {
    e.preventDefault();
    renderWebhook();
  });
}

if (applyForm) {
  applyForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('applyName')?.value.trim();
    const discord = document.getElementById('applyDiscord')?.value.trim();
    const reason = document.getElementById('applyReason')?.value.trim();

    if (!name || !discord || !reason) {
      alert('تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    try {
      await addDoc(collection(db, 'staffApplications'), {
        name,
        discord,
        reason,
        time: Date.now(),
        status: 'pending',
        decisionMessage: '',
        decisionAt: null
      });
      alert('داواکاریەکەت نێردرا ✅');
      applyForm.reset();
    } catch (error) {
      console.error('Staff apply error:', error);
      alert('هەڵەیەک ڕوویدا لە ناردنی داواکاری');
    }
  });
}



const checkStatusBtn = document.getElementById('checkStatusBtn');
const applicationStatus = document.getElementById('applicationStatus');

async function checkMyApplicationStatus() {
  if (!applicationStatus) return;
  const discordValue = document.getElementById('statusDiscord')?.value.trim();
  if (!discordValue) {
    applicationStatus.innerHTML = '<p class="muted-note">Discord ـەکەت بنووسە.</p>';
    return;
  }

  applicationStatus.innerHTML = '<p class="muted-note">گەڕان بەدوای داواکاری...</p>';

  try {
    const q = query(collection(db, 'staffApplications'), where('discord', '==', discordValue));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      applicationStatus.innerHTML = '<p class="muted-note">هیچ داواکارییەک بەم Discord ـە نەدۆزرایەوە.</p>';
      return;
    }

    const docs = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.time || 0) - (a.time || 0));

    const item = docs[0];
    const statusMap = {
      pending: 'چاوەڕوانی',
      accepted: 'قبوڵ کراوە',
      rejected: 'قبوڵ نەکراوە'
    };
    const status = statusMap[item.status] || 'چاوەڕوانی';
    const message = item.decisionMessage || 'هێشتا وەڵامێک بۆ داواکارییەکەت نەنێردراوە.';

    applicationStatus.innerHTML = `
      <div class="status-result glass">
        <p><strong>ناو:</strong> ${escapeHtml(item.name || '')}</p>
        <p><strong>دۆخ:</strong> ${escapeHtml(status)}</p>
        <p><strong>نامە:</strong> ${escapeHtml(message)}</p>
      </div>
    `;
  } catch (error) {
    console.error('Status check error:', error);
    applicationStatus.innerHTML = '<p class="muted-note">هەڵەیەک ڕوویدا لە گەڕان.</p>';
  }
}

if (checkStatusBtn) {
  checkStatusBtn.addEventListener('click', checkMyApplicationStatus);
}

(function createThreeScene() {
  if (!window.THREE) return;
  const canvas = document.getElementById('scene3d');
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 58);

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);
  const cyanLight = new THREE.PointLight(0x55deff, 1.2, 200);
  cyanLight.position.set(18, 24, 25);
  scene.add(cyanLight);
  const goldLight = new THREE.PointLight(0xffc44d, 1.2, 200);
  goldLight.position.set(-20, 18, 28);
  scene.add(goldLight);

  const city = new THREE.Group();
  const boxGeo = new THREE.BoxGeometry(2.8, 1, 2.8);
  for (let x = -20; x <= 20; x += 4) {
    for (let z = -18; z <= 18; z += 4) {
      const height = 2 + Math.random() * 17;
      const tower = new THREE.Mesh(
        boxGeo,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(`hsl(${205 + Math.random()*20}, 88%, ${24 + Math.random()*20}%)`),
          metalness: 0.72,
          roughness: 0.35,
          emissive: new THREE.Color(`hsl(${205 + Math.random()*20}, 70%, 15%)`),
          emissiveIntensity: 0.45
        })
      );
      tower.scale.y = height;
      tower.position.set(x + (Math.random() - .5) * 1.4, height / 2 - 13, z + (Math.random() - .5) * 1.4);
      city.add(tower);
    }
  }
  city.rotation.x = -0.24;
  city.position.y = -1;
  scene.add(city);

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(14, .18, 16, 120),
    new THREE.MeshBasicMaterial({ color: 0x55deff, transparent: true, opacity: .3 })
  );
  ring1.rotation.x = Math.PI / 2.3;
  ring1.position.y = 8;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(22, .15, 16, 120),
    new THREE.MeshBasicMaterial({ color: 0xffc44d, transparent: true, opacity: .17 })
  );
  ring2.rotation.y = Math.PI / 3.4;
  ring2.position.y = 5;
  scene.add(ring2);

  const particlesGeo = new THREE.BufferGeometry();
  const count = 1300;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - .5) * 180;
    positions[i * 3 + 1] = (Math.random() - .5) * 120;
    positions[i * 3 + 2] = (Math.random() - .5) * 180;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({ color: 0xcbefff, size: 0.4, transparent: true, opacity: .84 }));
  scene.add(particles);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    city.rotation.y += 0.0013;
    ring1.rotation.z += 0.004;
    ring2.rotation.x += 0.0025;
    particles.rotation.y += 0.0007;
    camera.position.x += ((mouseX * 5) - camera.position.x) * 0.02;
    camera.position.y += ((8 + mouseY * 2.4) - camera.position.y) * 0.02;
    camera.lookAt(0, 1, 0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


const SHOP_STORAGE_KEY = 'ku_shop_cart_v2';

const SHOP_PRODUCTS = [
  {
    id: 'vip-gold',
    category: 'vip',
    title: 'VIP Gold',
    tag: 'Popular',
    icon: '👑',
    price: 9.99,
    oldPrice: 12.99,
    stock: 82,
    description: 'Priority queue، gold badge و starter bonus بۆ پلەیەرێک کە دەیەوێت بە شێوازی VIP دەستپێبکات.',
    subtitle: 'Queue boost + Gold tag',
    perks: ['Priority Queue', 'Gold Chat Tag', 'Starter Coin Bonus']
  },
  {
    id: 'vip-diamond',
    category: 'vip',
    title: 'VIP Diamond',
    tag: 'Premium',
    icon: '💎',
    price: 19.99,
    oldPrice: 24.99,
    stock: 68,
    description: 'ئەو pack ـەی کە پلەیەرە VIP ـەکان هەڵیدەبژێرن بۆ bonus زیاتر و priority ی بەهێزتر.',
    subtitle: 'High-tier role + Extra coins',
    perks: ['Priority+', 'Diamond Tag', 'Extra Reward Box']
  },
  {
    id: 'coin-5000',
    category: 'coins',
    title: '5,000 Coins',
    tag: 'Coins',
    icon: '🪙',
    price: 4.99,
    oldPrice: 6.49,
    stock: 96,
    description: 'Boost ی خێرا بۆ wallet ـی ناو یاری، گونجاو بۆ پلەیەرانی نوێ و regular.',
    subtitle: 'Fast in-game wallet boost',
    perks: ['Instant Balance', 'Economy Ready', 'Safe Manual Delivery']
  },
  {
    id: 'coin-15000',
    category: 'coins',
    title: '15,000 Coins',
    tag: 'Value',
    icon: '💰',
    price: 11.99,
    oldPrice: 14.99,
    stock: 74,
    description: 'بە باشترین value بۆ ئەوانەی دەیانەوێت کار و بازاڕ و lifestyle ـیان زوو بچێتە سەرەوە.',
    subtitle: 'Better value bundle',
    perks: ['High Value Pack', 'Economy Jumpstart', 'Manual Confirm']
  },
  {
    id: 'super-car',
    category: 'vehicle',
    title: 'Custom Super Car',
    tag: 'Vehicle',
    icon: '🏎️',
    price: 14.99,
    oldPrice: 18.99,
    stock: 51,
    description: 'ئۆتۆمبیلی تایبەتی بە plate و neon و tuning ی تەواو بۆ ئەوانەی دەیانەوێت جیاوازن.',
    subtitle: 'Exclusive tuned vehicle',
    perks: ['Exclusive Plate', 'Neon Setup', 'Full Tuned Delivery']
  },
  {
    id: 'street-garage',
    category: 'vehicle',
    title: 'Street Garage Pack',
    tag: 'Garage',
    icon: '🚗',
    price: 17.49,
    oldPrice: 21.49,
    stock: 59,
    description: 'car setup ـی جادەیی بۆ رول پلەی city و daily cruising بە look ـێکی clean.',
    subtitle: 'Garage starter collection',
    perks: ['2 Tuned Cars', 'Garage Slot Bonus', 'Street Style Setup']
  },
  {
    id: 'new-player-bundle',
    category: 'bundle',
    title: 'New Player Bundle',
    tag: 'Starter',
    icon: '🎁',
    price: 7.99,
    oldPrice: 10.49,
    stock: 88,
    description: 'هەموو شتێکی سەرەتایی بۆ پلەیەرێکی نوێ: coins، basic car و housing support.',
    subtitle: 'Best first-day setup',
    perks: ['Coins Included', 'Starter Vehicle', 'House Rent Help']
  },
  {
    id: 'gang-package',
    category: 'team',
    title: 'Gang Package',
    tag: 'Team',
    icon: '🛡️',
    price: 29.99,
    oldPrice: 35.99,
    stock: 33,
    description: 'pack ـی تایبەت بۆ team یاخود group ـەکان: base setup، outfit و support perk.',
    subtitle: 'Group-ready premium pack',
    perks: ['Base Setup', 'Matching Outfit', 'Support Perks']
  }
];

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function initializeShopPage() {
  if (!document.querySelector('[data-shop-page]')) return;

  const featuredCard = document.getElementById('shopFeaturedCard');
  const productGrid = document.getElementById('shopProductGrid');
  const cartList = document.getElementById('shopCartList');
  const subtotalEl = document.getElementById('shopSubtotal');
  const itemCountEl = document.getElementById('shopItemCount');
  const emptyStateEl = document.getElementById('shopEmptyState');
  const resultTextEl = document.getElementById('shopResultText');
  const searchInput = document.getElementById('shopSearch');
  const filterWrap = document.getElementById('shopFilters');
  const statusEl = document.getElementById('shopStatus');
  const jumpBtn = document.getElementById('shopJumpToProducts');
  const checkoutBtn = document.getElementById('shopCheckoutBtn');
  const clearCartBtn = document.getElementById('shopClearCart');
  const productsSection = document.getElementById('shopProductsSection');
  const openDiscordButtons = [
    document.getElementById('shopOpenDiscord'),
    document.getElementById('shopOpenDiscordHero'),
    document.getElementById('shopBottomDiscord')
  ].filter(Boolean);

  let activeFilter = 'all';
  let activeSearch = '';
  let featuredId = SHOP_PRODUCTS[1]?.id || SHOP_PRODUCTS[0]?.id || '';
  let cart = normalizeCart(readJson(SHOP_STORAGE_KEY, []));

  function normalizeCart(rawCart) {
    if (!Array.isArray(rawCart)) return [];
    const cleaned = rawCart
      .map((entry) => {
        const product = SHOP_PRODUCTS.find((item) => item.id === entry?.id);
        const qty = Math.max(1, Math.min(99, Number(entry?.qty || 1)));
        if (!product) return null;
        return { id: product.id, qty };
      })
      .filter(Boolean);

    const merged = [];
    cleaned.forEach((entry) => {
      const existing = merged.find((item) => item.id === entry.id);
      if (existing) {
        existing.qty += entry.qty;
      } else {
        merged.push({ ...entry });
      }
    });
    return merged;
  }

  function persistCart() {
    saveJson(SHOP_STORAGE_KEY, cart);
  }

  function showShopToast(title, detail = '') {
    if (!statusEl) return;
    statusEl.innerHTML = `<strong>${escapeHtml(title)}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ''}`;
    statusEl.classList.add('is-visible');
    window.clearTimeout(showShopToast.timeoutId);
    showShopToast.timeoutId = window.setTimeout(() => {
      statusEl.classList.remove('is-visible');
    }, 2200);
  }

  function getProduct(productId) {
    return SHOP_PRODUCTS.find((item) => item.id === productId) || SHOP_PRODUCTS[0];
  }

  function getFilteredProducts() {
    const term = activeSearch.trim().toLowerCase();
    return SHOP_PRODUCTS.filter((product) => {
      const matchesFilter = activeFilter === 'all' || product.category === activeFilter;
      const haystack = `${product.title} ${product.tag} ${product.description} ${product.subtitle} ${product.perks.join(' ')}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      return matchesFilter && matchesSearch;
    });
  }

  function buildShopTicketPayload(product = null) {
    const cartItems = product
      ? [{
          id: product.id,
          title: product.title,
          qty: 1,
          price: product.price,
          tag: product.tag
        }]
      : getCartItems().map((item) => ({
          id: item.id,
          title: item.title,
          qty: item.qty,
          price: item.price,
          tag: item.tag
        }));

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);

    return {
      source: 'shop-page',
      pageUrl: window.location.href,
      customer: {
        discordId: discordSessionState.id || '',
        discordUsername: discordSessionState.username || '',
        connected: Boolean(discordSessionState.connected)
      },
      items: cartItems,
      subtotal
    };
  }

  async function openDiscordTicket(product = null) {
    const payload = buildShopTicketPayload(product);
    const hasItems = Array.isArray(payload.items) && payload.items.length > 0;

    if (!product && !hasItems) {
      showShopToast('Cart is empty', 'سەرەتا item زیاد بکە یان product هەڵبژێرە.');
      return;
    }

    try {
      const result = await fetchJson(`${getDiscordBackendBase()}/api/shop/ticket`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const openUrl = result.openUrl || DISCORD_INVITE;
      if (openUrl) {
        try {
          window.open(openUrl, '_blank', 'noopener');
        } catch (error) {
          console.warn('Discord open warning:', error);
        }
      }

      showShopToast(
        result.title || (product ? `${product.title} ticket sent` : 'Ticket sent'),
        result.message || 'داواکارییەکەت بۆ server نێردرا ✅'
      );
    } catch (error) {
      console.warn('Shop ticket request failed:', error);
      try {
        window.open(DISCORD_INVITE, '_blank', 'noopener');
      } catch (openError) {
        console.warn('Discord fallback open warning:', openError);
      }
      showShopToast(
        'Discord fallback',
        'backend ی ticket ئامادە نییە، بۆیە Discord invite کراوەتەوە.'
      );
    }
  }

  function setFeatured(productId) {
    featuredId = productId;
    renderFeatured();
  }

  function renderFeatured() {
    if (!featuredCard) return;
    const product = getProduct(featuredId);
    featuredCard.innerHTML = `
      <div class="shop-featured-content">
        <div class="shop-featured-top">
          <div>
            <span class="shop-mini-kicker">FEATURED PICK</span>
            <h2 class="shop-featured-title">${escapeHtml(product.title)}</h2>
            <p class="shop-featured-desc">${escapeHtml(product.description)}</p>
          </div>
          <div class="shop-badge-stack">
            <span class="label-pill">${escapeHtml(product.tag)}</span>
            <span class="label-pill">${escapeHtml(product.category.toUpperCase())}</span>
          </div>
        </div>

        <div class="shop-price-row">
          <strong>${formatUsd(product.price)}</strong>
          <del>${formatUsd(product.oldPrice)}</del>
          <span class="status-pill">Stock ${Math.round(product.stock)}%</span>
        </div>

        <div class="shop-featured-perks">
          ${product.perks.map((perk) => `
            <div>
              <span>✦</span>
              <p>${escapeHtml(perk)}</p>
            </div>
          `).join('')}
        </div>

        <div class="shop-featured-actions">
          <button class="btn btn-primary" type="button" data-shop-add="${escapeHtml(product.id)}">Add To Cart</button>
          <button class="btn btn-secondary" type="button" data-shop-open-ticket="${escapeHtml(product.id)}">Discord Order</button>
        </div>
      </div>
    `;
  }

  function renderProducts() {
    if (!productGrid) return;
    const filteredProducts = getFilteredProducts();

    if (resultTextEl) {
      if (filteredProducts.length) {
        resultTextEl.textContent = `${filteredProducts.length} item دۆزرایەوە بۆ filter ـەکەت.`;
      } else {
        resultTextEl.textContent = 'هیچ item ـێک بەم filter / search ـە نەدۆزرایەوە.';
      }
    }

    if (!filteredProducts.length) {
      productGrid.innerHTML = `
        <article class="shop-card-premium glass">
          <span class="shop-mini-kicker">NO RESULT</span>
          <h3>هیچ item ـێک نەدۆزرایەوە</h3>
          <p>گەڕانەکەت بگۆڕە یان filter ـی تر هەڵبژێرە.</p>
          <div class="shop-card-actions">
            <button class="btn btn-secondary" type="button" id="shopResetFilters">Reset Filters</button>
          </div>
        </article>
      `;
      const resetBtn = document.getElementById('shopResetFilters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeFilter = 'all';
          activeSearch = '';
          if (searchInput) searchInput.value = '';
          syncActiveFilter();
          renderProducts();
        });
      }
      return;
    }

    productGrid.innerHTML = filteredProducts.map((product) => {
      const stockWidth = Math.max(12, Math.min(100, Math.round(product.stock)));
      return `
        <article class="shop-card-premium tilt-card">
          <div class="shop-card-head">
            <div>
              <span class="shop-mini-kicker">${escapeHtml(product.tag)}</span>
              <h3>${escapeHtml(product.title)}</h3>
              <p class="shop-card-sub">${escapeHtml(product.subtitle)}</p>
            </div>
            <div class="shop-card-icon" aria-hidden="true">${escapeHtml(product.icon)}</div>
          </div>

          <p>${escapeHtml(product.description)}</p>

          <div class="shop-card-price">
            <strong>${formatUsd(product.price)}</strong>
            <del>${formatUsd(product.oldPrice)}</del>
          </div>

          <div class="shop-stock-row">
            <span>Availability</span>
            <span>${stockWidth}%</span>
          </div>
          <div class="shop-stock-bar"><span style="width:${stockWidth}%"></span></div>

          <div class="shop-card-perks">
            ${product.perks.map((perk) => `
              <div>
                <span>✦</span>
                <p>${escapeHtml(perk)}</p>
              </div>
            `).join('')}
          </div>

          <div class="shop-card-actions">
            <button class="btn btn-primary" type="button" data-shop-add="${escapeHtml(product.id)}">Add To Cart</button>
            <button class="btn btn-secondary" type="button" data-shop-feature="${escapeHtml(product.id)}">Quick View</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function getCartItems() {
    return cart.map((entry) => {
      const product = getProduct(entry.id);
      return {
        ...product,
        qty: entry.qty,
        lineTotal: product.price * entry.qty
      };
    });
  }

  function renderCart() {
    if (!cartList || !subtotalEl || !itemCountEl || !emptyStateEl) return;
    const cartItems = getCartItems();
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

    itemCountEl.textContent = String(itemCount);
    subtotalEl.textContent = formatUsd(subtotal);
    emptyStateEl.style.display = cartItems.length ? 'none' : 'grid';

    if (!cartItems.length) {
      cartList.innerHTML = '';
      return;
    }

    cartList.innerHTML = cartItems.map((item) => `
      <article class="shop-cart-item">
        <div class="shop-cart-line">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.tag)} • ${formatUsd(item.price)}</span>
          </div>
          <button class="shop-remove-btn" type="button" aria-label="Remove ${escapeHtml(item.title)}" data-shop-remove="${escapeHtml(item.id)}">×</button>
        </div>

        <div class="shop-cart-line">
          <div class="shop-qty-row">
            <button class="shop-qty-chip" type="button" data-shop-decrease="${escapeHtml(item.id)}">-</button>
            <span class="shop-qty-chip">${item.qty}</span>
            <button class="shop-qty-chip" type="button" data-shop-increase="${escapeHtml(item.id)}">+</button>
          </div>
          <strong>${formatUsd(item.lineTotal)}</strong>
        </div>
      </article>
    `).join('');
  }

  function syncActiveFilter() {
    filterWrap?.querySelectorAll('[data-filter]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === activeFilter);
    });
  }

  function addToCart(productId) {
    const existing = cart.find((entry) => entry.id === productId);
    if (existing) {
      existing.qty = Math.min(99, existing.qty + 1);
    } else {
      cart.push({ id: productId, qty: 1 });
    }
    persistCart();
    renderCart();
    const product = getProduct(productId);
    showShopToast(product.title, 'زیاد کرا بۆ cart.');
  }

  function updateCartQty(productId, delta) {
    const item = cart.find((entry) => entry.id === productId);
    if (!item) return;
    item.qty = Math.max(1, Math.min(99, item.qty + delta));
    persistCart();
    renderCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter((entry) => entry.id !== productId);
    persistCart();
    renderCart();
    const product = getProduct(productId);
    showShopToast(product.title, 'لە cart سڕایەوە.');
  }

  jumpBtn?.addEventListener('click', () => {
    productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  openDiscordButtons.forEach((button) => {
    button.addEventListener('click', () => openDiscordTicket());
  });

  checkoutBtn?.addEventListener('click', () => {
    const cartItems = getCartItems();
    if (!cartItems.length) {
      showShopToast('Cart is empty', 'سەرەتا item زیاد بکە.');
      return;
    }
    const firstProduct = cartItems[0];
    openDiscordTicket(firstProduct);
  });

  clearCartBtn?.addEventListener('click', () => {
    if (!cart.length) {
      showShopToast('Cart already empty');
      return;
    }
    cart = [];
    persistCart();
    renderCart();
    showShopToast('Cart cleared', 'هەموو item ـەکان سڕایەوە.');
  });

  searchInput?.addEventListener('input', (event) => {
    activeSearch = String(event.target?.value || '');
    renderProducts();
  });

  filterWrap?.addEventListener('click', (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('[data-filter]') : null;
    if (!button) return;
    activeFilter = button.dataset.filter || 'all';
    syncActiveFilter();
    renderProducts();
  });

  productGrid?.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('button') : null;
    if (!target) return;

    if (target.dataset.shopAdd) {
      addToCart(target.dataset.shopAdd);
      return;
    }

    if (target.dataset.shopFeature) {
      setFeatured(target.dataset.shopFeature);
      featuredCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  featuredCard?.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('button') : null;
    if (!target) return;

    if (target.dataset.shopAdd) {
      addToCart(target.dataset.shopAdd);
    } else if (target.dataset.shopOpenTicket) {
      const product = getProduct(target.dataset.shopOpenTicket);
      openDiscordTicket(product);
    }
  });

  cartList?.addEventListener('click', (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest('button') : null;
    if (!target) return;

    if (target.dataset.shopIncrease) {
      updateCartQty(target.dataset.shopIncrease, 1);
    } else if (target.dataset.shopDecrease) {
      updateCartQty(target.dataset.shopDecrease, -1);
    } else if (target.dataset.shopRemove) {
      removeFromCart(target.dataset.shopRemove);
    }
  });

  syncActiveFilter();
  renderFeatured();
  renderProducts();
  renderCart();
}

initializeShopPage();
