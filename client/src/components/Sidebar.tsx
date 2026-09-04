import {
  Bell,
  Compass,
  Home,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type Conversation = {
  id: string;
  title: string | null;
  space?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    participants: number;
    messages: number;
  };
};

type SidebarProps = {
  unreadCount?: number;
  conversations?: Conversation[];
};

const navigation = [
  {
    label: "Home",
    path: "/home",
    icon: Home,
  },
  {
    label: "Discover",
    path: "/discover",
    icon: Compass,
  },
  {
    label: "Activity",
    path: "/activity",
    icon: Bell,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  unreadCount = 0,
  conversations = [],
}: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home" || location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* =========================================================
          DESKTOP
      ========================================================== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">
        <div className="flex h-full flex-col px-4 py-5">
          {/* Main sidebar surface */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-slate-200/70 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.055)] backdrop-blur-xl">
            
            {/* Decorative background lines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage: `
                  linear-gradient(
                    135deg,
                    transparent 0%,
                    transparent 49%,
                    rgba(124,58,237,0.035) 50%,
                    transparent 51%
                  )
                `,
                backgroundSize: "34px 34px",
              }}
            />

            <div className="relative flex min-h-0 flex-1 flex-col px-3.5 py-4">
              {/* -------------------------------------------------
                  BRAND
              -------------------------------------------------- */}
              <div className="mb-6 px-2">
                <Link
                  to="/home"
                  className="group flex items-center gap-3"
                >
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-[15px] bg-slate-950 text-[19px] font-black text-white shadow-[0_8px_20px_rgba(15,23,42,0.16)] transition duration-200 group-hover:-translate-y-0.5">
                    L

                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  <div>
                    <div className="text-[17px] font-black tracking-[-0.03em] text-slate-950">
                      LinkUp
                    </div>

                    <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Campus, but social
                    </div>
                  </div>
                </Link>
              </div>

              {/* -------------------------------------------------
                  DISCOVER CTA
              -------------------------------------------------- */}
              <Link
                to="/discover"
                className="group mb-6 flex items-center gap-3 rounded-2xl bg-violet-600 px-3 py-3 text-white shadow-[0_8px_20px_rgba(124,58,237,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_10px_24px_rgba(124,58,237,0.24)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles size={17} strokeWidth={2.2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold">
                    Find your people
                  </div>

                  <div className="mt-0.5 text-[10px] font-medium text-violet-200">
                    Explore campus spaces
                  </div>
                </div>

                <Compass
                  size={16}
                  className="text-violet-200 transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              {/* -------------------------------------------------
                  NAVIGATION
              -------------------------------------------------- */}
              <nav>
                <div className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Menu
                </div>

                <div className="space-y-0.5">
                  {navigation.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition-all duration-150 ${
                          active
                            ? "bg-violet-50 text-violet-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-600" />
                        )}

                        <Icon
                          size={18}
                          strokeWidth={active ? 2.4 : 1.9}
                          className={
                            active
                              ? "text-violet-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }
                        />

                        <span className="flex-1 text-[13px] font-bold">
                          {item.label}
                        </span>

                        {item.label === "Activity" &&
                          unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[9px] font-black text-white">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* -------------------------------------------------
                  CHATS
              -------------------------------------------------- */}
              <div className="mt-7 min-h-0 flex-1">
                <div className="mb-2 flex items-center justify-between px-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    Conversations
                  </div>

                  <Link
                    to="/discover"
                    title="Discover conversations"
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                  >
                    <Plus size={15} />
                  </Link>
                </div>

                <div className="chat-scrollbar max-h-[calc(100vh-430px)] space-y-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="mx-1 rounded-2xl bg-slate-50 px-3 py-5 text-center">
                      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                        <MessageCircle
                          size={17}
                          className="text-slate-300"
                        />
                      </div>

                      <p className="text-[10px] font-medium leading-4 text-slate-400">
                        Join a space and your chats will show up here.
                      </p>
                    </div>
                  ) : (
                    conversations.map((conversation) => {
                      const active =
                        location.pathname ===
                        `/chat/${conversation.id}`;

                      const title =
                        conversation.title?.trim() ||
                        conversation.space?.name ||
                        "Conversation";

                      return (
                        <Link
                          key={conversation.id}
                          to={`/chat/${conversation.id}`}
                          className={`group flex items-center gap-3 rounded-[14px] px-2.5 py-2 transition-all ${
                            active
                              ? "bg-slate-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* Space avatar */}
                          <div
                            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-xs font-black transition ${
                              active
                                ? "bg-violet-100 text-violet-700"
                                : "bg-slate-100 text-slate-500 group-hover:bg-violet-50 group-hover:text-violet-600"
                            }`}
                          >
                            #

                            {active && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-[11px] font-bold ${
                                active
                                  ? "text-slate-900"
                                  : "text-slate-600"
                              }`}
                            >
                              {title}
                            </div>

                            {conversation.space?.name && (
                              <div className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
                                {conversation.space.name}
                              </div>
                            )}
                          </div>

                          {conversation._count?.messages ? (
                            <span
                              className={`shrink-0 text-[9px] font-bold ${
                                active
                                  ? "text-violet-500"
                                  : "text-slate-300"
                              }`}
                            >
                              {conversation._count.messages > 999
                                ? "999+"
                                : conversation._count.messages}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* -------------------------------------------------
                  PROFILE
              -------------------------------------------------- */}
              <Link
                to="/profile"
                className={`group mt-4 flex items-center gap-3 rounded-2xl p-2.5 transition ${
                  location.pathname.startsWith("/profile")
                    ? "bg-violet-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-black text-white shadow-sm">
                  Y

                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-bold text-slate-800">
                    Your profile
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[9px] font-semibold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </div>
                </div>

                <UserRound
                  size={15}
                  className="text-slate-300 transition group-hover:text-slate-500"
                />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navigation.slice(0, 3).map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
                  active
                    ? "bg-violet-50 text-violet-600"
                    : "text-slate-400"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 1.9}
                />

                <span className="text-[9px] font-bold">
                  {item.label}
                </span>

                {item.label === "Activity" &&
                  unreadCount > 0 && (
                    <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[8px] font-black text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
              </Link>
            );
          })}

          <Link
            to="/profile"
            className={`relative flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
              location.pathname.startsWith("/profile")
                ? "bg-violet-50 text-violet-600"
                : "text-slate-400"
            }`}
          >
            <div className="relative">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[9px] font-black text-white">
                Y
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-white bg-emerald-400" />
            </div>

            <span className="text-[9px] font-bold">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}