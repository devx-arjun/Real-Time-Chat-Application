import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type User = {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  country?: string | null;
  createdAt?: string;
};

type ActivityItem = {
  id: string;
  type: "joined" | "message";
  room: string;
  text: string;
  createdAt: string;
};

type Room = {
  id: string;
  name: string;
  description: string | null;
  members: number;
  accent?: "violet" | "cyan" | "fuchsia";
};

type ProfileResponse = {
  user: User;
  stats: {
    rooms: number;
    messages: number;
    friends: number;
    daysOnLinkUp: number;
  };
  rooms: Room[];
  activity: ActivityItem[];
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"activity" | "rooms">("activity");

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<ProfileResponse>("/profile");
        console.log("PROFILE RESPONSE:", response.data);
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to load profile:", error);

        setError(
          error instanceof Error ? error.message : "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-950`}
      >
        <div className="text-sm opacity-50">Loading profile...</div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-950`}
      >
        <div className="text-center">
          <p className="text-sm font-medium">{error || "Profile not found"}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { user, stats, rooms, activity } = profile;
  console.log("User: ", user);

  const initials = user.username.charAt(0).toUpperCase();

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-950`}
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={`absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full blur-[140px] bg-violet-300/20`}
        />

        <div
          className={`absolute -right-40 top-[35%] h-[34rem] w-[34rem] rounded-full blur-[150px] bg-cyan-300/15`}
        />

        <div
          className={`absolute bottom-[-15rem] left-[35%] h-[30rem] w-[30rem] rounded-full blur-[150px]  bg-fuchsia-300/15`}
        />

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
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <section className="relative py-12 sm:py-16">
          <div
            className={`pointer-events-none absolute right-0 top-5 hidden select-none text-[16rem] font-black leading-none tracking-[-0.12em] lg:block text-slate-950/[0.025]`}
          >
            {initials}
          </div>

          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5 sm:gap-7">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-4xl font-bold text-white shadow-2xl shadow-violet-500/20 sm:h-36 sm:w-36 sm:text-5xl">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.username.charAt(0).toUpperCase()
                  )}
                </div>

                <span
                  className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-[5px] bg-emerald-400 border-[#f7f8fc]`}
                />
              </div>

              {/* User information */}
              <div>
                <p
                  className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-600`}
                >
                  Profile
                </p>

                <h1 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  {user.username}
                </h1>

                <p className={`mt-2 text-sm text-slate-400`}>
                  {user.country ? `${user.country}` : "India"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/settings"
                className={`rounded-full px-5 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 bg-slate-950 text-white shadow-lg shadow-slate-900/10 hover:bg-violet-600`}
              >
                Edit profile
              </Link>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition border-slate-200 bg-white/70 text-slate-600 hover:bg-white`}
              >
                Share
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8 max-w-2xl">
            <p className={`text-base leading-7 text-slate-500`}>
              {user.bio || "No bio yet."}
            </p>
          </div>

          {/* Stats */}
          <div
            className={`mt-10 flex flex-wrap gap-x-10 gap-y-5 border-y py-6 border-slate-200`}
          >
            <Stat value={String(stats.rooms)} label="Spaces" />

            <Stat value={String(stats.messages)} label="Messages" />

            <Stat value={String(stats.daysOnLinkUp)} label="Days on LinkUp" />
          </div>
        </section>

        {/* CONTENT */}

        <div className="grid gap-14 pb-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            {/* Tabs */}
            <div className={`mb-8 flex gap-7 border-b border-slate-200`}>
              <button
                type="button"
                onClick={() => setActiveTab("activity")}
                className={`relative pb-4 text-sm font-medium ${
                  activeTab === "activity" ? "text-slate-950" : "text-slate-400"
                }`}
              >
                Activity
                {activeTab === "activity" && (
                  <span className="absolute bottom-[-1px] left-0 h-px w-full bg-violet-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("rooms")}
                className={`relative pb-4 text-sm font-medium ${
                  activeTab === "rooms" ? "text-slate-950" : "text-slate-400"
                }`}
              >
                Spaces
                {activeTab === "rooms" && (
                  <span className="absolute bottom-[-1px] left-0 h-px w-full bg-violet-500" />
                )}
              </button>
            </div>

            {/* Activity */}
            {activeTab === "activity" ? (
              <ActivityList activity={activity} />
            ) : (
              <div className="space-y-4">
                {rooms.length === 0 ? (
                  <EmptyState text="You haven't joined any spaces yet." />
                ) : (
                  rooms.map((room) => <ProfileRoom key={room.id} room={room} />)
                )}
              </div>
            )}
          </section>

          {/* PROFILE INFO */}

          <aside className="space-y-5">
            <div
              className={`rounded-[24px] border p-6 border-slate-200 bg-white/60`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400`}
              >
                About
              </p>

              <div className="mt-6 space-y-5">
                <InfoRow
                  icon="@"
                  label="Username"
                  value={`@${user.username}`}
                />

                {user.country && (
                  <InfoRow icon="⌖" label="Location" value={user.country} />
                )}

                {user.createdAt && (
                  <InfoRow
                    icon="◷"
                    label="Joined"
                    value={formatDate(user.createdAt)}
                  />
                )}
              </div>
            </div>

            <div
              className={`rounded-[24px] border p-6 border-slate-200 bg-white/60`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400`}
              >
                LinkUp
              </p>

              <p className={`mt-3 text-sm leading-6 text-slate-500`}>
                Connect with people, join conversations and find your people.
              </p>
            </div>
          </aside>
        </div>

        <footer
          className={`flex flex-col gap-2 border-t py-7 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between border-slate-200/70 text-slate-400`}
        >
          <span>LinkUp © 2026</span>
          <span>Connect · Converse · Belong</span>
        </footer>
      </div>
    </main>
  );
}

