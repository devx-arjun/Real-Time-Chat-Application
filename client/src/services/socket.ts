type SocketPayload = Record<string, unknown>;

type MessageListener = (message: SocketPayload) => void;
type ErrorListener = (message: string) => void;
type AuthListener = () => void;
type ConnectionListener = (connected: boolean) => void;

class LinkUpSocket {
  private socket: WebSocket | null = null;

  private guestId: string | null = null;
  private authenticated = false;

  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private manuallyDisconnected = false;

  private joinedConversations = new Set<string>();

  private messageListeners = new Set<MessageListener>();
  private authListeners = new Set<AuthListener>();
  private errorListeners = new Set<ErrorListener>();
  private connectionListeners = new Set<ConnectionListener>();

  /**
   * Connect to the backend WebSocket server.
   */
  connect(guestId: string) {
    if (!guestId) {
      throw new Error("Guest ID is required");
    }

    this.guestId = guestId;
    this.manuallyDisconnected = false;

    // Already connected or connecting.
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.createConnection();
  }

  /**
   * Create the actual WebSocket connection.
   */
  private createConnection() {
    if (!this.guestId) {
      return;
    }

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (!this.guestId) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

    const wsUrl = apiUrl
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:")
      .replace(/\/api\/?$/, "/ws");

    console.log("Connecting WebSocket:", wsUrl);

    this.socket = new WebSocket(wsUrl);
    this.authenticated = false;

    this.socket.onopen = () => {
      console.log("WebSocket connected");

      this.reconnectAttempts = 0;

      this.notifyConnection(true);

      // Backend expects:
      // { type: "auth", guestId }
      this.send({
        type: "auth",
        guestId: this.guestId,
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SocketPayload;

        console.log("WebSocket received:", data);

        const type = data.type;

        if (type === "auth:success") {
          this.authenticated = true;

          console.log("WebSocket authenticated");

          this.authListeners.forEach((listener) => {
            listener();
          });

          // Re-join conversations after reconnect.
          this.joinedConversations.forEach((conversationId) => {
            this.send({
              type: "conversation:join",
              conversationId,
            });
          });

          return;
        }

        if (type === "error") {
          const errorMessage =
            typeof data.message === "string" ? data.message : "WebSocket error";

          console.error("WebSocket server error:", errorMessage);

          this.errorListeners.forEach((listener) => {
            listener(errorMessage);
          });

          return;
        }

        this.messageListeners.forEach((listener) => {
          listener(data);
        });
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket disconnected", event.code, event.reason);

      this.authenticated = false;

      this.socket = null;

      this.notifyConnection(false);

      if (!this.manuallyDisconnected) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect() {
    this.manuallyDisconnected = true;

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.authenticated = false;
    this.joinedConversations.clear();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.notifyConnection(false);
  }

  private scheduleReconnect() {
    if (this.manuallyDisconnected || !this.guestId) {
      return;
    }

    if (this.reconnectTimer !== null) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    this.reconnectAttempts += 1;

    console.log(`WebSocket reconnecting in ${delay}ms...`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;

      if (!this.manuallyDisconnected) {
        this.createConnection();
      }
    }, delay);
  }

  private send(payload: SocketPayload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return false;
    }

    this.socket.send(JSON.stringify(payload));

    return true;
  }

  joinConversation(conversationId: string) {
    if (!conversationId) {
      return false;
    }

    this.joinedConversations.add(conversationId);

    if (!this.authenticated) {
      console.log(
        "Conversation queued until WebSocket authentication:",
        conversationId,
      );

      return true;
    }

    return this.send({
      type: "conversation:join",
      conversationId,
    });
  }

  leaveConversation(conversationId: string) {
    if (!conversationId) {
      return false;
    }

    this.joinedConversations.delete(conversationId);

    if (!this.authenticated) {
      return true;
    }

    return this.send({
      type: "conversation:leave",
      conversationId,
    });
  }

  sendMessage(conversationId: string, content: string, replyToId?: string) {
    const cleanContent = content.trim();

    if (!conversationId || !cleanContent) {
      return false;
    }

    if (!this.authenticated) {
      console.warn("Cannot send message: WebSocket is not authenticated");

      return false;
    }

    return this.send({
      type: "message:send",
      conversationId,
      content: cleanContent,
      ...(replyToId ? { replyToId } : {}),
    });
  }

  startTyping(conversationId: string) {
    if (!conversationId || !this.authenticated) {
      return false;
    }

    return this.send({
      type: "typing:start",
      conversationId,
    });
  }

  stopTyping(conversationId: string) {
    if (!conversationId || !this.authenticated) {
      return false;
    }

    return this.send({
      type: "typing:stop",
      conversationId,
    });
  }

  /**
   * Edit an existing message.
   */
  editMessage(messageId: string, content: string) {
    const cleanContent = content.trim();

    if (!messageId || !cleanContent) {
      return false;
    }

    if (!this.authenticated) {
      console.warn("Cannot edit message: WebSocket is not authenticated");
      return false;
    }

    return this.send({
      type: "message:edit",
      messageId,
      content: cleanContent,
    });
  }

  /**
   * Delete an existing message.
   */
  deleteMessage(messageId: string) {
    if (!messageId) {
      return false;
    }

    if (!this.authenticated) {
      console.warn("Cannot delete message: WebSocket is not authenticated");
      return false;
    }

    return this.send({
      type: "message:delete",
      messageId,
    });
  }

  /**
   * Add or remove a reaction from a message.
   */
  toggleReaction(messageId: string, emoji: string) {
    const cleanEmoji = emoji.trim();

    if (!messageId || !cleanEmoji) {
      return false;
    }

    if (!this.authenticated) {
      console.warn("Cannot react to message: WebSocket is not authenticated");
      return false;
    }

    return this.send({
      type: "message:reaction",
      messageId,
      emoji: cleanEmoji,
    });
  }

  /**
   * Subscribe to all incoming WebSocket messages.
   */
  onMessage(listener: MessageListener) {
    this.messageListeners.add(listener);

    return () => {
      this.messageListeners.delete(listener);
    };
  }

  /**
   * Subscribe to server errors.
   */
  onError(listener: ErrorListener) {
    this.errorListeners.add(listener);

    return () => {
      this.errorListeners.delete(listener);
    };
  }

  /**
   * Subscribe to successful authentication.
   */
  onAuthenticated(listener: AuthListener) {
    this.authListeners.add(listener);

    return () => {
      this.authListeners.delete(listener);
    };
  }

  /**
   * Subscribe to connection state changes.
   */
  onConnectionChange(listener: ConnectionListener) {
    this.connectionListeners.add(listener);

    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Check whether the socket is connected.
   */
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Check whether the socket has authenticated.
   */
  isAuthenticated() {
    return this.authenticated;
  }

  private notifyConnection(connected: boolean) {
    this.connectionListeners.forEach((listener) => {
      listener(connected);
    });
  }
}

export const socket = new LinkUpSocket();
