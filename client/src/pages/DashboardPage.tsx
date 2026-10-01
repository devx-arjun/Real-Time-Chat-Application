import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyPrivateConversations,
  type Conversation,
} from "../api/conversation.api";
import { useAuth } from "../context/useAuth";
import { getMySpaces, type Space } from "../api/space.api";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.2-.6L4 20l1.6-3.8A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M10 13.5a4 4 0 0 0 5.8.2l2-2a4 4 0 0 0-5.7-5.6l-1.2 1.2" />
      <path d="M14 10.5a4 4 0 0 0-5.8-.2l-2 2a4 4 0 0 0 5.7 5.6l1.2-1.2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </svg>
  );
}

function SpaceSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="animate-pulse">
        <div className="h-9 w-9 rounded-xl bg-slate-100" />
        <div className="mt-4 h-4 w-36 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
        <div className="mt-5 h-3 w-20 rounded bg-slate-100" />
      </div>
    </div>
  );
}

const accentStyles = [
  {
    icon: "bg-violet-500/10 text-violet-600",
    rail: "bg-violet-500",
  },
  {
    icon: "bg-cyan-500/10 text-cyan-600",
    rail: "bg-cyan-500",
  },
  {
    icon: "bg-fuchsia-500/10 text-fuchsia-600",
    rail: "bg-fuchsia-500",
  },
  {
    icon: "bg-emerald-500/10 text-emerald-600",
    rail: "bg-emerald-500",
  },
];

