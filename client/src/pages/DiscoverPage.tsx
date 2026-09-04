import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const rooms = [
  {
    name: "late-night",
    description: "For conversations that somehow become 3 AM conversations.",
    category: "Chill",
    members: 184,
    online: 31,
    accent: "violet",
    tags: ["casual", "late night", "friends"],
  },
  {
    name: "developers",
    description: "Build things. Break things. Talk about why they broke.",
    category: "Tech",
    members: 326,
    online: 74,
    accent: "cyan",
    tags: ["coding", "web", "tech"],
  },
  {
    name: "music-room",
    description: "Drop a song. Discover something new.",
    category: "Music",
    members: 241,
    online: 46,
    accent: "fuchsia",
    tags: ["music", "albums", "artists"],
  },
  {
    name: "gaming",
    description: "Looking for teammates, rivals or someone to blame.",
    category: "Gaming",
    members: 418,
    online: 96,
    accent: "emerald",
    tags: ["gaming", "fps", "multiplayer"],
  },
  {
    name: "movies",
    description: "Good movies, terrible takes and everything between.",
    category: "Entertainment",
    members: 167,
    online: 22,
    accent: "orange",
    tags: ["movies", "series", "reviews"],
  },
  {
    name: "creative-corner",
    description: "Designers, writers, artists and people making cool stuff.",
    category: "Creative",
    members: 129,
    online: 18,
    accent: "pink",
    tags: ["design", "art", "writing"],
  },
];

const people = [
  {
    name: "Aria",
    username: "@aria",
    status: "Exploring late-night",
    avatar: "A",
    gradient: "from-orange-400 to-pink-500",
  },
  {
    name: "Rahul",
    username: "@rahul",
    status: "In developers",
    avatar: "R",
    gradient: "from-violet-500 to-cyan-400",
  },
  {
    name: "Maya",
    username: "@maya",
    status: "Listening to music",
    avatar: "M",
    gradient: "from-emerald-400 to-cyan-500",
  },
];

const categories = [
  "All",
  "Chill",
  "Tech",
  "Music",
  "Gaming",
  "Entertainment",
  "Creative",
];

