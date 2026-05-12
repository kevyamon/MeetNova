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
      
      // Détection de nouveau déploiement via les headers Vercel
      let lastDeploymentId = null;
      const checkDeployment = async () => {
        try {
          const response = await fetch('/?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
          const deploymentId = response.headers.get('x-vercel-id');
          if (lastDeploymentId && deploymentId && lastDeploymentId !== deploymentId) {
            console.log('🚀 Nouveau déploiement Vercel détecté !');
            window.dispatchEvent(new CustomEvent('app-update-available'));
          }
          lastDeploymentId = deploymentId;
        } catch (e) {
          // Silencieux si erreur réseau
        }
      };

      // Vérification toutes les 5 secondes
      setInterval(() => {
        registration.update();
        checkDeployment();
      }, 5000);

      // Vérifier aussi au focus
      window.addEventListener('focus', () => {
        registration.update();
        checkDeployment();
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

  // On prévient l'app quand le nouveau Service Worker est prêt
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.dispatchEvent(new CustomEvent('app-update-available'));
    }
  });
}
