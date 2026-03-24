import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ClipboardIcon,
  DashboardIcon,
  UsersRoundIcon,
} from "../components/icons/animate";
import SystemBridgeLoader from "../components/common/SystemBridgeLoader";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "../lib/authToken";
import { useCurrentPerformanceUser } from "../hooks/useCurrentPerformanceUser";
import UserService from "../services/userApi";
import { useAppTheme } from "../context/AppThemeContext";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Checklist Templates", path: "/templates", icon: ClipboardIcon },
  { label: "Employee Checklists", path: "/employee-checklists", icon: UsersRoundIcon },
  { label: "Reports", path: "/reports", icon: ChartBarIcon },
];

const STUDENT_NAV_ITEMS = [
  { label: "My Dashboard", path: "/student/dashboard", icon: DashboardIcon },
  { label: "My Checklists", path: "/student/checklists", icon: ClipboardIcon },
];

const LOCAL_LMS_APP_URL = "http://localhost:5173";
const HOSTED_LMS_APP_URL = "https://mediatrix-lms-app-dev.web.app";

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");
const isLocalhostHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

const resolveDefaultLmsAppUrl = () => {
  if (typeof window === "undefined") {
    return HOSTED_LMS_APP_URL;
  }

  if (isLocalhostHost(window.location.hostname)) {
    return LOCAL_LMS_APP_URL;
  }

  return import.meta.env.VITE_LMS_APP_URL || HOSTED_LMS_APP_URL;
};

const LMS_APP_URL = resolveDefaultLmsAppUrl();

const toAbsoluteUrl = (url: string) => {
  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, window.location.origin).toString();
  }
};

