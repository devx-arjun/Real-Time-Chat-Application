import {
  ArrowLeft,
  Bell,
  Check,
  Copy,
  Hash,
  Info,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Send,
  Smile,
  Trash2,
  Users,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  deleteConversation,
  getConversation,
  getMessages,
  joinConversation,
  leaveConversation,
} from "../api/conversation.api";
import type {
  Conversation,
  ConversationMessage,
  MessageReaction,
} from "../api/conversation.api";
import { useAuth } from "../context/useAuth";
import { socket } from "../services/socket";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "🔥", "😮", "🎉"];
const emojis = [
  "😀",
  "😂",
  "😍",
  "😊",
  "😭",
  "😎",
  "🤔",
  "😮",
  "😢",
  "😡",
  "❤️",
  "🔥",
  "👍",
  "👏",
  "🎉",
  "🙌",
];

function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-violet-100 bg-violet-50 text-violet-500">
        <MessageCircle size={28} strokeWidth={1.6} />
      </div>

      <h2 className="mt-5 text-lg font-black tracking-tight text-slate-950">
        Start the conversation
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
        Send the first message and get the conversation moving.
      </p>
    </div>
  );
}

function formatTime(date?: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function isConversationMessage(value: unknown): value is ConversationMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<ConversationMessage>;

  return (
    typeof message.id === "string" &&
    typeof message.content === "string" &&
    typeof message.conversationId === "string" &&
    typeof message.senderId === "string"
  );
}

