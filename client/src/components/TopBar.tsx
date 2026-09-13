// import { Link, useLocation } from "react-router-dom";
// import { useState } from "react";
// import { useAuth } from "../context/useAuth";

// function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className={className}
//     >
//       <circle cx="11" cy="11" r="7" />
//       <path d="m20 20-4-4" />
//     </svg>
//   );
// }

// function SunIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className="h-[17px] w-[17px]"
//     >
//       <circle cx="12" cy="12" r="4" />
//       <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
//     </svg>
//   );
// }

// function MoonIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className="h-[17px] w-[17px]"
//     >
//       <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.6 8.6 0 1 0 11 11Z" />
//     </svg>
//   );
// }

// function PlusIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       className="h-4 w-4"
//     >
//       <path d="M12 5v14M5 12h14" />
//     </svg>
//   );
// }

// function BellIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className="h-[17px] w-[17px]"
//     >
//       <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
//       <path d="M10 21h4" />
//     </svg>
//   );
// }

// function ChevronDownIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className="h-3.5 w-3.5"
//     >
//       <path d="m6 9 6 6 6-6" />
//     </svg>
//   );
// }

// function CommandIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       className="h-3.5 w-3.5"
//     >
//       <path d="M18 9a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12Z" />
//     </svg>
//   );
// }

// export default function TopBar() {
//   const { guest } = useAuth();
//   const location = useLocation();

//   const [search, setSearch] = useState("");
//   const [mobileSearch, setMobileSearch] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const username =
//     guest?.username || localStorage.getItem("linkup_username") || "Guest";

//   const avatarLetter = username.charAt(0).toUpperCase();

//   const getPageContext = () => {
//     if (location.pathname === "/app") {
//       return {
//         eyebrow: "Workspace",
//         title: "Home",
//       };
//     }

//     if (location.pathname.includes("/space/")) {
//       return {
//         eyebrow: "Community",
//         title: "Space",
//       };
//     }

//     if (location.pathname.includes("profile")) {
//       return {
//         eyebrow: "Account",
//         title: "Profile",
//       };
//     }

//     if (location.pathname.includes("settings")) {
//       return {
//         eyebrow: "Preferences",
//         title: "Settings",
//       };
//     }

//     return {
//       eyebrow: "LinkUp",
//       title: "Workspace",
//     };
//   };

//   const context = getPageContext();

//   const today = new Intl.DateTimeFormat("en-US", {
//     weekday: "short",
//     month: "short",
//     day: "numeric",
//   }).format(new Date());

//   return (
//     <>
//       <header
//         className={`relative z-50 flex min-h-[68px] items-center gap-3 border-b px-3 transition-colors duration-300 sm:px-5 border-slate-200/80 bg-[#f8f9fc]`}
//       >
//         {/* -------------------------------------------------------
//             MOBILE BRAND
//         -------------------------------------------------------- */}

//         <Link
//           to="/app"
//           className="group flex shrink-0 items-center gap-2.5 lg:hidden"
//         >
//           <div
//             className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[11px] text-sm font-black transition duration-300 group-hover:scale-105 bg-slate-950 text-white`}
//           >
//             L
//             <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-violet-400/60 blur-md" />
//           </div>

//           <div className="hidden xs:block">
//             <p className="text-sm font-bold tracking-tight">LinkUp</p>
//             <p
//               className={`text-[9px] uppercase tracking-[0.18em] text-slate-400`}
//             >
//               Connect
//             </p>
//           </div>
//         </Link>

//         {/* -------------------------------------------------------
//             PAGE CONTEXT
//         -------------------------------------------------------- */}

//         <div className="hidden items-center gap-3 lg:flex">
//           <div>
//             <p
//               className={`text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400`}
//             >
//               {context.eyebrow}
//             </p>

//             <div className="mt-0.5 flex items-center gap-2">
//               <h1 className="text-sm font-semibold tracking-tight">
//                 {context.title}
//               </h1>

//               <span
//                 className={`h-1 w-1 rounded-full bg-slate-300`}
//               />

//               <span
//                 className={`text-[10px] text-slate-400`}
//               >
//                 {today}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* -------------------------------------------------------
//             CENTER SEARCH / COMMAND DOCK
//         -------------------------------------------------------- */}

//         <div className="mx-auto hidden w-full max-w-[460px] md:block">
//           <div
//             className={`group relative flex h-11 items-center rounded-[14px] border transition-all duration-200 border-slate-200 bg-white hover:border-slate-300 focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/[0.06]`}
//           >
//             <div
//               className={`ml-3.5 flex shrink-0 text-slate-400`}
//             >
//               <SearchIcon />
//             </div>

//             <input
//               type="search"
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//               placeholder="Search spaces, conversations..."
//               aria-label="Search LinkUp"
//               className={`h-full w-full bg-transparent px-3 text-sm outline-none text-slate-900 placeholder:text-slate-400`}
//             />

//             {search ? (
//               <button
//                 type="button"
//                 onClick={() => setSearch("")}
//                 className={`mr-2 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-slate-400 hover:bg-slate-100`}
//               >
//                 ×
//               </button>
//             ) : (
//               <div
//                 className={`mr-2 hidden items-center gap-1 rounded-lg border px-1.5 py-1 text-[9px] sm:flex border-slate-200 bg-slate-50 text-slate-400`}
//               >
//                 <CommandIcon />
//                 <span>K</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* -------------------------------------------------------
//             RIGHT ACTION AREA
//         -------------------------------------------------------- */}

//         <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
//           {/* Connection status */}

//           <div
//             className={`hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex bg-emerald-50 text-emerald-600`}
//             title="Connected"
//           >
//             <span className="relative flex h-2 w-2">
//               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
//               <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
//             </span>

