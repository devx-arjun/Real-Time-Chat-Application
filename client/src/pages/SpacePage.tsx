// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useEffect, useState } from "react";

// import { getSpace, type Space } from "../api/space.api";
// import { createConversation } from "../api/conversation.api";
// import { useAuth } from "../context/useAuth";

// export default function SpacePage() {
//   const { spaceId } = useParams<{ spaceId: string }>();
//   const navigate = useNavigate();

//   const { guest, loading: authLoading } = useAuth();

//   const [space, setSpace] = useState<Space | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [showCreateConversation, setShowCreateConversation] = useState(false);
//   const [conversationTitle, setConversationTitle] = useState("");
//   const [creatingConversation, setCreatingConversation] = useState(false);

//   async function handleCreateConversation() {
//     if (!spaceId || !conversationTitle.trim()) {
//       return;
//     }

//     try {
//       setCreatingConversation(true);
//       setError("");

//       const conversation = await createConversation(
//         spaceId,
//         conversationTitle.trim(),
//       );

//       setShowCreateConversation(false);
//       setConversationTitle("");

//       navigate(`/chat/${conversation.id}`);
//     } catch (error) {
//       console.error("Failed to create conversation:", error);

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to create conversation",
//       );
//     } finally {
//       setCreatingConversation(false);
//     }
//   }

//   useEffect(() => {
//     if (authLoading) {
//       return;
//     }

//     if (!guest || !spaceId) {
//       setLoading(false);
//       return;
//     }

//     async function loadSpace() {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getSpace(spaceId);

//         setSpace(data);
//       } catch (error) {
//         console.error("Failed to load space:", error);
//         setError("Unable to load this space.");
//         setSpace(null);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadSpace();
//   }, [guest, authLoading, spaceId]);

//   if (authLoading || loading) {
//     return (
//       <main
//         className={`flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-950`}
//       >
//         <p className="text-slate-400">
//           Loading space...
//         </p>
//       </main>
//     );
//   }

//   if (!guest) {
//     return (
//       <main
//         className={`flex min-h-screen flex-col items-center justify-center px-6 bg-[#f7f8fc] text-slate-950`}
//       >
//         <div className="text-center">
//           <h1 className="text-2xl font-semibold">Guest session not found</h1>

//           <p
//             className={`mt-2 text-sm text-slate-400`}
//           >
//             Please create or restore your guest session.
//           </p>

//           <button
//             type="button"
//             onClick={() => navigate("/")}
//             className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold bg-slate-950 text-white`}
//           >
//             Go home
//           </button>
//         </div>
//       </main>
//     );
//   }

//   if (!spaceId) {
//     return (
//       <main
//         className={`flex min-h-screen flex-col items-center justify-center px-6 bg-[#f7f8fc] text-slate-950`}
//       >
//         <div className="text-center">
//           <h1 className="text-2xl font-semibold">Invalid space</h1>

//           <p
//             className={`mt-2 text-sm text-slate-400`}
//           >
//             No space ID was provided in the URL.
//           </p>

//           <button
//             type="button"
//             onClick={() => navigate("/home")}
//             className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold bg-slate-950 text-white`}
//           >
//             Back to dashboard
//           </button>
//         </div>
//       </main>
//     );
//   }

//   if (error || !space) {
//     return (
//       <main
//         className={`flex min-h-screen flex-col items-center justify-center px-6 bg-[#f7f8fc] text-slate-950`}
//       >
//         <div className="text-center">
//           <h1 className="text-2xl font-semibold">Space not found</h1>

//           <p
//             className={`mt-2 text-sm text-slate-400`}
//           >
//             {error || "This space does not exist or you are not a member."}
//           </p>

//           <button
//             type="button"
//             onClick={() => navigate("/home")}
//             className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold bg-slate-950 text-white`}
//           >
//             Back to dashboard
//           </button>
//         </div>
//       </main>
//     );
//   }

//   const avatarLetter = guest.username?.charAt(0).toUpperCase() || "?";

//   return (
//     <main className={`min-h-screen bg-[#f7f8fc] text-slate-950`}>
//       <div className="mx-auto min-h-screen max-w-[1400px] px-5 sm:px-8 lg:px-10">
//         <header
//           className={`flex h-20 items-center justify-between border-b border-slate-200/70`}
//         >
//           <Link
//             to="/home"
//             className={`text-sm font-medium transition text-slate-500 hover:text-violet-600`}
//           >
//             ← Dashboard
//           </Link>

//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-violet-500/20">
//               {avatarLetter}
//             </div>

//             <span className="text-sm font-medium">{guest.username}</span>
//           </div>
//         </header>

