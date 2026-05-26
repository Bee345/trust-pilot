# TrustBase Frontend — Feature Log

## Sprint 2 — Frontend Completion (2026-05-24)

### Files Created
- `src/lib/api.js` — updated: 429, 500, network error handling added
- `src/lib/socket.js` — Socket.io singleton with connectSocket/getSocket/disconnectSocket; JWT passed in auth handshake
- `src/context/AuthContext.jsx` — provides isAuthenticated, user, login(), logout() via Context; connects/disconnects socket on auth state change
- `src/hooks/useAuth.js` — consumes AuthContext
- `src/hooks/useReports.js` — wraps GET /api/reviews and GET /api/reviews/mine
- `src/hooks/useVerification.js` — wraps GET /api/verify/status and POST /api/verify/initiate
- `src/routes/ProtectedRoute.jsx` — redirects to /login when unauthenticated
- `src/routes/AppRoutes.jsx` — all route definitions in one file
- `src/components/ui/Button.jsx` — atomic button (primary, secondary, ghost variants, WCAG compliant)
- `src/components/ui/Input.jsx` — atomic input with label, error, aria-describedby
- `src/components/ui/Card.jsx` — atomic card wrapper
- `src/components/ui/Spinner.jsx` — accessible loading spinner (role="status", aria-label)
- `src/utils/format.js` — formatNaira, formatPhone, timeAgo
- `src/utils/validators.js` — isValidPhone, isValidPassword
- `frontend/docs/` — 5 stub docs created

### Files Modified
- `src/App.jsx` — refactored to use AuthProvider + BrowserRouter + AppRoutes
- `src/main.jsx` — Sprint 5 comment added for Sentry ErrorBoundary
- `src/pages/Login.jsx` — removed onLogin prop, uses useAuth hook
- `src/pages/Signup.jsx` — removed onLogin prop, uses useAuth hook
- `src/pages/MyReports.jsx` — replaced mock data with useReports({ mine: true }) hook
- `src/pages/Notifications.jsx` — replaced mock data with live Socket.io new_report events
- Multiple pages — WCAG: aria-live on loading states, aria-label on icon-only buttons, role="alert" on error messages

### Notes
- Socket connects on login with JWT token in auth handshake; disconnects on logout
- Hard redirect on 401 in api.js is intentional (AuthContext cannot be accessed from non-React module)
- Sentry ErrorBoundary deferred to Sprint 5 (awaiting VITE_SENTRY_DSN provisioning)
