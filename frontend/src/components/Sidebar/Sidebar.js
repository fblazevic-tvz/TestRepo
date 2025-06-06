import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import SuggestionIcon from '@mui/icons-material/LightbulbOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';

function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <aside className="app-sidebar">
      <nav>
        <ul className="sidebar-nav-list">
          {!isAdmin && (
            <li>
              <NavLink to="/dashboard" className={getNavLinkClass} end> 
                <SuggestionIcon className="sidebar-icon" />
                 Moji prijedlozi 
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <NavLink to="/dashboard/users" className={getNavLinkClass}> 
                <PeopleIcon className="sidebar-icon" />
                 Korisnici 
              </NavLink>
            </li>
          )}
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