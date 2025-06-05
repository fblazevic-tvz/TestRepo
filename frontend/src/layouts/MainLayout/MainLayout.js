import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '../../components/Navbar/Navbar';
import Partners from '../../components/Partners/Partners';
import Footer from '../../components/Footer/Footer';
import './MainLayout.css';

function MainLayout({ children }) {
  return (
    <div className="app-container"> 
      <Navbar /> 
      <main className="page-content">
        {children}
      </main>
      <Partners />
      <Footer />
    </div>
  );
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;