export default function DashboardPage() {
  const { guest } = useAuth();
  console.log("DASHBOARD GUEST:", guest);
  const [search, setSearch] = useState("");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [spacesError, setSpacesError] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  const storedUsername = localStorage.getItem("linkup_username");

  const username = guest?.username || storedUsername || "there";

  const avatarLetter = username.charAt(0).toUpperCase();

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const hour = new Date().getHours();

  const greeting =
    hour < 5
      ? "Night"
      : hour < 12
        ? "Morning"
        : hour < 18
          ? "Afternoon"
          : "Evening";

  useEffect(() => {
    if (!guest) {
      setSpaces([]);
      setConversations([]);
      setSpacesLoading(false);
      setConversationsLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        setSpacesLoading(true);
        setConversationsLoading(true);
        setSpacesError("");

        const [mySpaces, myConversations] = await Promise.all([
          getMySpaces(),
          getMyPrivateConversations(),
        ]);

        setSpaces(mySpaces);
        setConversations(myConversations);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setSpacesError("Unable to load your spaces.");
      } finally {
        setSpacesLoading(false);
        setConversationsLoading(false);
      }
    }

    void loadDashboard();
  }, [guest]);

  const filteredSpaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return spaces;
    }

    return spaces.filter((space) => {
      return (
        space.name.toLowerCase().includes(query) ||
        space.description?.toLowerCase().includes(query)
      );
    });
  }, [spaces, search]);

  function openCreateSpace() {
    window.dispatchEvent(new Event("linkup:create-space"));
  }

  function openPrivateConversation() {
    window.dispatchEvent(new Event("linkup:create-private-conversation"));
  }

  function openJoinConversation() {
    window.dispatchEvent(new Event("linkup:join-conversation"));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-violet-300/20 blur-[140px]" />
        <div className="absolute -right-40 -bottom-40 h-[36rem] w-[36rem] rounded-full bg-cyan-300/15 blur-[140px]" />
        <div className="absolute bottom-[-14rem] left-[35%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-300/15 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: ` linear-gradient(rgba(15,23,42,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.8) 1px, transparent 1px) `,
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: ` radial-gradient( circle at 20% 20%, currentColor .6px, transparent .7px ), radial-gradient( circle at 80% 70%, currentColor .6px, transparent .7px ) `,
            backgroundSize: "17px 17px, 23px 23px",
          }}
        />{" "}
      </div>
      <div className="mx-auto max-w-[1350px] px-5 pt-8 sm:px-8 lg:px-12">
        {/* Intro */}
        <section className="relative py-8 sm:py-10 lg:py-14">
          <div className="relative max-w-4xl">
            <div className="mb-5 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Good {greeting}
              </p>
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-8xl">
              Welcome back,
              <br />
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                {username}.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-500">
              Pick up where you left off, jump into a conversation, or find a
              space that feels like yours.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openCreateSpace}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:bg-violet-600"
              >
                <PlusIcon />
                Create a space
              </button>

              <button
                type="button"
                onClick={openPrivateConversation}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-600"
              >
                <ChatIcon />
                Start a conversation
              </button>

              <button
                type="button"
                onClick={openJoinConversation}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:text-cyan-600"
              >
                <LinkIcon />
                Join with code
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-0 top-20 hidden select-none text-[17rem] font-black leading-[0.8] tracking-[-0.12em] text-slate-900/[0.035] lg:block">
            {avatarLetter}
          </div>

          <div className="pointer-events-none absolute right-0 top-14 z-10 hidden text-right lg:block">
            <p className="text-6xl font-semibold tracking-[-0.07em] text-slate-950">
              {formattedDate.split(",")[0]}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400">
              {formattedDate.split(",").slice(1).join(",").trim()}
            </p>
          </div>
        </section>

        {/* Search */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your spaces..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/5"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-400 transition hover:text-slate-700"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {search && !spacesLoading && (
            <p className="text-xs text-slate-400">
              {filteredSpaces.length}{" "}
              {filteredSpaces.length === 1 ? "space" : "spaces"} found
            </p>
          )}
        </div>
        {/* Jump back in */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                Jump back in
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Your conversations
              </h2>
            </div>

            {conversations.length > 0 && (
              <Link
                to="/chats"
                className="hidden items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-violet-600 sm:flex"
              >
                See all
                <ArrowIcon />
              </Link>
            )}
          </div>

          {conversationsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
              <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
            </div>
          ) : conversations.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {conversations.slice(0, 4).map((conversation, index) => {
                const accent = accentStyles[index % accentStyles.length];

                return (
                  <Link
                    key={conversation.id}
                    to={`/chat/${conversation.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_16px_38px_rgba(60,40,120,0.08)]"
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-1 ${accent.rail} transition-all duration-200 group-hover:w-1.5`}
                    />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}
                        >
                          <ChatIcon />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {conversation.title || "Private conversation"}
                            </h3>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {conversation._count.participants}{" "}
                            {conversation._count.participants === 1
                              ? "participant"
                              : "participants"}
                          </p>
                        </div>
                      </div>

                      <span className="mt-1 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-violet-500">
                        <ArrowIcon />
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                      <span>{conversation._count.messages} messages</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>Private</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 px-6 py-10">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <ChatIcon />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    Nothing to jump back into yet
                  </h3>

                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-400">
                    Start a private conversation and your latest chats will
                    appear here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openPrivateConversation}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-600"
                >
                  <PlusIcon />
                  Start a conversation
                </button>
              </div>
            </div>
          )}
        </section>
        {/* Spaces */}
        <section className="mt-14">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Your spaces
                </p>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
                  {spaces.length}
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Places you belong
              </h2>
            </div>

            <button
              type="button"
              onClick={openCreateSpace}
              className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-violet-600 transition hover:text-violet-700"
            >
              <PlusIcon />
              New space
            </button>
          </div>

          {spacesLoading && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SpaceSkeleton />
              <SpaceSkeleton />
              <SpaceSkeleton />
            </div>
          )}

          {!spacesLoading && spacesError && (
            <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6">
              <p className="text-sm font-semibold text-red-600">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-500/70">{spacesError}</p>
            </div>
          )}

          {!spacesLoading && !spacesError && filteredSpaces.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSpaces.map((space, index) => {
                const accent = accentStyles[index % accentStyles.length];

                return (
                  <Link
                    key={space.id}
                    to={`/space/${space.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_38px_rgba(30,40,70,0.07)]"
                  >
                    <span
                      className={`absolute left-0 top-0 h-1 w-0 ${accent.rail} transition-all duration-300 group-hover:w-full`}
                    />

                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${accent.icon}`}
                      >
                        #
                      </div>

                      <span className="text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-slate-700">
                        <ArrowIcon />
                      </span>
                    </div>

                    <h3 className="mt-5 truncate text-sm font-semibold text-slate-900">
                      {space.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {space._count?.members ?? 0} members
                    </p>

                    {space.description && (
                      <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">
                        {space.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                      <span>
                        {space._count?.conversations ?? 0} conversations
                      </span>

                      <span className="h-1 w-1 rounded-full bg-slate-300" />

                      <span>{space.role || "Member"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!spacesLoading && !spacesError && filteredSpaces.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                {search ? <SearchIcon /> : <SparkleIcon />}
              </div>

              <h3 className="mt-4 text-base font-semibold">
                {search ? "No spaces found" : "No spaces yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                {search
                  ? "Try a different search or clear the current filter."
                  : "Create your first space and give your community somewhere to gather."}
              </p>

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-600"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openCreateSpace}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                >
                  <PlusIcon />
                  Create your first space
                </button>
              )}
            </div>
          )}
        </section>
        {/* Explore strip */}
        <section className="py-12 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
          <Link
            to="/discover"
            className="group relative overflow-hidden rounded-2xl border border-violet-200/70 bg-violet-50/60 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_14px_35px_rgba(100,70,180,0.08)]"
          >
            <div className="relative z-10 flex items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
                  Explore
                </p>

                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Find somewhere new to belong.
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Browse spaces and discover communities outside your usual
                  circle.
                </p>
              </div>

              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm transition group-hover:translate-x-1 sm:flex">
                <ArrowIcon />
              </span>
            </div>
          </Link>

          <Link
            to="/activity"
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_14px_35px_rgba(30,140,180,0.07)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Your activity
                </p>

                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  See what changed.
                </h3>
              </div>

              <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-cyan-500">
                <ArrowIcon />
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Keep up with the things you've joined and created.
            </p>
          </Link>
        </section>
        {/* Footer */}
        <footer className="py-7 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400 flex-row items-center justify-between">
          <span>LinkUp © 2026</span>

          <div className="flex items-center gap-3">
            <span>Connect</span>
            <span>·</span>
            <span>Converse</span>
            <span>·</span>
            <span>Belong</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
