import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>

          Something went wrong. Refresh.
        </h2>;
    }

    return this.props.children;
  }

}

export default ErrorBoundary;