import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { lazy, Suspense } from "react";

// Eagerly loaded (critical path)
import Home from "./pages/Home";
import Auth from "./pages/Auth";

// Lazy loaded pages
const Browse = lazy(() => import("./pages/Browse"));
const Feed = lazy(() => import("./pages/Feed"));
const CommunityNeeds = lazy(() => import("./pages/CommunityNeeds"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Messages = lazy(() => import("./pages/Messages"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Guards
import RequireAuth from "./components/guards/RequireAuth";
import RequireAdmin from "./components/guards/RequireAdmin";

// Layouts
import AppShell from "./components/AppShell";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/* ─── Full-screen loader ──────────────────────────────────────────────── */
const AppLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      <div className="absolute inset-[6px] rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-primary font-bold text-sm">S</span>
      </div>
    </div>
    <p className="text-xs text-muted-foreground font-medium tracking-wide animate-pulse">
      Verifying session…
    </p>
  </div>
);

/* ─── Route-level Suspense fallback ───────────────────────────────────── */
const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-3 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary animate-spin" />
    </div>
  </div>
);

/* ─── Smart "/" - redirects based on auth role ────────────────────────── */
const SmartHome = () => {
  const { authStatus, isAdmin } = useAuth();
  if (authStatus === "loading") return null;
  if (authStatus === "authenticated") {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/feed"} replace />;
  }
  return <Home />;
};

/* ─── Route tree ──────────────────────────────────────────────────────── */
const AppRoutes = () => {
  const { authStatus } = useAuth();

  // Block ALL route rendering while auth is initialising
  if (authStatus === "loading") return <AppLoader />;

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Routes without AppShell (Auth, Admin, etc) */}
        <Route path="/auth/login" element={<Auth />} />
        <Route path="/auth/signup" element={<Auth />} />
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />

        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/:tab"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Routes with AppShell */}
        <Route element={<AppShell />}>
          {/* Smart landing */}
          <Route path="/" element={<SmartHome />} />

          {/* Public */}
          <Route path="/browse" element={<Browse />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/community-needs" element={<CommunityNeeds />} />

          {/* Protected – any authenticated user */}
          <Route
            path="/feed"
            element={
              <RequireAuth>
                <Feed />
              </RequireAuth>
            }
          />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreatePost />
              </RequireAuth>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireAuth>
                <Messages />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          {/* Legacy /dashboard redirect */}
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />

          {/* Not Found catch-all wrapped in Shell so they at least get nav/footer */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

/* ─── Root ────────────────────────────────────────────────────────────── */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
