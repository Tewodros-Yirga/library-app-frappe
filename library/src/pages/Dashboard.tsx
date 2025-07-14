import { useUserRoles } from "../hooks/useUserRoles";
import LibrarianDashboard from "./LibrarianDashboard";
import MemberDashboard from "./MemberDashboard";
import AdminDashboard from "./AdminDashboard";
import MainLayout from "../components/MainLayout";
import { Spinner, Callout, Text } from "@radix-ui/themes";

export default function Dashboard() {
  const { isLibrarian, isMember, isAdmin, isLoading, error } = useUserRoles();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="3" />
          <Text className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</Text>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Callout.Root color="red">
          <Callout.Text>Error: {error}</Callout.Text>
        </Callout.Root>
      </MainLayout>
    );
  }

  if (isAdmin) return <AdminDashboard />;
  if (isLibrarian) return <LibrarianDashboard />;
  if (isMember) return <MemberDashboard />;
  return (
    <MainLayout>
      <Callout.Root color="yellow">
        <Callout.Text>No dashboard available for your role.</Callout.Text>
      </Callout.Root>
    </MainLayout>
  );
}