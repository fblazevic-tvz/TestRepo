import React from 'react';
import './Partners.css';

const partnersData = [
  { id: 1, src: '/TVZ-logo.svg', alt: 'TVZ Logo' },
  { id: 2, src: '/TVZ-logo-mc.svg', alt: 'TVZ Logo MC' }
];

function Partners() {
  return (
    <section className="partners-section">
      <ul className="partners-row">
        {partnersData.map(partner => (
          <li key={partner.id} className="partner-logo-container">
            <img
              src={partner.src}
              alt={partner.alt}
              className="partner-logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="partner-logo-fallback">{partner.alt}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Partners;