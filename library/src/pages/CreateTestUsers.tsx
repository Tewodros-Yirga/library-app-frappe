import {
  Heading,
  Flex,
  Card,
  Text,
  Button,
  Select,
  Callout,
  Spinner,
} from "@radix-ui/themes";
import MainLayout from "../components/MainLayout";
import { useFrappePostCall } from "frappe-react-sdk";
import { useState } from "react";
import { toast } from 'sonner';

interface CreateUserForm {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  user_type: "member" | "librarian" | "manager";
}

const CreateTestUsers = () => {
  const [form, setForm] = useState<CreateUserForm>({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    user_type: "member",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { call: registerUserCall } = useFrappePostCall("library_app.api.register_user");
  const { call: createLibrarianCall } = useFrappePostCall("library_app.api.create_librarian_user");
  const { call: createManagerCall } = useFrappePostCall("library_app.api.create_manager_user");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let response;
      const params = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      };

      switch (form.user_type) {
        case "member":
          response = await registerUserCall(params);
          break;
        case "librarian":
          response = await createLibrarianCall(params);
          break;
        case "manager":
          response = await createManagerCall(params);
          break;
        default:
          throw new Error("Invalid user type");
      }

      toast.success(response?.message || "User created successfully!");
      setMessage({
        type: "success",
        text: response?.message || "User created successfully!",
      });

      // Reset form
      setForm({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        user_type: "member",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
      setMessage({
        type: "error",
        text: error.message || "Failed to create user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <Flex direction="column" gap="6">
        <Heading>Create Test Users</Heading>
        
        <Text color="gray" size="3">
          Use this page to create test users with different roles for testing the role-based access control system.
        </Text>

        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Heading size="4">Create New User</Heading>

              <Flex gap="4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Flex>

              <Flex gap="4">
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Flex>

              <Select.Root
                value={form.user_type}
                onValueChange={(value) => handleInputChange("user_type", value as any)}
              >
                <Select.Trigger placeholder="Select user type" />
                <Select.Content>
                  <Select.Item value="member">Library Member</Select.Item>
                  <Select.Item value="librarian">Librarian</Select.Item>
                  <Select.Item value="manager">Library Manager</Select.Item>
                </Select.Content>
              </Select.Root>

              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="2" /> : "Create User"}
              </Button>
            </Flex>
          </form>
        </Card>

        {message && (
          <Callout.Root color={message.type === "success" ? "green" : "red"}>
            <Callout.Text>{message.text}</Callout.Text>
          </Callout.Root>
        )}

        <Card className="p-6">
          <Heading size="4">Test User Credentials</Heading>
          <Text size="2" color="gray" className="mt-2">
            After creating users, you can log in with these credentials to test different roles:
          </Text>
          
          <Flex direction="column" gap="2" className="mt-4">
            <Text size="2">
              <strong>Library Member:</strong> Can browse books, view their loans and reservations
            </Text>
            <Text size="2">
              <strong>Librarian:</strong> Can manage books, members, loans, and reservations
            </Text>
            <Text size="2">
              <strong>Library Manager:</strong> Has all librarian permissions plus additional management features
            </Text>
          </Flex>
        </Card>
      </Flex>
    </MainLayout>
  );
};

export default CreateTestUsers; 