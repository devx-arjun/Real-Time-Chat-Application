import {
  Bell,
  ChevronDown,
  Compass,
  Home,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";

type HeaderProps = {
  unreadCount?: number;
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
];

export default function Header({ unreadCount = 0 }: HeaderProps) {
  const location = useLocation();
  const { guest } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);

  const username = guest?.username || "Guest";
  const avatarLetter = username.charAt(0).toUpperCase() || "?";

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }

    return location.pathname.startsWith(path);
  };

  const profileActive = location.pathname.startsWith("/profile");

  function handleSearch() {
    setSearchOpen(true);

    window.dispatchEvent(new CustomEvent("linkup:search"));
  }

  function handleCreate() {
    window.dispatchEvent(new Event("linkup:create-space"));
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        handleSearch();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative bg-white">
      <div className="mx-auto flex h-[68px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/app" className="group flex shrink-0 items-center gap-2.5">
          <div
            className="
              relative
              grid
              h-9
              w-9
              place-items-center
              rounded-[11px]
              bg-slate-950
              text-[15px]
              font-black
              tracking-[-0.04em]
              text-white
              shadow-sm
              transition
              duration-200
              group-hover:-translate-y-0.5
            "
          >
            L
            <span
              className="
                absolute
                bottom-[-1px]
                right-[-1px]
                h-2.5
                w-2.5
                rounded-full
                border-2
                border-white
                bg-emerald-400
              "
            />
          </div>

          <span
            className="
              text-[18px]
              font-black
              tracking-[-0.045em]
              text-slate-950
            "
          >
            LinkUp
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex lg:ml-8">
          {navigation.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  px-3.5
                  py-2
                  text-[13px]
                  font-bold
                  transition
                  duration-150
                  ${
                    active
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <Icon
                  size={16}
                  strokeWidth={active ? 2.1 : 1.8}
                  className={
                    active
                      ? "text-violet-600"
                      : "text-slate-400 transition-colors group-hover:text-slate-700"
                  }
                />

                <span>{item.label}</span>

                {item.label === "Activity" && unreadCount > 0 && (
                  <span
                    className="
                        flex
                        h-4
                        min-w-4
                        items-center
                        justify-center
                        rounded-full
                        bg-violet-600
                        px-1
                        text-[8px]
                        font-black
                        text-white
                      "
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                {active && (
                  <span
                    className="
                      absolute
                      bottom-[-12px]
                      left-1/2
                      h-[2px]
                      w-5
                      -translate-x-1/2
                      rounded-full
                      bg-violet-600
                    "
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ===================================================
            RIGHT CONTROLS
        ==================================================== */}

        <div className="ml-auto flex items-center gap-1.5">
          {/* Search */}

          <button
            type="button"
            onClick={handleSearch}
            aria-label="Search LinkUp"
            className={`
              hidden
              h-9
              items-center
              gap-2
              rounded-xl
              border
              px-3.5
              text-slate-400
              transition
              sm:flex
              lg:w-[230px]
              ${
                searchOpen
                  ? "border-violet-300 bg-white ring-4 ring-violet-500/[0.06]"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:text-slate-700"
              }
            `}
          >
            <Search size={15} strokeWidth={1.8} />

            <span className="flex-1 text-left text-[11px] font-semibold">
              Search LinkUp
            </span>

            <kbd
              className="
                rounded-md
                border
                border-slate-200
                bg-white
                px-1.5
                py-0.5
                text-[8px]
                font-bold
                text-slate-400
              "
            >
              /
            </kbd>
          </button>

          {/* Notifications */}

          <Link
            to="/activity"
            aria-label="Activity"
            className={`
              relative
              grid
              h-9
              w-9
              place-items-center
              rounded-xl
              transition
              ${
                isActive("/activity")
                  ? "bg-slate-100 text-slate-950"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <Bell size={17} strokeWidth={1.8} />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  right-1.5
                  top-1.5
                  h-2
                  w-2
                  rounded-full
                  border-2
                  border-white
                  bg-violet-600
                "
              />
            )}
          </Link>

          {/* Create */}

          <button
            type="button"
            onClick={handleCreate}
            className="
              ml-1
              hidden
              items-center
              gap-2
              rounded-xl
              bg-slate-950
              py-1.5
              pl-4
              pr-1.5
              text-[12px]
              font-black
              text-white
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:bg-slate-800
              sm:flex
            "
          >
            Create
            <span
              className="
                grid
                h-7
                w-7
                place-items-center
                rounded-[9px]
                bg-white/10
              "
            >
              <Plus size={14} strokeWidth={2.4} />
            </span>
          </button>

          {/* Profile */}

          <Link
            to="/profile"
            aria-label={`Open ${username} profile`}
            className={`
              ml-1
              flex
              h-9
              items-center
              gap-1.5
              rounded-xl
              pl-1
              pr-2
              transition
              ${profileActive ? "bg-slate-100" : "hover:bg-slate-100"}
            `}
          >
            <div
              className="
    relative
    grid
    h-7
    w-7
    place-items-center
    overflow-hidden
    rounded-[9px]
    bg-gradient-to-br
    from-violet-500
    to-indigo-600
    text-[10px]
    font-black
    text-white
  "
            >
              {guest?.avatarUrl ? (
                <img
                  src={guest.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                avatarLetter
              )}

              <span
                className="
      absolute
      bottom-0
      right-0
      h-2
      w-2
      rounded-full
      border-[1.5px]
      border-white
      bg-emerald-400
    "
              />
            </div>

            <ChevronDown
              size={13}
              strokeWidth={1.8}
              className="hidden text-slate-400 lg:block"
            />
          </Link>
        </div>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}

      <div className="border-t border-slate-100 md:hidden">
        <nav className="mx-auto flex h-[50px] items-center justify-around px-2">
          {navigation.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative
                  flex
                  min-w-[60px]
                  items-center
                  justify-center
                  gap-1.5
                  py-2
                  text-[10px]
                  font-bold
                  transition
                  ${
                    active
                      ? "text-slate-950"
                      : "text-slate-400 hover:text-slate-700"
                  }
                `}
              >
                <Icon size={17} strokeWidth={active ? 2.1 : 1.7} />

                <span className="hidden min-[380px]:inline">{item.label}</span>

                {item.label === "Activity" && unreadCount > 0 && (
                  <span
                    className="
                        absolute
                        right-1
                        top-1
                        h-2
                        w-2
                        rounded-full
                        bg-violet-600
                      "
                  />
                )}

                {active && (
                  <span
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-[2px]
                      w-5
                      -translate-x-1/2
                      rounded-full
                      bg-violet-600
                    "
                  />
                )}
              </Link>
            );
          })}

          {/* Mobile Create */}

          <button
            type="button"
            onClick={handleCreate}
            aria-label="Create space"
            className="
              grid
              h-8
              w-8
              place-items-center
              rounded-xl
              bg-slate-950
              text-white
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:bg-slate-800
            "
          >
            <Plus size={16} strokeWidth={2.4} />
          </button>
        </nav>
      </div>
    </div>
  );
}
