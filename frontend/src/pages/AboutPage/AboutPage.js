import React, { useState } from 'react';
import './AboutPage.css';
import PropTypes from 'prop-types';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`} onClick={toggleOpen}>
      <div className="faq-toggle">
        <span className="faq-question">{question}</span>
        <div className="faq-icon-placeholder">{isOpen ? '-' : '+'}</div>
      </div>
      {isOpen && (
        <div className="faq-answer">
          {answer}
        </div>
      )}
    </div>
  );
};

FaqItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
};

function AboutPage() {
  const faqData = [
    { id: 1, question: "Kako mogu predati svoj prijedlog?", answer: "Prijedlog možete predati putem obrasca dostupnog na stranici 'Novi prijedlog' nakon što se prijavite u sustav. Potrebno je ispuniti sva obavezna polja uključujući naziv, opis, lokaciju i procijenjeni trošak." },
    { id: 2, question: "Tko može glasati za prijedloge?", answer: "Pravo glasa imaju svi registrirani korisnici platforme koji su potvrđeni kao stanovnici grada za koji se prijedlog odnosi. Detalji o procesu verifikacije mogu se naći u pravilima korištenja." },
    { id: 3, question: "Kako se odabiru pobjednički prijedlozi?", answer: "Pobjednički prijedlozi odabiru se na temelju broja glasova prikupljenih tijekom perioda glasanja, uzimajući u obzir raspoloživi budžet za određeni natječaj i provjeru izvedivosti od strane gradskih službi." },
    { id: 4, question: "Gdje mogu pratiti status svog prijedloga?", answer: "Status vašeg prijedloga možete pratiti na stranici 'Moji prijedlozi' unutar vašeg korisničkog profila. Statusi uključuju 'Predano', 'U razmatranju', 'Odobreno', 'Odbijeno', 'Implementirano'." },
    { id: 5, question: "Kako mogu kontaktirati administratore?", answer: "Za kontakt s administratorima platforme, molimo koristite kontakt formu dostupnu na stranici 'Kontakt' ili pošaljite email na info@izjasnise.hr (primjer adrese)." }
  ];

  return (
    <div className="about-page-container">
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="about-hero-text">
            <h1 className="about-hero-headline">O nama</h1>
            <p className="about-hero-paragraph">
              Dobrodošli na IzjasniSe, platformu posvećenu poticanju građanskog
              angažmana i poboljšanju naših lokalnih zajednica. Vjerujemo u snagu
              kolektivnog glasa i transparentnost u donošenju odluka.
            </p>
            <p className="about-hero-paragraph">
              Naša misija je pružiti jednostavan i pristupačan način za građane da
              predlažu ideje, glasaju za prijedloge i prate obavijesti vezane uz
              razvoj grada.
            </p>
          </div>
        </div>
        <div className="about-hero-image-area">
          <img
            src="/cta.jpg"
            alt="Ilustracija suradnje u zajednici"
            className="about-hero-image"
          />
        </div>
      </section>

      <section className="about-team-section">
        <div className="section-text-container">
          <div className="section-text-top">
            <h2 className="section-secondary-headline">Naš tim</h2>
          </div>
          <p className="section-paragraph">
            Upoznajte ljude koji stoje iza platforme IzjasniSe, posvećene transparentnosti i boljitku zajednice.
          </p>
        </div>
        <div className="team-members-container">
          <div className="team-member-card">
            <div className="team-member-image-wrapper">
              <img
                src="/personPlaceholder.jpg"
                alt="Član tima - Franjo Blažević"
                className="team-member-image"
              />
            </div>
            <div className="team-member-info">
              <span className="team-member-name">Franjo Blažević</span>
              <span className="team-member-role">Razvojni inženjer</span>
            </div>
          </div>
          <div className="team-member-card">
            <div className="team-member-image-wrapper">
              <img
                src="/personPlaceholder.jpg"
                alt="Član tima - Dario Drame"
                className="team-member-image"
              />
            </div>
            <div className="team-member-info">
              <span className="team-member-name">Dario Drame</span>
              <span className="team-member-role">Dizajn i arhitektura informacija</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-faq-section">
        <div className="section-text-container">
          <div className="section-text-top">
            <h2 className="section-secondary-headline">Često postavljana pitanja</h2>
          </div>
        </div>
        <div className="faq-list">
          {faqData.map(faq => (
            <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
