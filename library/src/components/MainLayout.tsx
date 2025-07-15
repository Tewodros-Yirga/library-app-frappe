// library-bench/apps/library_app/library/src/components/MainLayout.tsx
import { Box, Flex, Button, Heading, Text, Avatar, DropdownMenu } from "@radix-ui/themes";
import { useFrappeAuth } from "frappe-react-sdk";
import { useNavigate } from "react-router-dom";
import { RoleBasedNavigation } from "./RoleBasedNavigation";
import { useUserRoles } from "../hooks/useUserRoles";
import { useTheme } from "../App";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { logout, currentUser } = useFrappeAuth();
  const { isLibrarian, isMember, isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const getUserRoleDisplay = () => {
    if (isAdmin) return "Admin";
    if (isLibrarian) return "Librarian";
    if (isMember) return "Member";
    return "User";
  };

  const getRoleColor = () => {
    if (isAdmin) return "red";
    if (isLibrarian) return "blue";
    if (isMember) return "green";
    return "gray";
  };

  return (
    <Flex direction="column" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header/Navbar - sticky on mobile */}
      <Box className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 w-full z-50 px-2 md:px-6 py-2 md:py-4">
        <Flex justify="between" align="center" className="max-w-7xl mx-auto">
          <Flex align="center" gap="4">
            {/* Hamburger menu for mobile */}
            <div className="md:hidden mr-2">
              {/* The RoleBasedNavigation already handles mobile menu, so just render it here */}
              <RoleBasedNavigation />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <Heading size="5" className="text-gray-900 dark:text-gray-100 text-base md:text-lg">Library Management System</Heading>
            </div>
          </Flex>
          <Flex gap="4" align="center">
            {/* Theme Switcher */}
            <Button
              variant="ghost"
              className="rounded-full p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <SunIcon width={20} height={20} /> : <MoonIcon width={20} height={20} />}
            </Button>
            {/* Desktop navigation */}
            <div className="hidden md:block">
              <RoleBasedNavigation />
            </div>
            {/* User Profile Section - avatar only on mobile */}
            {currentUser && (
              <Flex align="center" gap="3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 md:p-2">
                      <Avatar 
                        size="2" 
                        fallback={currentUser.charAt(0).toUpperCase()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                      {/* Show name and role only on desktop */}
                      <Flex direction="column" align="start" className="hidden md:flex">
                        <Text size="2" className="font-medium text-gray-900 dark:text-gray-100">{currentUser}</Text>
                        <Text size="1" className={`text-${getRoleColor()}-600 font-medium`}>
                          {getUserRoleDisplay()}
                        </Text>
                      </Flex>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={handleLogout} className="text-red-600">
                      Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Main Content Area - add top and bottom padding to avoid overlap with sticky header/footer */}
      <Box className="flex-1 pt-20 md:pt-0 pb-16 md:pb-0 px-2 md:px-6">
        {children}
      </Box>

      {/* Footer - sticky on mobile if content does not overflow */}
      <Box className="mt-10 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-3 md:py-4 text-center fixed bottom-0 left-0 w-full z-40 md:static md:w-auto md:z-auto shadow md:shadow-none">
        <Text size="2" className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          &copy; 2025 Library Management System. Built with ❤️ for better book management.
        </Text>
      </Box>
    </Flex>
  );
};

export default MainLayout;