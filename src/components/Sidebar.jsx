import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from '../styles/Sidebar.module.css'
import logo from '../assets/logo.png'

const Sidebar = () => (
  <nav className={styles.sidebar}>
    <div className={styles.logoContainer}>
      <img src={logo} alt="Logo" className={styles.logo} />
    </div>
    <ul className={styles.menu}>
      <li>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : undefined}>
          Accueil
        </NavLink>
      </li>
      <li>
        <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : undefined}>
          Paramètres
        </NavLink>
      </li>
      <li>
        <NavLink to="/form" className={({ isActive }) => isActive ? styles.active : undefined}>
          Formulaire
        </NavLink>
      </li>
    </ul>
  </nav>
)

export default Sidebar
