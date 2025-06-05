import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import SuggestionIcon from '@mui/icons-material/LightbulbOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';

function Sidebar() {
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <aside className="app-sidebar">
      <nav>
        <ul className="sidebar-nav-list">
          <li>
            <NavLink to="/dashboard" className={getNavLinkClass} end> 
              <SuggestionIcon className="sidebar-icon" />
               Moji prijedlozi 
            </NavLink>
          </li>
           <li>
            <NavLink to="/dashboard/settings" className={getNavLinkClass}> 
              <SettingsIcon className="sidebar-icon" />
               Postavke 
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
export default Sidebar;