import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '../../components/Navbar/Navbar';
import Partners from '../../components/Partners/Partners';
import Footer from '../../components/Footer/Footer';
import './MainLayout.css';
import AccessibilityController from '../../components/AccessibilityController/AccessibilityController';


function MainLayout({ children }) {
  return (
    <div className="app-container"> 
      <Navbar /> 
      <main className="page-content">
        {children}
      </main>
      <AccessibilityController/>
      <Partners />
      <Footer />
    </div>
  );
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MainLayout;