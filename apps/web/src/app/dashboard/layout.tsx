'use client';
import React, { useState, useContext } from 'react';
import styles from './DashboardLayout.module.css';
import classNames from 'classnames';
import ThemeContext from '@/contexts/ThemeContext';
import Navbar from '@/components/layouts/Dashboard/Navbar';
import Sidenav from '@/components/layouts/Dashboard/Sidenav';

export const DashboardLayout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const [nav, setNav] = useState('hidden');

  const handleNav = () => {
    if (nav === 'visible') setNav('hidden');
    else setNav('visible');
  };
  const handleClose = () => {
    if (nav === 'visible') setNav('hidden');
  };

  return (
    <div className={classNames(styles.dashboard, styles[theme])}>
      <Navbar nav={nav} handleNav={handleNav} />
      <Sidenav nav={nav} handleNav={handleClose} />
      <div className={styles.container}>
        <div className={styles.group}>
          <div className={styles.grid}>
            <div className={styles.spacer}></div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardLayout;
