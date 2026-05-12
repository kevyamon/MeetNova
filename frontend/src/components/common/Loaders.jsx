export const FullScreenLoader = ({ title = "Traitement en cours...", message = "Veuillez patienter quelques instants" }) => (
  <div className="register-loader-overlay">
    <div className="loader-visual">
      <div className="loader-ring-outer"></div>
      <div className="loader-ring-inner"></div>
    </div>
    <div className="loader-content">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  </div>
);

export const PremiumLoader = ({ text = "Chargement" }) => (
  <div className="loading-screen">
    <div className="premium-loader">
      <div className="loader-ring"></div>
      <div className="loader-core"></div>
    </div>
    <p className="loading-text">{text}</p>
  </div>
);