//         {/* Space Header */}
//         <section className="py-12">
//           <div
//             className={`rounded-[32px] border p-8 sm:p-10 border-slate-200 bg-white/70 shadow-[0_15px_50px_rgba(30,20,60,0.04)]`}
//           >
//             <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
//               <div>
//                 <div
//                   className={`mb-3 text-xs font-medium uppercase tracking-[0.25em] text-violet-600`}
//                 >
//                   Space
//                 </div>

//                 <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
//                   #{space.name}
//                 </h1>

//                 {space.description && (
//                   <p className={`mt-4 max-w-2xl leading-7 text-slate-500`}>
//                     {space.description}
//                   </p>
//                 )}
//               </div>

//               {space.currentUserRole && (
//                 <div
//                   className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium bg-slate-100 text-slate-500`}
//                 >
//                   {space.currentUserRole}
//                 </div>
//               )}
//             </div>

//             {/* Stats */}
//             <div
//               className={`mt-8 flex flex-wrap gap-6 border-t pt-6 text-sm border-slate-200 text-slate-400`}
//             >
//               <span>
//                 {space.members?.length ?? space._count?.members ?? 0} members
//               </span>

//               <span>
//                 {space.conversations?.length ??
//                   space._count?.conversations ??
//                   0}{" "}
//                 conversations
//               </span>
//             </div>
//           </div>
//         </section>

//         {/* Members */}
//         {space.members && space.members.length > 0 && (
//           <section className="pb-12">
//             <div className="mb-6">
//               <p
//                 className={`text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400`}
//               >
//                 Members
//               </p>

//               <h2 className="mt-2 text-2xl font-semibold">
//                 People in this space
//               </h2>
//             </div>

//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//               {space.members.map((member) => {
//                 const memberLetter =
//                   member.user.username?.charAt(0).toUpperCase() || "?";

//                 return (
//                   <div
//                     key={member.id}
//                     className={`flex items-center gap-4 rounded-[22px] border p-4 border-slate-200 bg-white/70`}
//                   >
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
//                       {memberLetter}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-semibold">
//                         {member.user.username}
//                       </p>

//                       <p className={`mt-1 text-xs text-slate-400`}>
//                         {member.role}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </section>
//         )}

//         {/* Conversations */}
//         <section className="pb-16">
//           <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//               <p
//                 className={`text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400`}
//               >
//                 Conversations
//               </p>

//               <h2 className="mt-2 text-2xl font-semibold">What's happening</h2>
//             </div>

//             <button
//               type="button"
//               onClick={() => setShowCreateConversation(true)}
//               className={`rounded-full px-5 py-3 text-sm font-semibold transition bg-slate-950 text-white hover:bg-slate-800`}
//             >
//               + New conversation
//             </button>
//           </div>

//           {!space.conversations || space.conversations.length === 0 ? (
//             <div
//               className={`rounded-[28px] border border-dashed p-12 text-center border-slate-300 text-slate-400`}
//             >
//               <p className="text-lg font-semibold">No conversations yet</p>

//               <p className="mt-2 text-sm">
//                 Start the first conversation in this space.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {space.conversations.map((conversation) => (
//                 <Link
//                   key={conversation.id}
//                   to={`/chat/${conversation.id}`}
//                   className={`group block rounded-[24px] border p-6 transition border-slate-200 bg-white/70 hover:border-violet-200 hover:shadow-[0_15px_40px_rgba(100,70,180,0.08)]`}
//                 >
//                   <div className="flex items-center justify-between gap-4">
//                     <h3 className="font-semibold">
//                       {conversation.title || "Untitled conversation"}
//                     </h3>

//                     <span
//                       className={`text-lg transition-transform group-hover:translate-x-1 text-slate-300`}
//                     >
//                       ↗
//                     </span>
//                   </div>

//                   <div className={`mt-3 flex gap-4 text-xs text-slate-400`}>
//                     <span>{conversation._count.participants} participants</span>

//                     <span>{conversation._count.messages} messages</span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Footer */}
//         <footer
//           className={`flex flex-col gap-2 border-t py-5 text-[10px] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between border-slate-200/70 text-slate-400`}
//         >
//           <span>LinkUp © 2026</span>

//           <span>Connect · Converse · Belong</span>
//         </footer>
//       </div>

//       {showCreateConversation && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
//           {/* Backdrop */}
//           <button
//             type="button"
//             aria-label="Close create conversation modal"
//             onClick={() => {
//               setShowCreateConversation(false);
//               setConversationTitle("");
//             }}
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//           />

//           {/* Modal */}
//           <div
//             className={`relative z-10 w-full max-w-md rounded-[28px] border p-6 shadow-2xl border-slate-200 bg-white`}
//           >
//             <div className="flex items-start justify-between gap-4">
//               <div>
//                 <p
//                   className={`text-[10px] font-medium uppercase tracking-[0.25em] text-violet-600`}
//                 >
//                   New conversation
//                 </p>