export default function DiscoverPage() {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const isLight = theme === "light";

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesCategory = category === "All" || room.category === category;

      const matchesSearch =
        !query ||
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full blur-[140px] ${
            isLight ? "bg-violet-300/20" : "bg-violet-600/[0.09]"
          }`}
        />

        <div
          className={`absolute -right-48 top-[25%] h-[36rem] w-[36rem] rounded-full blur-[150px] ${
            isLight ? "bg-cyan-300/15" : "bg-cyan-500/[0.06]"
          }`}
        />

        <div
          className={`absolute bottom-[-14rem] left-[35%] h-[30rem] w-[30rem] rounded-full blur-[150px] ${
            isLight ? "bg-fuchsia-300/15" : "bg-fuchsia-500/[0.05]"
          }`}
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
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
            backgroundSize: "48px 48px",
          }}
        />

        <div
          className={`absolute inset-0 ${
            isLight ? "opacity-[0.025]" : "opacity-[0.035]"
          }`}
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
        <header
          className={`flex h-20 items-center justify-end border-b ${
            isLight ? "border-slate-200/70" : "border-white/[0.06]"
          }`}
        >
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className={`hidden text-sm font-medium sm:block ${
                isLight
                  ? "text-slate-500 hover:text-slate-950"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                isLight
                  ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
              }`}
              aria-label="Toggle theme"
            >
              {isLight ? "☀" : "☾"}
            </button>

            <Link
              to="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-violet-500/20"
            >
              Y
            </Link>
          </div>
        </header>
        <section className="relative py-14 sm:py-20">
          <div className="relative max-w-4xl">
            <div
              className={`mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                isLight ? "text-violet-600" : "text-violet-300/70"
              }`}
            >
              <span className="h-px w-8 bg-violet-400" />
              Explore LinkUp
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
              Find somewhere
              <br />
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                you belong.
              </span>
            </h1>

            <p
              className={`mt-7 max-w-2xl text-base leading-7 ${
                isLight ? "text-slate-500" : "text-white/40"
              }`}
            >
              Discover rooms, conversations and people that match your
              interests. No algorithmic rabbit hole required.
            </p>
          </div>

          <div
            className={`pointer-events-none absolute right-0 top-16 hidden text-right lg:block ${
              isLight ? "text-slate-950" : "text-white"
            }`}
          >
            <p className="text-6xl font-semibold tracking-[-0.07em]">1.4k</p>

            <p
              className={`mt-1 text-[10px] uppercase tracking-[0.25em] ${
                isLight ? "text-slate-400" : "text-white/20"
              }`}
            >
              people online
            </p>
          </div>
        </section>
        <section className="mb-10">
          <div
            className={`flex h-14 items-center gap-3 rounded-2xl border px-5 transition ${
              isLight
                ? "border-slate-200 bg-white/70 focus-within:border-violet-300 focus-within:shadow-lg focus-within:shadow-violet-500/5"
                : "border-white/[0.08] bg-white/[0.025] focus-within:border-violet-500/30"
            }`}
          >
            <svg
              className={`h-5 w-5 shrink-0 ${
                isLight ? "text-slate-400" : "text-white/25"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms, topics or interests..."
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
                className={`text-xs ${
                  isLight
                    ? "text-slate-400 hover:text-slate-800"
                    : "text-white/30 hover:text-white"
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <div className="mb-12 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((item) => {
            const active = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-medium transition duration-300 ${
                  active
                    ? isLight
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-white bg-white text-slate-950"
                    : isLight
                      ? "border-slate-200 bg-white/50 text-slate-500 hover:border-slate-300 hover:text-slate-900"
                      : "border-white/[0.07] bg-white/[0.025] text-white/35 hover:border-white/[0.15] hover:text-white/70"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="grid gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    isLight ? "text-slate-400" : "text-white/25"
                  }`}
                >
                  Discover
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Rooms worth opening
                </h2>
              </div>

              <span
                className={`text-xs ${
                  isLight ? "text-slate-400" : "text-white/25"
                }`}
              >
                {filteredRooms.length} spaces
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredRooms.map((room, index) => (
                <DiscoverRoom
                  key={room.name}
                  room={room}
                  isLight={isLight}
                  index={index}
                />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div
                className={`rounded-[28px] border border-dashed p-14 text-center ${
                  isLight
                    ? "border-slate-200 text-slate-400"
                    : "border-white/[0.08] text-white/25"
                }`}
              >
                <p className="text-lg font-medium">Nothing found.</p>

                <p className="mt-2 text-sm">Try another topic or category.</p>
              </div>
            )}
          </section>

          {/* =====================================================
              PEOPLE
          ====================================================== */}

          <aside>
            <div className="lg:sticky lg:top-8">
              <div className="mb-6">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    isLight ? "text-slate-400" : "text-white/25"
                  }`}
                >
                  Right now
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  People are here
                </h2>
              </div>

              <div className="space-y-1">
                {people.map((person) => (
                  <button
                    key={person.username}
                    type="button"
                    className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      isLight ? "hover:bg-white" : "hover:bg-white/[0.035]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${person.gradient} text-xs font-bold text-white`}
                    >
                      {person.avatar}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{person.name}</p>

                      <p
                        className={`mt-0.5 truncate text-[11px] ${
                          isLight ? "text-slate-400" : "text-white/25"
                        }`}
                      >
                        {person.status}
                      </p>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </button>
                ))}
              </div>

              {/* Invite */}

              <div
                className={`mt-10 border-l-2 pl-5 ${
                  isLight ? "border-violet-400" : "border-violet-500"
                }`}
              >
                <p className="text-sm font-semibold">
                  Know someone who belongs here?
                </p>

                <p
                  className={`mt-2 text-xs leading-5 ${
                    isLight ? "text-slate-400" : "text-white/25"
                  }`}
                >
                  Invite them and give them somewhere to start.
                </p>

                <button
                  type="button"
                  className={`mt-4 text-xs font-semibold ${
                    isLight
                      ? "text-violet-600 hover:text-violet-700"
                      : "text-violet-300 hover:text-violet-200"
                  }`}
                >
                  Invite someone →
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* =======================================================
            FOOTER
        ======================================================== */}

        <footer
          className={`flex flex-col gap-2 border-t py-7 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between ${
            isLight
              ? "border-slate-200/70 text-slate-400"
              : "border-white/[0.06] text-white/20"
          }`}
        >
          <span>LinkUp © 2026</span>
          <span>Connect · Converse · Belong</span>
        </footer>
      </div>
    </main>
  );
}

