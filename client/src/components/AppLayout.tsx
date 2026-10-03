import {
  ArrowRight,
  Check,
  Copy,
  MessageCircle,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import {
  createPrivateConversation,
  joinPrivateConversation,
} from "../api/conversation.api";
import { createSpace } from "../api/space.api";
import Header from "./Header";

export default function AppLayout() {
  const navigate = useNavigate();
  const { guest } = useAuth();

  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [privateConversationOpen, setPrivateConversationOpen] = useState(false);
  const [joinConversationOpen, setJoinConversationOpen] = useState(false);

  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [createSpaceError, setCreateSpaceError] = useState<string | null>(null);

  const [privateTitle, setPrivateTitle] = useState("");
  const [privateConversation, setPrivateConversation] = useState<{
    id: string;
    joinCode: string;
  } | null>(null);

  const [creatingPrivateConversation, setCreatingPrivateConversation] =
    useState(false);

  const [privateConversationError, setPrivateConversationError] = useState<
    string | null
  >(null);

  const [codeCopied, setCodeCopied] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [joiningConversation, setJoiningConversation] = useState(false);
  const [joinConversationError, setJoinConversationError] = useState<
    string | null
  >(null);
  const location = useLocation();

  const isChatPage = location.pathname.startsWith("/chat/");

  async function handleCreateSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = spaceName.trim();
    const description = spaceDescription.trim();

    if (!guest) {
      setCreateSpaceError("Guest session not found");
      return;
    }

    if (name.length < 2) {
      setCreateSpaceError("Space name must be at least 2 characters");
      return;
    }

    try {
      setCreatingSpace(true);
      setCreateSpaceError(null);

      const newSpace = await createSpace({
        name,
        description: description || undefined,
      });

      setCreateSpaceOpen(false);
      setSpaceName("");
      setSpaceDescription("");

      navigate(`/space/${newSpace.id}`);
    } catch (error) {
      console.error("Failed to create space:", error);

      setCreateSpaceError(
        error instanceof Error ? error.message : "Failed to create space",
      );
    } finally {
      setCreatingSpace(false);
    }
  }

  async function handleCreatePrivateConversation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setCreatingPrivateConversation(true);
      setPrivateConversationError(null);

      const conversation = await createPrivateConversation(privateTitle);

      if (!conversation.joinCode) {
        throw new Error("Join code was not generated");
      }

      setPrivateConversation({
        id: conversation.id,
        joinCode: conversation.joinCode,
      });

      setPrivateTitle("");
    } catch (error) {
      console.error("Failed to create private conversation:", error);

      setPrivateConversationError(
        error instanceof Error
          ? error.message
          : "Failed to create private conversation",
      );
    } finally {
      setCreatingPrivateConversation(false);
    }
  }

  function closePrivateConversation() {
    if (creatingPrivateConversation) return;

    setPrivateConversationOpen(false);
    setPrivateConversation(null);
    setPrivateTitle("");
    setPrivateConversationError(null);
    setCodeCopied(false);
  }

  async function handleCopyJoinCode() {
    if (!privateConversation?.joinCode) return;

    try {
      await navigator.clipboard.writeText(privateConversation.joinCode);

      setCodeCopied(true);

      window.setTimeout(() => {
        setCodeCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy join code:", error);
    }
  }

  function closeCreateSpace() {
    if (creatingSpace) return;

    setCreateSpaceOpen(false);
    setSpaceName("");
    setSpaceDescription("");
    setCreateSpaceError(null);
  }

  async function handleJoinConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = joinCode.trim().toUpperCase();

    if (code.length !== 6) {
      setJoinConversationError("Join code must be 6 characters");
      return;
    }

    try {
      setJoiningConversation(true);
      setJoinConversationError(null);

      const result = await joinPrivateConversation(code);

      setJoinConversationOpen(false);
      setJoinCode("");

      const conversationId =
        "participant" in result
          ? result.participant.conversationId
          : result.conversationId;

      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error("Failed to join conversation:", error);

      setJoinConversationError(
        error instanceof Error ? error.message : "Failed to join conversation",
      );
    } finally {
      setJoiningConversation(false);
    }
  }

  function closeJoinConversation() {
    if (joiningConversation) return;

    setJoinConversationOpen(false);
    setJoinCode("");
    setJoinConversationError(null);
  }

  /*
   * Header actions
   */
  useEffect(() => {
    function handleCreateSpace() {
      setPrivateConversationOpen(false);
      setJoinConversationOpen(false);

      setCreateSpaceError(null);
      setCreateSpaceOpen(true);
    }

    function handleOpenPrivateConversation() {
      setCreateSpaceOpen(false);
      setJoinConversationOpen(false);

      setPrivateConversationError(null);
      setPrivateConversationOpen(true);
    }

    function handleJoinConversation() {
      setCreateSpaceOpen(false);
      setPrivateConversationOpen(false);

      setJoinConversationError(null);
      setJoinConversationOpen(true);
    }

    window.addEventListener("linkup:create-space", handleCreateSpace);

    window.addEventListener(
      "linkup:create-private-conversation",
      handleOpenPrivateConversation,
    );

    window.addEventListener("linkup:join-conversation", handleJoinConversation);

    return () => {
      window.removeEventListener("linkup:create-space", handleCreateSpace);

      window.removeEventListener(
        "linkup:create-private-conversation",
        handleOpenPrivateConversation,
      );

      window.removeEventListener(
        "linkup:join-conversation",
        handleJoinConversation,
      );
    };
  }, []);

  /*
   * Escape closes active modal
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (createSpaceOpen && !creatingSpace) {
        closeCreateSpace();
        return;
      }

      if (privateConversationOpen && !creatingPrivateConversation) {
        closePrivateConversation();
        return;
      }

      if (joinConversationOpen && !joiningConversation) {
        closeJoinConversation();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    createSpaceOpen,
    privateConversationOpen,
    joinConversationOpen,
    creatingSpace,
    creatingPrivateConversation,
    joiningConversation,
  ]);

  return (
    <main
      className={[
        "relative bg-[#f7f8fc] text-slate-950",
        isChatPage ? "h-[100dvh] overflow-hidden" : "min-h-dvh overflow-hidden",
      ].join(" ")}
    >
      {/* Global background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 min-h-screen">
        <div
          className="
        absolute
        -left-[18rem]
        -top-[18rem]
        h-[42rem]
        w-[42rem]
        animate-[linkup-float_16s_ease-in-out_infinite]
        rounded-full
        bg-violet-400/[0.08]
        blur-[150px]
      "
        />

        <div
          className="
        absolute
        -right-[18rem]
        top-[18%]
        h-[38rem]
        w-[38rem]
        animate-[linkup-float-reverse_20s_ease-in-out_infinite]
        rounded-full
        bg-cyan-400/[0.07]
        blur-[160px]
      "
        />

        <div
          className="
        absolute
        left-1/2
        top-[65%]
        h-[30rem]
        w-[30rem]
        -translate-x-1/2
        animate-[linkup-pulse_12s_ease-in-out_infinite]
        rounded-full
        bg-indigo-300/[0.045]
        blur-[150px]
      "
        />

        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: `
          linear-gradient(
            120deg,
            transparent 0%,
            transparent 49.3%,
            rgba(124, 58, 237, 0.05) 49.7%,
            rgba(124, 58, 237, 0.05) 50.3%,
            transparent 50.7%,
            transparent 100%
          )
        `,
            backgroundSize: "52px 52px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
          linear-gradient(
            rgba(100, 116, 139, 0.13) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(100, 116, 139, 0.13) 1px,
            transparent 1px
          )
        `,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="absolute left-[7%] top-[18%] hidden h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300/60 2xl:block" />

        <div className="absolute right-[7%] top-[34%] hidden h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/60 [animation-delay:1.2s] 2xl:block" />

        <div className="absolute bottom-[18%] left-[12%] hidden h-1 w-1 animate-pulse rounded-full bg-slate-300 [animation-delay:2s] 2xl:block" />
      </div>

      {/* Header */}
      {isChatPage ? (
        <div className="hidden shrink-0 sm:block">
          <Header />
        </div>
      ) : (
        <Header />
      )}

      {/* Page content */}
      {isChatPage ? (
        <section
          className="
      relative
      z-10
      h-[100dvh]
      min-h-0
      overflow-hidden
      sm:h-[calc(100dvh-70px)]
      sm:px-4
      sm:py-2
      lg:px-6
      xl:px-8
    "
        >
          <div
            className="
        mx-auto
        h-full
        min-h-0
        w-full
        max-w-[1680px]
        overflow-hidden
        bg-white
        shadow-[0_20px_70px_rgba(15,23,42,0.08)]
        sm:rounded-[28px]
        sm:border
        sm:border-slate-200/80
      "
          >
            <Outlet />
          </div>
        </section>
      ) : (
        <section className="relative z-10">
          <div className="mx-auto min-h-[calc(100vh-72px)] max-w-[1680px] px-0 sm:px-4 sm:py-2 lg:px-6 xl:px-8">
            <div
              className="
                relative
                min-h-[calc(100vh-72px)]
                overflow-hidden
                bg-white
                shadow-[0_20px_70px_rgba(15,23,42,0.06)]
                sm:min-h-[calc(100vh-104px)]
                sm:rounded-[28px]
                sm:border
                sm:border-slate-200/70
              "
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-violet-200/70 to-transparent" />

              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="
                    absolute
                    -right-32
                    -top-32
                    h-72
                    w-72
                    animate-[linkup-float_18s_ease-in-out_infinite]
                    rounded-full
                    bg-violet-200/[0.045]
                    blur-[100px]
                  "
                />

                <div
                  className="
                    absolute
                    -bottom-40
                    -left-32
                    h-80
                    w-80
                    animate-[linkup-float-reverse_22s_ease-in-out_infinite]
                    rounded-full
                    bg-cyan-200/[0.035]
                    blur-[110px]
                  "
                />
              </div>

              <div className="relative z-10 animate-[linkup-page-in_500ms_ease-out_both]">
                <Outlet />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Start a Space */}
      {createSpaceOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close start space dialog"
            onClick={closeCreateSpace}
            className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
          />

          <form
            onSubmit={handleCreateSpace}
            className="
              relative
              z-10
              w-full
              max-w-lg
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              shadow-[0_30px_100px_rgba(15,23,42,0.18)]
            "
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/15 blur-[80px]" />

            <div className="relative">
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-6 sm:px-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      New community
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                      Start a space
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Give your people somewhere to gather.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={creatingSpace}
                  onClick={closeCreateSpace}
                  aria-label="Close"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 px-5 py-6 sm:px-7">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="space-name"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Space name
                    </label>

                    <span className="text-[10px] text-slate-300">
                      {spaceName.length}/50
                    </span>
                  </div>

                  <input
                    id="space-name"
                    autoFocus
                    value={spaceName}
                    onChange={(event) => setSpaceName(event.target.value)}
                    maxLength={50}
                    placeholder="e.g. Photography"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-violet-300
                      focus:bg-white
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="space-description"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Description{" "}
                    <span className="font-normal text-slate-300">
                      · optional
                    </span>
                  </label>

                  <textarea
                    id="space-description"
                    value={spaceDescription}
                    onChange={(event) =>
                      setSpaceDescription(event.target.value)
                    }
                    rows={4}
                    placeholder="What is this space about?"
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-900
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-violet-300
                      focus:bg-white
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />
                </div>

                {createSpaceError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-500">
                    <span className="font-bold">!</span>
                    <p className="text-xs leading-5">{createSpaceError}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-7">
                <button
                  type="button"
                  disabled={creatingSpace}
                  onClick={closeCreateSpace}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingSpace || !spaceName.trim()}
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-violet-600
                    px-2 sm:px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-violet-600/15
                    transition
                    hover:bg-violet-500
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {creatingSpace ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Start space
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Private Conversation */}
      {privateConversationOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePrivateConversation();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-600">
                  Private conversation
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Start a private conversation
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Create a private chat and invite people using a join code.
                </p>
              </div>

              <button
                type="button"
                onClick={closePrivateConversation}
                disabled={creatingPrivateConversation}
                aria-label="Close"
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {privateConversation ? (
              <div className="px-6 py-6">
                <p className="text-sm font-medium text-slate-700">
                  Your conversation is ready.
                </p>

                <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-5 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-600">
                    Join code
                  </p>

                  <p className="mt-2 font-mono text-3xl font-bold tracking-[0.22em] text-slate-950">
                    {privateConversation.joinCode}
                  </p>

                  <button
                    type="button"
                    onClick={handleCopyJoinCode}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy code
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={closePrivateConversation}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const conversationId = privateConversation.id;

                      closePrivateConversation();
                      navigate(`/chat/${conversationId}`);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open chat
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleCreatePrivateConversation}
                className="px-6 py-6"
              >
                <label className="block">
                  <span className="text-sm font-semibold text-slate-800">
                    Conversation title
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </span>

                  <input
                    value={privateTitle}
                    onChange={(event) => setPrivateTitle(event.target.value)}
                    maxLength={100}
                    placeholder="e.g. Weekend plans"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    autoFocus
                  />
                </label>

                {privateConversationError && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {privateConversationError}
                  </p>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closePrivateConversation}
                    disabled={creatingPrivateConversation}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creatingPrivateConversation}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingPrivateConversation ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Start conversation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Join Conversation */}
      {joinConversationOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeJoinConversation();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.2)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-600">
                  Join conversation
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Enter your join code
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use the 6-character code shared by the conversation owner.
                </p>
              </div>

              <button
                type="button"
                onClick={closeJoinConversation}
                disabled={joiningConversation}
                aria-label="Close"
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleJoinConversation} className="px-6 py-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">
                  Join code
                </span>

                <input
                  value={joinCode}
                  onChange={(event) =>
                    setJoinCode(
                      event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6),
                    )
                  }
                  maxLength={6}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ABC123"
                  className="mt-2 h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center font-mono text-xl font-bold tracking-[0.3em] text-slate-950 uppercase outline-none transition placeholder:text-slate-300 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </label>

              {joinConversationError && (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {joinConversationError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeJoinConversation}
                  disabled={joiningConversation}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={joiningConversation || joinCode.length !== 6}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joiningConversation ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join conversation
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