export default function PerformanceLayout() {
  const { isDarkMode } = useAppTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [isReturningToLms, setIsReturningToLms] = useState(false);
  const [isBridgeInitialized, setIsBridgeInitialized] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const params = new URLSearchParams(window.location.search);
    return !params.has("accessToken") && !params.has("token");
  });
  const [isAuthReady, setIsAuthReady] = useState(() => Boolean(getStoredAuthToken()));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("accessToken") || searchParams.get("token");

    if (accessToken) {
      setStoredAuthToken(accessToken);
      searchParams.delete("accessToken");
      searchParams.delete("token");

      const sanitizedSearch = searchParams.toString();
      navigate(
        {
          pathname: location.pathname,
          search: sanitizedSearch ? `?${sanitizedSearch}` : "",
        },
        { replace: true }
      );
    }

    setIsBridgeInitialized(true);
  }, [location.pathname, location.search, navigate]);

  const { data: currentUser, isLoading: isCurrentUserLoading, isError: isCurrentUserError } =
    useCurrentPerformanceUser(isBridgeInitialized);

  useEffect(() => {
    const existingToken = getStoredAuthToken();
    if (existingToken) {
      setIsAuthReady(true);
      return;
    }

    const tokenFromCurrentUser = currentUser?.token;
    if (typeof tokenFromCurrentUser === "string" && tokenFromCurrentUser) {
      setStoredAuthToken(tokenFromCurrentUser);
      setIsAuthReady(true);
      return;
    }

    if (!isCurrentUserLoading) {
      setIsAuthReady(true);
    }
  }, [currentUser, isCurrentUserLoading]);

  const sidebarWidth = collapsed ? 80 : 272;
  const organizationName = currentUser?.organizationName ?? "Bento Workspace";
  const organizationLogo = currentUser?.organizationLogo ?? "";
  const userInitials = currentUser?.initials ?? "A";
  const userDisplayName = currentUser?.name ?? "Admin";
  const userRoleLabel = currentUser?.roleLabel ?? "Organization Admin";
  const isStudentWorkspace = Boolean(currentUser?.isStudent);
  const navItems = isStudentWorkspace ? STUDENT_NAV_ITEMS : ADMIN_NAV_ITEMS;
  const defaultDashboardPath = isStudentWorkspace ? "/student/dashboard" : "/dashboard";
  const hasStoredToken = Boolean(getStoredAuthToken());
  const hasCurrentUser = Boolean(currentUser?.id);
  const shouldRedirectUnauthorized =
    isBridgeInitialized &&
    !isCurrentUserLoading &&
    (isCurrentUserError || (!hasStoredToken && !hasCurrentUser));

  const shellBackgroundClass = isDarkMode
    ? "bg-[radial-gradient(circle_at_0%_0%,#0f172a_0%,#020617_100%)]"
    : "bg-[radial-gradient(circle_at_0%_0%,#dbeafe_0%,#f1f5f9_40%,#f8fafc_100%)]";
  const sidebarClass = isDarkMode
    ? "border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100 shadow-[0_28px_70px_-35px_rgba(2,6,23,0.95)]"
    : "border-slate-200/80 bg-white/90 text-slate-800 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]";
  const sidebarHeaderClass = isDarkMode ? "border-slate-800/80" : "border-slate-100";
  const sidebarTitleClass = isDarkMode ? "text-slate-100" : "text-slate-900";
  const sidebarSubtitleClass = isDarkMode ? "text-slate-400" : "text-slate-500";
  const navLinkActiveClass = isDarkMode
    ? "border border-blue-300/30 bg-blue-500/15 text-blue-100"
    : "border border-blue-100 bg-blue-50/90 text-blue-700";
  const navLinkIdleClass = isDarkMode
    ? "text-slate-300 hover:bg-white/5 hover:text-white"
    : "text-slate-600 hover:bg-white hover:text-slate-900";
  const navIconActiveClass = isDarkMode ? "text-blue-200" : "text-blue-600";
  const navIconIdleClass = isDarkMode ? "text-slate-400 group-hover:text-slate-100" : "text-slate-500 group-hover:text-slate-700";
  const profileCardClass = isDarkMode
    ? "border border-white/10 bg-white/5"
    : "border border-slate-200 bg-slate-50/80";
  const profileNameClass = isDarkMode ? "text-slate-100" : "text-slate-800";
  const profileRoleClass = isDarkMode ? "text-slate-400" : "text-slate-500";
  const sidebarToggleClass = isDarkMode
    ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-400/70 hover:text-blue-200"
    : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600";
  const mainShellClass = isDarkMode
    ? "border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 shadow-[0_28px_70px_-35px_rgba(2,6,23,0.95)]"
    : "border-white/70 bg-white/65 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)]";
  const headerShellClass = isDarkMode
    ? "border-slate-800 bg-slate-950/80"
    : "border-slate-200/80 bg-white/85";
  const menuButtonClass = isDarkMode
    ? "text-slate-300 hover:bg-white/10 hover:text-slate-100"
    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700";
  const backButtonClass = isDarkMode
    ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-blue-400/60 hover:text-white"
    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900";

  const lmsBackUrl = useMemo(() => {
    const lmsBaseUrl = trimTrailingSlashes(toAbsoluteUrl(LMS_APP_URL));
    const shouldForceLocalLms =
      typeof window !== "undefined" && isLocalhostHost(window.location.hostname);
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get("returnTo");

    if (returnTo) {
      try {
        const resolvedReturnTo = new URL(returnTo, `${lmsBaseUrl}/`);
        if (shouldForceLocalLms || isLocalhostHost(resolvedReturnTo.hostname)) {
          return `${lmsBaseUrl}${resolvedReturnTo.pathname}${resolvedReturnTo.search}${resolvedReturnTo.hash}`;
        }
        return resolvedReturnTo.toString();
      } catch {
        const path = returnTo.startsWith("/") ? returnTo : `/${returnTo}`;
        return `${lmsBaseUrl}${path}`;
      }
    }

    const orgCode = currentUser?.organizationCode ?? "";
    const role = (currentUser?.role || "admin").toString().toLowerCase();
    const fallbackPath = orgCode ? `/${orgCode}/${role}/dashboard` : "/login";

    return `${lmsBaseUrl}${fallbackPath}`;
  }, [location.search, currentUser?.organizationCode, currentUser?.role]);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [organizationLogo]);

  const renderBrandIcon = () => (
    <div
      className={`flex size-10 items-center justify-center overflow-hidden rounded-xl border text-blue-600 shadow-sm ${
        isDarkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"
      }`}
    >
      {organizationLogo && !logoLoadFailed ? (
        <img
          src={organizationLogo}
          alt={`${organizationName} logo`}
          className="h-full w-full object-cover"
          onError={() => setLogoLoadFailed(true)}
        />
      ) : (
        <DashboardIcon size={21} />
      )}
    </div>
  );

  const goBackToLms = () => {
    if (isReturningToLms) return;
    setIsReturningToLms(true);

    const timeoutPromise = new Promise((resolve) => {
      window.setTimeout(resolve, 1200);
    });

    Promise.race([
      UserService.logoutPerformanceSession().catch(() => null),
      timeoutPromise,
    ]).finally(() => {
      clearStoredAuthToken();
      window.location.assign(lmsBackUrl);
    });
  };

  if (!isBridgeInitialized || !isAuthReady) {
    return (
      <div
        className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900"
            : "bg-gradient-to-br from-slate-100 via-slate-50 to-cyan-50"
        }`}
      >
        <div
          className={`pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl ${
            isDarkMode ? "bg-blue-500/20" : "bg-blue-200/40"
          }`}
        />
        <div
          className={`pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full blur-3xl ${
            isDarkMode ? "bg-emerald-500/15" : "bg-emerald-200/40"
          }`}
        />
        <div className="relative z-10 w-full max-w-2xl">
          <SystemBridgeLoader
            title="Initializing secure session"
            subtitle="Setting up your access token for Performance APIs."
            fromLabel="ALMA LMS"
            toLabel="Performance System"
          />
        </div>
      </div>
    );
  }

  if (shouldRedirectUnauthorized && location.pathname !== "/unauthorized") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className={`flex h-screen gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3 ${shellBackgroundClass}`}>
      <m.aside
        animate={{ width: mobileOpen ? 272 : sidebarWidth }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={`relative z-30 hidden h-full flex-shrink-0 flex-col rounded-[28px] border lg:flex ${sidebarClass}`}
      >
        <div
          className={`flex cursor-pointer select-none items-center gap-3 border-b px-4 py-5 ${sidebarHeaderClass}`}
          onClick={() => navigate(defaultDashboardPath)}
        >
          {renderBrandIcon()}
          <AnimatePresence>
            {!collapsed && (
              <m.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className={`whitespace-nowrap text-sm font-semibold leading-tight ${sidebarTitleClass}`}>
                  Performance System
                </p>
                <p className={`whitespace-nowrap text-xs ${sidebarSubtitleClass}`}>{organizationName}</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1.5 px-2 py-4">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? navLinkActiveClass : navLinkIdleClass
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? navIconActiveClass : navIconIdleClass}`}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <m.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {label}
                      </m.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <AnimatePresence>
          {collapsed ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-3 mb-4 flex justify-center"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {userInitials}
              </div>
            </m.div>
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 ${profileCardClass}`}
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${profileNameClass}`}>{userDisplayName}</p>
                <p className={`truncate text-xs ${profileRoleClass}`}>{userRoleLabel}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-colors ${sidebarToggleClass}`}
        >
          {collapsed ? <MdChevronRight className="text-lg" /> : <MdChevronLeft className="text-lg" />}
        </button>
      </m.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <m.aside
              key="mobile-nav"
              initial={{ x: -272 }}
              animate={{ x: 0 }}
              exit={{ x: -272 }}
              transition={{ duration: 0.25 }}
              className={`fixed left-0 top-0 z-50 flex h-full w-[85vw] max-w-[292px] flex-col border-r lg:hidden ${
                isDarkMode
                  ? "border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              <div className={`flex items-center justify-between border-b px-4 py-5 ${sidebarHeaderClass}`}>
              <div className="flex items-center gap-3">
                  {renderBrandIcon()}
                  <div>
                    <p className={`text-sm font-semibold ${sidebarTitleClass}`}>Performance System</p>
                    <p className={`text-xs ${sidebarSubtitleClass}`}>{organizationName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 px-2 py-4">
                {navItems.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? navLinkActiveClass
                          : isDarkMode
                            ? "text-slate-300 hover:bg-white/5"
                            : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? navIconActiveClass : (isDarkMode ? "text-slate-400" : "text-slate-500")} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className={`mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 ${profileCardClass}`}>
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-medium ${profileNameClass}`}>{userDisplayName}</p>
                  <p className={`truncate text-xs ${profileRoleClass}`}>{userRoleLabel}</p>
                </div>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border backdrop-blur ${mainShellClass}`}>
        <header className={`sticky top-0 z-20 m-2 flex flex-shrink-0 items-center gap-4 rounded-2xl border px-3 py-3 backdrop-blur sm:px-4 lg:px-6 ${headerShellClass}`}>
          <button
            className={`rounded-lg p-1 transition-colors lg:hidden ${menuButtonClass}`}
            onClick={() => setMobileOpen(true)}
          >
            <HiOutlineMenu className="text-2xl" />
          </button>

          <button
            onClick={goBackToLms}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${backButtonClass}`}
          >
            Back to LMS
          </button>

          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-y-auto px-1 pb-1">
          <Outlet />
        </main>
      </div>

      {isReturningToLms && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/20 px-6 py-12 backdrop-blur-sm">
          <SystemBridgeLoader
            title="Returning to ALMA LMS"
            subtitle="Securing your session and taking you back to LMS."
            fromLabel="Performance System"
            toLabel="ALMA LMS"
          />
        </div>
      )}
    </div>
  );
}
