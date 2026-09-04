import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function AppLayout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-[#f4f5f9] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="
            absolute
            -left-[18rem]
            -top-[18rem]
            h-[42rem]
            w-[42rem]
            animate-[linkup-float_16s_ease-in-out_infinite]
            rounded-full
            bg-violet-400/[0.08]
            blur-[150px]
          "
        />

        {/* Cyan ambient glow */}
        <div
          className="
            absolute
            -right-[18rem]
            top-[18%]
            h-[38rem]
            w-[38rem]
            animate-[linkup-float-reverse_20s_ease-in-out_infinite]
            rounded-full
            bg-cyan-400/[0.07]
            blur-[160px]
          "
        />

        {/* Center glow */}
        <div
          className="
            absolute
            left-1/2
            top-[65%]
            h-[30rem]
            w-[30rem]
            -translate-x-1/2
            animate-[linkup-pulse_12s_ease-in-out_infinite]
            rounded-full
            bg-indigo-300/[0.045]
            blur-[150px]
          "
        />

        {/* Diagonal pattern */}
        <div
          className="
            absolute
            inset-0
            animate-[linkup-lines_24s_linear_infinite]
            opacity-[0.22]
          "
          style={{
            backgroundImage: `
              linear-gradient(
                120deg,
                transparent 0%,
                transparent 49.3%,
                rgba(124, 58, 237, 0.055) 49.7%,
                rgba(124, 58, 237, 0.055) 50.3%,
                transparent 50.7%,
                transparent 100%
              )
            `,
            backgroundSize: "52px 52px",
          }}
        />

        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(100, 116, 139, 0.13) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(100, 116, 139, 0.13) 1px,
                transparent 1px
              )
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Horizontal accent */}
        <div className="absolute left-0 right-0 top-[72px] h-px bg-gradient-to-r from-transparent via-violet-200/50 to-transparent" />

        {/* Middle line */}
        <div className="absolute left-0 right-0 top-[48%] h-px bg-gradient-to-r from-transparent via-slate-200/40 to-transparent" />

        {/* Left rail */}
        <div
          className="
            absolute
            bottom-0
            left-[6%]
            top-0
            hidden
            w-px
            bg-gradient-to-b
            from-transparent
            via-violet-200/25
            to-transparent
            2xl:block
          "
        />

        {/* Right rail */}
        <div
          className="
            absolute
            bottom-0
            right-[6%]
            top-0
            hidden
            w-px
            bg-gradient-to-b
            from-transparent
            via-cyan-200/25
            to-transparent
            2xl:block
          "
        />

        {/* Decorative dots */}
        <div className="absolute left-[7%] top-[18%] hidden h-1.5 w-1.5 animate-pulse rounded-full bg-violet-300/60 2xl:block" />

        <div className="absolute right-[7%] top-[34%] hidden h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/60 [animation-delay:1.2s] 2xl:block" />

        <div className="absolute bottom-[18%] left-[12%] hidden h-1 w-1 animate-pulse rounded-full bg-slate-300 [animation-delay:2s] 2xl:block" />
      </div>

      {/* =========================================================
          STICKY GLOBAL HEADER
      ========================================================== */}
      <header
        className={`
          sticky
          top-0
          z-[100]
          w-full
          transition-all
          duration-300
          ease-out
          ${
            scrolled
              ? "border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
              : "border-b border-slate-200/60 bg-white/90 backdrop-blur-xl"
          }
        `}
      >
        {/* Animated top accent */}
        <div
          className={`
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-[110]
            h-[2px]
            origin-left
            bg-gradient-to-r
            from-violet-500
            via-fuchsia-400
            to-cyan-400
            transition-transform
            duration-700
            ${
              scrolled
                ? "scale-x-100"
                : "scale-x-[0.35]"
            }
          `}
        />

        <Header />
      </header>

      {/* =========================================================
          CONTENT
      ========================================================== */}
      <section className="relative z-10">
        <div className="mx-auto min-h-[calc(100vh-72px)] max-w-[1680px] px-0 sm:px-4 sm:py-2 lg:px-6 xl:px-8">
          <div
            className="
              relative
              min-h-[calc(100vh-72px)]
              overflow-hidden
              bg-white
              shadow-[0_20px_70px_rgba(15,23,42,0.06)]
              sm:min-h-[calc(100vh-104px)]
              sm:rounded-[28px]
              sm:border
              sm:border-slate-200/70
            "
          >
            {/* Inner top highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-violet-200/70 to-transparent" />

            {/* Inner atmosphere */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="
                  absolute
                  -right-32
                  -top-32
                  h-72
                  w-72
                  animate-[linkup-float_18s_ease-in-out_infinite]
                  rounded-full
                  bg-violet-200/[0.045]
                  blur-[100px]
                "
              />

              <div
                className="
                  absolute
                  -bottom-40
                  -left-32
                  h-80
                  w-80
                  animate-[linkup-float-reverse_22s_ease-in-out_infinite]
                  rounded-full
                  bg-cyan-200/[0.035]
                  blur-[110px]
                "
              />
            </div>

            {/* Page */}
            <div className="relative z-10 animate-[linkup-page-in_500ms_ease-out_both]">
              <Outlet />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}
      <style>{`
        @keyframes linkup-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(35px, 25px, 0) scale(1.04);
          }
        }

        @keyframes linkup-float-reverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-30px, 35px, 0) scale(1.05);
          }
        }

        @keyframes linkup-pulse {
          0%,
          100% {
            opacity: 0.55;
            transform: translateX(-50%) scale(0.96);
          }

          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.05);
          }
        }

        @keyframes linkup-lines {
          0% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(26px, 18px, 0);
          }

          100% {
            transform: translate3d(52px, 36px, 0);
          }
        }

        @keyframes linkup-page-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}