export default function ChatPage() {
  const { guestId, guest } = useAuth();
  const currentUserId = guest?.id;

  const { conversationId } = useParams<{
    conversationId: string;
  }>();

  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [showInfo, setShowInfo] = useState(false);

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [conversationActionLoading, setConversationActionLoading] =
    useState(false);

  const [conversationActionError, setConversationActionError] = useState<
    string | null
  >(null);

  const [sending, setSending] = useState(false);

  const [socketConnected, setSocketConnected] = useState(socket.isConnected());
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [editingContent, setEditingContent] = useState("");

  const [savingEdit, setSavingEdit] = useState(false);

  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(
    null,
  );

  const [openReactionMessageId, setOpenReactionMessageId] = useState<
    string | null
  >(null);

  const [typingUsers, setTypingUsers] = useState<
    { id: string; username: string }[]
  >([]);

  const [codeCopied, setCodeCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Conversation permissions
  const isConversationOwner =
    !!currentUserId &&
    !!conversation?.ownerId &&
    conversation.ownerId === currentUserId;

  const canManageConversation = isParticipant === true;

  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const initialLoadRef = useRef(true);

  const loadingOlderRef = useRef(false);

  const shouldScrollToBottomRef = useRef(false);

  const pendingScrollRestoreRef = useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);

  const isParticipantRef = useRef<boolean | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const infoPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    isParticipantRef.current = isParticipant;
  }, [isParticipant]);

  const conversationTitle =
    conversation?.title || conversation?.space?.name || "Conversation";

  const participantCount = conversation?._count?.participants ?? 0;

  const hasMessages = messages.length > 0;

  const canSendMessage =
    isParticipant === true && socketConnected && socket.isAuthenticated();

  /*
   * =========================================================
   * LOAD CONVERSATION
   * =========================================================
   */

  useEffect(() => {
    if (!guestId || !conversationId) {
      setConversation(null);
      setIsParticipant(null);
      return;
    }

    const id = conversationId;
    let cancelled = false;

    async function loadConversation() {
      try {
        setIsParticipant(null);

        const data = await getConversation(id);

        if (cancelled) {
          return;
        }

        setConversation(data.conversation);

        // Already a participant.
        if (data.isParticipant) {
          setIsParticipant(true);
          return;
        }

        // Private conversations must be explicitly joined.
        if (data.conversation.isPrivate) {
          setIsParticipant(false);
          return;
        }

        // Public conversation — automatically join.
        await joinConversation(id);

        if (cancelled) {
          return;
        }

        setIsParticipant(true);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load/join conversation:", error);

          setIsParticipant(false);
          setConversation(null);
        }
      }
    }

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [guestId, conversationId, currentUserId]);

  /*
   * =========================================================
   * INITIAL SCROLL
   * =========================================================
   */

  useEffect(() => {
    if (loadingMessages) {
      return;
    }

    if (!initialLoadRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
      });

      initialLoadRef.current = false;
    });
  }, [loadingMessages]);

  /*
   * =========================================================
   * LOAD MESSAGES
   * =========================================================
   */

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    if (isParticipant !== true) {
      setLoadingMessages(isParticipant === null);
      return;
    }

    const id = conversationId;
    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setMessagesError(null);
        setMessages([]);
        setNextCursor(null);

        initialLoadRef.current = true;
        shouldScrollToBottomRef.current = false;

        const data = await getMessages(id, 50);

        if (cancelled) {
          return;
        }

        setMessages(data.messages);
        setNextCursor(data.nextCursor);
      } catch (error: any) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load messages:", error);

        setMessagesError(
          error?.response?.data?.message || "Failed to load messages.",
        );
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationId, isParticipant]);

  /*
   * =========================================================
   * LOAD OLDER MESSAGES
   * =========================================================
   */

  const loadOlderMessages = async () => {
    if (
      !conversationId ||
      !nextCursor ||
      loadingMore ||
      loadingOlderRef.current
    ) {
      return;
    }

    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    try {
      loadingOlderRef.current = true;
      setLoadingMore(true);

      const data = await getMessages(conversationId, 50, nextCursor);

      pendingScrollRestoreRef.current = {
        scrollTop: previousScrollTop,
        scrollHeight: previousScrollHeight,
      };

      setMessages((current) => {
        const existingIds = new Set(current.map((item) => item.id));

        const uniqueOlderMessages = data.messages.filter(
          (item) => !existingIds.has(item.id),
        );

        return [...uniqueOlderMessages, ...current];
      });

      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      loadingOlderRef.current = false;
      setLoadingMore(false);
    }
  };

  useLayoutEffect(() => {
    const pending = pendingScrollRestoreRef.current;

    const container = messagesContainerRef.current;

    if (!pending || !container) {
      return;
    }

    const newScrollHeight = container.scrollHeight;

    const heightDifference = newScrollHeight - pending.scrollHeight;

    container.scrollTop = pending.scrollTop + heightDifference;

    pendingScrollRestoreRef.current = null;
  }, [messages.length]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    if (container.scrollTop <= 100) {
      void loadOlderMessages();
    }
  };
  function handleEmojiClick(emoji: string) {
    setMessage((current) => `${current}${emoji}`);
    setShowEmojiPicker(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    // Allows selecting the same file again later.
    event.target.value = "";
  }

  function removeSelectedFile() {
    setSelectedFile(null);
  }

  /*
   * =========================================================
   * MESSAGE SORTING
   * =========================================================
   */

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messages],
  );

  const isNearBottom = () => {
    const container = messagesContainerRef.current;

    if (!container) {
      return true;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    return distanceFromBottom < 140;
  };

  /*
   * =========================================================
   * WEBSOCKET
   * =========================================================
   */

  useEffect(() => {
    if (!guestId || !conversationId) {
      return;
    }

    console.log("Setting up WebSocket for conversation:", conversationId);

    const unsubscribeConnection = socket.onConnectionChange((connected) => {
      setSocketConnected(connected);
    });

    const unsubscribeAuth = socket.onAuthenticated(() => {
      console.log("WebSocket authenticated:", conversationId);

      if (isParticipantRef.current === true) {
        console.log(
          "Participant confirmed. Joining conversation:",
          conversationId,
        );

        socket.joinConversation(conversationId);
      }
    });

    const unsubscribeMessages = socket.onMessage((data) => {
      /*
       * MESSAGE CREATED
       */

      if (data.type === "message:new") {
        const incomingMessage = data.message;

        if (!isConversationMessage(incomingMessage)) {
          return;
        }

        if (incomingMessage.conversationId !== conversationId) {
          return;
        }

        const shouldScroll = isNearBottom();

        setMessages((current) => {
          if (current.some((item) => item.id === incomingMessage.id)) {
            return current;
          }

          return [...current, incomingMessage];
        });

        shouldScrollToBottomRef.current = shouldScroll;

        return;
      }

      /*
       * MESSAGE UPDATED
       */

      if (data.type === "message:updated") {
        const updatedMessage = data.message;

        if (!isConversationMessage(updatedMessage)) {
          return;
        }

        if (updatedMessage.conversationId !== conversationId) {
          return;
        }

        setMessages((current) =>
          current.map((item) =>
            item.id === updatedMessage.id ? updatedMessage : item,
          ),
        );

        return;
      }

      /*
       * MESSAGE DELETED
       */

      if (data.type === "message:deleted") {
        const deletedMessage = data.message;

        if (!isConversationMessage(deletedMessage)) {
          return;
        }

        if (deletedMessage.conversationId !== conversationId) {
          return;
        }

        setMessages((current) =>
          current.map((item) =>
            item.id === deletedMessage.id ? deletedMessage : item,
          ),
        );

        return;
      }

      /*
       * REACTION
       */

      if (data.type === "message:reaction") {
        if (
          typeof data.messageId !== "string" ||
          data.conversationId !== conversationId
        ) {
          return;
        }

        if (!Array.isArray(data.reactions)) {
          return;
        }

        setMessages((current) =>
          current.map((item) =>
            item.id === data.messageId
              ? {
                  ...item,
                  reactions: data.reactions as MessageReaction[],
                }
              : item,
          ),
        );

        return;
      }

      /*
       * CONVERSATION JOINED
       */

      if (data.type === "conversation:joined") {
        console.log("Joined conversation:", data.conversationId);
        return;
      }

      /*
       * PARTICIPANT JOINED
       */

      if (data.type === "conversation:participant_joined") {
        if (data.conversationId !== conversationId) {
          return;
        }

        const participant = data.participant;

        if (!participant?.id || !participant.user?.id) {
          return;
        }

        setConversation((current) => {
          if (!current) {
            return current;
          }

          const alreadyExists = current.participants?.some(
            (item) => item.id === participant.id,
          );

          if (alreadyExists) {
            return current;
          }

          return {
            ...current,
            participants: [...(current.participants ?? []), participant],
            _count: {
              ...current._count,
              participants: (current._count?.participants ?? 0) + 1,
            },
          };
        });

        return;
      }

      /*
       * PARTICIPANT LEFT
       */

      if (data.type === "conversation:participant_left") {
        if (
          data.conversationId !== conversationId ||
          typeof data.userId !== "string"
        ) {
          return;
        }

        setConversation((current) => {
          if (!current) {
            return current;
          }

          const participants = current.participants ?? [];

          const removed = participants.some(
            (item) => item.user?.id === data.userId,
          );

          if (!removed) {
            return current;
          }

          return {
            ...current,
            participants: participants.filter(
              (item) => item.user?.id !== data.userId,
            ),
            _count: {
              ...current._count,
              participants: Math.max(
                0,
                (current._count?.participants ?? participants.length) - 1,
              ),
            },
          };
        });

        return;
      }

      /*
       * TYPING START
       */

      if (data.type === "typing:start") {
        if (
          data.conversationId !== conversationId ||
          data.userId === currentUserId
        ) {
          return;
        }

        if (
          typeof data.userId !== "string" ||
          typeof data.username !== "string"
        ) {
          return;
        }

        const userId = data.userId;
        const username = data.username;

        setTypingUsers((current) => {
          if (current.some((user) => user.id === data.userId)) {
            return current;
          }

          return [
            ...current,
            {
              id: userId,
              username,
            },
          ];
        });

        return;
      }

      /*
       * TYPING STOP
       */

      if (data.type === "typing:stop") {
        if (data.conversationId !== conversationId || !data.userId) {
          return;
        }

        setTypingUsers((current) =>
          current.filter((user) => user.id !== data.userId),
        );
      }
    });

    const unsubscribeErrors = socket.onError((error) => {
      console.error("WebSocket server error:", error);
    });

    // Start/reuse the WebSocket connection.
    socket.connect(guestId);

    return () => {
      console.log("Cleaning up WebSocket conversation:", conversationId);

      unsubscribeConnection();
      unsubscribeAuth();
      unsubscribeMessages();
      unsubscribeErrors();

      if (isParticipantRef.current === true) {
        socket.leaveConversation(conversationId);
      }
    };
  }, [guestId, conversationId, currentUserId]);

  useEffect(() => {
    if (!guestId || !conversationId || isParticipant !== true) {
      return;
    }

    if (!socket.isAuthenticated()) {
      return;
    }

    console.log(
      "Participant confirmed. Joining WebSocket conversation:",
      conversationId,
    );

    socket.joinConversation(conversationId);
  }, [guestId, conversationId, isParticipant]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });

      shouldScrollToBottomRef.current = false;
    });
  }, [messages.length]);

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!conversationId || !socket.isAuthenticated()) {
      return;
    }

    // Input was cleared.
    if (!value.trim()) {
      if (isTypingRef.current) {
        socket.stopTyping(conversationId);
        isTypingRef.current = false;
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = null;
      }

      return;
    }

    // Only send typing:start once.
    if (!isTypingRef.current) {
      socket.startTyping(conversationId);
      isTypingRef.current = true;
    }

    // Reset inactivity timer.
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.stopTyping(conversationId);

      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 1500);
  };

  /*
   * =========================================================
   * SEND MESSAGE
   * =========================================================
   */

  const handleSubmit = async () => {
    const value = message.trim();

    if (!value || sending || !conversationId) {
      return;
    }

    if (!canSendMessage) {
      console.warn("Cannot send message: conversation is not ready.");
      return;
    }

    try {
      setSending(true);

      const sent = socket.sendMessage(conversationId, value);

      if (!sent) {
        throw new Error("WebSocket is not connected.");
      }

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  /*
   * =========================================================
   * DELETE MESSAGE
   * =========================================================
   */

  async function handleDeleteMessage(messageId: string) {
    if (!messageId || deletingMessageId) {
      return;
    }

    try {
      setDeletingMessageId(messageId);
      setOpenMessageMenuId(null);

      const sent = socket.deleteMessage(messageId);

      if (!sent) {
        throw new Error("WebSocket is not connected.");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setDeletingMessageId(null);
    }
  }

  /*
   * =========================================================
   * EDIT MESSAGE
   * =========================================================
   */

  function startEditingMessage(item: ConversationMessage) {
    if (item.deletedAt) {
      return;
    }

    setOpenMessageMenuId(null);
    setEditingMessageId(item.id);
    setEditingContent(item.content);
  }

  function cancelEditingMessage() {
    setEditingMessageId(null);
    setEditingContent("");
    setSavingEdit(false);
  }

  async function handleEditMessage(messageId: string) {
    const cleanContent = editingContent.trim();

    const originalMessage = messages.find((item) => item.id === messageId);

    if (
      !messageId ||
      !cleanContent ||
      savingEdit ||
      !originalMessage ||
      cleanContent === originalMessage.content.trim()
    ) {
      return;
    }

    try {
      setSavingEdit(true);

      const sent = socket.editMessage(messageId, cleanContent);

      if (!sent) {
        throw new Error("WebSocket is not connected.");
      }

      setEditingMessageId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    } finally {
      setSavingEdit(false);
    }
  }

  /*
   * =========================================================
   * REACTIONS
   * =========================================================
   */

  function handleReaction(messageId: string, emoji: string) {
    if (!messageId || !emoji) {
      return;
    }

    if (!socket.isAuthenticated()) {
      console.warn("Cannot react: WebSocket is not authenticated.");

      return;
    }

    const sent = socket.toggleReaction(messageId, emoji);

    if (!sent) {
      console.warn("Failed to send reaction: WebSocket is not connected.");

      return;
    }

    setOpenReactionMessageId(null);
  }

  /*
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  /*
   * =========================================================
   * COPY PRIVATE CONVERSATION CODE
   * =========================================================
   */

  async function handleCopyJoinCode() {
    const code = conversation?.joinCode;

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);

      setCodeCopied(true);

      window.setTimeout(() => {
        setCodeCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy conversation code:", error);
    }
  }

  /*
   * =========================================================
   * CLEANUP TYPING
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = null;
      }

      if (isTypingRef.current && conversationId) {
        socket.stopTyping(conversationId);
        isTypingRef.current = false;
      }
    };
  }, [conversationId]);

  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setShowMoreMenu(false);
      setShowInfo(false);
      setShowEmojiPicker(false);
      setOpenMessageMenuId(null);
      setOpenReactionMessageId(null);

      if (!conversationActionLoading) {
        setShowDeleteConfirm(false);
        setShowLeaveConfirm(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [conversationActionLoading]);

  useEffect(() => {
    if (!showInfo) {
      return;
    }

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (
        infoPanelRef.current?.contains(target) ||
        infoButtonRef.current?.contains(target)
      ) {
        return;
      }

      setShowInfo(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showInfo]);

  async function handleDeleteConversation() {
    if (!conversationId || conversationActionLoading) {
      return;
    }

    try {
      setConversationActionLoading(true);
      setConversationActionError(null);

      await deleteConversation(conversationId);

      navigate(
        conversation?.spaceId ? `/space/${conversation.spaceId}` : "/home",
        { replace: true },
      );
    } catch (error: any) {
      console.error("Failed to delete conversation:", error);

      setConversationActionError(
        error?.response?.data?.message || "Failed to delete conversation.",
      );
    } finally {
      setConversationActionLoading(false);
    }
  }

  async function handleLeaveConversation() {
    if (!conversationId || conversationActionLoading) {
      return;
    }

    try {
      setConversationActionLoading(true);
      setConversationActionError(null);

      await leaveConversation(conversationId);

      navigate(
        conversation?.spaceId ? `/space/${conversation.spaceId}` : "/home",
        { replace: true },
      );
    } catch (error: any) {
      console.error("Failed to leave conversation:", error);

      setConversationActionError(
        error?.response?.data?.message || "Failed to leave conversation.",
      );
    } finally {
      setConversationActionLoading(false);
    }
  }

  return (
    <div
      className="
    flex
    h-[calc(100dvh-75px)]
    min-h-0
    flex-col
    overflow-hidden
    rounded-none
    border-0
    bg-white
    shadow-none
    sm:h-[calc(100dvh-75px)]
    sm:rounded-[26px]
    sm:border
    sm:border-slate-200/80
    sm:shadow-[0_18px_60px_rgba(15,23,42,0.07)]
    md:h-[calc(100dvh-90px)]
  "
    >
      {/* CHAT HEADER */}
      <header className="flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200/70 bg-white px-3.5 sm:h-[65px] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={
              conversation?.spaceId ? `/space/${conversation.spaceId}` : "/home"
            }
            className="
              grid
              h-9
              w-9
              shrink-0
              place-items-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-900
            "
          >
            <ArrowLeft size={18} />
          </Link>

          <div
            className="
              grid
             h-9 w-9 sm:h-10 sm:w-10
              shrink-0
              place-items-center
              rounded-[13px]
              border
              border-violet-100
              bg-violet-50
              text-violet-600
            "
          >
            {conversation?.space ? (
              <Hash size={18} />
            ) : (
              <MessageCircle size={18} />
            )}
          </div>

          <div className="min-w-0">
            {/* Conversation name + connection status */}
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-black tracking-tight text-slate-950">
                {conversationTitle}
              </h1>

              <div
                className={[
                  "flex shrink-0 items-center gap-1 text-[9px] font-semibold sm:text-[10px]",
                  socketConnected ? "text-emerald-600" : "text-amber-600",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    socketConnected
                      ? "bg-emerald-500"
                      : "animate-pulse bg-amber-400",
                  ].join(" ")}
                />

                <span>{socketConnected ? "Connected" : "Reconnecting..."}</span>
              </div>
            </div>

            {/* Space + participant count */}
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-[11px]">
              {conversation?.space?.name ? (
                <>
                  <span className="max-w-[120px] truncate">
                    {conversation.space.name}
                  </span>

                  <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                  <span className="shrink-0">
                    {participantCount}{" "}
                    {participantCount === 1 ? "participant" : "participants"}
                  </span>
                </>
              ) : (
                <span>
                  {participantCount}{" "}
                  {participantCount === 1 ? "participant" : "participants"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="
              hidden
              h-9
              w-9
              place-items-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-900
              sm:grid
            "
            aria-label="Notifications"
          >
            <Bell size={17} />
          </button>

          <button
            ref={infoButtonRef}
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className={[
              "grid h-9 w-9 place-items-center rounded-xl transition",
              showInfo
                ? "bg-violet-50 text-violet-600"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
            aria-label="Conversation info"
          >
            <Info size={17} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((value) => !value)}
              className="
      grid
      h-9
      w-9
      place-items-center
      rounded-xl
      text-slate-400
      transition
      hover:bg-slate-100
      hover:text-slate-900
    "
              aria-label="More options"
              aria-expanded={showMoreMenu}
            >
              <MoreHorizontal size={18} />
            </button>

            {showMoreMenu && (
              <>
                {/* Outside click */}
                <button
                  type="button"
                  aria-label="Close more options"
                  onClick={() => setShowMoreMenu(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                  {canManageConversation && isConversationOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setConversationActionError(null);
                        setShowDeleteConfirm(true);
                      }}
                      className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-red-600
              transition
              hover:bg-red-50
            "
                    >
                      <Trash2 size={16} />
                      Delete conversation
                    </button>
                  )}

                  {canManageConversation && !isConversationOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setConversationActionError(null);
                        setShowLeaveConfirm(true);
                      }}
                      className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-slate-600
              transition
              hover:bg-slate-50
            "
                    >
                      <ArrowLeft size={16} />
                      Leave conversation
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CHAT BODY */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Messages */}

          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="
  min-h-0
  flex-1
  overflow-x-hidden
  overflow-y-auto
  overscroll-contain
  bg-white
  px-3
  py-4
  sm:px-6
  sm:py-6
  lg:px-8
"
          >
            {loadingMessages ? (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={[
                      "flex animate-pulse gap-3",
                      item % 2 === 0 ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {item % 2 !== 0 && (
                      <div className="h-8 w-8 shrink-0 rounded-[10px] bg-slate-100" />
                    )}

                    <div
                      className={[
                        "h-12 rounded-[18px] bg-slate-100",
                        item % 2 === 0 ? "w-40" : "w-56",
                      ].join(" ")}
                    />
                  </div>
                ))}
              </div>
            ) : messagesError ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-[18px] border border-red-100 bg-red-50 text-red-500">
                  <MessageCircle size={24} />
                </div>

                <h2 className="mt-4 text-sm font-black text-slate-950">
                  Couldn't load messages
                </h2>

                <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
                  {messagesError}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="
                    mt-4
                    rounded-xl
                    bg-slate-950
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-white
                    transition
                    hover:bg-slate-800
                  "
                >
                  Try again
                </button>
              </div>
            ) : !hasMessages ? (
              <EmptyChat />
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {loadingMore && (
                  <div className="flex justify-center py-2">
                    <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-400">
                      Loading older messages...
                    </span>
                  </div>
                )}

                {sortedMessages.map((item, index) => {
                  const senderId = item.senderId || item.sender?.id;

                  const mine = !!currentUserId && senderId === currentUserId;

                  const username =
                    item.sender?.username || (mine ? "You" : "Member");

                  const previous = sortedMessages[index - 1];

                  const previousSender =
                    previous?.senderId || previous?.sender?.id;

                  const grouped = previousSender === senderId;

                  const deleted = !!item.deletedAt;

                  const myReaction = currentUserId
                    ? item.reactions?.find(
                        (reaction) => reaction.user?.id === currentUserId,
                      )
                    : undefined;

                  const groupedReactions = Object.values(
                    (item.reactions ?? []).reduce<
                      Record<
                        string,
                        {
                          emoji: string;
                          count: number;
                          hasMine: boolean;
                          users: string[];
                        }
                      >
                    >((groups, reaction) => {
                      const key = reaction.emoji;

                      if (!groups[key]) {
                        groups[key] = {
                          emoji: reaction.emoji,
                          count: 0,
                          hasMine: false,
                          users: [],
                        };
                      }

                      groups[key].count += 1;

                      const username = reaction.user?.username || "Member";

                      groups[key].users.push(username);

                      if (reaction.user?.id === currentUserId) {
                        groups[key].hasMine = true;
                      }

                      return groups;
                    }, {}),
                  );

                  return (
                    <div
                      key={item.id}
                      className={[
                        "group flex w-full gap-3",
                        mine ? "justify-end" : "justify-start",
                      ].join(" ")}
                    >
                      {/* OTHER MEMBER AVATAR */}

                      {!mine && !grouped ? (
                        <div
                          className="
                            mt-1
                            grid
                            h-8
                            w-8
                            shrink-0
                            place-items-center
                            overflow-hidden
                            rounded-[10px]
                            bg-gradient-to-br
                            from-violet-500
                            to-indigo-600
                            text-[10px]
                            font-black
                            text-white
                          "
                        >
                          {item.sender?.avatarUrl ? (
                            <img
                              src={item.sender.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            username.charAt(0).toUpperCase()
                          )}
                        </div>
                      ) : !mine ? (
                        <div className="w-8 shrink-0" />
                      ) : null}

                      {/* MESSAGE CONTENT */}

                      <div
                        className={[
                          "flex max-w-[88%] flex-col sm:max-w-[72%] lg:max-w-[68%]",
                          mine ? "items-end" : "items-start",
                        ].join(" ")}
                      >
                        {/* OTHER MEMBER NAME */}

                        {!mine && !grouped && (
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500">
                              {username}
                            </span>

                            <span className="text-[9px] text-slate-300">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* REPLY */}

                        {item.replyTo && (
                          <div className="mb-1.5 border-l-2 border-violet-200 px-3 text-[10px] text-slate-400">
                            <div className="font-bold text-slate-500">
                              {item.replyTo.sender?.username || "Member"}
                            </div>

                            <div className="truncate">
                              {item.replyTo.content}
                            </div>
                          </div>
                        )}

                        {/* MESSAGE + OPTIONS */}

                        <div className="group relative flex items-end gap-1">
                          {/* MESSAGE OPTIONS */}

                          {mine && !deleted && editingMessageId !== item.id && (
                            <div className="relative order-first self-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMessageMenuId((current) =>
                                    current === item.id ? null : item.id,
                                  )
                                }
                                className={[
                                  "grid h-8 w-8 place-items-center rounded-full transition-all duration-200",
                                  openMessageMenuId === item.id
                                    ? "bg-slate-100 text-slate-700 opacity-100"
                                    : "text-slate-300 opacity-0 hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100",
                                ].join(" ")}
                                aria-label="Message options"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {openMessageMenuId === item.id && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setOpenMessageMenuId(null)}
                                    className="fixed inset-0 z-40 cursor-default"
                                    aria-label="Close menu"
                                  />

                                  <div
                                    className="
                                        absolute
                                        left-0
                                        top-9
                                        z-50
                                        flex
                                        items-center
                                        gap-0.5
                                        rounded-xl
                                        border
                                        border-slate-200/80
                                        bg-white/95
                                        p-1
                                        shadow-[0_10px_30px_rgba(15,23,42,0.12)]
                                        backdrop-blur-xl
                                      "
                                  >
                                    <button
                                      type="button"
                                      onClick={() => startEditingMessage(item)}
                                      className="
                                          grid
                                          h-8
                                          w-8
                                          place-items-center
                                          rounded-lg
                                          text-slate-400
                                          transition
                                          hover:bg-violet-50
                                          hover:text-violet-600
                                        "
                                      aria-label="Edit message"
                                    >
                                      <Pencil size={14} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDeleteMessage(item.id)
                                      }
                                      disabled={deletingMessageId === item.id}
                                      className="
                                          grid
                                          h-8
                                          w-8
                                          place-items-center
                                          rounded-lg
                                          text-slate-400
                                          transition
                                          hover:bg-red-50
                                          hover:text-red-600
                                          disabled:cursor-not-allowed
                                          disabled:opacity-40
                                        "
                                      aria-label="Delete message"
                                    >
                                      {deletingMessageId === item.id ? (
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                                      ) : (
                                        <Trash2 size={14} />
                                      )}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* MESSAGE AREA */}

                          <div
                            className={[
                              "relative",
                              groupedReactions.length > 0 ? "pb-3" : "",
                            ].join(" ")}
                          >
                            {/* MESSAGE */}

                            {editingMessageId === item.id ? (
                              <div className="w-[min(520px,78vw)]">
                                <div
                                  className="
                                    overflow-hidden
                                    rounded-[18px]
                                    border
                                    border-violet-200
                                    bg-white
                                    shadow-[0_4px_18px_rgba(124,58,237,0.10)]
                                    focus-within:border-violet-400
                                    focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.06)]
                                  "
                                >
                                  <textarea
                                    autoFocus
                                    value={editingContent}
                                    onChange={(event) =>
                                      setEditingContent(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                      if (event.key === "Escape") {
                                        event.preventDefault();
                                        cancelEditingMessage();
                                        return;
                                      }

                                      if (
                                        event.key === "Enter" &&
                                        !event.shiftKey
                                      ) {
                                        event.preventDefault();
                                        void handleEditMessage(item.id);
                                      }
                                    }}
                                    rows={3}
                                    disabled={savingEdit}
                                    className="
                                      block
                                      max-h-40
                                      min-h-[72px]
                                      w-full
                                      resize-none
                                      bg-transparent
                                      px-4
                                      py-3
                                      text-sm
                                      leading-6
                                      text-slate-900
                                      outline-none
                                      placeholder:text-slate-400
                                      disabled:cursor-not-allowed
                                      disabled:opacity-60
                                    "
                                  />

                                  <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-2">
                                    <span className="px-1 text-[9px] font-medium text-slate-300">
                                      Esc to cancel · Enter to save
                                    </span>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={cancelEditingMessage}
                                        disabled={savingEdit}
                                        className="
                                          grid
                                          h-8
                                          w-8
                                          place-items-center
                                          rounded-lg
                                          text-slate-400
                                          transition
                                          hover:bg-slate-100
                                          hover:text-slate-700
                                          disabled:opacity-40
                                        "
                                        aria-label="Cancel edit"
                                      >
                                        <X size={15} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleEditMessage(item.id)
                                        }
                                        disabled={
                                          !editingContent.trim() || savingEdit
                                        }
                                        className="
                                          grid
                                          h-8
                                          w-8
                                          place-items-center
                                          rounded-lg
                                          bg-violet-600
                                          text-white
                                          transition
                                          hover:bg-violet-700
                                          disabled:cursor-not-allowed
                                          disabled:opacity-30
                                        "
                                        aria-label="Save edit"
                                      >
                                        <Check size={15} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={[
                                  "relative rounded-[18px] px-4 py-3 text-sm leading-6 transition",
                                  deleted
                                    ? "border border-slate-100 bg-slate-50 italic text-slate-400 shadow-none"
                                    : mine
                                      ? "rounded-br-[6px] bg-violet-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.18)]"
                                      : "rounded-bl-[6px] border border-slate-100 bg-slate-50 text-slate-800 shadow-sm",
                                ].join(" ")}
                              >
                                {deleted
                                  ? "This message was deleted"
                                  : item.content}
                              </div>
                            )}

                            {/* REACTIONS */}

                            {!deleted && groupedReactions.length > 0 && (
                              <div className="absolute -bottom-0.5 -right-1 z-20 flex items-center gap-1">
                                {groupedReactions.map((reaction) => (
                                  <div
                                    key={reaction.emoji}
                                    className="group/reaction relative"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReaction(item.id, reaction.emoji)
                                      }
                                      className={[
                                        "flex h-6 items-center gap-1 rounded-full border px-1.5 shadow-sm transition-all",
                                        reaction.hasMine
                                          ? "border-violet-200 bg-violet-50"
                                          : "border-slate-200 bg-white",
                                        "hover:-translate-y-0.5 hover:shadow-md",
                                      ].join(" ")}
                                      aria-label={`Reacted with ${reaction.emoji}`}
                                    >
                                      <span className="text-[12px] leading-none">
                                        {reaction.emoji}
                                      </span>

                                      {reaction.count > 1 && (
                                        <span className="text-[10px] font-semibold text-slate-500">
                                          {reaction.count}
                                        </span>
                                      )}
                                    </button>

                                    <div
                                      className="
                                            pointer-events-none
                                            absolute
                                            bottom-full
                                            left-1/2
                                            z-[60]
                                            mb-2
                                            w-max
                                            max-w-[220px]
                                            -translate-x-1/2
                                            translate-y-1
                                            rounded-xl
                                            border
                                            border-slate-200/80
                                            bg-slate-950
                                            px-3
                                            py-2
                                            text-left
                                            opacity-0
                                            shadow-[0_10px_30px_rgba(15,23,42,0.18)]
                                            transition-all
                                            duration-150
                                            group-hover/reaction:translate-y-0
                                            group-hover/reaction:opacity-100
                                          "
                                    >
                                      <div className="flex flex-col gap-1">
                                        {reaction.users.map(
                                          (username, index) => (
                                            <div
                                              key={`${username}-${index}`}
                                              className="flex items-center gap-1.5 text-[10px] font-medium text-white"
                                            >
                                              <span>{reaction.emoji}</span>

                                              <span className="truncate">
                                                {username}
                                              </span>

                                              {username === guest?.username && (
                                                <span className="text-[9px] text-slate-400">
                                                  you
                                                </span>
                                              )}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* ADD REACTION */}

                            {!deleted &&
                              editingMessageId !== item.id &&
                              !myReaction && (
                                <div
                                  className={[
                                    "absolute z-30 transition-all duration-200",
                                    groupedReactions.length > 0
                                      ? "-bottom-0.5 -right-5"
                                      : "-bottom-0.5 -right-2",
                                  ].join(" ")}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenReactionMessageId((current) =>
                                        current === item.id ? null : item.id,
                                      )
                                    }
                                    className={[
                                      "grid h-6 w-6 place-items-center rounded-full border bg-white shadow-sm transition-all",
                                      openReactionMessageId === item.id
                                        ? "border-violet-200 text-violet-600 opacity-100"
                                        : "border-slate-200 text-slate-400 opacity-0 group-hover:opacity-100",
                                    ].join(" ")}
                                    aria-label="Add reaction"
                                  >
                                    <Smile size={13} />
                                  </button>

                                  {/* REACTION PICKER */}

                                  {openReactionMessageId === item.id && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenReactionMessageId(null)
                                        }
                                        className="fixed inset-0 z-40 cursor-default"
                                        aria-label="Close reaction picker"
                                      />

                                      <div
                                        className="
                                          absolute
                                          bottom-8
                                          right-0
                                          z-50
                                          flex
                                          items-center
                                          gap-0.5
                                          rounded-2xl
                                          border
                                          border-slate-200/80
                                          bg-white
                                          p-1.5
                                          shadow-[0_10px_30px_rgba(15,23,42,0.14)]
                                        "
                                      >
                                        {QUICK_REACTIONS.map((emoji) => (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() =>
                                              handleReaction(item.id, emoji)
                                            }
                                            className={[
                                              "grid h-8 w-8 place-items-center rounded-xl text-base transition",
                                              "hover:scale-110 hover:bg-violet-50 active:scale-95",
                                              myReaction === emoji
                                                ? "bg-violet-50"
                                                : "",
                                            ].join(" ")}
                                            aria-label={`React with ${emoji}`}
                                            title={`React with ${emoji}`}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* MY MESSAGE TIME */}

                        {mine && (
                          <div className="mt-1 flex items-center justify-end gap-1 px-1 text-[9px] font-medium text-slate-300">
                            {item.updatedAt &&
                              item.updatedAt !== item.createdAt &&
                              !deleted && <span>edited</span>}

                            <span>{formatTime(item.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* TYPING INDICATOR */}

          {typingUsers.length > 0 && (
            <div className="border-t border-slate-100 bg-white px-4 py-2 sm:px-6">
              <div className="mx-auto flex max-w-4xl items-center gap-2 px-1">
                <div className="flex -space-x-1.5">
                  {typingUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-[9px] font-semibold text-violet-700"
                      title={user.username}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  ))}

                  {typingUsers.length > 3 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-500">
                      +{typingUsers.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>
                    {typingUsers.length === 1
                      ? `${typingUsers[0].username} is typing`
                      : typingUsers.length === 2
                        ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
                        : typingUsers.length === 3
                          ? `${typingUsers[0].username}, ${typingUsers[1].username}, and ${typingUsers[2].username} are typing`
                          : `${typingUsers[0].username}, ${typingUsers[1].username}, and ${
                              typingUsers.length - 2
                            } others are typing`}
                  </span>

                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-violet-400" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-violet-400 [animation-delay:150ms]" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* COMPOSER */}

          <div
            className="
    shrink-0
    border-t
    border-slate-200
    bg-white
    px-3
    py-2
    pb-[max(0.5rem,env(safe-area-inset-bottom))]
    sm:px-6
    sm:py-2
  "
          >
            <div className="mx-auto max-w-4xl">
              {/* Attachment preview */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  {selectedFile.type.startsWith("image/") ? (
                    <ImageIcon size={18} className="shrink-0 text-violet-500" />
                  ) : (
                    <FileText size={18} className="shrink-0 text-slate-500" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {selectedFile.name}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                    aria-label="Remove attachment"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <div className="relative">
                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div
                    className="
  absolute
  bottom-14
  right-0
  z-50
  w-[min(280px,calc(100vw-24px))]
  rounded-2xl
  border
  border-slate-200
  bg-white
  p-3
  shadow-xl
  sm:right-10
"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        Emojis
                      </span>

                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close emoji picker"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-lg transition hover:bg-slate-100"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Attach */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                    aria-label="Attach file"
                  >
                    <Paperclip size={17} />
                  </button>

                  {/* Message */}
                  <textarea
                    value={message}
                    onChange={(event) => handleTyping(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Write a message..."
                    className="
  max-h-32
  min-h-9
  flex-1
  resize-none
  bg-transparent
  px-1
  py-2
  text-base
  text-slate-900
  outline-none
  placeholder:text-slate-400
  sm:text-sm
"
                  />

                  {/* Emoji */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((current) => !current)}
                    className={`mb-0.5 grid h-8 w-8 place-items-center rounded-lg transition ${
                      showEmojiPicker
                        ? "bg-violet-100 text-violet-600"
                        : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    }`}
                    aria-label="Add emoji"
                    aria-expanded={showEmojiPicker}
                  >
                    <Smile size={16} />
                  </button>

                  {/* Send */}
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!message.trim() || sending || !canSendMessage}
                    className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                <span className="hidden sm:inline">
                  Press Enter to send · Shift + Enter for a new line
                </span>
                {!socketConnected && (
                  <span className="text-amber-500">Reconnecting...</span>
                )}
              </div>
            </div>
          </div>
        </main>
        {/* CONVERSATION INFO */}
        {showInfo && (
          <>
            <div
              className="absolute inset-0 z-10 bg-slate-950/20 backdrop-blur-[1px] sm:hidden"
              onClick={() => setShowInfo(false)}
            />
            <aside
              ref={infoPanelRef}
              className="
    absolute
    inset-y-0
    right-0
    z-20
    w-[min(88vw,320px)]
    border-l
    border-slate-200
    bg-white
    shadow-2xl
    shadow-slate-950/10
    sm:relative
    sm:w-[290px]
    sm:shadow-none
  "
            >
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto p-5">
                  {/* PRIVATE CONVERSATION CODE */}

                  {conversation?.isPrivate && conversation.joinCode && (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-500">
                            Private invite code
                          </p>

                          <p className="mt-2 break-all font-mono text-xl font-black tracking-[0.2em] text-slate-950">
                            {conversation.joinCode}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleCopyJoinCode()}
                          className="
                  grid
                  h-9
                  w-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-white
                  text-slate-400
                  shadow-sm
                  transition
                  hover:bg-slate-950
                  hover:text-white
                "
                          aria-label={
                            codeCopied
                              ? "Conversation code copied"
                              : "Copy conversation code"
                          }
                          title={codeCopied ? "Copied" : "Copy code"}
                        >
                          {codeCopied ? (
                            <Check size={15} />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-[10px] leading-4 text-violet-500/80">
                        Share this code with people you want to invite.
                      </p>

                      {codeCopied && (
                        <p className="mt-2 text-[10px] font-semibold text-emerald-600">
                          Invite code copied!
                        </p>
                      )}
                    </div>
                  )}

                  {/* PARTICIPANTS */}

                  <div className={conversation?.isPrivate ? "mt-6" : "mt-2"}>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Participants
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-800">
                          {participantCount}{" "}
                          {participantCount === 1 ? "person" : "people"}
                        </p>
                      </div>

                      <Users size={16} className="text-violet-500" />
                    </div>

                    <div className="space-y-1">
                      {conversation?.participants?.length ? (
                        conversation.participants.map((participant) => {
                          const user = participant.user;
                          const isCurrentUser = user.id === currentUserId;

                          return (
                            <div
                              key={participant.id}
                              className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-2.5
                      py-2
                      transition
                      hover:bg-slate-50
                    "
                            >
                              {/* Avatar */}

                              <div
                                className="
                        grid
                        h-9
                        w-9
                        shrink-0
                        place-items-center
                        overflow-hidden
                        rounded-[11px]
                        bg-gradient-to-br
                        from-violet-500
                        to-indigo-600
                        text-[10px]
                        font-black
                        text-white
                      "
                              >
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  user.username.charAt(0).toUpperCase()
                                )}
                              </div>

                              {/* User info */}

                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <p className="truncate text-xs font-bold text-slate-800">
                                    {user.username}
                                  </p>

                                  {isCurrentUser && (
                                    <span className="shrink-0 text-[9px] font-semibold text-violet-500">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center">
                          <p className="text-[10px] font-medium text-slate-400">
                            No participants found.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}
        {/* DELETE CONVERSATION CONFIRMATION */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
            <button
              type="button"
              aria-label="Close delete confirmation"
              onClick={() => {
                if (!conversationActionLoading) {
                  setShowDeleteConfirm(false);
                }
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={19} />
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
                Delete conversation?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This will permanently delete{" "}
                <span className="font-semibold text-slate-700">
                  {conversationTitle}
                </span>{" "}
                and all of its messages. This action cannot be undone.
              </p>

              {conversationActionError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {conversationActionError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={conversationActionLoading}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="
            flex-1
            rounded-full
            border
            border-slate-200
            px-4
            py-3
            text-sm
            font-semibold
            text-slate-600
            transition
            hover:bg-slate-50
            disabled:opacity-50
          "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={conversationActionLoading}
                  onClick={() => void handleDeleteConversation()}
                  className="
            flex-1
            rounded-full
            bg-red-600
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-500
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                >
                  {conversationActionLoading
                    ? "Deleting..."
                    : "Delete conversation"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* LEAVE CONVERSATION CONFIRMATION */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
            <button
              type="button"
              aria-label="Close leave confirmation"
              onClick={() => {
                if (!conversationActionLoading) {
                  setShowLeaveConfirm(false);
                }
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <ArrowLeft size={19} />
              </div>

              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
                Leave conversation?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You will leave{" "}
                <span className="font-semibold text-slate-700">
                  {conversationTitle}
                </span>
                . You can rejoin this conversation later if it's available to
                you.
              </p>

              {conversationActionError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {conversationActionError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={conversationActionLoading}
                  onClick={() => setShowLeaveConfirm(false)}
                  className="
            flex-1
            rounded-full
            border
            border-slate-200
            px-4
            py-3
            text-sm
            font-semibold
            text-slate-600
            transition
            hover:bg-slate-50
            disabled:opacity-50
          "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={conversationActionLoading}
                  onClick={() => void handleLeaveConversation()}
                  className="
            flex-1
            rounded-full
            bg-slate-950
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
                >
                  {conversationActionLoading
                    ? "Leaving..."
                    : "Leave conversation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
