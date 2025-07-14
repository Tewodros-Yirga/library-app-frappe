// library-bench/apps/library_app/library/src/App.tsx
import { useState } from "react";
import { FrappeProvider, useFrappeAuth } from "frappe-react-sdk";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books/Books"; // For listing/viewing books
import Members from "./pages/Members/Members"; // For listing/viewing members
import Loans from "./pages/Loans/Loans"; // For listing/viewing loans
import BookForm from "./pages/Books/BookForm"; // For creating/editing books
import MemberForm from "./pages/Members/MemberForm"; // For creating/editing members
import LoanForm from "./pages/Loans/LoanForm"; // For creating loans
import Reservations from "./pages/Reservations/Reservations"; // For managing reservations
import MyLoans from "./pages/MyLoans"; // For members to view their loans
import MyReservations from "./pages/MyReservations"; // For members to view their reservations
import CreateTestUsers from "./pages/CreateTestUsers"; // For creating test users

// Import role-based components
import { RoleBasedRoute, LibrarianOnly, MemberOnly } from "./components/RoleBasedRoute";

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
    //@ts-ignore
    if (
      window.frappe?.boot?.versions?.frappe &&
      (window.frappe.boot.versions.frappe.startsWith("15") ||
        window.frappe.boot.versions.frappe.startsWith("16"))
    ) {
      //@ts-ignore
      return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
    }
    return import.meta.env.VITE_SITE_NAME;
  };

  return (
    <div className="App">
      <Theme appearance="dark" accentColor="iris" panelBackground="translucent">
        <FrappeProvider
          socketPort={import.meta.env.VITE_SOCKET_PORT}
          siteName={getSiteName()}
        >
          <Router>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
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
                    <LibrarianOnly>
                      <BookForm />
                    </LibrarianOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/books/edit/:name"
                element={
                  <PrivateRoute>
                    <LibrarianOnly>
                      <BookForm />
                    </LibrarianOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <PrivateRoute>
                    <LibrarianOnly>
                      <Members />
                    </LibrarianOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/members/new"
                element={
                  <PrivateRoute>
                    <LibrarianOnly>
                      <MemberForm />
                    </LibrarianOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/members/edit/:name"
                element={
                  <PrivateRoute>
                    <LibrarianOnly>
                      <MemberForm />
                    </LibrarianOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/loans"
                element={
                  <PrivateRoute>
                    <LibrarianOnly>
                      <Loans />
                    </LibrarianOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/loans/new"
                element={
                  <PrivateRoute>
                    <LibrarianOnly>
                      <LoanForm />
                    </LibrarianOnly>
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
                    <MemberOnly>
                      <MyLoans />
                    </MemberOnly>
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-reservations"
                element={
                  <PrivateRoute>
                    <MemberOnly>
                      <MyReservations />
                    </MemberOnly>
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

              {/* Redirect any unmatched route to login (or a 404 page) */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </FrappeProvider>
      </Theme>
    </div>
  );
}

export default App;
