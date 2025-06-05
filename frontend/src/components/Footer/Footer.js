import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <p>© {new Date().getFullYear()} IzjasniSe. All rights reserved.</p>
    </footer>
  );
}
export default Footer;