import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getSpace, type Space } from "../api/space.api";
import { createConversation } from "../api/conversation.api";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

export default function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  const { guest, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  const isLight = theme === "light";

  async function handleCreateConversation() {
    if (!spaceId || !conversationTitle.trim()) {
      return;
    }

    try {
      setCreatingConversation(true);
      setError("");

      const conversation = await createConversation(
        spaceId,
        conversationTitle.trim(),
      );

      setShowCreateConversation(false);
      setConversationTitle("");

      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
      );
    } finally {
      setCreatingConversation(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!guest || !spaceId) {
      setLoading(false);
      return;
    }

    async function loadSpace() {
      try {
        setLoading(true);
        setError("");

        const data = await getSpace(spaceId);

        setSpace(data);
      } catch (error) {
        console.error("Failed to load space:", error);
        setError("Unable to load this space.");
        setSpace(null);
      } finally {
        setLoading(false);
      }
    }

    loadSpace();
  }, [guest, authLoading, spaceId]);

  if (authLoading || loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
        }`}
      >
        <p className={isLight ? "text-slate-400" : "text-white/40"}>
          Loading space...
        </p>
      </main>
    );
  }

  if (!guest) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center px-6 ${
          isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
        }`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Guest session not found</h1>

          <p
            className={`mt-2 text-sm ${
              isLight ? "text-slate-400" : "text-white/40"
            }`}
          >
            Please create or restore your guest session.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold ${
              isLight ? "bg-slate-950 text-white" : "bg-white text-slate-950"
            }`}
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  if (!spaceId) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center px-6 ${
          isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
        }`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Invalid space</h1>

          <p
            className={`mt-2 text-sm ${
              isLight ? "text-slate-400" : "text-white/40"
            }`}
          >
            No space ID was provided in the URL.
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

  if (error || !space) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-center px-6 ${
          isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
        }`}
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Space not found</h1>

          <p
            className={`mt-2 text-sm ${
              isLight ? "text-slate-400" : "text-white/40"
            }`}
          >
            {error || "This space does not exist or you are not a member."}
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

  const avatarLetter = guest.username?.charAt(0).toUpperCase() || "?";

  return (
    <main
      className={`min-h-screen ${
        isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
      }`}
    >
      <div className="mx-auto min-h-screen max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <header
          className={`flex h-20 items-center justify-between border-b ${
            isLight ? "border-slate-200/70" : "border-white/[0.06]"
          }`}
        >
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition ${
              isLight
                ? "text-slate-500 hover:text-violet-600"
                : "text-white/40 hover:text-violet-300"
            }`}
          >
            ← Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-violet-500/20">
              {avatarLetter}
            </div>

            <span className="text-sm font-medium">{guest.username}</span>
          </div>
        </header>

        {/* Space Header */}
        <section className="py-12">
          <div
            className={`rounded-[32px] border p-8 sm:p-10 ${
              isLight
                ? "border-slate-200 bg-white/70 shadow-[0_15px_50px_rgba(30,20,60,0.04)]"
                : "border-white/[0.07] bg-white/[0.025]"
            }`}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div
                  className={`mb-3 text-xs font-medium uppercase tracking-[0.25em] ${
                    isLight ? "text-violet-600" : "text-violet-300/70"
                  }`}
                >
                  Space
                </div>

                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  #{space.name}
                </h1>

                {space.description && (
                  <p
                    className={`mt-4 max-w-2xl leading-7 ${
                      isLight ? "text-slate-500" : "text-white/40"
                    }`}
                  >
                    {space.description}
                  </p>
                )}
              </div>

              {space.currentUserRole && (
                <div
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
                    isLight
                      ? "bg-slate-100 text-slate-500"
                      : "bg-white/[0.06] text-white/40"
                  }`}
                >
                  {space.currentUserRole}
                </div>
              )}
            </div>

            {/* Stats */}
            <div
              className={`mt-8 flex flex-wrap gap-6 border-t pt-6 text-sm ${
                isLight
                  ? "border-slate-200 text-slate-400"
                  : "border-white/[0.06] text-white/30"
              }`}
            >
              <span>
                {space.members?.length ?? space._count?.members ?? 0} members
              </span>

              <span>
                {space.conversations?.length ??
                  space._count?.conversations ??
                  0}{" "}
                conversations
              </span>
            </div>
          </div>
        </section>

        {/* Members */}
        {space.members && space.members.length > 0 && (
          <section className="pb-12">
            <div className="mb-6">
              <p
                className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
                  isLight ? "text-slate-400" : "text-white/25"
                }`}
              >
                Members
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                People in this space
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {space.members.map((member) => {
                const memberLetter =
                  member.user.username?.charAt(0).toUpperCase() || "?";

                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-4 rounded-[22px] border p-4 ${
                      isLight
                        ? "border-slate-200 bg-white/70"
                        : "border-white/[0.07] bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                      {memberLetter}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {member.user.username}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          isLight ? "text-slate-400" : "text-white/30"
                        }`}
                      >
                        {member.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Conversations */}
        <section className="pb-16">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
                  isLight ? "text-slate-400" : "text-white/25"
                }`}
              >
                Conversations
              </p>

              <h2 className="mt-2 text-2xl font-semibold">What's happening</h2>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateConversation(true)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                isLight
                  ? "bg-slate-950 text-white hover:bg-slate-800"
                  : "bg-white text-slate-950 hover:bg-white/90"
              }`}
            >
              + New conversation
            </button>
          </div>

          {!space.conversations || space.conversations.length === 0 ? (
            <div
              className={`rounded-[28px] border border-dashed p-12 text-center ${
                isLight
                  ? "border-slate-300 text-slate-400"
                  : "border-white/10 text-white/30"
              }`}
            >
              <p className="text-lg font-semibold">No conversations yet</p>

              <p className="mt-2 text-sm">
                Start the first conversation in this space.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {space.conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className={`group block rounded-[24px] border p-6 transition ${
                    isLight
                      ? "border-slate-200 bg-white/70 hover:border-violet-200 hover:shadow-[0_15px_40px_rgba(100,70,180,0.08)]"
                      : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold">
                      {conversation.title || "Untitled conversation"}
                    </h3>

                    <span
                      className={`text-lg transition-transform group-hover:translate-x-1 ${
                        isLight ? "text-slate-300" : "text-white/20"
                      }`}
                    >
                      ↗
                    </span>
                  </div>

                  <div
                    className={`mt-3 flex gap-4 text-xs ${
                      isLight ? "text-slate-400" : "text-white/30"
                    }`}
                  >
                    <span>{conversation._count.participants} participants</span>

                    <span>{conversation._count.messages} messages</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer
          className={`flex flex-col gap-2 border-t py-5 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between ${
            isLight
              ? "border-slate-200/70 text-slate-400"
              : "border-white/[0.06] text-white/20"
          }`}
        >
          <span>LinkUp © 2026</span>

          <span>Connect · Converse · Belong</span>
        </footer>
      </div>

      {showCreateConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close create conversation modal"
            onClick={() => {
              setShowCreateConversation(false);
              setConversationTitle("");
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div
            className={`relative z-10 w-full max-w-md rounded-[28px] border p-6 shadow-2xl ${
              isLight
                ? "border-slate-200 bg-white"
                : "border-white/[0.08] bg-[#11111b]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
                    isLight ? "text-violet-600" : "text-violet-300/70"
                  }`}
                >
                  New conversation
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Start a conversation
                </h2>

                <p
                  className={`mt-2 text-sm ${
                    isLight ? "text-slate-400" : "text-white/40"
                  }`}
                >
                  Create a new conversation in #{space.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateConversation(false);
                  setConversationTitle("");
                }}
                aria-label="Close"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition ${
                  isLight
                    ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    : "text-white/40 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateConversation();
              }}
              className="mt-6"
            >
              <label
                className={`text-xs font-medium ${
                  isLight ? "text-slate-600" : "text-white/60"
                }`}
              >
                Conversation title
              </label>

              <input
                autoFocus
                value={conversationTitle}
                onChange={(event) => setConversationTitle(event.target.value)}
                placeholder="e.g. General chat"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:ring-violet-500/10"
                    : "border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/25 focus:border-violet-400/30 focus:ring-violet-500/10"
                }`}
              />

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateConversation(false);
                    setConversationTitle("");
                  }}
                  className={`flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                    isLight
                      ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                      : "border-white/[0.08] text-white/60 hover:bg-white/[0.05]"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!conversationTitle.trim() || creatingConversation}
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    conversationTitle.trim() && !creatingConversation
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : isLight
                        ? "bg-slate-100 text-slate-300"
                        : "bg-white/[0.05] text-white/20"
                  }`}
                >
                  {creatingConversation ? "Creating..." : "Create conversation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
