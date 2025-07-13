// library-bench/apps/library_app/library/src/pages/auth/Login.tsx
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useFrappeAuth } from "frappe-react-sdk";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<any>("");

  const { currentUser, login, isLoading } = useFrappeAuth(); // Removed logout as it's not needed here
  const navigate = useNavigate(); // Initialize navigate

  // Effect to redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/"); // Redirect to dashboard if currentUser exists
    }
  }, [currentUser, navigate]); // Depend on currentUser and navigate

  const onSubmit = () => {
    setLoginError(""); // Clear previous errors
    login({
      username: username,
      password: password,
    })
      .then((res) => {
        console.log("Login successful:", res);
        // Redirection is now handled by the useEffect hook
      })
      .catch((err) => {
        console.error("Login failed:", err);
        setLoginError(err);
      });
  };

  // If user is already logged in or logging in, we don't need to show the form
  if (currentUser || isLoading) {
    return (
      <Flex align="center" justify="center" className="w-screen h-screen">
        <Card className="p-4">
          <Text>
            {isLoading ? "Logging in..." : "Already logged in. Redirecting..."}
          </Text>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" className="w-screen h-screen">
      <Card className="w-[40vw] min-h-80 p-2">
        <Flex direction="column" gap="2">
          <Heading>Login</Heading>
          {loginError ? (
            <Callout.Root color="red">
              <Callout.Text>
                {loginError.message || JSON.stringify(loginError)}
              </Callout.Text>
            </Callout.Root>
          ) : null}
          <Box>
            <Text as="label">Username/Email</Text>
            <TextField.Root
              size="2"
              placeholder="Username"
              onChange={(e) => setUserName(e.target.value)}
              value={username}
            />
          </Box>
          <Box>
            <Text as="label">Password</Text>
            <TextField.Root
              type="password"
              size="2"
              placeholder="*******"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Box>
          <Button onClick={onSubmit} disabled={isLoading}>
            Login
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
};

export default Login;