import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token, userId) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Join user's personal room for notifications
      if (userId) {
        this.socket.emit('join-user-room', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket;
  }

  // Event listeners
  onEventCreated(callback) {
    if (this.socket) {
      this.socket.on('eventCreated', callback);
    }
  }

  onTeamCreated(callback) {
    if (this.socket) {
      this.socket.on('teamCreated', callback);
    }
  }

  onMatchCreated(callback) {
    if (this.socket) {
      this.socket.on('matchCreated', callback);
    }
  }

  onMatchResultUpdated(callback) {
    if (this.socket) {
      this.socket.on('matchResultUpdated', callback);
    }
  }

  onRequestReceived(callback) {
    if (this.socket) {
      this.socket.on('requestReceived', callback);
    }
  }

  onRequestAccepted(callback) {
    if (this.socket) {
      this.socket.on('requestAccepted', callback);
    }
  }

  onRequestRejected(callback) {
    if (this.socket) {
      this.socket.on('requestRejected', callback);
    }
  }

  // Remove listeners
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
