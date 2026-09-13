// // import { Link, useNavigate, useParams } from "react-router-dom";
// // import { useEffect, useState } from "react";

// // import {
// //   getConversation,
// //   joinConversation,
// //   type Conversation,
// // } from "../api/conversation.api";

// // import { useAuth } from "../context/useAuth";
// // import { useTheme } from "../context/ThemeContext";

// // export default function ConversationPage() {
// //   const { conversationId } = useParams<{
// //     conversationId: string;
// //   }>();

// //   const navigate = useNavigate();

// //   const { guest } = useAuth();
// //   const { theme } = useTheme();

// //   const [conversation, setConversation] = useState<Conversation | null>(null);

// //   const [isParticipant, setIsParticipant] = useState(false);

// //   const [loading, setLoading] = useState(true);
// //   const [joining, setJoining] = useState(false);
// //   const [error, setError] = useState("");

// //   const isLight = theme === "light";

// //   useEffect(() => {
// //     if (!guest || !conversationId) {
// //       setLoading(false);
// //       return;
// //     }

// //     async function loadConversation() {
// //       try {
// //         setLoading(true);
// //         setError("");

// //         const data = await getConversation(conversationId);

// //         setConversation(data.conversation);
// //         setIsParticipant(data.isParticipant);
// //       } catch (error) {
// //         console.error("Failed to load conversation:", error);

// //         setError("Unable to load this conversation.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     loadConversation();
// //   }, [guest, conversationId]);

// //   async function handleJoin() {
// //     if (!conversationId || joining) {
// //       return;
// //     }

// //     try {
// //       setJoining(true);
// //       setError("");

// //       await joinConversation(conversationId);

// //       setIsParticipant(true);
// //     } catch (error) {
// //       console.error("Failed to join conversation:", error);

// //       setError("Unable to join this conversation.");
// //     } finally {
// //       setJoining(false);
// //     }
// //   }

// //   if (loading) {
// //     return (
// //       <main
// //         className={`flex min-h-screen items-center justify-center ${
// //           isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
// //         }`}
// //       >
// //         <p className={isLight ? "text-slate-400" : "text-white/40"}>
// //           Loading conversation...
// //         </p>
// //       </main>
// //     );
// //   }

// //   if (error || !conversation) {
// //     return (
// //       <main
// //         className={`flex min-h-screen flex-col items-center justify-center px-6 ${
// //           isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
// //         }`}
// //       >
// //         <div className="text-center">
// //           <h1 className="text-2xl font-semibold">Conversation not found</h1>

// //           <p
// //             className={`mt-2 text-sm ${
// //               isLight ? "text-slate-400" : "text-white/40"
// //             }`}
// //           >
// //             {error ||
// //               "This conversation does not exist or you do not have access to it."}
// //           </p>

// //           <button
// //             type="button"
// //             onClick={() => navigate("/dashboard")}
// //             className={`mt-6 rounded-full px-5 py-3 text-sm font-semibold ${
// //               isLight ? "bg-slate-950 text-white" : "bg-white text-slate-950"
// //             }`}
// //           >
// //             Back to dashboard
// //           </button>
// //         </div>
// //       </main>
// //     );
// //   }

// //   return (
// //     <main
// //       className={`min-h-screen ${
// //         isLight ? "bg-[#f7f8fc] text-slate-950" : "bg-[#070711] text-white"
// //       }`}
// //     >
// //       <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-5 sm:px-8 lg:px-10">
// //         {/* Header */}
// //         <header
// //           className={`flex h-20 shrink-0 items-center justify-between border-b ${
// //             isLight ? "border-slate-200/70" : "border-white/[0.06]"
// //           }`}
// //         >
// //           <div className="flex items-center gap-4">
// //             <Link
// //               to={`/space/${conversation.space?.id}`}
// //               className={`text-sm font-medium ${
// //                 isLight
// //                   ? "text-slate-500 hover:text-violet-600"
// //                   : "text-white/40 hover:text-violet-300"
// //               }`}
// //             >
// //               ← Space
// //             </Link>

