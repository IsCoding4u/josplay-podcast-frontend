// WebSocketClient.js
// ------------------
// This file handles WebSocket connections for real-time updates.
// Commented out for testing REST API without connection errors.


class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.initSocket();
  }

  initSocket() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected to", this.url);
    };

    this.socket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  sendMessage(msg) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      console.warn("WebSocket not connected. Message not sent.");
    }
  }
}

// Example instantiation (commented out for testing)
// const wsClient = new WebSocketClient("ws://localhost:3001/ws");
// export default wsClient;