//                 <h2 className="mt-2 text-2xl font-semibold">
//                   Start a conversation
//                 </h2>

//                 <p className={`mt-2 text-sm text-slate-400`}>
//                   Create a new conversation in #{space.name}.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowCreateConversation(false);
//                   setConversationTitle("");
//                 }}
//                 aria-label="Close"
//                 className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition text-slate-400 hover:bg-slate-100 hover:text-slate-700`}
//               >
//                 ×
//               </button>
//             </div>

//             <form
//               onSubmit={(event) => {
//                 event.preventDefault();
//                 handleCreateConversation();
//               }}
//               className="mt-6"
//             >
//               <label className={`text-xs font-medium text-slate-600`}>
//                 Conversation title
//               </label>

//               <input
//                 autoFocus
//                 value={conversationTitle}
//                 onChange={(event) => setConversationTitle(event.target.value)}
//                 placeholder="e.g. General chat"
//                 className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:ring-violet-500/10`}
//               />

//               <div className="mt-6 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCreateConversation(false);
//                     setConversationTitle("");
//                   }}
//                   className={`flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition border-slate-200 text-slate-600 hover:bg-slate-50`}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={!conversationTitle.trim() || creatingConversation}
//                   className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
//                     conversationTitle.trim() && !creatingConversation
//                       ? "bg-violet-600 text-white hover:bg-violet-500"
//                       : "bg-slate-100 text-slate-300"
//                   }`}
//                 >
//                   {creatingConversation ? "Creating..." : "Create conversation"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// }


import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MoreHorizontal, Trash2, LogOut, X } from "lucide-react";

import {
  getSpace,
  leaveSpace,
  deleteSpace,
  type Space,
} from "../api/space.api";
import { createConversation } from "../api/conversation.api";
import { useAuth } from "../context/useAuth";

