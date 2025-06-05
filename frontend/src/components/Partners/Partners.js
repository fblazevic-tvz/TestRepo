import React from 'react';
import './Partners.css';


const partnersData = [
  { id: 1, src: '/TVZ-logo.svg', alt: 'TVZ Logo' },
  { id: 2, src: '/TVZ-logo-mc.svg', alt: 'TVZ Logo MC' } 
];

function Partners() {
  return (
    <section className="partners-section"> 
      <div className="partners-row"> 
        {partnersData.map(partner => (
          <div key={partner.id} className="partner-logo-container">
            <img
              src={partner.src}
              alt={partner.alt}
              className="partner-logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="partner-logo-fallback">{partner.alt}</span> 
          </div>
        ))}
      </div>
    </section>
  );
}

export default Partners;