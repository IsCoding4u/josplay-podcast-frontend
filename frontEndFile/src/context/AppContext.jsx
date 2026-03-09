import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{
        episodes,
        setEpisodes,
        loading,
        setLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};