/* ===============================================================
   DISCOVER ROOM
================================================================ */

function DiscoverRoom({
  room,
  isLight,
  index,
}: {
  room: {
    name: string;
    description: string;
    category: string;
    members: number;
    online: number;
    accent: string;
    tags: string[];
  };
  isLight: boolean;
  index: number;
}) {
  const accent =
    room.accent === "violet"
      ? "from-violet-500/20 via-fuchsia-500/5"
      : room.accent === "cyan"
        ? "from-cyan-500/20 via-blue-500/5"
        : room.accent === "fuchsia"
          ? "from-fuchsia-500/20 via-violet-500/5"
          : room.accent === "emerald"
            ? "from-emerald-500/20 via-cyan-500/5"
            : room.accent === "orange"
              ? "from-orange-500/20 via-pink-500/5"
              : "from-pink-500/20 via-fuchsia-500/5";

  const dot =
    room.accent === "violet"
      ? "bg-violet-400"
      : room.accent === "cyan"
        ? "bg-cyan-400"
        : room.accent === "fuchsia"
          ? "bg-fuchsia-400"
          : room.accent === "emerald"
            ? "bg-emerald-400"
            : room.accent === "orange"
              ? "bg-orange-400"
              : "bg-pink-400";

  return (
    <button
      type="button"
      className={`group relative min-h-[270px] overflow-hidden rounded-[28px] border text-left transition duration-500 hover:-translate-y-1.5 ${
        isLight
          ? "border-slate-200/80 bg-white/65 shadow-[0_15px_50px_rgba(30,20,60,0.03)] hover:border-violet-200 hover:shadow-[0_25px_70px_rgba(100,70,180,0.10)]"
          : "border-white/[0.07] bg-white/[0.025] hover:border-white/[0.13] hover:bg-white/[0.04]"
      }`}
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Gradient */}

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} to-transparent`}
      />

      {/* Hover glow */}

      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full ${dot} opacity-0 blur-[70px] transition duration-500 group-hover:opacity-20`}
      />

      <div className="relative flex h-full flex-col p-6">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
              isLight
                ? "bg-slate-100 text-slate-500"
                : "bg-white/[0.06] text-white/40"
            }`}
          >
            #
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dot} animate-pulse`} />

            <span
              className={`text-[10px] ${
                isLight ? "text-slate-400" : "text-white/25"
              }`}
            >
              {room.online} online
            </span>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight">
              {room.name}
            </h3>

            <span
              className={`text-[9px] uppercase tracking-[0.15em] ${
                isLight ? "text-slate-400" : "text-white/20"
              }`}
            >
              {room.category}
            </span>
          </div>

          <p
            className={`mt-2 text-sm leading-6 ${
              isLight ? "text-slate-500" : "text-white/35"
            }`}
          >
            {room.description}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          <div className="flex flex-wrap gap-1.5">
            {room.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-1 text-[9px] ${
                  isLight
                    ? "bg-slate-100 text-slate-400"
                    : "bg-white/[0.04] text-white/25"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <span
            className={`shrink-0 text-xs ${
              isLight ? "text-slate-400" : "text-white/20"
            }`}
          >
            {room.members} members
          </span>
        </div>

        {/* Arrow */}

        <span
          className={`absolute bottom-5 right-5 translate-y-2 text-xl opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
            isLight ? "text-violet-500" : "text-violet-300"
          }`}
        >
          ↗
        </span>
      </div>
    </button>
  );
}
