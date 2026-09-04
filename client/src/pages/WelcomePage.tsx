import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/client";

export default function GuestSetupPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLight = theme === "light";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      setError("Please choose a username.");
      return;
    }

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (cleanUsername.length > 20) {
      setError("Username cannot exceed 20 characters.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain letters, numbers and underscores.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/guests", {
        username: cleanUsername,
      });

      const guest = response.data.guest;
        localStorage.setItem("linkup_guest_id", guest.guestId);
        localStorage.setItem("linkup_username", guest.username);
      navigate("/home");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setError("That username is already taken.");
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to create your profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden ${
        isLight
          ? "bg-[#f7f8fc] text-slate-950"
          : "bg-[#070711] text-white"
      }`}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full blur-[140px] ${
            isLight ? "bg-violet-300/30" : "bg-violet-600/20"
          }`}
        />

        <div
          className={`absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full blur-[140px] ${
            isLight ? "bg-cyan-300/30" : "bg-cyan-500/15"
          }`}
        />

        <div
          className={`absolute left-[45%] top-[40%] h-80 w-80 rounded-full blur-[130px] ${
            isLight ? "bg-fuchsia-300/20" : "bg-fuchsia-500/[0.08]"
          }`}
        />
      </div>

      {/* Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage: isLight
            ? "linear-gradient(rgba(15,23,42,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.8) 1px, transparent 1px)"
            : "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Vignette */}
      <div
        className={`pointer-events-none fixed inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_center,transparent_25%,rgba(148,163,184,.12)_100%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,.45)_100%)]"
        }`}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-5 sm:px-10 sm:py-6">
        <header className="flex shrink-0 items-center justify-between">
          <Link to="/welcome" className="group flex items-center gap-3">
            <div
              className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-sm font-black ${
                isLight ? "bg-slate-950 text-white" : "bg-white text-black"
              }`}
            >
              <span className="relative z-10">L</span>

              <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-violet-400 blur-md" />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight">LinkUp</p>

              <p
                className={`text-[10px] uppercase tracking-[0.25em] ${
                  isLight ? "text-slate-400" : "text-white/30"
                }`}
              >
                Stay connected
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div
              className={`hidden items-center gap-2 text-xs sm:flex ${
                isLight ? "text-slate-400" : "text-white/30"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems online
            </div>

            <button
              type="button"
              onClick={() => setTheme(isLight ? "dark" : "light")}
              aria-label={`Switch to ${
                isLight ? "dark" : "light"
              } theme`}
              className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                isLight
                  ? "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                  : "border-white/10 bg-white/[0.06] text-white/70 hover:border-white/20 hover:bg-white/[0.1]"
              }`}
            >
              <span className="text-base">{isLight ? "☀" : "☾"}</span>
            </button>
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_430px] lg:gap-20">
            {/* Left */}
            <section className="hidden lg:block">
              <div className="max-w-2xl">
                <div
                  className={`mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] ${
                    isLight ? "text-violet-600" : "text-violet-300/80"
                  }`}
                >
                  <span className="h-px w-8 bg-violet-400/60" />
                  Welcome to LinkUp
                </div>

                <h1 className="text-6xl font-semibold leading-[0.95] tracking-[-0.05em] xl:text-7xl">
                  Find your people.
                  <br />
                  <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                    Start talking.
                  </span>
                </h1>

                <p
                  className={`mt-7 max-w-lg text-base leading-7 ${
                    isLight ? "text-slate-500" : "text-white/40"
                  }`}
                >
                  Pick a username, join spaces, and start conversations with
                  people who share your interests.
                </p>
              </div>

              {/* Fake conversation preview */}
              <div className="relative mt-12 h-36 max-w-xl">
                <div
                  className={`absolute left-0 top-0 flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
                    isLight
                      ? "border-slate-200 bg-white/70 shadow-slate-300/20"
                      : "border-white/[0.08] bg-white/[0.035] shadow-black/20"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold text-white">
                    A
                  </div>

                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isLight ? "text-slate-700" : "text-white/70"
                      }`}
                    >
                      Aria
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        isLight ? "text-slate-500" : "text-white/40"
                      }`}
                    >
                      Anyone up for a late-night chat?
                    </p>
                  </div>
                </div>

                <div
                  className={`absolute right-2 top-14 flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
                    isLight
                      ? "border-violet-200 bg-violet-100/70 shadow-violet-200/30"
                      : "border-violet-400/10 bg-violet-500/[0.08] shadow-violet-900/20"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-xs font-bold text-white">
                    Y
                  </div>

                  <div>
                    <p
                      className={`text-xs font-medium ${
                        isLight ? "text-violet-700" : "text-violet-100/80"
                      }`}
                    >
                      You
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        isLight ? "text-violet-600" : "text-violet-100/50"
                      }`}
                    >
                      I'm already here 👀
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Guest setup */}
            <section className="w-full">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-10 rounded-[40px] bg-violet-500/[0.035] blur-3xl" />

                <div className="relative">
                  {/* Mobile heading */}
                  <div className="mb-8 lg:hidden">
                    <p
                      className={`mb-2 text-sm font-medium ${
                        isLight ? "text-violet-600" : "text-violet-300"
                      }`}
                    >
                      Welcome to LinkUp
                    </p>

                    <h1 className="text-4xl font-semibold tracking-[-0.04em]">
                      Let's get you started.
                    </h1>
                  </div>

                  {/* Heading */}
                  <div className="mb-7">
                    <p
                      className={`mb-2 text-[11px] font-medium uppercase tracking-[0.2em] ${
                        isLight ? "text-slate-400" : "text-white/25"
                      }`}
                    >
                      Get started
                    </p>

                    <h2 className="text-3xl font-semibold tracking-[-0.035em]">
                      Choose your username.
                    </h2>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isLight ? "text-slate-500" : "text-white/35"
                      }`}
                    >
                      No password. No complicated signup. Just pick a name
                      and jump in.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      className={`mb-5 flex items-center gap-3 border-l-2 bg-red-500/[0.07] px-4 py-3 text-sm ${
                        isLight ? "text-red-600" : "text-red-300"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                      {error}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                      <label
                        htmlFor="username"
                        className={`mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] ${
                          isLight
                            ? "text-slate-500 group-focus-within:text-violet-500"
                            : "text-white/30 group-focus-within:text-violet-300/70"
                        }`}
                      >
                        Username
                      </label>

                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="choose a username"
                        autoComplete="username"
                        maxLength={20}
                        autoFocus
                        disabled={loading}
                        className={`w-full border-b bg-transparent px-0 py-3 text-[15px] outline-none transition ${
                          isLight
                            ? "border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                            : "border-white/10 text-white placeholder:text-white/15 focus:border-violet-400"
                        }`}
                      />

                      <p
                        className={`mt-2 text-[11px] ${
                          isLight ? "text-slate-400" : "text-white/20"
                        }`}
                      >
                        3–20 characters · letters, numbers and underscores
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl px-5 py-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isLight
                          ? "bg-slate-950 text-white shadow-sm hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20"
                          : "bg-white text-black shadow-sm hover:bg-violet-100 hover:shadow-lg hover:shadow-violet-500/10"
                      }`}
                    >
                      <span>
                        {loading
                          ? "Setting things up..."
                          : "Join LinkUp"}
                      </span>

                      <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </form>

                  {/* Privacy note */}
                  <div
                    className={`mt-7 border-t pt-5 text-center text-[13px] leading-5 ${
                      isLight
                        ? "border-slate-200 text-slate-400"
                        : "border-white/[0.07] text-white/20"
                    }`}
                  >
                    <p>
                      Your username is how people will see you on LinkUp.
                    </p>
                    <p className="mt-1">
                      You can update your profile later.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`flex shrink-0 items-center justify-between text-[12px] uppercase tracking-[0.2em] ${
            isLight ? "text-slate-400" : "text-white/15"
          }`}
        >
          <span>LinkUp © 2026</span>

          <span className="hidden sm:block">
            Connect. Converse. Belong.
          </span>
        </footer>
      </div>
    </main>
  );
}
