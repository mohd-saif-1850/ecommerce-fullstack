import { createContext, useContext, useState, useEffect } from "react";

const Theme = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(
    localStorage.getItem("mode") === "true" || false
  ); // false = light, true = dark

  useEffect(() => {
    const html = document.documentElement;
    if (mode) html.classList.add("dark");
    else html.classList.remove("dark");
    localStorage.setItem("mode", mode);
  }, [mode]);

  return (
    <Theme.Provider value={{ mode, setMode }}>
      {children}
    </Theme.Provider>
  );
};

export const useTheme = () => useContext(Theme);
