import React, { useState, useEffect } from 'react';
import './AccessibilityController.css';

function AccessibilityController() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // Percentage value
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('appFontSize');
    const savedDyslexicFont = localStorage.getItem('appDyslexicFont');
    const savedHighContrast = localStorage.getItem('appHighContrast');
    
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      applyFontSize(size);
    }
    
    if (savedDyslexicFont === 'true') {
      setIsDyslexicFont(true);
      applyDyslexicFont(true);
    }
    
    if (savedHighContrast === 'true') {
      setIsHighContrast(true);
      applyHighContrast(true);
    }
  }, []);

  const applyFontSize = (size) => {
    document.documentElement.style.fontSize = `${size}%`;
  };

  const applyDyslexicFont = (isEnabled) => {
    if (isEnabled) {
      // OpenDyslexic is a common dyslexia-friendly font
      // You can also use Comic Sans, Arial, or other sans-serif fonts
      document.body.style.fontFamily = 'OpenDyslexic, Comic Sans MS, Arial, sans-serif';
      // Add more spacing for better readability
      document.body.style.letterSpacing = '0.12em';
      document.body.style.wordSpacing = '0.16em';
      document.body.style.lineHeight = '1.8';
    } else {
      // Reset to original font
      document.body.style.fontFamily = "'Roboto', sans-serif";
      document.body.style.letterSpacing = 'normal';
      document.body.style.wordSpacing = 'normal';
      document.body.style.lineHeight = 'normal';
    }
  };

  const applyHighContrast = (isEnabled) => {
    if (isEnabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem('appFontSize', newSize.toString());
  };

  const handleDyslexicFontToggle = () => {
    const newValue = !isDyslexicFont;
    setIsDyslexicFont(newValue);
    applyDyslexicFont(newValue);
    localStorage.setItem('appDyslexicFont', newValue.toString());
  };

  const handleHighContrastToggle = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    applyHighContrast(newValue);
    localStorage.setItem('appHighContrast', newValue.toString());
  };

  const resetAllSettings = () => {
    // Reset font size
    setFontSize(100);
    applyFontSize(100);
    localStorage.setItem('appFontSize', '100');
    
    // Reset dyslexic font
    setIsDyslexicFont(false);
    applyDyslexicFont(false);
    localStorage.setItem('appDyslexicFont', 'false');
    
    // Reset high contrast
    setIsHighContrast(false);
    applyHighContrast(false);
    localStorage.setItem('appHighContrast', 'false');
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`accessibility-controller ${isOpen ? 'open' : ''}`}>
      <button 
        className="accessibility-toggle-button" 
        onClick={toggleOpen}
        aria-label="Postavke pristupačnosti"
        title="Postavke pristupačnosti"
      >
        <svg className="accessibility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="accessibility-panel">
          <h3 className="panel-title">Postavke pristupačnosti</h3>
          
          {/* Font Size Section */}
          <div className="control-section">
            <h4 className="section-title">Veličina teksta</h4>
            <div className="font-size-display">
              <span className="size-value">{fontSize}%</span>
            </div>
            <div className="slider-container">
              <span className="slider-label-min">A</span>
              <input
                type="range"
                min="70"
                max="150"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="font-size-slider"
                aria-label="Prilagodi veličinu teksta"
              />
              <span className="slider-label-max">A</span>
            </div>
          </div>

          {/* Dyslexic Font Toggle */}
          <div className="control-section">
            <h4 className="section-title">Font za disleksiju</h4>
            <p className="section-description">
              Koristi font prilagođen osobama s disleksijom
            </p>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isDyslexicFont}
                onChange={handleDyslexicFontToggle}
                aria-label="Uključi/isključi font za disleksiju"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* High Contrast Toggle */}
          <div className="control-section">
            <h4 className="section-title">Visoki kontrast</h4>
            <p className="section-description">
              Povećava kontrast za bolju vidljivost
            </p>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isHighContrast}
                onChange={handleHighContrastToggle}
                aria-label="Uključi/isključi visoki kontrast"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <button 
            className="reset-button"
            onClick={resetAllSettings}
          >
            Vrati sve na zadano
          </button>
        </div>
      )}
    </div>
  );
}

export default AccessibilityController;