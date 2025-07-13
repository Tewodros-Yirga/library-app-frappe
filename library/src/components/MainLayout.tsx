// library-bench/apps/library_app/library/src/components/MainLayout.tsx
import { Box, Flex, Button, Heading } from "@radix-ui/themes";
import { useFrappeAuth } from "frappe-react-sdk";
import { Link, useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { logout, currentUser } = useFrappeAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <Flex direction="column" className="min-h-screen">
      {/* Header/Navbar */}
      <Box className="bg-gray-800 text-white p-4">
        <Flex justify="between" align="center">
          <Heading size="6">Library Management</Heading>
          <Flex gap="4" align="center">
            <Link to="/" className="text-white hover:text-gray-300">
              Dashboard
            </Link>
            <Link to="/books" className="text-white hover:text-gray-300">
              Books
            </Link>
            <Link to="/members" className="text-white hover:text-gray-300">
              Members
            </Link>
            <Link to="/loans" className="text-white hover:text-gray-300">
              Loans
            </Link>
            <Link to="/reservations" className="text-white hover:text-gray-300">
              Reservations
            </Link>
            {/* Display current user if logged in */}
            {currentUser && (
              <span className="text-sm">Logged in as: {currentUser}</span>
            )}
            <Button onClick={handleLogout} variant="soft" color="red">
              Logout
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content Area */}
      <Box className="flex-1 p-8">{children}</Box>

      {/* Footer (Optional) */}
      <Box className="bg-gray-800 text-white p-4 text-center text-sm">
        &copy; 2025 Library Management System
      </Box>
    </Flex>
  );
};

export default MainLayout;