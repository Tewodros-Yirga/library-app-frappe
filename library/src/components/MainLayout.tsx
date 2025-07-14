// library-bench/apps/library_app/library/src/components/MainLayout.tsx
import { Box, Flex, Button, Heading, Text, Avatar, DropdownMenu } from "@radix-ui/themes";
import { useFrappeAuth } from "frappe-react-sdk";
import { useNavigate } from "react-router-dom";
import { RoleBasedNavigation } from "./RoleBasedNavigation";
import { useUserRoles } from "../hooks/useUserRoles";
import { useTheme } from "../App";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

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
      {/* Header/Navbar */}
      <Box className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <Flex justify="between" align="center" className="px-6 py-4">
          <Flex align="center" gap="4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <Heading size="5" className="text-gray-900 dark:text-gray-100">Library Management</Heading>
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
            <RoleBasedNavigation />
            {/* User Profile Section */}
            {currentUser && (
              <Flex align="center" gap="3">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Avatar 
                        size="2" 
                        fallback={currentUser.charAt(0).toUpperCase()}
                        className="bg-gradient-to-r from-blue-500 to-purple-500"
                      />
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

      {/* Main Content Area */}
      <Box className="flex-1 p-6">{children}</Box>

      {/* Footer */}
      <Box className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4 text-center">
        <Text size="2" className="text-gray-500 dark:text-gray-400">
          &copy; 2025 Library Management System. Built with ❤️ for better book management.
        </Text>
      </Box>
    </Flex>
  );
};

export default MainLayout;