//             <span className="text-[10px] font-semibold">Online</span>
//           </div>

//           {/* Mobile search */}

//           <button
//             type="button"
//             onClick={() => setMobileSearch((value) => !value)}
//             aria-label="Search"
//             className={`flex h-10 w-10 items-center justify-center rounded-xl border transition border-slate-200 bg-white text-slate-500 hover:bg-slate-50md:hidden`}
//           >
//             <SearchIcon />
//           </button>

//           {/* Create */}

//           <Link
//             to="/app"
//             className={`hidden h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition duration-200 sm:flex bg-slate-950 text-white shadow-sm hover:bg-slate-800"`}
//           >
//             <PlusIcon />
//             <span>New space</span>
//           </Link>

//           {/* Notifications */}

//           <button
//             type="button"
//             aria-label="Notifications"
//             className={`relative hidden h-10 w-10 items-center justify-center rounded-xl border transition md:flex border-slate-200 bg-white text-slate-500 hover:bg-slate-50`}
//           >
//             <BellIcon />

//             <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
//           </button>

//           {/* Profile */}

//           <div className="relative">
//             <button
//               type="button"
//               onClick={() => setProfileOpen((value) => !value)}
//               className={`group flex h-10 items-center gap-2 rounded-xl border pl-1 pr-2 transition ${
//                 isLight
//                   ? "border-slate-200 bg-white hover:border-slate-300"
//                   : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]"
//               }`}
//             >
//               <span className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-[11px] font-bold text-white shadow-sm">
//                 {avatarLetter}

//                 <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
//               </span>

//               <span className="hidden max-w-[80px] truncate text-xs font-semibold lg:block">
//                 {username}
//               </span>

//               <ChevronDownIcon />
//             </button>

//             {profileOpen && (
//               <div
//                 className={`absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-2xl border p-1.5 shadow-2xl ${
//                   isLight
//                     ? "border-slate-200 bg-white shadow-slate-300/30"
//                     : "border-white/[0.08] bg-[#11121a] shadow-black/40"
//                 }`}
//               >
//                 <div
//                   className={`mb-1 rounded-xl px-3 py-2.5 ${
//                     isLight ? "bg-slate-50" : "bg-white/[0.035]"
//                   }`}
//                 >
//                   <p className="truncate text-xs font-semibold">{username}</p>

//                   <p
//                     className={`mt-0.5 text-[10px] ${
//                       isLight ? "text-slate-400" : "text-white/30"
//                     }`}
//                   >
//                     Your LinkUp account
//                   </p>
//                 </div>

//                 <Link
//                   to="/profile"
//                   onClick={() => setProfileOpen(false)}
//                   className={`block rounded-xl px-3 py-2.5 text-xs font-medium transition ${
//                     isLight
//                       ? "text-slate-600 hover:bg-slate-50"
//                       : "text-white/60 hover:bg-white/[0.05]"
//                   }`}
//                 >
//                   Profile
//                 </Link>

//                 <Link
//                   to="/settings"
//                   onClick={() => setProfileOpen(false)}
//                   className={`block rounded-xl px-3 py-2.5 text-xs font-medium transition ${
//                     isLight
//                       ? "text-slate-600 hover:bg-slate-50"
//                       : "text-white/60 hover:bg-white/[0.05]"
//                   }`}
//                 >
//                   Settings
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* -------------------------------------------------------
//             MOBILE SEARCH PANEL
//         -------------------------------------------------------- */}

//         {mobileSearch && (
//           <div
//             className={`absolute left-3 right-3 top-[calc(100%+8px)] z-50 rounded-2xl border p-3 shadow-2xl md:hidden ${
//               isLight
//                 ? "border-slate-200 bg-white"
//                 : "border-white/[0.08] bg-[#11121a]"
//             }`}
//           >
//             <div
//               className={`flex h-11 items-center gap-3 rounded-xl border px-3 ${
//                 isLight
//                   ? "border-slate-200 bg-slate-50"
//                   : "border-white/[0.07] bg-white/[0.03]"
//               }`}
//             >
//               <SearchIcon
//                 className={`h-4 w-4 ${
//                   isLight ? "text-slate-400" : "text-white/30"
//                 }`}
//               />

//               <input
//                 autoFocus
//                 type="search"
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//                 placeholder="Search spaces..."
//                 className={`w-full bg-transparent text-sm outline-none ${
//                   isLight
//                     ? "text-slate-900 placeholder:text-slate-400"
//                     : "text-white placeholder:text-white/25"
//                 }`}
//               />

//               {search && (
//                 <button
//                   type="button"
//                   onClick={() => setSearch("")}
//                   className={isLight ? "text-slate-400" : "text-white/30"}
//                 >
//                   ×
//                 </button>
//               )}
//             </div>

//             <div
//               className={`mt-3 flex items-center gap-2 px-1 text-[10px] ${
//                 isLight ? "text-slate-400" : "text-white/25"
//               }`}
//             >
//               <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
//               Search your spaces and conversations
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Mobile quick action */}

//       <div className="pointer-events-none fixed bottom-5 right-5 z-40 sm:hidden">
//         <Link
//           to="/app"
//           className={`pointer-events-auto flex h-12 items-center gap-2 rounded-2xl px-4 text-xs font-bold shadow-xl transition hover:-translate-y-1 ${
//             isLight
//               ? "bg-slate-950 text-white shadow-slate-300/30"
//               : "bg-white text-slate-950 shadow-black/40"
//           }`}
//         >
//           <PlusIcon />
//           New space
//         </Link>
//       </div>
//     </>
//   );
// }
