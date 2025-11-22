import React, { createContext, useState, useEffect } from "react";

// Create ThemeContext
export const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  // Default theme
  const [theme, setTheme] = useState({
    mode: "light", // light or dark
    primaryColor: "#3b82f6", // Tailwind blue-500
  });

  // Save theme to localStorage for persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  // Function to toggle light/dark mode
  const toggleMode = () => {
    setTheme((prev) => ({
      ...prev,
      mode: prev.mode === "light" ? "dark" : "light",
    }));
  };

  // Function to update primary color
  const setPrimaryColor = (color) => {
    setTheme((prev) => ({
      ...prev,
      primaryColor: color,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleMode, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