export default function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();

  const { guest, loading: authLoading } = useAuth();

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateConversation, setShowCreateConversation] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [spaceActionLoading, setSpaceActionLoading] = useState(false);
  const [spaceActionError, setSpaceActionError] = useState("");

  async function handleCreateConversation() {
    if (!spaceId || !conversationTitle.trim()) {
      return;
    }

    try {
      setCreatingConversation(true);
      setError("");

      const conversation = await createConversation(
        spaceId,
        conversationTitle.trim(),
      );

      setShowCreateConversation(false);
      setConversationTitle("");

      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
      );
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleDeleteSpace() {
    if (!spaceId) {
      return;
    }

    try {
      setSpaceActionLoading(true);
      setSpaceActionError("");

      await deleteSpace(spaceId);

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Failed to delete space:", error);

      setSpaceActionError(
        error instanceof Error ? error.message : "Failed to delete space",
      );
    } finally {
      setSpaceActionLoading(false);
    }
  }

  async function handleLeaveSpace() {
    if (!spaceId) {
      return;
    }

    try {
      setSpaceActionLoading(true);
      setSpaceActionError("");

      await leaveSpace(spaceId);

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Failed to leave space:", error);

      setSpaceActionError(
        error instanceof Error ? error.message : "Failed to leave space",
      );
    } finally {
      setSpaceActionLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!guest || !spaceId) {
      setLoading(false);
      return;
    }
    const id = spaceId;

    async function loadSpace() {
      try {
        setLoading(true);
        setError("");

        const data = await getSpace(id);

        setSpace(data);
      } catch (error) {
        console.error("Failed to load space:", error);
        setError("Unable to load this space.");
        setSpace(null);
      } finally {
        setLoading(false);
      }
    }

    loadSpace();
  }, [guest, authLoading, spaceId]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setShowMoreMenu(false);

      if (!spaceActionLoading) {
        setShowDeleteConfirm(false);
        setShowLeaveConfirm(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [spaceActionLoading]);

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-950">
        <p className="text-slate-400">Loading space...</p>
      </main>
    );
  }

  if (!guest) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8fc] px-6 text-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Guest session not found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Please create or restore your guest session.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  if (!spaceId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8fc] px-6 text-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Invalid space</h1>

          <p className="mt-2 text-sm text-slate-400">
            No space ID was provided in the URL.
          </p>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to home
          </button>
        </div>
      </main>
    );
  }

  if (error || !space) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8fc] px-6 text-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Space not found</h1>

          <p className="mt-2 text-sm text-slate-400">
            {error || "This space does not exist or you are not a member."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to home
          </button>
        </div>
      </main>
    );
  }
  const isOwner = space.currentUserRole === "OWNER";

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <div className="mx-auto min-h-screen max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <header className="flex h-20 items-center justify-between">
          <Link
            to="/home"
            className="text-sm font-medium text-slate-500 transition hover:text-violet-600"
          >
            ← Home
          </Link>
        </header>

        {/* Space Header */}
        <section className="py-10 pt-4">
          <div className="rounded-[32px] border border-slate-200 bg-white/70 p-8 shadow-[0_15px_50px_rgba(30,20,60,0.04)] sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-violet-600">
                  Space
                </div>

                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  #{space.name}
                </h1>

                {space.description && (
                  <p className="mt-4 max-w-2xl leading-7 text-slate-500">
                    {space.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {space.currentUserRole && (
                  <div className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
                    {space.currentUserRole}
                  </div>
                )}

                {/* More menu */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Space options"
                    aria-expanded={showMoreMenu}
                    onClick={() => setShowMoreMenu((value) => !value)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {showMoreMenu && (
                    <>
                      <button
                        type="button"
                        aria-label="Close space options"
                        onClick={() => setShowMoreMenu(false)}
                        className="fixed inset-0 z-10 cursor-default"
                      />

                      <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              setSpaceActionError("");
                              setShowDeleteConfirm(true);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete space
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreMenu(false);
                              setSpaceActionError("");
                              setShowLeaveConfirm(true);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Leave space
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-200 pt-6 text-sm text-slate-400">
              <span>
                {space.members?.length ?? space._count?.members ?? 0} members
              </span>

              <span>
                {space.conversations?.length ??
                  space._count?.conversations ??
                  0}{" "}
                conversations
              </span>
            </div>
          </div>
        </section>

        {/* Members */}
        {space.members && space.members.length > 0 && (
          <section className="pb-12">
            <div className="mb-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
                Members
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                People in this space
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {space.members.map((member) => {
                const memberLetter =
                  member.user.username?.charAt(0).toUpperCase() || "?";

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 rounded-[22px] border border-slate-200 bg-white/70 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white">
                      {memberLetter}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {member.user.username}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Conversations */}
        <section className="pb-16">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
                Conversations
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                What's happening
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateConversation(true)}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              + New conversation
            </button>
          </div>

          {!space.conversations || space.conversations.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 p-12 text-center text-slate-400">
              <p className="text-lg font-semibold">No conversations yet</p>

              <p className="mt-2 text-sm">
                Start the first conversation in this space.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {space.conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className="group block rounded-[24px] border border-slate-200 bg-white/70 p-6 transition hover:border-violet-200 hover:shadow-[0_15px_40px_rgba(100,70,180,0.08)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold">
                      {conversation.title || "Untitled conversation"}
                    </h3>

                    <span className="text-lg text-slate-300 transition-transform group-hover:translate-x-1">
                      ↗
                    </span>
                  </div>

                  <div className="mt-3 flex gap-4 text-xs text-slate-400">
                    <span>
                      {conversation._count.participants} participants
                    </span>

                    <span>
                      {conversation._count.messages} messages
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-slate-200/70 py-5 text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>LinkUp © 2026</span>
          <span>Connect · Converse · Belong</span>
        </footer>
      </div>

      {/* Create conversation modal */}
      {showCreateConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <button
            type="button"
            aria-label="Close create conversation modal"
            onClick={() => {
              setShowCreateConversation(false);
              setConversationTitle("");
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-violet-600">
                  New conversation
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Start a conversation
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Create a new conversation in #{space.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateConversation(false);
                  setConversationTitle("");
                }}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateConversation();
              }}
              className="mt-6"
            >
              <label className="text-xs font-medium text-slate-600">
                Conversation title
              </label>

              <input
                autoFocus
                value={conversationTitle}
                onChange={(event) => setConversationTitle(event.target.value)}
                placeholder="e.g. General chat"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-500/10"
              />

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateConversation(false);
                    setConversationTitle("");
                  }}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!conversationTitle.trim() || creatingConversation}
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    conversationTitle.trim() && !creatingConversation
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "bg-slate-100 text-slate-300"
                  }`}
                >
                  {creatingConversation
                    ? "Creating..."
                    : "Create conversation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={() => {
              if (!spaceActionLoading) {
                setShowDeleteConfirm(false);
              }
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Delete #{space.name}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently delete the space, its conversations,
              messages, and memberships. This action cannot be undone.
            </p>

            {spaceActionError && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {spaceActionError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={spaceActionLoading}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={spaceActionLoading}
                onClick={handleDeleteSpace}
                className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {spaceActionLoading ? "Deleting..." : "Delete space"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave confirmation */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <button
            type="button"
            aria-label="Close leave confirmation"
            onClick={() => {
              if (!spaceActionLoading) {
                setShowLeaveConfirm(false);
              }
            }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <LogOut className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Leave #{space.name}?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You will no longer be a member of this space or its
              conversations.
            </p>

            {spaceActionError && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {spaceActionError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={spaceActionLoading}
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={spaceActionLoading}
                onClick={handleLeaveSpace}
                className="flex-1 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {spaceActionLoading ? "Leaving..." : "Leave space"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}