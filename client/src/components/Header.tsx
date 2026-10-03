import {
  ArrowRight,
  ChevronDown,
  Compass,
  Home,
  MessageCircle,
  Plus,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";

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
];

export default function Header() {
  const location = useLocation();
  const { guest } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const createMenuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const username = guest?.username || "Guest";
  const avatarLetter = username.charAt(0).toUpperCase() || "L";

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }

    return location.pathname.startsWith(path);
  };

  function closeAllMenus() {
    setMenuOpen(false);
    setCreateOpen(false);
    setProfileOpen(false);
  }

  function handleCreate() {
    setCreateOpen((current) => !current);
    setMenuOpen(false);
    setProfileOpen(false);
  }

  function openCreateSpace() {
    closeAllMenus();
    window.dispatchEvent(new Event("linkup:create-space"));
  }

  function openCreatePrivateConversation() {
    closeAllMenus();
    window.dispatchEvent(new Event("linkup:create-private-conversation"));
  }

  function openJoinConversation() {
    closeAllMenus();
    window.dispatchEvent(new Event("linkup:join-conversation"));
  }

  function toggleProfile() {
    setProfileOpen((current) => !current);
    setMenuOpen(false);
    setCreateOpen(false);
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
      }

      if (event.key === "Escape") {
        setMenuOpen(false);
        setCreateOpen(false);
        setProfileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (createMenuRef.current && !createMenuRef.current.contains(target)) {
        setCreateOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <header
      className="
    sticky
    top-0
    z-[100]
    w-full
    border-b
    border-slate-200/70
    bg-white/30
  "
    >
      <div
        className="
      pointer-events-none
      absolute
      inset-x-0
      bottom-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-violet-300/70
      to-transparent
    "
      />
      <nav className="relative mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-5 md:px-10 lg:px-16 xl:px-24">
        {/* Logo */}
        <Link
          to="/home"
          onClick={closeAllMenus}
          className="flex shrink-0 items-center gap-2.5"
        >
          <div
            className="
    relative
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-[11px]
    text-[15px]
    font-black
    tracking-[-0.04em]
    shadow-sm
    shadow-violet-600/20
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

          <div className="hidden sm:block">
            <span className="block text-[17px] font-black leading-none tracking-[-0.055em] text-slate-950">
              LinkUp
            </span>

            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Connect better
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 md:flex">
          {navigation.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-1.5
                  text-sm
                  transition-all
                  duration-200
                  ${
                    active
                      ? "border border-zinc-200 bg-white font-medium text-zinc-800 shadow-sm"
                      : "border border-transparent text-zinc-500 hover:text-zinc-800"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Create */}
          <div ref={createMenuRef} className="relative">
            <button
              type="button"
              onClick={handleCreate}
              aria-haspopup="menu"
              aria-expanded={createOpen}
              className={`
                flex
                items-center
                gap-1.5
                rounded-full
                px-4
                py-1.5
                text-sm
                transition-all
                ${
                  createOpen
                    ? "bg-white font-medium text-zinc-800 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }
              `}
            >
              Connect
              <ChevronDown
                size={13}
                className={`transition-transform ${
                  createOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {createOpen && (
              <div
                role="menu"
                className="
                  absolute
                  left-1/2
                  top-[calc(100%+12px)]
                  z-50
                  w-[280px]
                  -translate-x-1/2
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-2
                  shadow-[0_20px_60px_rgba(15,23,42,0.12)]
                "
              >
                <CreateMenuItem
                  icon={<Plus size={17} />}
                  iconClass="bg-violet-50 text-violet-600"
                  title="Create a Space"
                  description="Build a community around a topic"
                  onClick={openCreateSpace}
                />

                <CreateMenuItem
                  icon={<MessageCircle size={17} />}
                  iconClass="bg-emerald-50 text-emerald-600"
                  title="Private Conversation"
                  description="Start a private chat with a code"
                  onClick={openCreatePrivateConversation}
                />

                <div className="my-1.5 border-t border-zinc-100" />

                <CreateMenuItem
                  icon={<ArrowRight size={17} />}
                  iconClass="bg-zinc-100 text-zinc-600"
                  title="Join Conversation"
                  description="Enter a private conversation code"
                  onClick={openJoinConversation}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden items-center gap-2 md:flex">

          {/* Profile */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={toggleProfile}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-zinc-200
                bg-white
                py-1
                pl-1
                pr-3
                transition
                hover:bg-zinc-50
              "
            >
              <div
                className="
                  relative
                  grid
                  h-8
                  w-8
                  shrink-0
                  place-items-center
                  overflow-hidden
                  rounded-full
                  bg-violet-600
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

                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-[1.5px] border-white bg-emerald-400" />
              </div>

              <span className="hidden max-w-[90px] truncate text-xs font-medium text-zinc-700 lg:block">
                {username}
              </span>

              <ChevronDown
                size={13}
                className={`text-zinc-400 transition ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="
                  absolute
                  right-0
                  top-[calc(100%+12px)]
                  z-50
                  w-64
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-2
                  shadow-[0_20px_60px_rgba(15,23,42,0.12)]
                "
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  <div
                    className="
                      relative
                      grid
                      h-10
                      w-10
                      shrink-0
                      place-items-center
                      overflow-hidden
                      rounded-full
                      bg-violet-600
                      text-xs
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

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {username}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-500">
                      Online
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-1">
                  <Link
                    to="/profile"
                    onClick={closeAllMenus}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      transition
                      hover:bg-zinc-50
                    "
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-zinc-500">
                      <UserRound size={15} />
                    </span>

                    <span className="flex-1">
                      <span className="block text-xs font-semibold text-zinc-900">
                        Your Profile
                      </span>

                      <span className="mt-0.5 block text-[10px] text-zinc-400">
                        View your LinkUp profile
                      </span>
                    </span>

                    <ArrowRight size={13} className="text-zinc-300" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">

          <button
            type="button"
            onClick={() => {
              setMenuOpen((current) => !current);
              setCreateOpen(false);
              setProfileOpen(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="
              flex
              flex-col
              gap-1.5
              rounded-full
              bg-transparent
              p-2
            "
          >
            <span
              className={`
                block
                h-0.5
                w-5
                bg-zinc-800
                transition-transform
                ${menuOpen ? "translate-y-2 rotate-45" : ""}
              `}
            />

            <span
              className={`
                block
                h-0.5
                w-5
                bg-zinc-800
                transition-opacity
                ${menuOpen ? "opacity-0" : ""}
              `}
            />

            <span
              className={`
                block
                h-0.5
                w-5
                bg-zinc-800
                transition-transform
                ${menuOpen ? "-translate-y-2 -rotate-45" : ""}
              `}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="
              absolute
              left-0
              top-full
              w-full
              border-t
              border-zinc-200
              bg-white/60
              backdrop-blur-3xl
              px-5
              pb-5
              pt-3
              shadow-[0_20px_40px_rgba(15,23,42,0.08)]
              md:hidden
            "
          >
            <div className="flex flex-col gap-1">
              {navigation.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeAllMenus}
                    className={`
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      transition
                      ${
                        active
                          ? "bg-zinc-50 font-semibold text-zinc-900"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={openCreateSpace}
                className="
                  mt-1
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  hover:text-zinc-900
                "
              >
                Create a Space
                <Plus size={16} className="bg-violet-50 text-violet-600" />
              </button>

              <button
                type="button"
                onClick={openCreatePrivateConversation}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  hover:text-zinc-900
                "
              >
                Private Conversation
                <MessageCircle
                  size={16}
                  className="bg-emerald-50 text-emerald-600"
                />
              </button>

              <button
                type="button"
                onClick={openJoinConversation}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-medium
                  text-zinc-600
                  transition
                  hover:bg-zinc-50
                  hover:text-zinc-900
                "
              >
                Join Conversation
                <ArrowRight size={16} className="bg-zinc-100 text-zinc-600" />
              </button>

              <Link
                to="/profile"
                onClick={closeAllMenus}
                className="
                  mt-2
                  flex
                  items-center
                  gap-3
                  border-t
                  border-zinc-100
                  px-4
                  pt-4
                "
              >
                <div
                  className="
                    grid
                    h-9
                    w-9
                    shrink-0
                    place-items-center
                    overflow-hidden
                    rounded-full
                    bg-violet-600
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
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {username}
                  </p>

                  <p className="text-[10px] text-zinc-400">View profile</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function CreateMenuItem({
  icon,
  iconClass,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-left
        transition
        hover:bg-zinc-50
      "
    >
      <span
        className={`
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-xl
          transition
          group-hover:scale-105
          ${iconClass}
        `}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-zinc-900">
          {title}
        </span>

        <span className="mt-0.5 block truncate text-[10px] text-zinc-400">
          {description}
        </span>
      </span>

      <ArrowRight
        size={13}
        className="
          shrink-0
          text-zinc-200
          transition
          group-hover:translate-x-0.5
          group-hover:text-violet-500
        "
      />
    </button>
  );
}
