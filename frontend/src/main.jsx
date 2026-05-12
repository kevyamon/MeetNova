import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('🚀 MeetNova SW Ready');
      
      // Vérification ULTRA-RAPIDE des mises à jour (toutes les 3 secondes)
      // C'est ce qui permet de détecter un nouveau push Vercel presque instantanément
      const updateCheckInterval = setInterval(() => {
        registration.update();
      }, 3000);

      // Vérifier aussi quand l'utilisateur revient sur l'onglet
      window.addEventListener('focus', () => {
        registration.update();
      });

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ Nouvelle version détectée, mise à jour...');
              // Le skipWaiting() dans sw.js fera le reste
            }
          };
        }
      };
    }).catch(err => console.error('SW Error:', err));
  });

  // Recharger AUTOMATIQUEMENT dès que le nouveau SW prend le contrôle
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
