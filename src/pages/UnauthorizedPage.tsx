import { motion as m } from "framer-motion";

const LOCAL_LMS_APP_URL = "http://localhost:5173";
const HOSTED_LMS_APP_URL = "https://mediatrix-lms-app-dev.web.app";

const isLocalhostHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

const resolveLmsAppUrl = () => {
  if (typeof window === "undefined") {
    return HOSTED_LMS_APP_URL;
  }

  if (isLocalhostHost(window.location.hostname)) {
    return LOCAL_LMS_APP_URL;
  }

  return import.meta.env.VITE_LMS_APP_URL || HOSTED_LMS_APP_URL;
};

export default function UnauthorizedPage() {
  const lmsAppUrl = resolveLmsAppUrl();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-cyan-50 px-6 py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />

      <m.section
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)] sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-transparent to-blue-50/50" />
        <div className="relative z-10">
          <div className="mb-5 flex justify-center">
            <m.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                <circle cx="60" cy="60" r="52" fill="#eff6ff" />
                <path
                  d="M60 22L90 34V58C90 78 77 96 60 102C43 96 30 78 30 58V34L60 22Z"
                  fill="#dbeafe"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
                <rect x="44" y="52" width="32" height="28" rx="6" fill="#1d4ed8" />
                <path
                  d="M50 52V46C50 40.4772 54.4772 36 60 36C65.5228 36 70 40.4772 70 46V52"
                  stroke="#bfdbfe"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="66" r="4" fill="#e0f2fe" />
              </svg>
              <m.span
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 1.7, repeat: Infinity }}
                className="absolute -right-1 -top-1 inline-flex h-4 w-4 rounded-full bg-rose-500"
              />
            </m.div>
          </div>

          <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            Not Authorized
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
            You are not authenticated for the Performance System. Please go back to LMS
            and open this page again with a valid session.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.assign(lmsAppUrl)}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Back to LMS
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Retry Session
            </button>
          </div>
        </div>
      </m.section>
    </div>
  );
}
