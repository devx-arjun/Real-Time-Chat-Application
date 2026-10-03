import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { createGuest } = useAuth();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Username can only contain letters, numbers and underscores.");
      return;
    }

    try {
      setLoading(true);

      await createGuest(cleanUsername);

      navigate("/home");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        setError("That username is already taken.");
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to create your profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#f7f8fc] text-slate-950">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-violet-300/20 blur-[110px] sm:-left-40 sm:-top-40 sm:h-[32rem] sm:w-[32rem] sm:bg-violet-300/30 sm:blur-[140px]" />

        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-cyan-300/20 blur-[110px] sm:-bottom-40 sm:-right-40 sm:h-[32rem] sm:w-[32rem] sm:bg-cyan-300/30 sm:blur-[140px]" />

        <div className="absolute left-[45%] top-[40%] hidden h-80 w-80 rounded-full bg-fuchsia-300/20 blur-[130px] sm:block" />
      </div>

      {/* Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02] sm:opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(148,163,184,.08)_100%)] sm:bg-[radial-gradient(circle_at_center,transparent_25%,rgba(148,163,184,.12)_100%)]" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-5 py-4 sm:px-10 sm:py-6">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between">
          <Link to="/" className="group flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[11px] bg-slate-950 text-sm font-black text-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl">
              <span className="relative z-10">L</span>

              <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-violet-400 blur-md" />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight">LinkUp</p>

              <p className="hidden text-[10px] uppercase tracking-[0.25em] text-slate-400 sm:block">
                Stay connected
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All systems online
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center">
          <div className="grid w-full max-w-6xl items-center gap-10 py-6 sm:py-12 lg:grid-cols-[1fr_430px] lg:gap-20">
            {/* Desktop Hero */}
            <section className="hidden lg:block">
              <div className="max-w-2xl">
                <div className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-violet-600">
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

                <p className="mt-7 max-w-lg text-base leading-7 text-slate-500">
                  Pick a username, join spaces, and start conversations with
                  people who share your interests.
                </p>
              </div>

              {/* Desktop conversation preview */}
              <div className="relative mt-12 h-36 max-w-xl">
                <div className="absolute left-0 top-0 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-2xl shadow-slate-300/20 backdrop-blur-md">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs font-bold text-white">
                    A
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-700">Rahul</p>

                    <p className="mt-1 text-sm text-slate-500">
                      Anyone up for a late-night chat?
                    </p>
                  </div>
                </div>

                <div className="absolute right-2 top-14 flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-100/70 px-4 py-3 shadow-2xl shadow-violet-200/30 backdrop-blur-md">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-xs font-bold text-white">
                    Y
                  </div>

                  <div>
                    <p className="text-xs font-medium text-violet-700">You</p>

                    <p className="mt-1 text-sm text-violet-600">
                      I'm already here 👀
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile Hero + Form */}
            <section className="w-full">
              {/* Mobile intro */}
              <div className="mb-7 lg:hidden">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-violet-600">
                  <span className="h-px w-5 bg-violet-400/60" />
                  Welcome to LinkUp
                </div>

                <h1 className="text-[2.65rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl">
                  Find your people.
                  <br />
                  <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                    Start talking.
                  </span>
                </h1>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                  Discover communities, join conversations, and connect with
                  people who share your interests.
                </p>
              </div>

              {/* Mobile conversation preview */}
              <div className="relative mb-12 h-[86px] sm:hidden">
                <div className="absolute left-0 top-0 flex max-w-[78%] items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 shadow-lg shadow-slate-200/50 backdrop-blur-md">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-[10px] font-bold text-white">
                    A
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-700">
                      Rahul
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      Anyone up for a chat?
                    </p>
                  </div>
                </div>

                <div className="absolute right-0 top-10 flex max-w-[68%] items-center gap-2.5 rounded-2xl border border-violet-200 bg-violet-100/80 px-3 py-2.5 shadow-lg shadow-violet-200/40 backdrop-blur-md">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-[10px] font-bold text-white">
                    Y
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-violet-700">
                      You
                    </p>

                    <p className="truncate text-xs text-violet-600">
                      I'm already here 👀
                    </p>
                  </div>
                </div>
              </div>

              {/* Form container */}
              <div className="relative">
                <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-violet-500/[0.035] blur-3xl" />

                <div className="relative rounded-[26px] border border-slate-200/80 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[30px] sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
                  {/* Form heading */}
                  <div className="mb-6">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                      Get started
                    </p>

                    <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                      Choose your username.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      No password. No complicated signup. Just pick a name and
                      jump in.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-5 flex items-start gap-3 border-l-2 border-red-400 bg-red-500/[0.07] px-4 py-3 text-sm text-red-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />

                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                      <label
                        htmlFor="username"
                        className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 transition-colors group-focus-within:text-violet-500"
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
                        className="w-full border-b border-slate-300 bg-transparent px-0 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <p className="mt-2 text-[11px] text-slate-400">
                        3–20 characters · letters, numbers and underscores
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex w-full cursor-pointer items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>{loading ? "Joining" : "Join LinkUp"}</span>

                      <span className="text-lg transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:text-[12px] sm:tracking-[0.2em]">
          <span>LinkUp © 2026</span>

          <span className="hidden sm:block">Connect. Converse. Belong.</span>
        </footer>
      </div>
    </main>
  );
}