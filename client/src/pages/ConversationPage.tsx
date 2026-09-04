import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getConversation,
  joinConversation,
  type Conversation,
} from "../api/conversation.api";

import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function ConversationPage() {
  const { conversationId } = useParams<{
    conversationId: string;
  }>();

  const navigate = useNavigate();

  const { guest } = useAuth();
  const { theme } = useTheme();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [isParticipant, setIsParticipant] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const isLight = theme === "light";

  useEffect(() => {
    if (!guest || !conversationId) {
      setLoading(false);
      return;
    }

    async function loadConversation() {
      try {
        setLoading(true);
        setError("");

        const data = await getConversation(conversationId);

        setConversation(data.conversation);
        setIsParticipant(data.isParticipant);
      } catch (error) {
        console.error("Failed to load conversation:", error);

        setError("Unable to load this conversation.");
      } finally {
        setLoading(false);
      }
    }

    loadConversation();
  }, [guest, conversationId]);

  async function handleJoin() {
    if (!conversationId || joining) {
      return;
    }

    try {
      setJoining(true);
      setError("");

      await joinConversation(conversationId);

      setIsParticipant(true);
    } catch (error) {
      console.error("Failed to join conversation:", error);

      setError("Unable to join this conversation.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
        }`}
      >
        <p className={isLight ? "text-slate-400" : "text-white/40"}>
          Loading conversation...
        </p>
      </main>
    );
  }

  if (error || !conversation) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center px-6 ${
          isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
        }`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Conversation not found</h1>

          <p
            className={`mt-2 text-sm ${
              isLight ? "text-slate-400" : "text-white/40"
            }`}
          >
            {error ||
              "This conversation does not exist or you do not have access to it."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold ${
              isLight ? "bg-slate-950 text-white" : "bg-white text-slate-950"
            }`}
          >
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen ${
        isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
      }`}
    >
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <header
          className={`flex h-20 shrink-0 items-center justify-between border-b ${
            isLight ? "border-slate-200/70" : "border-white/[0.06]"
          }`}
        >
          <div className="flex items-center gap-4">
            <Link
              to={`/space/${conversation.space?.id}`}
              className={`text-sm font-medium ${
                isLight
                  ? "text-slate-500 hover:text-violet-600"
                  : "text-white/40 hover:text-violet-300"
              }`}
            >
              ← Space
            </Link>

            <span className={isLight ? "text-slate-300" : "text-white/10"}>
              /
            </span>

            <span className="text-sm font-medium">
              {conversation.space?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white">
              {guest?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>

            <span className="hidden text-sm font-medium sm:block">
              {guest?.username}
            </span>
          </div>
        </header>

        {/* Conversation header */}
        <section className="shrink-0 py-8">
          <div
            className={`rounded-[28px] border p-7 ${
              isLight
                ? "border-slate-200 bg-white/70"
                : "border-white/[0.07] bg-white/[0.025]"
            }`}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
                    isLight ? "text-violet-600" : "text-violet-300/70"
                  }`}
                >
                  Conversation
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  {conversation.title || "Untitled conversation"}
                </h1>

                <div
                  className={`mt-3 flex flex-wrap gap-4 text-xs ${
                    isLight ? "text-slate-400" : "text-white/30"
                  }`}
                >
                  <span>
                    {conversation._count.participants}{" "}
                    {conversation._count.participants === 1
                      ? "participant"
                      : "participants"}
                  </span>

                  <span>
                    {conversation._count.messages}{" "}
                    {conversation._count.messages === 1
                      ? "message"
                      : "messages"}
                  </span>
                </div>
              </div>

              {!isParticipant && (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joining}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLight
                      ? "bg-slate-950 text-white hover:bg-violet-600"
                      : "bg-white text-slate-950 hover:bg-violet-100"
                  }`}
                >
                  {joining ? "Joining..." : "Join conversation"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Chat area */}
        <section className="flex min-h-0 flex-1 pb-8">
          <div
            className={`flex min-h-[500px] w-full flex-col overflow-hidden rounded-[28px] border ${
              isLight
                ? "border-slate-200 bg-white/70"
                : "border-white/[0.07] bg-white/[0.025]"
            }`}
          >
            {/* Messages */}
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="text-center">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                    isLight
                      ? "bg-slate-100 text-slate-400"
                      : "bg-white/[0.05] text-white/30"
                  }`}
                >
                  💬
                </div>

                <h2 className="mt-5 text-lg font-semibold">No messages yet</h2>

                <p
                  className={`mt-2 max-w-sm text-sm leading-6 ${
                    isLight ? "text-slate-400" : "text-white/30"
                  }`}
                >
                  The conversation is ready. Message sending comes next.
                </p>
              </div>
            </div>

            {/* Message input placeholder */}
            <div
              className={`border-t p-4 ${
                isLight ? "border-slate-200" : "border-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  disabled
                  placeholder="Message coming next..."
                  className={`h-12 flex-1 rounded-2xl border bg-transparent px-4 text-sm outline-none ${
                    isLight
                      ? "border-slate-200 text-slate-800 placeholder:text-slate-400"
                      : "border-white/[0.08] text-white placeholder:text-white/25"
                  }`}
                />

                <button
                  type="button"
                  disabled
                  className={`h-12 rounded-2xl px-5 text-sm font-semibold opacity-50 ${
                    isLight
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-950"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