// //             <span className={isLight ? "text-slate-300" : "text-white/10"}>
// //               /
// //             </span>

// //             <span className="text-sm font-medium">
// //               {conversation.space?.name}
// //             </span>
// //           </div>

// //           <div className="flex items-center gap-3">
// //             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white">
// //               {guest?.username?.charAt(0).toUpperCase() ?? "?"}
// //             </div>

// //             <span className="hidden text-sm font-medium sm:block">
// //               {guest?.username}
// //             </span>
// //           </div>
// //         </header>

// //         {/* Conversation header */}
// //         <section className="shrink-0 py-8">
// //           <div
// //             className={`rounded-[28px] border p-7 ${
// //               isLight
// //                 ? "border-slate-200 bg-white/70"
// //                 : "border-white/[0.07] bg-white/[0.025]"
// //             }`}
// //           >
// //             <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
// //               <div>
// //                 <p
// //                   className={`text-[10px] font-medium uppercase tracking-[0.25em] ${
// //                     isLight ? "text-violet-600" : "text-violet-300/70"
// //                   }`}
// //                 >
// //                   Conversation
// //                 </p>

// //                 <h1 className="mt-2 text-3xl font-semibold tracking-tight">
// //                   {conversation.title || "Untitled conversation"}
// //                 </h1>

// //                 <div
// //                   className={`mt-3 flex flex-wrap gap-4 text-xs ${
// //                     isLight ? "text-slate-400" : "text-white/30"
// //                   }`}
// //                 >
// //                   <span>
// //                     {conversation._count.participants}{" "}
// //                     {conversation._count.participants === 1
// //                       ? "participant"
// //                       : "participants"}
// //                   </span>

// //                   <span>
// //                     {conversation._count.messages}{" "}
// //                     {conversation._count.messages === 1
// //                       ? "message"
// //                       : "messages"}
// //                   </span>
// //                 </div>
// //               </div>

// //               {!isParticipant && (
// //                 <button
// //                   type="button"
// //                   onClick={handleJoin}
// //                   disabled={joining}
// //                   className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
// //                     isLight
// //                       ? "bg-slate-950 text-white hover:bg-violet-600"
// //                       : "bg-white text-slate-950 hover:bg-violet-100"
// //                   }`}
// //                 >
// //                   {joining ? "Joining..." : "Join conversation"}
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         </section>

// //         {/* Chat area */}
// //         <section className="flex min-h-0 flex-1 pb-8">
// //           <div
// //             className={`flex min-h-[500px] w-full flex-col overflow-hidden rounded-[28px] border ${
// //               isLight
// //                 ? "border-slate-200 bg-white/70"
// //                 : "border-white/[0.07] bg-white/[0.025]"
// //             }`}
// //           >
// //             {/* Messages */}
// //             <div className="flex flex-1 items-center justify-center p-8">
// //               <div className="text-center">
// //                 <div
// //                   className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
// //                     isLight
// //                       ? "bg-slate-100 text-slate-400"
// //                       : "bg-white/[0.05] text-white/30"
// //                   }`}
// //                 >
// //                   💬
// //                 </div>

// //                 <h2 className="mt-5 text-lg font-semibold">No messages yet</h2>

// //                 <p
// //                   className={`mt-2 max-w-sm text-sm leading-6 ${
// //                     isLight ? "text-slate-400" : "text-white/30"
// //                   }`}
// //                 >
// //                   The conversation is ready. Message sending comes next.
// //                 </p>
// //               </div>
// //             </div>

// //             {/* Message input placeholder */}
// //             <div
// //               className={`border-t p-4 ${
// //                 isLight ? "border-slate-200" : "border-white/[0.06]"
// //               }`}
// //             >
// //               <div className="flex items-center gap-3">
// //                 <input
// //                   disabled
// //                   placeholder="Message coming next..."
// //                   className={`h-12 flex-1 rounded-2xl border bg-transparent px-4 text-sm outline-none ${
// //                     isLight
// //                       ? "border-slate-200 text-slate-800 placeholder:text-slate-400"
// //                       : "border-white/[0.08] text-white placeholder:text-white/25"
// //                   }`}
// //                 />