//  STAT

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>

      <p
        className={`mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-400`}
      >
        {label}
      </p>
    </div>
  );
}

//  ACTIVITY

function ActivityList({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return <EmptyState text="No activity yet." />;
  }

  return (
    <div className={`relative border-l border-slate-200`}>
      {activity.map((item, index) => (
        <div key={item.id} className="group relative mb-9 pl-8 last:mb-0">
          <span
            className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#f7f8fc] bg-violet-500`}
          />

          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm">
                {item.type === "message" ? (
                  <>
                    Sent a message in{" "}
                    <span className={`font-semibold text-violet-600`}>
                      #{item.room}
                    </span>
                  </>
                ) : (
                  <>
                    Joined{" "}
                    <span className={`font-semibold text-violet-600`}>
                      #{item.room}
                    </span>
                  </>
                )}
              </p>

              {item.text && (
                <p className={`mt-2 text-sm text-slate-500`}>{item.text}</p>
              )}
            </div>

            <span className={`shrink-0 text-[10px] text-slate-400`}>
              {formatRelativeTime(item.createdAt)}
            </span>
          </div>

          {index !== activity.length - 1 && (
            <div
              className={`absolute bottom-[-18px] left-[-1px] h-2 w-px bg-slate-200`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ProfileRoom({ room }: { room: Room }) {
  const gradient =
    room.accent === "violet"
      ? "from-violet-500/15 via-fuchsia-500/5"
      : room.accent === "cyan"
        ? "from-cyan-500/15 via-blue-500/5"
        : "from-fuchsia-500/15 via-violet-500/5";

  return (
    <Link
      to={`/space/${room.id}`}
      className={`group relative block w-full overflow-hidden rounded-[24px] border p-6 text-left transition duration-400 hover:-translate-y-1 border-slate-200 bg-white/65 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} to-transparent opacity-80`}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-lg text-slate-300`}>#</span>

            <h3 className="font-semibold">{room.name}</h3>
          </div>

          <span
            className={`text-xl transition-transform duration-300 group-hover:translate-x-1 text-slate-300`}
          >
            ↗
          </span>
        </div>

        <p className={`mt-3 max-w-xl text-sm leading-6 text-slate-500`}>
          {room.description || "No description yet."}
        </p>

        <p
          className={`mt-5 text-[10px] uppercase tracking-[0.15em] text-slate-400`}
        >
          {room.members} members
        </p>
      </div>
    </Link>
  );
}

//  INFO ROW

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm bg-white text-slate-500 shadow-sm`}
      >
        {icon}
      </span>

      <div>
        <p className={`text-[10px] uppercase tracking-[0.15em] text-slate-400`}>
          {label}
        </p>

        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
function EmptyState({ text }: { text: string }) {
  return (
    <div
      className={`rounded-2xl border p-10 text-center text-sm border-slate-200 bg-white/50 text-slate-400`}
    >
      {text}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(date: string) {
  const now = Date.now();
  const timestamp = new Date(date).getTime();

  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
