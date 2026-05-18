// Shared auth widget: injects a sign-in/up modal and a nav slot, and tracks
// the current user via /api/auth/me. Other scripts can:
//   - read SkillenceAuth.user  (null until checkAuth() finishes; updates on change)
//   - call SkillenceAuth.openModal({ initialTab, onSuccess, message })
//   - listen for the 'skillence:auth:change' event on window
(function () {
  if (window.SkillenceAuth) return;

  const STYLES = `
    .sk-auth-trigger { background: transparent; color: var(--text); border: 1px solid var(--border); padding: 0.55rem 1.1rem; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.82rem; letter-spacing: 0.04em; cursor: pointer; border-radius: 4px; text-transform: uppercase; transition: border-color 0.2s, color 0.2s; }
    .sk-auth-trigger:hover { border-color: var(--accent); color: var(--accent); }
    .sk-auth-user { display: inline-flex; align-items: center; gap: 0.55rem; padding: 0.4rem 0.7rem; background: rgba(0,245,160,0.05); border: 1px solid rgba(0,245,160,0.25); border-radius: 100px; color: var(--text); font-size: 0.82rem; font-family: 'Syne', sans-serif; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .sk-auth-user:hover { background: rgba(0,245,160,0.1); }
    .sk-auth-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #000; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; }
    .sk-auth-menu { position: absolute; top: 100%; right: 0; margin-top: 0.5rem; min-width: 200px; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 0.6rem; box-shadow: 0 14px 40px rgba(0,0,0,0.4); z-index: 110; display: none; }
    .sk-auth-menu.open { display: block; }
    .sk-auth-menu .sk-menu-item { display: block; width: 100%; text-align: left; background: transparent; color: var(--text); border: none; padding: 0.65rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-family: 'DM Sans', sans-serif; }
    .sk-auth-menu .sk-menu-item:hover { background: rgba(255,255,255,0.04); color: var(--accent); }
    .sk-auth-menu .sk-menu-info { padding: 0.4rem 0.8rem 0.7rem; border-bottom: 1px solid var(--border); margin-bottom: 0.4rem; }
    .sk-auth-menu .sk-menu-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.92rem; color: var(--text); }
    .sk-auth-menu .sk-menu-email { font-size: 0.78rem; color: var(--muted); margin-top: 0.15rem; word-break: break-all; }
    .sk-auth-wrap { position: relative; display: inline-flex; align-items: center; gap: 0.6rem; }

    .sk-modal-overlay { position: fixed; inset: 0; background: rgba(3, 5, 10, 0.78); backdrop-filter: blur(8px); z-index: 200; display: none; align-items: center; justify-content: center; padding: 2rem 1rem; }
    .sk-modal-overlay.open { display: flex; }
    .sk-modal { width: 100%; max-width: 440px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 2.2rem 2rem 1.8rem; position: relative; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
    .sk-modal-close { position: absolute; top: 0.9rem; right: 0.9rem; width: 32px; height: 32px; background: transparent; border: 1px solid var(--border); color: var(--muted); border-radius: 6px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: color 0.2s, border-color 0.2s; }
    .sk-modal-close:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
    .sk-modal h2 { font-family: 'Syne', sans-serif; font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.4rem; }
    .sk-modal-sub { color: var(--muted); font-size: 0.9rem; font-weight: 300; margin-bottom: 1.4rem; }
    .sk-tabs { display: flex; gap: 0.4rem; border: 1px solid var(--border); border-radius: 8px; padding: 0.25rem; margin-bottom: 1.3rem; background: rgba(255,255,255,0.02); }
    .sk-tab { flex: 1; background: transparent; color: var(--muted); border: none; padding: 0.6rem 0.8rem; border-radius: 6px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.2s, color 0.2s; }
    .sk-tab.active { background: var(--accent); color: #000; }
    .sk-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.95rem; }
    .sk-field label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; color: var(--muted); text-transform: uppercase; }
    .sk-field input { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text); padding: 0.8rem 1rem; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
    .sk-field input:focus { border-color: var(--accent); }
    .sk-submit { width: 100%; background: var(--accent); color: #000; border: none; padding: 0.95rem; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; letter-spacing: 0.02em; border-radius: 6px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; margin-top: 0.3rem; }
    .sk-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,245,160,0.35); }
    .sk-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .sk-status { min-height: 1.2em; font-size: 0.85rem; margin-top: 0.8rem; text-align: center; color: var(--muted); }
    .sk-status.error { color: #ff6b6b; }
    .sk-status.success { color: var(--accent); }
    .sk-message { background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.2); color: #c9d1e0; font-size: 0.85rem; padding: 0.8rem 1rem; border-radius: 8px; margin-bottom: 1rem; line-height: 1.5; }
    .sk-message.hidden { display: none; }

    @media (max-width: 600px) {
      .sk-auth-trigger { padding: 0.5rem 0.85rem; font-size: 0.72rem; }
      .sk-auth-user { padding: 0.35rem 0.55rem; font-size: 0.75rem; }
      .sk-modal { padding: 1.7rem 1.3rem 1.4rem; }
    }
  `;

  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'skillence-auth-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function buildModal() {
    const overlay = document.createElement('div');
    overlay.className = 'sk-modal-overlay';
    overlay.id = 'sk-auth-modal';
    overlay.innerHTML = `
      <div class="sk-modal" role="dialog" aria-modal="true" aria-labelledby="sk-modal-title">
        <button class="sk-modal-close" type="button" aria-label="Close">✕</button>
        <h2 id="sk-modal-title">Welcome back</h2>
        <p class="sk-modal-sub" id="sk-modal-sub">Sign in to enroll, apply for scholarships, and track your progress.</p>
        <div class="sk-message hidden" id="sk-modal-message"></div>
        <div class="sk-tabs" role="tablist">
          <button class="sk-tab active" data-tab="login" type="button">Sign In</button>
          <button class="sk-tab" data-tab="register" type="button">Create Account</button>
        </div>
        <form id="sk-login-form" novalidate>
          <div class="sk-field">
            <label for="sk-login-email">Email</label>
            <input type="email" id="sk-login-email" name="email" autocomplete="email" required />
          </div>
          <div class="sk-field">
            <label for="sk-login-password">Password</label>
            <input type="password" id="sk-login-password" name="password" autocomplete="current-password" required />
          </div>
          <button class="sk-submit" type="submit">Sign In</button>
          <div class="sk-status" role="status" aria-live="polite"></div>
        </form>
        <form id="sk-register-form" novalidate style="display:none;">
          <div class="sk-field">
            <label for="sk-register-name">Full name</label>
            <input type="text" id="sk-register-name" name="name" autocomplete="name" required />
          </div>
          <div class="sk-field">
            <label for="sk-register-email">Email</label>
            <input type="email" id="sk-register-email" name="email" autocomplete="email" required />
          </div>
          <div class="sk-field">
            <label for="sk-register-password">Password</label>
            <input type="password" id="sk-register-password" name="password" autocomplete="new-password" minlength="8" required />
          </div>
          <button class="sk-submit" type="submit">Create Account</button>
          <div class="sk-status" role="status" aria-live="polite"></div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function buildNavWidget() {
    const nav = document.querySelector('nav');
    if (!nav) return null;

    const wrap = document.createElement('div');
    wrap.className = 'sk-auth-wrap';
    wrap.id = 'sk-auth-nav';
    wrap.innerHTML = `<button class="sk-auth-trigger" type="button" id="sk-auth-trigger">Sign in</button>`;

    const navCta = nav.querySelector('.nav-cta');
    const hamburger = nav.querySelector('.nav-hamburger');
    if (navCta) {
      navCta.parentNode.insertBefore(wrap, navCta);
    } else if (hamburger) {
      hamburger.parentNode.insertBefore(wrap, hamburger);
    } else {
      nav.appendChild(wrap);
    }
    return wrap;
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderNav(user) {
    const wrap = document.getElementById('sk-auth-nav');
    if (!wrap) return;
    if (!user) {
      wrap.innerHTML = `<button class="sk-auth-trigger" type="button" id="sk-auth-trigger">Sign in</button>`;
      document.getElementById('sk-auth-trigger').addEventListener('click', () => SkillenceAuth.openModal());
    } else {
      wrap.innerHTML = `
        <button class="sk-auth-user" type="button" id="sk-auth-user">
          <span class="sk-auth-avatar">${getInitials(user.name)}</span>
          <span>${escapeHtml(user.name.split(' ')[0])}</span>
        </button>
        <div class="sk-auth-menu" id="sk-auth-menu">
          <div class="sk-menu-info">
            <div class="sk-menu-name">${escapeHtml(user.name)}</div>
            <div class="sk-menu-email">${escapeHtml(user.email)}</div>
          </div>
          <button class="sk-menu-item" type="button" id="sk-auth-logout">Sign out</button>
        </div>
      `;
      const userBtn = document.getElementById('sk-auth-user');
      const menu = document.getElementById('sk-auth-menu');
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) menu.classList.remove('open');
      });
      document.getElementById('sk-auth-logout').addEventListener('click', async () => {
        try {
          await window.SkillenceAPI.auth.logout();
        } catch (_) {}
        setUser(null);
      });
    }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  let user = null;
  let pendingOnSuccess = null;

  function setUser(next) {
    user = next;
    SkillenceAuth.user = next;
    renderNav(next);
    window.dispatchEvent(new CustomEvent('skillence:auth:change', { detail: { user: next } }));
  }

  async function checkAuth() {
    try {
      const data = await window.SkillenceAPI.auth.me();
      setUser(data.user);
    } catch (err) {
      if (err && err.status === 401) {
        setUser(null);
      } else {
        // Network error - keep user as null but don't reset noisily
        setUser(null);
      }
    }
  }

  function activateTab(tab) {
    document.querySelectorAll('.sk-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.getElementById('sk-login-form').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('sk-register-form').style.display = tab === 'register' ? '' : 'none';
    const title = document.getElementById('sk-modal-title');
    title.textContent = tab === 'login' ? 'Welcome back' : 'Create your account';
  }

  function openModal(opts = {}) {
    const overlay = document.getElementById('sk-auth-modal');
    if (!overlay) return;
    const message = opts.message || '';
    const messageEl = document.getElementById('sk-modal-message');
    if (message) {
      messageEl.textContent = message;
      messageEl.classList.remove('hidden');
    } else {
      messageEl.classList.add('hidden');
    }
    pendingOnSuccess = typeof opts.onSuccess === 'function' ? opts.onSuccess : null;
    activateTab(opts.initialTab === 'register' ? 'register' : 'login');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = overlay.querySelector('form:not([style*="display:none"]) input');
      if (first) first.focus();
    }, 60);
  }

  function closeModal() {
    const overlay = document.getElementById('sk-auth-modal');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    overlay.querySelectorAll('.sk-status').forEach((el) => {
      el.textContent = '';
      el.classList.remove('error', 'success');
    });
    overlay.querySelectorAll('form').forEach((f) => f.reset());
  }

  function bindModal() {
    const overlay = document.getElementById('sk-auth-modal');
    overlay.querySelector('.sk-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    overlay.querySelectorAll('.sk-tab').forEach((btn) => {
      btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });

    const loginForm = document.getElementById('sk-login-form');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = loginForm.querySelector('.sk-status');
      const submit = loginForm.querySelector('.sk-submit');
      const email = document.getElementById('sk-login-email').value.trim();
      const password = document.getElementById('sk-login-password').value;
      status.textContent = 'Signing in…';
      status.classList.remove('error', 'success');
      submit.disabled = true;
      try {
        const data = await window.SkillenceAPI.auth.login({ email, password });
        setUser(data.user);
        const cb = pendingOnSuccess;
        pendingOnSuccess = null;
        closeModal();
        if (cb) cb(data.user);
      } catch (err) {
        status.textContent = err.message || 'Could not sign in.';
        status.classList.add('error');
      } finally {
        submit.disabled = false;
      }
    });

    const registerForm = document.getElementById('sk-register-form');
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = registerForm.querySelector('.sk-status');
      const submit = registerForm.querySelector('.sk-submit');
      const name = document.getElementById('sk-register-name').value.trim();
      const email = document.getElementById('sk-register-email').value.trim();
      const password = document.getElementById('sk-register-password').value;
      status.textContent = 'Creating account…';
      status.classList.remove('error', 'success');
      submit.disabled = true;
      try {
        const data = await window.SkillenceAPI.auth.register({ name, email, password });
        setUser(data.user);
        const cb = pendingOnSuccess;
        pendingOnSuccess = null;
        closeModal();
        if (cb) cb(data.user);
      } catch (err) {
        status.textContent = err.message || 'Could not create account.';
        status.classList.add('error');
      } finally {
        submit.disabled = false;
      }
    });
  }

  function init() {
    if (!window.SkillenceAPI) {
      console.warn('[skillence-auth] SkillenceAPI not loaded — skipping init');
      return;
    }
    injectStyles();
    buildModal();
    buildNavWidget();
    bindModal();
    renderNav(null);
    checkAuth();
  }

  window.SkillenceAuth = {
    user: null,
    openModal,
    closeModal,
    refresh: checkAuth,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
