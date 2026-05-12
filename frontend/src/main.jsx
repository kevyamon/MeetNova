import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && typeof __GIT_HASH__ !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('🚀 MeetNova SW Ready');

      const savedHash = sessionStorage.getItem('meetnova_git_hash');

      if (savedHash && savedHash !== __GIT_HASH__) {
        console.log('🚀 Nouveau déploiement détecté !');
        sessionStorage.setItem('meetnova_update_reload', 'true');
        sessionStorage.setItem('meetnova_last_path', window.location.pathname);
        const inputs = document.querySelectorAll('input, textarea');
        const formData = {};
        inputs.forEach(input => {
          if (input.name && input.value) formData[input.name] = input.value;
        });
        sessionStorage.setItem('meetnova_pending_form', JSON.stringify(formData));
        window.location.reload();
        return;
      }

      sessionStorage.setItem('meetnova_git_hash', __GIT_HASH__);

      const checkUpdate = async () => {
        try {
          const scripts = document.querySelectorAll('script[src*="/assets/index-"]');
          if (scripts.length === 0) return;
          const src = scripts[0].src;
          const res = await fetch(src, { cache: 'no-store' });
          const text = await res.text();
          const match = text.match(/const __GIT_HASH__ = '([^']+)'/);
          if (match && match[1] !== __GIT_HASH__) {
            console.log('🚀 Nouveau déploiement détecté !');
            window.dispatchEvent(new CustomEvent('app-update-available'));
          }
        } catch {}
      };

      setInterval(() => {
        registration.update();
        checkUpdate();
      }, 60000);

      window.addEventListener('focus', () => {
        registration.update();
        checkUpdate();
      });

      registration.onupdatefound = () => {
        const worker = registration.installing;
        if (worker) {
          worker.onstatechange = () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ Nouvelle version disponible');
              window.dispatchEvent(new CustomEvent('app-update-available'));
            }
          };
        }
      };
    }).catch(err => console.error('SW Error:', err));
  });
}