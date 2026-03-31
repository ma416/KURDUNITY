function getBackendBase() {
  const metaBase = document.querySelector('meta[name="discord-backend"]')?.content?.trim();
  if (metaBase && metaBase !== 'auto') return metaBase.replace(/\/$/, '');

  if (window.location.port === '3000') return window.location.origin;

  const host = window.location.hostname || '127.0.0.1';
  if (host === '127.0.0.1' || host === 'localhost') {
    return null;
  }

  return window.location.origin;
}

async function applySiteContent() {
  try {
    const backendBase = getBackendBase();
    if (!backendBase) return;

    const response = await fetch(`${backendBase}/api/site-content`, {
      credentials: 'include'
    });
    if (!response.ok) return;

    const data = await response.json();
    const content = data?.content || {};

    document.querySelectorAll('[data-site-key]').forEach((el) => {
      const key = el.getAttribute('data-site-key');
      if (!key || !(key in content)) return;
      el.textContent = content[key];
    });
  } catch (error) {
    console.warn('Site content load skipped:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applySiteContent);
} else {
  applySiteContent();
}
