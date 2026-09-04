import {
  ArrowLeft,
  Bell,
  Check,
  Hash,
  Info,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Search,
  Send,
  Smile,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getMessages } from "../api/conversation.api";
import type {
  Conversation,
  ConversationMessage,
  MessageReaction,
} from "../api/conversation.api";
import { useAuth } from "../context/useAuth";
import { socket } from "../services/socket";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "🔥", "😮", "🎉"];

type ChatPageProps = {
  conversation?: Conversation;
};

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

export default function ChatPage({ conversation }: ChatPageProps) {
  const { guestId, guest } = useAuth();
  const currentUserId = guest?.id;

  const { conversationId: routeConversationId } = useParams<{
    conversationId: string;
  }>();

  const conversationId = conversation?.id ?? routeConversationId;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  const [loadingMessages, setLoadingMessages] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [showInfo, setShowInfo] = useState(false);

  const [sending, setSending] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);

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

  const bottomRef = useRef<HTMLDivElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const initialLoadRef = useRef(true);

  const loadingOlderRef = useRef(false);

  const shouldScrollToBottomRef = useRef(false);

  const pendingScrollRestoreRef = useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);

  const conversationTitle =
    conversation?.title || conversation?.space?.name || "Conversation";

  const participantCount = conversation?._count?.participants ?? 0;

  const messageCount = conversation?._count?.messages ?? messages.length;

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        setMessagesError(null);
        setMessages([]);
        setNextCursor(null);

        initialLoadRef.current = true;
        shouldScrollToBottomRef.current = false;

        const data = await getMessages(conversationId, 50);

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
  }, [conversationId]);

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

  useEffect(() => {
    if (!guestId || !conversationId) {
      return;
    }

    console.log("Setting up WebSocket for conversation:", conversationId);
    const unsubscribeConnection = socket.onConnectionChange((connected) => {
      setSocketConnected(connected);
    });

    const unsubscribeAuth = socket.onAuthenticated(() => {
      console.log(
        "WebSocket authenticated. Joining conversation:",
        conversationId,
      );

      socket.joinConversation(conversationId);
    });

    const unsubscribeMessages = socket.onMessage((data) => {
      /*
       * ---------------------------------------------------
       * NEW MESSAGE
       * ---------------------------------------------------
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
          /*
           * Prevent duplicates.
           *
           * The server broadcasts the message back
           * to the sender too.
           */
          if (current.some((item) => item.id === incomingMessage.id)) {
            return current;
          }

          return [...current, incomingMessage];
        });

        shouldScrollToBottomRef.current = shouldScroll;

        return;
      }

      /*
       * ---------------------------------------------------
       * MESSAGE UPDATED
       * ---------------------------------------------------
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
       * ---------------------------------------------------
       * MESSAGE DELETED
       * ---------------------------------------------------
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
       * ---------------------------------------------------
       * MESSAGE REACTION
       * ---------------------------------------------------
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
      if (data.type === "conversation:joined") {
        console.log("Joined conversation:", data.conversationId);

        return;
      }
    });

    const unsubscribeErrors = socket.onError((error) => {
      console.error("WebSocket server error:", error);
    });

    /*
     * Connect AFTER all listeners are registered.
     */
    socket.connect(guestId);

    /*
     * If the singleton socket was already authenticated
     * before this page mounted, join immediately.
     */
    if (socket.isAuthenticated()) {
      socket.joinConversation(conversationId);
    }

    return () => {
      console.log("Cleaning up WebSocket conversation:", conversationId);

      unsubscribeConnection();
      unsubscribeAuth();
      unsubscribeMessages();
      unsubscribeErrors();

      socket.leaveConversation(conversationId);
    };
  }, [guestId, conversationId]);

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

  const handleSubmit = async () => {
    const value = message.trim();

    if (!value || sending || !conversationId) {
      return;
    }

    if (!socket.isAuthenticated()) {
      console.warn("Cannot send message: WebSocket is not authenticated.");

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

  async function handleDeleteMessage(messageId: string) {
    if (!messageId || deletingMessageId) return;

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className="flex h-[calc(100vh-92px)] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/70 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/space/${conversation.spaceId}`}
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
              h-10
              w-10
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
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-black tracking-tight text-slate-950">
                {conversationTitle}
              </h1>

              <span
                className={[
                  "hidden h-1.5 w-1.5 rounded-full sm:block",
                  socketConnected ? "bg-emerald-500" : "bg-slate-300",
                ].join(" ")}
              />
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-[10px] font-medium text-slate-400">
              {conversation?.space?.name && (
                <>
                  <span className="truncate">{conversation.space.name}</span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                </>
              )}

              <span>
                {participantCount}{" "}
                {participantCount === 1 ? "participant" : "participants"}
              </span>
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
          >
            <Search size={17} />
          </button>

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
          >
            <Bell size={17} />
          </button>

          <button
            type="button"
            onClick={() => setShowInfo((value) => !value)}
            className={[
              "grid h-9 w-9 place-items-center rounded-xl transition",
              showInfo
                ? "bg-violet-50 text-violet-600"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")}
          >
            <Info size={17} />
          </button>

          <button
            type="button"
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
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      {/* =====================================================
          CHAT BODY
      ====================================================== */}

      <div className="relative flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Conversation status */}

          <div className="flex shrink-0 items-center justify-center border-b border-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-400">
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  socketConnected ? "bg-emerald-500" : "bg-slate-300",
                ].join(" ")}
              />

              {loadingMessages
                ? "Loading messages..."
                : !socketConnected
                  ? "Reconnecting..."
                  : messageCount > 0
                    ? `${messageCount} messages in this conversation`
                    : "This conversation is just getting started"}
            </div>
          </div>

          {/* Messages */}

          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-white
              px-4
              py-6
              sm:px-8
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
                          "flex max-w-[78%] flex-col sm:max-w-[68%]",
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
                          {/* MESSAGE OPTIONS — LEFT OF OWN MESSAGE */}
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
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {openMessageMenuId === item.id && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setOpenMessageMenuId(null)}
                                    className="fixed inset-0 z-40 cursor-default"
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
                group/action
                relative
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
                group/action
                relative
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
                                              myReaction?.emoji === emoji
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

          {/* =================================================
              COMPOSER
          ================================================== */}

          {/* <div className="shrink-0 border-t border-slate-200/70 bg-white p-3 sm:p-4">
            <div className="mx-auto max-w-3xl">
              <div
                className="
                  overflow-hidden
                  rounded-[18px]
                  border
                  border-slate-200
                  bg-slate-50
                  transition
                  focus-within:border-violet-300
                  focus-within:bg-white
                  focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.06)]
                "
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={!conversationId || !socketConnected}
                  placeholder={
                    socketConnected
                      ? `Message ${conversationTitle}...`
                      : "Connecting..."
                  }
                  className="
                    block
                    max-h-32
                    min-h-[54px]
                    w-full
                    resize-none
                    bg-transparent
                    px-4
                    pt-3
                    text-sm
                    leading-6
                    text-slate-900
                    outline-none
                    placeholder:text-slate-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                />

                <div className="flex items-center justify-between px-2.5 pb-2.5">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="
                        grid
                        h-8
                        w-8
                        place-items-center
                        rounded-lg
                        text-slate-400
                        transition
                        hover:bg-slate-200
                        hover:text-slate-700
                      "
                    >
                      <Paperclip size={16} />
                    </button>

                    <button
                      type="button"
                      className="
                        grid
                        h-8
                        w-8
                        place-items-center
                        rounded-lg
                        text-slate-400
                        transition
                        hover:bg-slate-200
                        hover:text-slate-700
                      "
                      aria-label="Add emoji"
                    >
                      <Smile size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={
                      !message.trim() ||
                      sending ||
                      !conversationId ||
                      !socketConnected
                    }
                    className="
                      flex
                      h-9
                      items-center
                      gap-2
                      rounded-xl
                      bg-violet-600
                      px-3.5
                      text-xs
                      font-bold
                      text-white
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:bg-violet-700
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <span className="hidden sm:inline">
                      {sending ? "Sending..." : "Send"}
                    </span>

                    <Send size={15} />
                  </button>
                </div>
              </div>

              <p className="mt-2 hidden text-center text-[9px] font-medium text-slate-300 sm:block">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </div>
          </div> */}

          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">
                <button
                  type="button"
                  className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                  aria-label="Attach file"
                >
                  <Paperclip size={17} />
                </button>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                  placeholder="Write a message..."
                  className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  className="
                        grid
                        h-8
                        w-8
                        place-items-center
                        rounded-lg
                        text-slate-400
                        transition
                        hover:bg-slate-200
                        hover:text-slate-700
                      "
                  aria-label="Add emoji"
                >
                  <Smile size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending || !socketConnected}
                  className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400">
                <span>Press Enter to send · Shift + Enter for a new line</span>

                {!socketConnected && (
                  <span className="text-amber-500">Reconnecting...</span>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ===================================================
            CONVERSATION INFO
        ==================================================== */}

        {showInfo && (
          <aside
            className="
              absolute
              inset-y-0
              right-0
              z-20
              w-[290px]
              border-l
              border-slate-200
              bg-white
              shadow-2xl
              shadow-slate-950/10
              sm:relative
              sm:shadow-none
            "
          >
            <div className="flex h-full flex-col">
              <div className="flex h-[72px] items-center justify-between border-b border-slate-200/70 px-5">
                <p className="text-sm font-black text-slate-950">
                  Conversation
                </p>

                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="
                    grid
                    h-8
                    w-8
                    place-items-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-900
                  "
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div
                  className="
                    grid
                    h-16
                    w-16
                    place-items-center
                    rounded-[20px]
                    border
                    border-violet-100
                    bg-violet-50
                    text-violet-600
                  "
                >
                  {conversation?.space ? (
                    <Hash size={25} />
                  ) : (
                    <MessageCircle size={25} />
                  )}
                </div>

                <h2 className="mt-4 text-lg font-black tracking-tight text-slate-950">
                  {conversationTitle}
                </h2>

                {conversation?.space?.name && (
                  <p className="mt-1 text-xs text-slate-400">
                    {conversation.space.name}
                  </p>
                )}

                <div className="mt-6 space-y-2">
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-[15px]
                      border
                      border-slate-100
                      bg-slate-50
                      p-3
                    "
                  >
                    <Users size={17} className="text-violet-500" />

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Participants
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {participantCount} people
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-[15px]
                      border
                      border-slate-100
                      bg-slate-50
                      p-3
                    "
                  >
                    <MessageCircle size={17} className="text-violet-500" />

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Messages
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {messageCount} messages
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