// //                 <button
// //                   type="button"
// //                   disabled
// //                   className={`h-12 rounded-2xl px-5 text-sm font-semibold opacity-50 ${
// //                     isLight
// //                       ? "bg-slate-950 text-white"
// //                       : "bg-white text-slate-950"
// //                   }`}
// //                 >
// //                   Send
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </section>
// //       </div>
// //     </main>
// //   );
// // }


// import { Copy, Check, MessageCircle, ArrowLeft } from "lucide-react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useEffect, useState } from "react";

// import {
//   getConversation,
//   joinConversation,
//   type Conversation,
// } from "../api/conversation.api";

// import { useAuth } from "../context/useAuth";

// export default function ConversationPage() {
//   const { conversationId } = useParams<{
//     conversationId: string;
//   }>();

//   const navigate = useNavigate();
//   const { guest } = useAuth();

//   const [conversation, setConversation] =
//     useState<Conversation | null>(null);

//   const [isParticipant, setIsParticipant] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [joining, setJoining] = useState(false);
//   const [error, setError] = useState("");

//   const [codeCopied, setCodeCopied] = useState(false);

//   useEffect(() => {
//     if (!guest || !conversationId) {
//       setLoading(false);
//       return;
//     }

//     async function loadConversation() {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getConversation(conversationId);

//         setConversation(data.conversation);
//         setIsParticipant(data.isParticipant);
//       } catch (error) {
//         console.error("Failed to load conversation:", error);

//         setError("Unable to load this conversation.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     void loadConversation();
//   }, [guest, conversationId]);

//   async function handleJoin() {
//     if (!conversationId || joining) {
//       return;
//     }

//     try {
//       setJoining(true);
//       setError("");

//       await joinConversation(conversationId);

//       setIsParticipant(true);
//     } catch (error) {
//       console.error("Failed to join conversation:", error);

//       setError("Unable to join this conversation.");
//     } finally {
//       setJoining(false);
//     }
//   }

//   async function handleCopyCode() {
//     const code = conversation?.joinCode;

//     if (!code) {
//       return;
//     }

//     try {
//       await navigator.clipboard.writeText(code);

//       setCodeCopied(true);

//       window.setTimeout(() => {
//         setCodeCopied(false);
//       }, 2000);
//     } catch (error) {
//       console.error("Failed to copy conversation code:", error);
//     }
//   }

//   if (loading) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-950">
//         <p className="text-slate-400">Loading conversation...</p>
//       </main>
//     );
//   }

//   if (error || !conversation) {
//     return (
//       <main className="flex min-h-screen flex-col items-center justify-center bg-[#f7f8fc] px-6 text-slate-950">
//         <div className="text-center">
//           <h1 className="text-2xl font-semibold">
//             Conversation not found
//           </h1>

//           <p className="mt-2 text-sm text-slate-400">
//             {error ||
//               "This conversation does not exist or you do not have access to it."}
//           </p>

//           <button
//             type="button"
//             onClick={() => navigate("/home")}
//             className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
//           >
//             Back to home
//           </button>
//         </div>
//       </main>
//     );
//   }

//   const isPrivate = conversation.isPrivate;
//   const joinCode = conversation.joinCode;

//   return (
//     <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
//       <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-5 sm:px-8 lg:px-10">
//         {/* Conversation top bar */}
//         <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200/70">
//           <div className="flex min-w-0 items-center gap-4">
//             {conversation.space ? (
//               <>
//                 <Link
//                   to={`/space/${conversation.space.id}`}
//                   className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-violet-600"
//                 >
//                   <ArrowLeft size={15} />
//                   Space
//                 </Link>

//                 <span className="text-slate-300">/</span>

