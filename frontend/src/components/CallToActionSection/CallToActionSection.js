import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CallToActionSection.css'; 

function CallToActionSection() {
  const navigate = useNavigate();

  const goToAllSuggestions = () => {
    navigate('/suggestions'); 
  };

  return (
    <section className="cta-section">
      <div className="cta-content">
        <div className="cta-text">
            <h2 className="cta-headline">Glasaj za prijedloge!</h2>
            <p className="cta-paragraph">
                Pregledajte sve aktivne prijedloge građana za poboljšanje našeg grada
                i dajte svoj glas onima koji vam se najviše sviđaju. Vaše mišljenje je važno!
            </p>
        </div>
        <button onClick={goToAllSuggestions} className="cta-button button-primary"> 
          Svi prijedlozi
        </button>
      </div>

      <figure className="cta-image-area">
         <img
            src="/cta.jpg" 
            alt="Ilustracija glasanja za prijedloge" 
            className="cta-image" 
         />
      </figure>
    </section>
  );
}

export default CallToActionSection;