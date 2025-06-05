import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const RocketIconPlaceholder = () => (
  <div className="not-found-icon">
  </div>
);

function NotFoundPage() {
  return (
    <div className="not-found-page-content">
      <RocketIconPlaceholder />

      <div className="not-found-text-section">
        <div className="not-found-text-top">
          <h1 className="not-found-main-headline">404</h1>
          <h2 className="not-found-secondary-headline">Stranica nije pronađena</h2>
        </div>
        <p className="not-found-paragraph">
          Izgleda da stranica koju tražite ne postoji ili je premještena.
          Možda se želite vratiti na početnu stranicu?
        </p>
      </div>

      <Link to="/" className="not-found-button button-primary">
        Vrati se na početnu
      </Link>
    </div>
  );
}

export default NotFoundPage;
