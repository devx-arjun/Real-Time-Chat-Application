import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

type ActivityType = "all" | "mentions" | "rooms" | "messages";

type ActivityItem = {
  id: number;
  type: Exclude<ActivityType, "all">;
  name: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  unread: boolean;
  accent: string;
};

const activities: ActivityItem[] = [
  {
    id: 1,
    type: "mentions",
    name: "Aria",
    avatar: "A",
    action: "mentioned you in",
    target: "#late-night",
    time: "2 min ago",
    unread: true,
    accent: "from-orange-400 to-pink-500",
  },
  {
    id: 2,
    type: "rooms",
    name: "Yash",
    avatar: "Y",
    action: "joined your room",
    target: "#random",
    time: "8 min ago",
    unread: true,
    accent: "from-violet-500 to-cyan-400",
  },
  {
    id: 3,
    type: "messages",
    name: "Maya",
    avatar: "M",
    action: "replied to your message in",
    target: "#music",
    time: "18 min ago",
    unread: true,
    accent: "from-emerald-400 to-cyan-500",
  },
  {
    id: 4,
    type: "rooms",
    name: "Kabir",
    avatar: "K",
    action: "invited you to",
    target: "#weekend-plans",
    time: "42 min ago",
    unread: false,
    accent: "from-fuchsia-500 to-violet-500",
  },
  {
    id: 5,
    type: "messages",
    name: "Riya",
    avatar: "R",
    action: "replied to your message in",
    target: "#developers",
    time: "1 hr ago",
    unread: false,
    accent: "from-cyan-400 to-blue-500",
  },
  {
    id: 6,
    type: "mentions",
    name: "Dev",
    avatar: "D",
    action: "mentioned you in",
    target: "#developers",
    time: "2 hrs ago",
    unread: false,
    accent: "from-indigo-500 to-purple-500",
  },
  {
    id: 7,
    type: "rooms",
    name: "Sam",
    avatar: "S",
    action: "joined",
    target: "#late-night",
    time: "3 hrs ago",
    unread: false,
    accent: "from-pink-400 to-orange-400",
  },
];

const filters: { label: string; value: ActivityType }[] = [
  { label: "Everything", value: "all" },
  { label: "Mentions", value: "mentions" },
  { label: "Rooms", value: "rooms" },
  { label: "Messages", value: "messages" },
];

