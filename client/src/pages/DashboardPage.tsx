import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/useAuth";
import {
  getMySpaces,
  getDiscoverableSpaces,
  joinSpace,
  type Space,
} from "../api/space.api";
import { api } from "../api/client";

function getAccent(index: number) {
  const accents = [
    {
      glow: "bg-violet-500/20",
      icon: "bg-violet-500/10 text-violet-400",
      line: "from-violet-500 to-fuchsia-500",
    },
    {
      glow: "bg-cyan-500/20",
      icon: "bg-cyan-500/10 text-cyan-400",
      line: "from-cyan-500 to-blue-500",
    },
    {
      glow: "bg-fuchsia-500/20",
      icon: "bg-fuchsia-500/10 text-fuchsia-400",
      line: "from-fuchsia-500 to-violet-500",
    },
    {
      glow: "bg-emerald-500/20",
      icon: "bg-emerald-500/10 text-emerald-400",
      line: "from-emerald-500 to-cyan-500",
    },
  ];

  return accents[index % accents.length];
}

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

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
    >
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.6 8.6 0 1 0 11 11Z" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
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

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="m6 6 12 12M18 6 6 18" />
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

function SpaceSkeleton({ isLight }: { isLight: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-[26px] border p-6 ${
        isLight
          ? "border-slate-200 bg-white"
          : "border-white/[0.07] bg-white/[0.025]"
      }`}
    >
      <div className="animate-pulse">
        <div
          className={`h-11 w-11 rounded-2xl ${
            isLight ? "bg-slate-100" : "bg-white/[0.06]"
          }`}
        />

        <div
          className={`mt-5 h-5 w-40 rounded ${
            isLight ? "bg-slate-100" : "bg-white/[0.06]"
          }`}
        />

        <div
          className={`mt-3 h-3 w-3/4 rounded ${
            isLight ? "bg-slate-100" : "bg-white/[0.06]"
          }`}
        />

        <div
          className={`mt-2 h-3 w-1/2 rounded ${
            isLight ? "bg-slate-100" : "bg-white/[0.06]"
          }`}
        />

        <div
          className={`mt-7 h-3 w-32 rounded ${
            isLight ? "bg-slate-100" : "bg-white/[0.06]"
          }`}
        />
      </div>
    </div>
  );
}

function SpaceCard({
  space,
  index,
  isLight,
}: {
  space: Space;
  index: number;
  isLight: boolean;
}) {
  const accent = getAccent(index);

  return (
    <Link
      to={`/space/${space.id}`}
      className={`group relative block overflow-hidden rounded-[26px] border transition-all duration-300 hover:-translate-y-1 ${
        isLight
          ? "border-slate-200/80 bg-white shadow-[0_12px_45px_rgba(15,23,42,0.035)] hover:border-violet-200 hover:shadow-[0_20px_60px_rgba(109,40,217,0.10)]"
          : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.13] hover:bg-white/[0.045] hover:shadow-[0_20px_70px_rgba(0,0,0,0.25)]"
      }`}
    >
      {/* Accent glow */}
      <div
        className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-[70px] ${accent.glow} opacity-50 transition duration-500 group-hover:scale-125 group-hover:opacity-80`}
      />

      {/* Top accent line */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent.line} opacity-0 transition-opacity duration-300 group-hover:opacity-70`}
      />

      <div className="relative p-6 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.icon}`}
          >
            <span className="text-xl font-semibold">#</span>
          </div>

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
              isLight
                ? "border-slate-200 text-slate-300 group-hover:border-violet-200 group-hover:text-violet-500"
                : "border-white/[0.07] text-white/20 group-hover:border-violet-400/20 group-hover:text-violet-300"
            }`}
          >
            <ArrowUpRightIcon />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2.5">
            <h3 className="truncate text-lg font-semibold tracking-tight">
              {space.name}
            </h3>

            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </div>

          <p
            className={`mt-2 line-clamp-2 min-h-[42px] text-sm leading-5 ${
              isLight ? "text-slate-500" : "text-white/35"
            }`}
          >
            {space.description || "A place for people to connect and talk."}
          </p>
        </div>

        {space._count && (
          <div
            className={`mt-7 flex items-center gap-3 border-t pt-4 text-[11px] ${
              isLight
                ? "border-slate-100 text-slate-400"
                : "border-white/[0.06] text-white/25"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLight ? "bg-violet-400" : "bg-violet-400/70"
                }`}
              />
              {space._count.members}{" "}
              {space._count.members === 1 ? "member" : "members"}
            </span>

            <span className={isLight ? "text-slate-200" : "text-white/10"}>
              /
            </span>

            <span>
              {space._count.conversations}{" "}
              {space._count.conversations === 1
                ? "conversation"
                : "conversations"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { guest } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [spacesError, setSpacesError] = useState("");

  const [discoverableSpaces, setDiscoverableSpaces] = useState<Space[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [joiningSpaceId, setJoiningSpaceId] = useState<string | null>(null);

  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [createSpaceError, setCreateSpaceError] = useState<string | null>(null);

  const isLight = theme === "light";

  const avatarLetter =
    guest?.username?.charAt(0).toUpperCase() ||
    localStorage.getItem("linkup_username")?.charAt(0).toUpperCase() ||
    "L";

  useEffect(() => {
    if (!guest) {
      setSpaces([]);
      setDiscoverableSpaces([]);
      setSpacesLoading(false);
      setDiscoverLoading(false);
      return;
    }

    async function loadSpaces() {
      try {
        setSpacesLoading(true);
        setDiscoverLoading(true);
        setSpacesError("");

        const [mySpaces, discoverable] = await Promise.all([
          getMySpaces(),
          getDiscoverableSpaces(),
        ]);

        setSpaces(mySpaces);
        setDiscoverableSpaces(discoverable);
      } catch (error) {
        console.error("Failed to load spaces:", error);
        setSpacesError("Unable to load your spaces.");
      } finally {
        setSpacesLoading(false);
        setDiscoverLoading(false);
      }
    }

    loadSpaces();
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

  async function handleJoinSpace(spaceId: string) {
    try {
      setJoiningSpaceId(spaceId);

      await joinSpace(spaceId);

      const joinedSpace = discoverableSpaces.find(
        (space) => space.id === spaceId,
      );

      if (joinedSpace) {
        setSpaces((current) => [
          {
            ...joinedSpace,
            role: "MEMBER",
          },
          ...current,
        ]);
      }

      setDiscoverableSpaces((current) =>
        current.filter((space) => space.id !== spaceId),
      );
    } catch (error) {
      console.error("Failed to join space:", error);
    } finally {
      setJoiningSpaceId(null);
    }
  }

  async function handleCreateSpace(event: FormEvent) {
    event.preventDefault();

    const name = spaceName.trim();
    const description = spaceDescription.trim();
    const guestId = localStorage.getItem("linkup_guest_id");

    if (!guestId) {
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

      const response = await api.post(
        "/spaces",
        {
          name,
          description: description || undefined,
        },
        {
          headers: {
            "x-guest-id": guestId,
          },
        },
      );

      const newSpace = response.data.space;

      setSpaces((current) => [newSpace, ...current]);
      setShowCreateSpace(false);
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

  function closeCreateModal() {
    if (creatingSpace) return;

    setShowCreateSpace(false);
    setCreateSpaceError(null);
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f8f9fc] text-slate-950" : "bg-[#06060b] text-white"
      }`}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-[18rem] -top-[18rem] h-[42rem] w-[42rem] rounded-full blur-[150px] ${
            isLight ? "bg-violet-300/20" : "bg-violet-600/[0.08]"
          }`}
        />

        <div
          className={`absolute -right-[18rem] top-[15%] h-[40rem] w-[40rem] rounded-full blur-[160px] ${
            isLight ? "bg-cyan-300/15" : "bg-cyan-500/[0.055]"
          }`}
        />

        <div
          className={`absolute bottom-[-20rem] left-[30%] h-[40rem] w-[40rem] rounded-full blur-[160px] ${
            isLight ? "bg-fuchsia-300/10" : "bg-fuchsia-500/[0.04]"
          }`}
        />

        <div
          className={`absolute inset-0 ${
            isLight ? "opacity-[0.025]" : "opacity-[0.035]"
          }`}
          style={{
            backgroundImage: isLight
              ? `
                linear-gradient(rgba(15,23,42,.8) 1px, transparent 1px),
                linear-gradient(90deg, rgba(15,23,42,.8) 1px, transparent 1px)
              `
              : `
                linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
              `,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header
          className={`sticky top-0 z-40 flex h-[76px] items-center justify-end backdrop-blur-lg `}
        >
          {/* Center date */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <p
              className={`text-[10px] font-medium uppercase tracking-[0.24em] ${
                isLight ? "text-slate-400" : "text-white/25"
              }`}
            >
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).format(new Date())}
            </p>
          </div>
        </header>

        <div className="pt-4 md:hidden">
          <div
            className={`flex h-11 items-center gap-3 rounded-xl border px-3.5 ${
              isLight
                ? "border-slate-200 bg-white"
                : "border-white/[0.07] bg-white/[0.035]"
            }`}
          >
            <span className={isLight ? "text-slate-400" : "text-white/30"}>
              <SearchIcon />
            </span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search spaces..."
              className={`w-full bg-transparent text-sm outline-none ${
                isLight
                  ? "text-slate-800 placeholder:text-slate-400"
                  : "text-white placeholder:text-white/25"
              }`}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={isLight ? "text-slate-400" : "text-white/30"}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <section className="relative py-14 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <p
              className={`mb-4 text-base font-medium ${
                isLight ? "text-violet-600" : "text-violet-300"
              }`}
            >
              Welcome back
            </p>

            <h1 className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Good to see you,{" "}
              <span className={isLight ? "text-slate-950" : "text-white"}>
                {guest?.username || "there"}
              </span>
              .
            </h1>

            <p
              className={`mt-6 max-w-2xl text-lg leading-8 ${
                isLight ? "text-slate-500" : "text-white/45"
              }`}
            >
              See what your people are talking about and jump back into the
              conversations that matter to you.
            </p>
          </div>

          <div
            className={`pointer-events-none absolute right-0 top-6 hidden select-none text-[17rem] font-black leading-none tracking-[-0.12em] lg:block ${
              isLight ? "text-slate-900/[0.025]" : "text-white/[0.02]"
            }`}
          >
            {avatarLetter}
          </div>
        </section>

        {/* Content */}
        <section className="pb-20">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    isLight ? "text-slate-400" : "text-white/25"
                  }`}
                >
                  Your spaces
                </p>

                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                    isLight
                      ? "bg-slate-100 text-slate-400"
                      : "bg-white/[0.05] text-white/30"
                  }`}
                >
                  {spaces.length}
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Places worth opening
              </h2>
            </div>

            {search && !spacesLoading && (
              <p
                className={`text-xs ${
                  isLight ? "text-slate-400" : "text-white/25"
                }`}
              >
                {filteredSpaces.length}{" "}
                {filteredSpaces.length === 1 ? "result" : "results"} for “
                {search}”
              </p>
            )}
          </div>

          {/* Loading */}
          {spacesLoading && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SpaceSkeleton isLight={isLight} />
              <SpaceSkeleton isLight={isLight} />
              <SpaceSkeleton isLight={isLight} />
            </div>
          )}

          {/* Error */}
          {!spacesLoading && spacesError && (
            <div
              className={`rounded-[26px] border p-8 ${
                isLight
                  ? "border-red-200 bg-red-50/70"
                  : "border-red-500/15 bg-red-500/[0.04]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isLight
                      ? "bg-red-100 text-red-500"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  !
                </div>

                <div>
                  <p
                    className={`font-semibold ${
                      isLight ? "text-red-600" : "text-red-300"
                    }`}
                  >
                    Something went wrong
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      isLight ? "text-red-500/70" : "text-red-300/50"
                    }`}
                  >
                    {spacesError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Spaces */}
          {!spacesLoading && filteredSpaces.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredSpaces.map((space, index) => (
                <Link
                  to={`/space/${space.id}`}
                  key={space.id}
                  className={`group relative overflow-hidden rounded-xl border p-5 transition duration-200 hover:-translate-y-0.5 ${
                    isLight
                      ? "border-slate-200 bg-white hover:border-violet-200 hover:shadow-[0_10px_30px_rgba(60,40,120,.08)]"
                      : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                          index % 3 === 0
                            ? "bg-violet-500/10 text-violet-500"
                            : index % 3 === 1
                              ? "bg-cyan-500/10 text-cyan-500"
                              : "bg-fuchsia-500/10 text-fuchsia-500"
                        }`}
                      >
                        #
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {space.name}
                        </h3>

                        <p
                          className={`mt-0.5 text-xs ${
                            isLight ? "text-slate-400" : "text-white/30"
                          }`}
                        >
                          {space._count?.members ?? 0} members
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-lg transition-transform group-hover:translate-x-0.5 ${
                        isLight ? "text-slate-300" : "text-white/20"
                      }`}
                    >
                      →
                    </span>
                  </div>

                  {space.description && (
                    <p
                      className={`mt-4 line-clamp-2 text-xs leading-5 ${
                        isLight ? "text-slate-500" : "text-white/35"
                      }`}
                    >
                      {space.description}
                    </p>
                  )}

                  {space._count && (
                    <div
                      className={`mt-4 flex items-center gap-3 text-[10px] ${
                        isLight ? "text-slate-400" : "text-white/25"
                      }`}
                    >
                      <span>{space._count.conversations} conversations</span>

                      <span>·</span>

                      <span>Active community</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {!spacesLoading && !spacesError && filteredSpaces.length === 0 && (
            <div
              className={`relative overflow-hidden rounded-[28px] border border-dashed px-6 py-16 text-center ${
                isLight
                  ? "border-slate-300 bg-white/40"
                  : "border-white/[0.09] bg-white/[0.015]"
              }`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                  isLight
                    ? "bg-slate-100 text-slate-400"
                    : "bg-white/[0.04] text-white/25"
                }`}
              >
                {search ? <SearchIcon /> : <SparkleIcon />}
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                {search ? "Nothing matched that search" : "No spaces yet"}
              </h3>

              <p
                className={`mx-auto mt-2 max-w-sm text-sm leading-6 ${
                  isLight ? "text-slate-400" : "text-white/25"
                }`}
              >
                {search
                  ? "Try another name or description, or clear your search."
                  : "Create your first space and give your community somewhere to hang out."}
              </p>

              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={`mt-6 rounded-xl px-4 py-2.5 text-sm font-medium ${
                    isLight
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-950"
                  }`}
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCreateSpaceError(null);
                    setShowCreateSpace(true);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  <PlusIcon />
                  Create your first space
                </button>
              )}
            </div>
          )}

          {!discoverLoading && discoverableSpaces.length > 0 && (
            <section className="mt-16">
              <div className="mb-7">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    isLight ? "text-slate-400" : "text-white/25"
                  }`}
                >
                  Discover spaces
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Find somewhere new to belong
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {discoverableSpaces.map((space, index) => (
                  <div
                    key={space.id}
                    className={`rounded-xl border p-5 ${
                      isLight
                        ? "border-slate-200 bg-white"
                        : "border-white/[0.07] bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                            index % 3 === 0
                              ? "bg-violet-500/10 text-violet-500"
                              : index % 3 === 1
                                ? "bg-cyan-500/10 text-cyan-500"
                                : "bg-fuchsia-500/10 text-fuchsia-500"
                          }`}
                        >
                          #
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">
                            {space.name}
                          </h3>

                          <p
                            className={`mt-0.5 text-xs ${
                              isLight ? "text-slate-400" : "text-white/30"
                            }`}
                          >
                            {space._count?.members ?? 0} members
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={joiningSpaceId === space.id}
                        onClick={() => handleJoinSpace(space.id)}
                        className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {joiningSpaceId === space.id ? "Joining..." : "Join"}
                      </button>
                    </div>

                    <p
                      className={`mt-4 line-clamp-2 text-xs leading-5 ${
                        isLight ? "text-slate-500" : "text-white/35"
                      }`}
                    >
                      {space.description || "No description yet."}
                    </p>

                    <div
                      className={`mt-4 text-[10px] ${
                        isLight ? "text-slate-400" : "text-white/25"
                      }`}
                    >
                      {space._count?.conversations ?? 0} conversations
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>

        {/* Footer */}
        <footer
          className={`flex flex-col gap-3 border-t py-6 text-[9px] font-medium uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between ${
            isLight
              ? "border-slate-200/70 text-slate-400"
              : "border-white/[0.055] text-white/20"
          }`}
        >
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

      {/* Create Space Modal */}
      {showCreateSpace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close create space dialog"
            onClick={closeCreateModal}
            className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-md"
          />

          {/* Modal */}
          <form
            onSubmit={handleCreateSpace}
            className={`relative z-10 w-full max-w-lg overflow-hidden rounded-[30px] border shadow-2xl ${
              isLight
                ? "border-slate-200 bg-white shadow-slate-950/15"
                : "border-white/[0.09] bg-[#0e0e17] shadow-black/50"
            }`}
          >
            {/* Modal glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/15 blur-[80px]" />

            <div className="relative">
              {/* Header */}
              <div
                className={`flex items-start justify-between border-b px-6 py-6 sm:px-7 ${
                  isLight ? "border-slate-100" : "border-white/[0.06]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isLight
                        ? "bg-violet-50 text-violet-600"
                        : "bg-violet-500/10 text-violet-300"
                    }`}
                  >
                    <SparkleIcon />
                  </div>

                  <div>
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-[0.22em] ${
                        isLight ? "text-slate-400" : "text-white/25"
                      }`}
                    >
                      New community
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      Create a space
                    </h2>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        isLight ? "text-slate-400" : "text-white/30"
                      }`}
                    >
                      Give your people somewhere to gather.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={creatingSpace}
                  onClick={closeCreateModal}
                  aria-label="Close"
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    isLight
                      ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      : "text-white/30 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-5 px-6 py-6 sm:px-7">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="space-name"
                      className={`text-xs font-semibold ${
                        isLight ? "text-slate-700" : "text-white/70"
                      }`}
                    >
                      Space name
                    </label>

                    <span
                      className={`text-[10px] ${
                        isLight ? "text-slate-300" : "text-white/20"
                      }`}
                    >
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
                    className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition-all ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                        : "border-white/[0.08] bg-white/[0.035] text-white placeholder:text-white/20 focus:border-violet-400/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet-500/10"
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="space-description"
                    className={`mb-2 block text-xs font-semibold ${
                      isLight ? "text-slate-700" : "text-white/70"
                    }`}
                  >
                    Description{" "}
                    <span
                      className={`font-normal ${
                        isLight ? "text-slate-300" : "text-white/20"
                      }`}
                    >
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
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition-all ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                        : "border-white/[0.08] bg-white/[0.035] text-white placeholder:text-white/20 focus:border-violet-400/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet-500/10"
                    }`}
                  />
                </div>

                {createSpaceError && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                      isLight
                        ? "border-red-200 bg-red-50 text-red-500"
                        : "border-red-500/15 bg-red-500/[0.05] text-red-300"
                    }`}
                  >
                    <span className="font-bold">!</span>
                    <p className="text-xs leading-5">{createSpaceError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className={`flex gap-3 border-t px-6 py-5 sm:px-7 ${
                  isLight
                    ? "border-slate-100 bg-slate-50/60"
                    : "border-white/[0.06] bg-white/[0.015]"
                }`}
              >
                <button
                  type="button"
                  disabled={creatingSpace}
                  onClick={closeCreateModal}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      : "border-white/[0.08] text-white/50 hover:bg-white/[0.04]"
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingSpace || !spaceName.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/15 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creatingSpace ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Create space
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
