// WebSocket Service - Vanilla JS version of websocketService.js

const EVENT_TYPES = {
    POST_CREATED: 'post_created',
    POST_LIKED: 'post_liked',
    USER_STATS_UPDATED: 'user_stats_updated',
    USER_STATUS_UPDATE: 'user_status_update',
    PRIVATE_MESSAGE: 'private_message',
    MESSAGES_READ: 'messages_read',
    USER_TYPING: 'user_typing',
    NOTIFICATION_UPDATE: 'notification_Update'
};

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.reconnectTimeout = null;
        this.pingInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.baseReconnectDelay = 3000;
        this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.statusMessageTimeout = null;
        this.statusDebounceDelay = 500;
        this.lastStatus = null;

        // Bind methods
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    connect() {
        if (!window.authService || !window.authService.isAuthenticated()) {
            console.warn('Cannot connect WebSocket: not authenticated');
            return;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.warn('WebSocket already connected');
            return;
        }

        try {
            const token = window.authService.token;
            const baseUrl = 'http://localhost:8080'; // Your Go backend URL
            const wsUrl = `ws://localhost:8080/ws?token=${token}&tabId=${this.tabId}`;

            console.log('Connecting to WebSocket:', wsUrl);
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = this.handleOpen.bind(this);
            this.socket.onclose = this.handleClose.bind(this);
            this.socket.onerror = this.handleError.bind(this);
            this.socket.onmessage = this.handleMessage.bind(this);

        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.scheduleReconnect();
        }
    }

    handleOpen() {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        window.showToast('Connected to server', 'success');

        // Update connection status
        this.updateConnectionStatus(true);

        // Start ping interval
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);

        // Notify listeners
        this.notifyListeners('connection', { connected: true });
    }

    handleClose(event) {
        console.log('WebSocket disconnected', event.code);
        this.updateConnectionStatus(false);
        this.socket = null;

        // Clear ping interval
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        // Handle different close codes
        if (event.code === 1006) {
            console.warn('WebSocket closed due to unauthorized access');
            window.showToast('Session expired. Please log in again.', 'error');
            window.authService.logout(false);
            return;
        }

        // Attempt reconnect if not normal closure
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }

        // Notify listeners
        this.notifyListeners('connection', { connected: false });
    }

    handleError(error) {
        console.error('WebSocket error:', error);
        if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
            this.socket.close();
        }
    }

    handleMessage(event) {
        try {
            const messages = event.data.split(/\n|\r\n/);

            for (const message of messages) {
                if (!message.trim()) continue;

                try {
                    const data = JSON.parse(message);

                    // Handle ping/pong
                    if (data.type === 'ping' || data.type === 'pong') {
                        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                            this.socket.send(JSON.stringify({ type: 'pong' }));
                        }
                        continue;
                    }

                    // Notify listeners of the event
                    this.notifyListeners(data.type, data.payload);

                } catch (innerError) {
                    console.error('Error parsing WebSocket message:', innerError, 'Raw:', message);
                }
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error, 'Raw:', event.data);
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Maximum reconnection attempts reached');
            window.showToast('Connection lost. Please refresh to reconnect.', 'error');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.baseReconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay / 1000} seconds`);

        this.reconnectTimeout = setTimeout(() => {
            if (window.authService && window.authService.isAuthenticated()) {
                this.connect();
            }
        }, delay);
    }

    disconnect() {
        // Clear timeouts
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        if (this.statusMessageTimeout) {
            clearTimeout(this.statusMessageTimeout);
            this.statusMessageTimeout = null;
        }

        // Close socket
        if (this.socket) {
            console.log('Closing WebSocket connection');
            this.socket.close();
            this.socket = null;
        }

        // Clear listeners
        this.listeners = {};
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(false);
    }

    sendMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
            return true;
        }
        return false;
    }

    sendStatusMessage(statusType) {
        // Clear any pending status message
        if (this.statusMessageTimeout) {
            clearTimeout(this.statusMessageTimeout);
        }

        // Don't send if it's the same as the last status
        if (this.lastStatus === statusType) {
            return;
        }

        this.statusMessageTimeout = setTimeout(() => {
            if (this.sendMessage({ type: statusType })) {
                console.log(`Sent ${statusType} message`);
                this.lastStatus = statusType;
            }
            this.statusMessageTimeout = null;
        }, this.statusDebounceDelay);
    }

    subscribe(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);

        // Return unsubscribe function
        return () => this.unsubscribe(eventType, callback);
    }

    unsubscribe(eventType, callback) {
        if (this.listeners[eventType]) {
            this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
        }
    }

    notifyListeners(eventType, payload) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach(callback => {
                try {
                    callback(payload);
                } catch (error) {
                    console.error('Listener error:', error);
                }
            });
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            if (isConnected) {
                statusElement.classList.remove('offline');
                statusElement.classList.add('online');
                statusElement.querySelector('span').textContent = 'Online';
            } else {
                statusElement.classList.remove('online');
                statusElement.classList.add('offline');
                statusElement.querySelector('span').textContent = 'Offline';
            }
        }
    }

    // Handle visibility changes
    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            this.sendStatusMessage('user_away');
        } else if (document.visibilityState === 'visible') {
            if (!this.isConnected() && window.authService && window.authService.isAuthenticated()) {
                this.connect();
            } else if (this.isConnected()) {
                this.sendStatusMessage('user_active');
            }
        }
    }
}

// Initialize the service
window.websocketService = new WebSocketService();

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    window.websocketService.handleVisibilityChange();
});

// Export EVENT_TYPES for use in other modules
window.EVENT_TYPES = EVENT_TYPES;