export default function ActivityPage() {
  const { theme, setTheme } = useTheme();
  const [filter, setFilter] = useState<ActivityType>("all");
  const [items, setItems] = useState(activities);

  const isLight = theme === "light";

  const filteredActivities = useMemo(() => {
    if (filter === "all") return items;

    return items.filter((item) => item.type === filter);
  }, [filter, items]);

  const unreadCount = items.filter((item) => item.unread).length;

  function markAllAsRead() {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  }

  function markAsRead(id: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
      }`}
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full blur-[150px] ${
            isLight ? "bg-violet-300/20" : "bg-violet-600/[0.09]"
          }`}
        />

        <div
          className={`absolute -bottom-40 -right-40 h-[35rem] w-[35rem] rounded-full blur-[150px] ${
            isLight ? "bg-cyan-300/20" : "bg-cyan-500/[0.07]"
          }`}
        />

        <div
          className={`absolute left-[45%] top-[35%] h-72 w-72 rounded-full blur-[130px] ${
            isLight ? "bg-fuchsia-300/10" : "bg-fuchsia-500/[0.05]"
          }`}
        />

        {/* Grid texture */}

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

        {/* Noise */}

        <div
          className={`absolute inset-0 ${
            isLight ? "opacity-[0.025]" : "opacity-[0.035]"
          }`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, currentColor 0.6px, transparent 0.7px),
              radial-gradient(circle at 80% 70%, currentColor 0.6px, transparent 0.7px)
            `,
            backgroundSize: "17px 17px, 23px 23px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px]">
        <div className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12">

          <header
            className={`flex items-center justify-between border-b pb-6 ${
              isLight ? "border-slate-200/70" : "border-white/[0.06]"
            }`}
          >
            <div>
              <p
                className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
                  isLight ? "text-violet-600" : "text-violet-300/70"
                }`}
              >
                What's happening
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Activity
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme(isLight ? "dark" : "light")}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                }`}
              >
                {isLight ? "☀" : "☾"}
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
                Y
              </div>
            </div>
          </header>
          <section className="relative py-12 sm:py-16">
            <div className="max-w-3xl">
              <div
                className={`mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] ${
                  isLight ? "text-slate-400" : "text-white/25"
                }`}
              >
                <span className="h-px w-8 bg-violet-400" />
                Stay in the loop
              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Things you{" "}
                <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                  shouldn't miss.
                </span>
              </h2>

              <p
                className={`mt-5 max-w-xl text-sm leading-7 sm:text-base ${
                  isLight ? "text-slate-500" : "text-white/35"
                }`}
              >
                Mentions, replies, room activity and invitations — everything
                happening around your conversations, all in one place.
              </p>
            </div>
            {unreadCount > 0 && (
              <div
                className={`absolute right-0 top-12 hidden rounded-full border px-4 py-2 text-xs sm:block ${
                  isLight
                    ? "border-violet-200 bg-violet-50 text-violet-600"
                    : "border-violet-500/20 bg-violet-500/[0.08] text-violet-300"
                }`}
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-violet-500" />
                {unreadCount} unread
              </div>
            )}
          </section>

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div
              className={`flex flex-wrap gap-1 rounded-full p-1 ${
                isLight ? "bg-slate-100" : "bg-white/[0.035]"
              }`}
            >
              {filters.map((item) => {
                const active = filter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      active
                        ? isLight
                          ? "bg-white text-slate-950 shadow-sm"
                          : "bg-white/[0.09] text-white"
                        : isLight
                          ? "text-slate-400 hover:text-slate-700"
                          : "text-white/30 hover:text-white/70"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className={`text-xs font-medium transition ${
                isLight
                  ? "text-slate-400 hover:text-violet-600"
                  : "text-white/30 hover:text-violet-300"
              }`}
            >
              Mark all as read
            </button>
          </div>

          <section className="max-w-4xl">
            {filteredActivities.length > 0 ? (
              <div className="space-y-1">
                {filteredActivities.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className={`group relative flex w-full items-center gap-4 rounded-2xl px-4 py-5 text-left transition duration-300 sm:px-5 ${
                      item.unread
                        ? isLight
                          ? "bg-white shadow-sm"
                          : "bg-white/[0.035]"
                        : isLight
                          ? "hover:bg-white/60"
                          : "hover:bg-white/[0.025]"
                    }`}
                    style={{
                      animation: "activityIn .45s ease both",
                      animationDelay: `${index * 60}ms`,
                    }}
                  >

                    {item.unread && (
                      <span
                        className={`absolute left-0 h-8 w-0.5 rounded-full ${
                          isLight ? "bg-violet-500" : "bg-violet-400"
                        }`}
                      />
                    )}

                    <div
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.accent} text-xs font-bold text-white shadow-lg`}
                    >
                      {item.avatar}

                      {item.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#f7f8fc] bg-violet-500 dark:border-[#070711]" />
                      )}
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6">
                        <span className="font-semibold">{item.name}</span>{" "}
                        <span
                          className={
                            isLight ? "text-slate-400" : "text-white/35"
                          }
                        >
                          {item.action}
                        </span>{" "}
                        <span
                          className={
                            isLight
                              ? "font-medium text-slate-700"
                              : "font-medium text-white/60"
                          }
                        >
                          {item.target}
                        </span>
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${
                          isLight ? "text-slate-400" : "text-white/20"
                        }`}
                      >
                        {item.time}
                      </p>
                    </div>

                    {/* Arrow */}

                    <span
                      className={`shrink-0 text-lg transition duration-300 group-hover:translate-x-1 ${
                        isLight
                          ? "text-slate-200 group-hover:text-violet-400"
                          : "text-white/10 group-hover:text-violet-300"
                      }`}
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-[28px] border border-dashed py-20 text-center ${
                  isLight
                    ? "border-slate-200 text-slate-400"
                    : "border-white/[0.08] text-white/25"
                }`}
              >
                <div className="mb-4 text-4xl">✦</div>

                <p className="text-sm font-medium">Nothing here yet.</p>

                <p className="mt-2 text-xs">New activity will show up here.</p>
              </div>
            )}
          </section>

          {/* =======================================================
              BOTTOM STATUS
          ======================================================== */}

          <section className="mt-14 max-w-4xl">
            <div
              className={`relative overflow-hidden rounded-[28px] border p-6 sm:p-7 ${
                isLight
                  ? "border-slate-200 bg-white/50"
                  : "border-white/[0.07] bg-white/[0.025]"
              }`}
            >
              <div
                className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-[80px] ${
                  isLight ? "bg-violet-300/20" : "bg-violet-500/[0.08]"
                }`}
              />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                    <p className="text-sm font-semibold">
                      You're all caught up
                    </p>
                  </div>

                  <p
                    className={`mt-2 text-xs leading-5 ${
                      isLight ? "text-slate-400" : "text-white/25"
                    }`}
                  >
                    Keep exploring your rooms. There might be something
                    interesting waiting for you.
                  </p>
                </div>

                <Link
                  to="/discover"
                  className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 ${
                    isLight
                      ? "bg-slate-950 text-white hover:bg-violet-600"
                      : "bg-white text-slate-950 hover:bg-violet-100"
                  }`}
                >
                  Discover rooms →
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}

          <footer
            className={`mt-14 flex flex-col gap-2 border-t py-7 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between ${
              isLight
                ? "border-slate-200/70 text-slate-400"
                : "border-white/[0.06] text-white/20"
            }`}
          >
            <span>LinkUp © 2026</span>

            <span>Connect · Converse · Belong</span>
          </footer>
        </div>
      </div>

      {/* =========================================================
          ANIMATION
      ========================================================== */}

      <style>{`
        @keyframes activityIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
