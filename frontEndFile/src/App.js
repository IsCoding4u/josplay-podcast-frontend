// src/App.jsx
import Router from "./routes/Router";
import { AppProvider } from "./context/AppContext";
import ErrorBoundary from "./components/errors/ErrorBoundary";

const App = () => {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </AppProvider>
  );
};

export default App;