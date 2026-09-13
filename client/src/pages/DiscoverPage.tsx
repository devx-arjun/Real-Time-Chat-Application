import {
  ArrowRight,
  Check,
  Compass,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDiscoverableSpaces, joinSpace, type Space } from "../api/space.api";

type Filter = "All" | "New" | "Popular";

const filters: Filter[] = ["All", "New", "Popular"];

export default function DiscoverPage() {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [joiningSpaceId, setJoiningSpaceId] = useState<string | null>(null);
  const [joinedSpaceIds, setJoinedSpaceIds] = useState<Set<string>>(
    () => new Set(),
  );

  async function loadSpaces() {
    try {
      setLoading(true);
      setError(null);

      const result = await getDiscoverableSpaces();
      setSpaces(result);
    } catch (error) {
      console.error("Failed to load discoverable spaces:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load discoverable spaces",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSpaces();
  }, []);

  const filteredSpaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = spaces.filter((space) => {
      const matchesSearch =
        !query ||
        space.name.toLowerCase().includes(query) ||
        space.description?.toLowerCase().includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "New") {
        const createdAt = new Date(space.createdAt).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        return createdAt >= sevenDaysAgo;
      }

      if (filter === "Popular") {
        return (space._count?.members ?? 0) >= 10;
      }

      return true;
    });

    if (filter === "Popular") {
      return [...result].sort(
        (a, b) => (b._count?.members ?? 0) - (a._count?.members ?? 0),
      );
    }

    if (filter === "New") {
      return [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [spaces, search, filter]);

  async function handleJoinSpace(spaceId: string) {
    if (joiningSpaceId) {
      return;
    }

    try {
      setJoiningSpaceId(spaceId);
      setError(null);

      await joinSpace(spaceId);

      setJoinedSpaceIds((current) => {
        const next = new Set(current);
        next.add(spaceId);
        return next;
      });

      setSpaces((current) => current.filter((space) => space.id !== spaceId));
    } catch (error) {
      console.error("Failed to join space:", error);

      setError(error instanceof Error ? error.message : "Failed to join space");
    } finally {
      setJoiningSpaceId(null);
    }
  }

  function handleCreateSpace() {
    window.dispatchEvent(new Event("linkup:create-space"));
  }

  const regularSpaces = filteredSpaces;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-950">
      {/* Atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-violet-300/20 blur-[140px]" />

        <div className="absolute -right-48 top-[25%] h-[36rem] w-[36rem] rounded-full bg-cyan-300/15 blur-[150px]" />

        <div className="absolute bottom-[-14rem] left-[35%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-300/15 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(15,23,42,.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15,23,42,.8) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, currentColor .6px, transparent .7px),
              radial-gradient(circle at 80% 70%, currentColor .6px, transparent .7px)
            `,
            backgroundSize: "17px 17px, 23px 23px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-[1450px] px-5 sm:px-8 lg:px-12">
        {/* Hero */}

        <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
          <div className="max-w-4xl">
            <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-600">
              <span className="h-px w-7 bg-violet-400" />
              Discover
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-5xl lg:text-8xl">
              Find your people.
              <br />
              <span className=" bg-linear-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-7xl">
                Find your space.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Browse communities, find something that feels like you, and jump
              into the conversation.
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="mb-10">
          <div className="group flex h-13 items-center gap-3 border border-slate-200 bg-white px-4 shadow-[0_12px_40px_rgba(30,20,60,0.04)] transition rounded-4xl focus-within:border-violet-300 focus-within:shadow-[0_18px_50px_rgba(100,70,180,0.08)] sm:px-5">
            <Search className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-violet-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search spaces, topics, interests..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((item) => {
                const active = filter === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`shrink-0 px-4 py-2 text-xs font-semibold transition rounded-4xl ${
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-10 flex items-center justify-between gap-4 border border-red-200 bg-red-50 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => void loadSpaces()}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 text-xs font-semibold text-red-700 transition hover:text-red-900 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Discover */}
        <section className="pb-20">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                Discover
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Spaces worth opening
              </h2>
            </div>

            {!loading && (
              <span className="text-xs text-slate-400">
                {filteredSpaces.length}{" "}
                {filteredSpaces.length === 1 ? "space" : "spaces"}
              </span>
            )}
          </div>

          {loading ? (
            <DiscoverSkeleton />
          ) : filteredSpaces.length === 0 ? (
            <EmptyState
              search={search}
              filter={filter}
              onClear={() => {
                setSearch("");
                setFilter("All");
              }}
              onCreate={handleCreateSpace}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regularSpaces.map((space) => (
                <DiscoverSpaceCard
                  key={space.id}
                  space={space}
                  joining={joiningSpaceId === space.id}
                  joined={joinedSpaceIds.has(space.id)}
                  onJoin={() => void handleJoinSpace(space.id)}
                  onOpen={() => navigate(`/space/${space.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Create CTA */}
        <section className="border-y border-slate-200/70 py-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-600">
                Start something
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Can&apos;t find your crowd?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create a space around whatever you&apos;re into and give other
                people somewhere to join the conversation.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateSpace}
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
            >
              <Plus className="h-4 w-4" />
              Create a space
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 py-7 text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>LinkUp © 2026</span>
          <span>Connect · Converse · Belong</span>
        </footer>
      </div>
    </main>
  );
}

function DiscoverSpaceCard({
  space,
  joining,
  joined,
  onJoin,
  onOpen,
}: {
  space: Space;
  joining: boolean;
  joined: boolean;
  onJoin: () => void;
  onOpen: () => void;
}) {
  const memberCount = space._count?.members ?? 0;

  const initial = space.name.charAt(0).toUpperCase() || "#";

  const createdRecently =
    Date.now() - new Date(space.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;

  return (
    <article className="group relative min-h-[200px] overflow-hidden  border border-slate-200/80 bg-white/65 text-left shadow-[0_15px_50px_rgba(30,20,60,0.03)] transition duration-500 hover:-translate-y-1.5 hover:border-violet-200 hover:shadow-[0_25px_70px_rgba(100,70,180,0.10)]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/5 to-transparent" />

      {/* Hover glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400 opacity-0 blur-[70px] transition duration-500 group-hover:opacity-20" />

      <div className="relative flex h-full  flex-col p-6">
        {/* Top */}
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={onOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500 transition group-hover:bg-violet-50 group-hover:text-violet-500"
          >
            {space.imageUrl ? (
              <img
                src={space.imageUrl}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              initial
            )}
          </button>

          <div className="flex items-center gap-2">
            {createdRecently && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-500">
                New
              </span>
            )}

            <Compass className="h-4 w-4 text-slate-300 transition duration-300 group-hover:text-violet-400" />
          </div>
        </div>

        {/* Content */}
        <button type="button" onClick={onOpen} className="mt-7 text-left">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="max-w-full truncate text-xl font-semibold tracking-tight text-slate-900">
              {space.name}
            </h3>

            <span className="text-[9px] uppercase tracking-[0.15em] text-slate-400">
              Space
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
            {space.description || "A new place to connect and converse."}
          </p>
        </button>

        {/* Bottom info */}
        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[12px]">
              <Users className="h-3 w-3" />
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
          <button
            type="button"
            onClick={onJoin}
            disabled={joining || joined}
            className={`inline-flex min-w-22.5 items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold cursor-pointer transition ${
              joined
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-950 text-white hover:bg-transparent hover:text-black"
            } disabled:cursor-default`}
          >
            {joining ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Joining
              </>
            ) : joined ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Joined
              </>
            ) : (
              <>
                Join
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="space-y-4">
      <div className="min-h-[290px] animate-pulse border border-slate-200 bg-white/70 p-7">
        <div className="h-12 w-12 bg-slate-100" />
        <div className="mt-7 h-5 w-48 bg-slate-100" />
        <div className="mt-3 h-4 max-w-xl bg-slate-100" />
        <div className="mt-2 h-4 max-w-md bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="min-h-[250px] animate-pulse border border-slate-200 bg-white/70 p-6"
          >
            <div className="h-10 w-10 bg-slate-100" />
            <div className="mt-6 h-5 w-36 bg-slate-100" />
            <div className="mt-3 h-4 w-full bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  search,
  filter,
  onClear,
  onCreate,
}: {
  search: string;
  filter: Filter;
  onClear: () => void;
  onCreate: () => void;
}) {
  const hasFilters = Boolean(search) || filter !== "All";

  return (
    <div className="border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center bg-slate-100 text-slate-400">
        <Compass className="h-5 w-5" />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {hasFilters
          ? "No spaces match your search."
          : "There are no spaces to discover yet."}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {hasFilters
          ? "Try a different search or clear the current filters."
          : "Be one of the first people to create a community on LinkUp."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            Clear filters
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-600"
        >
          <Plus className="h-3.5 w-3.5" />
          Create a space
        </button>
      </div>
    </div>
  );
}

// import {
//   ArrowRight,
//   Check,
//   Compass,
//   Loader2,
//   Plus,
//   RefreshCw,
//   Search,
//   Users,
//   X,
// } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getDiscoverableSpaces, joinSpace, type Space } from "../api/space.api";

// type Filter = "All" | "New" | "Popular";

// const filters: Filter[] = ["All", "New", "Popular"];

// export default function DiscoverPage() {
//   const navigate = useNavigate();

//   const [spaces, setSpaces] = useState<Space[]>([]);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState<Filter>("All");

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [joiningSpaceId, setJoiningSpaceId] = useState<string | null>(null);
//   const [joinedSpaceIds, setJoinedSpaceIds] = useState<Set<string>>(
//     () => new Set(),
//   );

//   async function loadSpaces() {
//     try {
//       setLoading(true);
//       setError(null);

//       const result = await getDiscoverableSpaces();
//       setSpaces(result);
//     } catch (error) {
//       console.error("Failed to load discoverable spaces:", error);

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to load discoverable spaces",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     void loadSpaces();
//   }, []);

//   const filteredSpaces = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     const result = spaces.filter((space) => {
//       const matchesSearch =
//         !query ||
//         space.name.toLowerCase().includes(query) ||
//         space.description?.toLowerCase().includes(query);

//       if (!matchesSearch) {
//         return false;
//       }

//       if (filter === "New") {
//         const createdAt = new Date(space.createdAt).getTime();
//         const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

//         return createdAt >= sevenDaysAgo;
//       }

//       if (filter === "Popular") {
//         return (space._count?.members ?? 0) >= 10;
//       }

//       return true;
//     });

//     if (filter === "Popular") {
//       return [...result].sort(
//         (a, b) => (b._count?.members ?? 0) - (a._count?.members ?? 0),
//       );
//     }

//     if (filter === "New") {
//       return [...result].sort(
//         (a, b) =>
//           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//       );
//     }

//     return result;
//   }, [spaces, search, filter]);

//   async function handleJoinSpace(spaceId: string) {
//     if (joiningSpaceId) {
//       return;
//     }

//     try {
//       setJoiningSpaceId(spaceId);
//       setError(null);

//       await joinSpace(spaceId);

//       setJoinedSpaceIds((current) => {
//         const next = new Set(current);
//         next.add(spaceId);
//         return next;
//       });

//       setSpaces((current) => current.filter((space) => space.id !== spaceId));
//     } catch (error) {
//       console.error("Failed to join space:", error);

//       setError(error instanceof Error ? error.message : "Failed to join space");
//     } finally {
//       setJoiningSpaceId(null);
//     }
//   }

//   function handleCreateSpace() {
//     window.dispatchEvent(new Event("linkup:create-space"));
//   }

//   return (
//     <main className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-950">
//       {/* Background atmosphere */}
// <div className="pointer-events-none fixed inset-0 overflow-hidden">
//   <div className="absolute -left-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-violet-300/20 blur-[150px]" />

//   <div className="absolute -right-56 top-[28%] h-[38rem] w-[38rem] rounded-full bg-cyan-300/15 blur-[160px]" />

//   <div className="absolute bottom-[-16rem] left-[40%] h-[32rem] w-[32rem] rounded-full bg-fuchsia-300/15 blur-[160px]" />

//   <div
//     className="absolute inset-0 opacity-[0.02]"
//     style={{
//       backgroundImage: `
//         linear-gradient(rgba(15,23,42,.8) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(15,23,42,.8) 1px, transparent 1px)
//       `,
//       backgroundSize: "48px 48px",
//     }}
//   />
// </div>

// <div className="relative z-10 mx-auto min-h-screen max-w-[1380px] px-5 sm:px-8 lg:px-12">
{
  /* Hero */
}
{
  /* <section className="pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20">
  <div className="max-w-3xl">
    <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-600">
      <span className="h-px w-7 bg-violet-400" />
      Discover
    </div>

    <h1 className="text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
      Find your people.
      <br />
      <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
        Find your space.
      </span>
    </h1>

    <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
      Browse communities, find something that feels like you, and jump into the
      conversation.
    </p>
  </div>
</section>; */
}

// {/* Search */}
// <section className="mb-10">
//   <div className="group flex min-h-14 items-center gap-3 border border-slate-200 bg-white px-4 shadow-[0_12px_40px_rgba(30,20,60,0.04)] transition focus-within:border-violet-300 focus-within:shadow-[0_18px_50px_rgba(100,70,180,0.08)] sm:px-5">
//     <Search className="h-5 w-5 shrink-0 text-slate-400 transition group-focus-within:text-violet-500" />

//     <input
//       value={search}
//       onChange={(event) => setSearch(event.target.value)}
//       placeholder="Search spaces, topics, interests..."
//       className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
//     />

//     {search && (
//       <button
//         type="button"
//         onClick={() => setSearch("")}
//         className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-800"
//         aria-label="Clear search"
//       >
//         <X className="h-4 w-4" />
//       </button>
//     )}
//   </div>

//   {/* Filters */}
//   <div className="mt-4 flex items-center justify-between gap-4">
//     <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
//       {filters.map((item) => {
//         const active = filter === item;

//         return (
//           <button
//             key={item}
//             type="button"
//             onClick={() => setFilter(item)}
//             className={`shrink-0 px-4 py-2 text-xs font-semibold transition ${
//               active
//                 ? "bg-slate-950 text-white shadow-sm"
//                 : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
//             }`}
//           >
//             {item}
//           </button>
//         );
//       })}
//     </div>

//     {!loading && (
//       <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
//         {filteredSpaces.length}{" "}
//         {filteredSpaces.length === 1 ? "space" : "spaces"}
//       </span>
//     )}
//   </div>
// </section>

//         {/* Error */}
//         {error && (
//           <div className="mb-8 flex flex-col gap-3 border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-sm font-semibold text-red-800">
//                 Something went wrong
//               </p>

//               <p className="mt-1 text-xs text-red-600">{error}</p>
//             </div>

//             <button
//               type="button"
//               onClick={() => void loadSpaces()}
//               disabled={loading}
//               className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-red-700 transition hover:text-red-900 disabled:opacity-50"
//             >
//               <RefreshCw className="h-3.5 w-3.5" />
//               Retry
//             </button>
//           </div>
//         )}

//         {/* Spaces */}
//         <section className="pb-16">
//           <div className="mb-5 flex items-end justify-between">
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
//                 Communities
//               </p>

//               <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
//                 Places to jump into
//               </h2>
//             </div>

//             {!loading && (
//               <span className="text-xs text-slate-400 sm:hidden">
//                 {filteredSpaces.length}{" "}
//                 {filteredSpaces.length === 1 ? "space" : "spaces"}
//               </span>
//             )}
//           </div>

//           {loading ? (
//             <DiscoverSkeleton />
//           ) : filteredSpaces.length === 0 ? (
//             <EmptyState
//               search={search}
//               filter={filter}
//               onClear={() => {
//                 setSearch("");
//                 setFilter("All");
//               }}
//               onCreate={handleCreateSpace}
//             />
//           ) : (
//             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {filteredSpaces.map((space) => (
//                 <DiscoverSpaceCard
//                   key={space.id}
//                   space={space}
//                   joining={joiningSpaceId === space.id}
//                   joined={joinedSpaceIds.has(space.id)}
//                   onJoin={() => void handleJoinSpace(space.id)}
//                   onOpen={() => navigate(`/space/${space.id}`)}
//                 />
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Create CTA */}
//         <section className="border-y border-slate-200/80 py-10 sm:py-12">
//           <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-violet-600">
//                 <Plus className="h-3.5 w-3.5" />
//                 Your turn
//               </div>

//               <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
//                 Don&apos;t see your crowd?
//               </h2>

//               <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
//                 Start your own space. Give your people somewhere to hang out.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleCreateSpace}
//               className="inline-flex shrink-0 items-center justify-center gap-2 bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
//             >
//               Create a space
//               <ArrowRight className="h-4 w-4" />
//             </button>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="flex flex-col gap-2 py-7 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
//           <span>LinkUp © 2026</span>
//           <span>Connect · Converse · Belong</span>
//         </footer>
//       </div>
//     </main>
//   );
// }

// function DiscoverSpaceCard({
//   space,
//   joining,
//   joined,
//   onJoin,
//   onOpen,
// }: {
//   space: Space;
//   joining: boolean;
//   joined: boolean;
//   onJoin: () => void;
//   onOpen: () => void;
// }) {
//   const memberCount = space._count?.members ?? 0;
//   const conversationCount = space._count?.conversations ?? 0;

//   const initial = space.name.charAt(0).toUpperCase() || "#";

//   const isNew =
//     Date.now() - new Date(space.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;

//   return (
//     <article className="group relative flex min-h-[218px] flex-col overflow-hidden border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(30,20,60,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_16px_40px_rgba(100,70,180,0.08)]">
//       {/* Small top accent */}
//       <div className="h-1 w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 opacity-70 transition-opacity group-hover:opacity-100" />

//       <div className="flex flex-1 flex-col p-5">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-3">
//           <button
//             type="button"
//             onClick={onOpen}
//             className="flex min-w-0 items-center gap-3 text-left"
//           >
//             {space.imageUrl ? (
//               <img
//                 src={space.imageUrl}
//                 alt=""
//                 className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
//               />
//             ) : (
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-sm font-bold text-violet-600">
//                 {initial}
//               </div>
//             )}

//             <div className="min-w-0">
//               <div className="flex items-center gap-2">
//                 <h3 className="truncate text-base font-semibold tracking-tight text-slate-900">
//                   {space.name}
//                 </h3>

//                 {isNew && (
//                   <span className="shrink-0 bg-violet-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-violet-600">
//                     New
//                   </span>
//                 )}
//               </div>

//               <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
//                 Community
//               </p>
//             </div>
//           </button>

//           <Compass className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-violet-400" />
//         </div>

//         {/* Description */}
//         <button type="button" onClick={onOpen} className="mt-4 text-left">
//           <p className="line-clamp-2 text-sm leading-5 text-slate-500">
//             {space.description || "A new place to connect and converse."}
//           </p>
//         </button>

//         {/* Metadata */}
//         <div className="mt-auto flex items-center gap-4 pt-5 text-[11px] text-slate-400">
//           <span className="inline-flex items-center gap-1.5">
//             <Users className="h-3.5 w-3.5" />
//             {memberCount}
//           </span>

//           <span>
//             {conversationCount}{" "}
//             {conversationCount === 1 ? "conversation" : "conversations"}
//           </span>
//         </div>

//         {/* Actions */}
//         <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
//           <button
//             type="button"
//             onClick={onOpen}
//             className="text-xs font-semibold text-slate-400 transition hover:text-slate-900"
//           >
//             View space
//           </button>

//           <button
//             type="button"
//             onClick={onJoin}
//             disabled={joining || joined}
//             className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition ${
//               joined
//                 ? "bg-emerald-50 text-emerald-700"
//                 : "bg-slate-950 text-white hover:bg-violet-600"
//             } disabled:cursor-default`}
//           >
//             {joining ? (
//               <>
//                 <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                 Joining
//               </>
//             ) : joined ? (
//               <>
//                 <Check className="h-3.5 w-3.5" />
//                 Joined
//               </>
//             ) : (
//               <>
//                 Join
//                 <ArrowRight className="h-3.5 w-3.5" />
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </article>
//   );
// }

// function DiscoverSkeleton() {
//   return (
//     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {[1, 2, 3, 4, 5, 6].map((item) => (
//         <div
//           key={item}
//           className="min-h-[218px] animate-pulse border border-slate-200 bg-white p-5"
//         >
//           <div className="flex items-center gap-3">
//             <div className="h-11 w-11 rounded-xl bg-slate-100" />

//             <div className="flex-1">
//               <div className="h-4 w-32 bg-slate-100" />
//               <div className="mt-2 h-2.5 w-16 bg-slate-100" />
//             </div>
//           </div>

//           <div className="mt-5 h-3.5 w-full bg-slate-100" />
//           <div className="mt-2 h-3.5 w-3/4 bg-slate-100" />

//           <div className="mt-8 flex justify-between">
//             <div className="h-3 w-20 bg-slate-100" />
//             <div className="h-8 w-20 bg-slate-100" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function EmptyState({
//   search,
//   filter,
//   onClear,
//   onCreate,
// }: {
//   search: string;
//   filter: Filter;
//   onClear: () => void;
//   onCreate: () => void;
// }) {
//   const hasFilters = Boolean(search) || filter !== "All";

//   return (
//     <div className="border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
//       <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
//         <Compass className="h-5 w-5" />
//       </div>

//       <h3 className="mt-5 text-lg font-semibold tracking-tight">
//         {hasFilters ? "Nothing matched that." : "Nothing to discover yet."}
//       </h3>

//       <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
//         {hasFilters
//           ? "Try another search or clear your filters."
//           : "Be the person who starts the next great LinkUp community."}
//       </p>

//       <div className="mt-6 flex flex-wrap justify-center gap-3">
//         {hasFilters && (
//           <button
//             type="button"
//             onClick={onClear}
//             className="border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
//           >
//             Clear filters
//           </button>
//         )}

//         <button
//           type="button"
//           onClick={onCreate}
//           className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-600"
//         >
//           <Plus className="h-3.5 w-3.5" />
//           Create a space
//         </button>
//       </div>
//     </div>
//   );
// }
