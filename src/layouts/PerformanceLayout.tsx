import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { motion as m, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ChartBarIcon,
  ClipboardIcon,
  DashboardIcon,
  UsersRoundIcon,
} from "../components/icons/animate";
import UserService from "../services/userApi";
import SystemBridgeLoader from "../components/common/SystemBridgeLoader";
import { setStoredAuthToken } from "../lib/authToken";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Checklist Templates", path: "/templates", icon: ClipboardIcon },
  { label: "Employee Checklists", path: "/employee-checklists", icon: UsersRoundIcon },
  { label: "Reports", path: "/reports", icon: ChartBarIcon },
];

const DEFAULT_LMS_APP_URL = "https://mediatrix-lms-app-dev.web.app";
const LMS_APP_URL = import.meta.env.VITE_LMS_APP_URL || DEFAULT_LMS_APP_URL;

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");
const isLocalhostHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

const toAbsoluteUrl = (url: string) => {
  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, window.location.origin).toString();
  }
};

export default function PerformanceLayout() {
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

  const { data: currentUser } = useQuery({
    queryKey: ["user", "current", "organization-branding"],
    queryFn: () => UserService.getCurrentUser(),
    staleTime: 1000 * 60 * 5,
    enabled: isBridgeInitialized,
  });

  const sidebarWidth = collapsed ? 80 : 272;
  const sourceUser =
    currentUser?.user && typeof currentUser.user === "object"
      ? currentUser.user
      : currentUser;

  const organizationName = useMemo(
    () =>
      sourceUser?.organization?.name ??
      sourceUser?.org?.name ??
      sourceUser?.organizationName ??
      "Bento Workspace",
    [sourceUser]
  );

  const organizationLogo = useMemo(
    () =>
      sourceUser?.organization?.branding?.logo ??
      sourceUser?.organization?.logo ??
      sourceUser?.org?.branding?.logo ??
      sourceUser?.org?.logo ??
      "",
    [sourceUser]
  );

  const lmsBackUrl = useMemo(() => {
    const lmsBaseUrl = trimTrailingSlashes(toAbsoluteUrl(LMS_APP_URL));
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get("returnTo");

    if (returnTo) {
      try {
        const resolvedReturnTo = new URL(returnTo, `${lmsBaseUrl}/`);
        if (isLocalhostHost(resolvedReturnTo.hostname)) {
          return `${lmsBaseUrl}${resolvedReturnTo.pathname}${resolvedReturnTo.search}${resolvedReturnTo.hash}`;
        }
        return resolvedReturnTo.toString();
      } catch {
        const path = returnTo.startsWith("/") ? returnTo : `/${returnTo}`;
        return `${lmsBaseUrl}${path}`;
      }
    }

    const orgCode =
      sourceUser?.organization?.code ??
      sourceUser?.org?.code ??
      sourceUser?.organizationCode ??
      "";
    const role = (sourceUser?.role || "admin").toString().toLowerCase();
    const fallbackPath = orgCode ? `/${orgCode}/${role}/dashboard` : "/login";

    return `${lmsBaseUrl}${fallbackPath}`;
  }, [location.search, sourceUser]);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [organizationLogo]);

  const renderBrandIcon = () => (
    <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
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
    window.setTimeout(() => {
      window.location.assign(lmsBackUrl);
    }, 900);
  };

  if (!isBridgeInitialized) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-cyan-50 px-6 py-12">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
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

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_0%_0%,#dbeafe_0%,#f8fafc_35%,#eef2ff_100%)]">
      <m.aside
        animate={{ width: mobileOpen ? 272 : sidebarWidth }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative z-30 hidden h-full flex-shrink-0 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur lg:flex"
      >
        <div
          className="flex cursor-pointer select-none items-center gap-3 border-b border-slate-100 px-4 py-5"
          onClick={() => navigate("/dashboard")}
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
                <p className="whitespace-nowrap text-sm font-semibold leading-tight text-slate-900">
                  Performance System
                </p>
                <p className="whitespace-nowrap text-xs text-slate-500">{organizationName}</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1.5 px-2 py-4">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border border-blue-100 bg-blue-50/90 text-blue-700"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"}`}
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
          {!collapsed && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-3 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
            >
              <p className="text-xs font-semibold text-amber-700">Mock Mode</p>
              <p className="text-xs text-amber-600">Using in-memory data</p>
            </m.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-600"
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
              className="fixed left-0 top-0 z-50 flex h-full w-[85vw] max-w-[292px] flex-col border-r border-slate-200 bg-white lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-5">
              <div className="flex items-center gap-3">
                  {renderBrandIcon()}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Performance System</p>
                    <p className="text-xs text-slate-500">{organizationName}</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-700">
                  <HiX className="text-xl" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 px-2 py-4">
                {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? "border border-blue-100 bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-500"} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="mx-3 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-semibold text-amber-700">Mock Mode</p>
                <p className="text-xs text-amber-600">Using in-memory data</p>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex flex-shrink-0 items-center gap-4 border-b border-slate-200/70 bg-white/80 px-3 py-3 backdrop-blur sm:px-4 lg:px-6">
          <button
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <HiOutlineMenu className="text-2xl" />
          </button>

          <button
            onClick={goBackToLms}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            Back to LMS
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              A
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">Admin</p>
              <p className="text-xs text-slate-500">Organization Admin</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
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
