import React from 'react';
import styles from './ButtonTheme.module.css';

interface ButtonThemeProps {
  checked: boolean;
  checkedHandler: () => void;
  themeHandler: () => void;
}

export const ButtonTheme = ({
  checked,
  checkedHandler = () => {},
  themeHandler,
}: ButtonThemeProps) => {
  return (
    <>
      <input
        id="toggle"
        type="checkbox"
        checked={checked}
        className={styles.input}
        onClick={checkedHandler}
        onChange={themeHandler}
      />
      <label htmlFor="toggle" className={styles.button}></label>
    </>
  );
};
