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
      let lastDeploymentId = sessionStorage.getItem('meetnova_deploy_id');
      
      const checkDeployment = async () => {
        try {
          const response = await fetch('/?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
          const deploymentId = response.headers.get('x-vercel-id');
          
          if (deploymentId) {
            if (lastDeploymentId && lastDeploymentId !== deploymentId) {
              console.log('🚀 Nouveau déploiement Vercel détecté !');
              window.dispatchEvent(new CustomEvent('app-update-available'));
            }
            lastDeploymentId = deploymentId;
            sessionStorage.setItem('meetnova_deploy_id', deploymentId);
          }
        } catch (e) {
          // Silencieux
        }
      };

      // Vérification toutes les 30 secondes
      setInterval(() => {
        registration.update();
        checkDeployment();
      }, 30000);

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
              console.log('✨ Nouvelle version disponible');
              window.dispatchEvent(new CustomEvent('app-update-available'));
            }
          };
        }
      };
    }).catch(err => console.error('SW Error:', err));
  });
}
