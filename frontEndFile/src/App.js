import React from "react";
import Router from "./routes/Router";
import { AppProvider } from "./context/AppContext";
import ErrorBoundary from "./components/errors/ErrorBoundary";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <AppProvider>
      <ErrorBoundary>
        <>
          <Router />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1e293b",
                color: "#fff",
                borderRadius: "10px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </>
      </ErrorBoundary>
    </AppProvider>
  );
};

export default App;