//                 <span className="truncate text-sm font-medium text-slate-700">
//                   {conversation.space.name}
//                 </span>
//               </>
//             ) : (
//               <Link
//                 to="/home"
//                 className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-violet-600"
//               >
//                 <ArrowLeft size={15} />
//                 Home
//               </Link>
//             )}
//           </div>

//           <div className="flex items-center gap-3">
//             <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-violet-600 text-sm font-bold text-white">
//               {guest?.avatarUrl ? (
//                 <img
//                   src={guest.avatarUrl}
//                   alt=""
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 guest?.username?.charAt(0).toUpperCase() ?? "?"
//               )}

//               <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-[1.5px] border-white bg-emerald-400" />
//             </div>

//             <span className="hidden text-sm font-medium text-slate-700 sm:block">
//               {guest?.username}
//             </span>
//           </div>
//         </header>

//         {/* Conversation header */}
//         <section className="shrink-0 py-8">
//           <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
//             <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
//               {/* Main conversation information */}
//               <div className="min-w-0">
//                 <div className="flex items-center gap-2">
//                   <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-600">
//                     {isPrivate ? "Private conversation" : "Conversation"}
//                   </p>

//                   {isPrivate && (
//                     <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-violet-600">
//                       Private
//                     </span>
//                   )}
//                 </div>

//                 <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-slate-950">
//                   {conversation.title || "Untitled conversation"}
//                 </h1>

//                 <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
//                   <span>
//                     {conversation._count.participants}{" "}
//                     {conversation._count.participants === 1
//                       ? "participant"
//                       : "participants"}
//                   </span>

//                   <span>
//                     {conversation._count.messages}{" "}
//                     {conversation._count.messages === 1
//                       ? "message"
//                       : "messages"}
//                   </span>
//                 </div>
//               </div>

//               {/* Private conversation code */}
//               {isPrivate && joinCode && (
//                 <div className="w-full shrink-0 lg:w-auto">
//                   <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
//                     <div className="flex items-center gap-3">
//                       <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
//                         <MessageCircle size={18} />
//                       </div>

//                       <div className="min-w-0">
//                         <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-500">
//                           Invite code
//                         </p>

//                         <p className="mt-1 font-mono text-lg font-bold tracking-[0.18em] text-slate-950">
//                           {joinCode}
//                         </p>
//                       </div>

//                       <button
//                         type="button"
//                         onClick={handleCopyCode}
//                         className="ml-2 flex h-9 shrink-0 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-950 hover:text-white"
//                       >
//                         {codeCopied ? (
//                           <>
//                             <Check size={14} />
//                             Copied
//                           </>
//                         ) : (
//                           <>
//                             <Copy size={14} />
//                             Copy
//                           </>
//                         )}
//                       </button>
//                     </div>

//                     <p className="mt-3 text-[10px] leading-4 text-violet-500/80">
//                       Share this code with people you want to invite.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Join button */}
//               {!isParticipant && (
//                 <button
//                   type="button"
//                   onClick={handleJoin}
//                   disabled={joining}
//                   className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {joining ? "Joining..." : "Join conversation"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Chat area */}
//         <section className="flex min-h-0 flex-1 pb-8">
//           <div className="flex min-h-[500px] w-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
//             {/* Messages */}
//             <div className="flex flex-1 items-center justify-center p-8">
//               <div className="text-center">
//                 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
//                   <MessageCircle size={24} />
//                 </div>

//                 <h2 className="mt-5 text-lg font-semibold text-slate-950">
//                   No messages yet
//                 </h2>

//                 <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
//                   The conversation is ready. Message sending comes next.
//                 </p>
//               </div>
//             </div>

//             {/* Message input placeholder */}
//             <div className="border-t border-slate-200 p-4">
//               <div className="flex items-center gap-3">
//                 <input
//                   disabled
//                   placeholder="Message coming next..."
//                   className="h-12 flex-1 rounded-2xl border border-slate-200 bg-transparent px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
//                 />

//                 <button
//                   type="button"
//                   disabled
//                   className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white opacity-50"
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }