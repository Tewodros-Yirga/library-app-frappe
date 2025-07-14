// library-bench/apps/library_app/library/src/App.tsx
import { useState, useEffect, createContext, useContext } from "react";
import { FrappeProvider, useFrappeAuth } from "frappe-react-sdk";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import type { JSX } from 'react';

// Import pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books/Books"; // For listing/viewing books
import Members from "./pages/Members/Members"; // For listing/viewing members
import Loans from "./pages/Loans/Loans"; // For listing/viewing loans
import BookForm from "./pages/Books/BookForm"; // For creating/editing books
import BookDetail from './pages/Books/BookDetail';
import LoanReturn from "./pages/Loans/LoanReturn";
import MemberForm from "./pages/Members/MemberForm"; // For creating/editing members
import LoanForm from "./pages/Loans/LoanForm"; // For creating loans
import Reservations from "./pages/Reservations/Reservations"; // For managing reservations
import MyLoans from "./pages/MyLoans"; // For members to view their loans
import MyReservations from "./pages/MyReservations"; // For members to view their reservations
import CreateTestUsers from "./pages/CreateTestUsers"; // For creating test users

// Import role-based components
import { RoleBasedRoute, LibrarianOnly, MemberOnly } from "./components/RoleBasedRoute";

// Theme context
const ThemeContext = createContext({
  theme: "dark",
  setTheme: (t: "dark" | "light") => {},
});
export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = "library_theme";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
  });
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
};

// A simple wrapper component to protect routes
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { currentUser, isLoading } = useFrappeAuth();

  if (isLoading) {
    // You might want to show a loading spinner here
    return <div>Loading authentication...</div>;
  }

  // If user is not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // Helper to get the site name, robust for Frappe v15/16
  const getSiteName = () => {
    // @ts-ignore
    if (
      // @ts-ignore
      window.frappe?.boot?.versions?.frappe &&
      // @ts-ignore
      (window.frappe.boot.versions.frappe.startsWith("15") ||
        window.frappe.boot.versions.frappe.startsWith("16"))
    ) {
      // @ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
    }
    return import.meta.env.VITE_SITE_NAME;
  };

  // Use theme context
  return (
    <ThemeProvider>
      <ThemeConsumerApp getSiteName={getSiteName} />
    </ThemeProvider>
  );
}

function ThemeConsumerApp({ getSiteName }: { getSiteName: () => string }) {
  const { theme } = useTheme();
  // Only allow 'dark' or 'light' for Radix Theme
  const radixTheme: 'dark' | 'light' = theme === 'dark' ? 'dark' : 'light';
  return (
    <Theme appearance={radixTheme} accentColor="iris" panelBackground="translucent">
      <FrappeProvider
        socketPort={import.meta.env.VITE_SOCKET_PORT}
        siteName={getSiteName()}
      >
        <Router>
          <Routes>
            {/* Login page always dark, no theme switch */}
            <Route path="/login" element={<Login alwaysDark />} />
            {/* All other pages use theme context */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/books"
              element={
                <PrivateRoute>
                  <Books />
                </PrivateRoute>
              }
            />
            <Route
              path="/books/new"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <BookForm />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route path="/books/:name" element={
              <PrivateRoute>
                  <RoleBasedRoute >
                  <BookDetail />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            <Route
              path="/books/:name/edit"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <BookForm />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/members"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <Members />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/members/new"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <MemberForm />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/members/edit/:name"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <MemberForm />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <Loans />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route 
            path="/loans/return/:name" 
            element={
              <PrivateRoute>
                <RoleBasedRoute>
                  <LoanReturn />
                </RoleBasedRoute>
              </PrivateRoute>
            } />
            <Route
              path="/loans/new"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <LoanForm />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <PrivateRoute>
                  <Reservations />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-loans"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <MyLoans />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-reservations"
              element={
                <PrivateRoute>
                  <RoleBasedRoute>
                    <MyReservations />
                  </RoleBasedRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/create-test-users"
              element={
                <PrivateRoute>
                  <CreateTestUsers />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </FrappeProvider>
    </Theme>
  );
}

export default App;
