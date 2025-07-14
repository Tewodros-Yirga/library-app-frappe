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
  Spinner,
} from "@radix-ui/themes";
import { useFrappeAuth } from "frappe-react-sdk";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../App";

interface LoginProps {
  alwaysDark?: boolean;
}

const Login = ({ alwaysDark }: LoginProps) => {
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<any>("");

  const { currentUser, login, isLoading } = useFrappeAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme ? useTheme() : { setTheme: () => {} };

  // Force dark theme if alwaysDark
  useEffect(() => {
    if (alwaysDark) {
      document.documentElement.classList.add("dark");
      setTheme && setTheme("dark");
    }
    // No cleanup: login page should always be dark
    // eslint-disable-next-line
  }, [alwaysDark]);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const onSubmit = () => {
    setLoginError("");
    login({
      username: username,
      password: password,
    })
      .then((res) => {
        console.log("Login successful:", res);
      })
      .catch((err) => {
        console.error("Login failed:", err);
        setLoginError(err);
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  // If user is already logged in or logging in, show loading
  if (currentUser || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex items-center justify-center">
        <Card className="p-8 shadow-xl bg-gray-900/90 backdrop-blur-sm">
          <Flex direction="column" align="center" gap="4">
            <Spinner size="3" />
            <Text size="3" className="text-gray-300">
              {isLoading ? "Logging in..." : "Already logged in. Redirecting..."}
            </Text>
          </Flex>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-900 to-purple-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-900 to-pink-900 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md p-8 shadow-2xl bg-gray-900/95 backdrop-blur-sm border-0">
        <Flex direction="column" gap="6">
          {/* Header */}
          <Flex direction="column" align="center" gap="3">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <Flex direction="column" align="center" gap="1">
              <Heading size="6" className="text-gray-100">Welcome Back</Heading>
              <Text size="3" className="text-gray-400 text-center">
                Sign in to your library account
              </Text>
            </Flex>
          </Flex>

          {/* Error Display */}
          {loginError && (
            <Callout.Root color="red" className="border-red-400 bg-red-900/60">
              <Callout.Text className="text-red-200">
                {loginError.message || "Invalid username or password. Please try again."}
              </Callout.Text>
            </Callout.Root>
          )}

          {/* Login Form */}
          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" className="font-medium text-gray-200 mb-2 block">
                Username or Email
              </Text>
              <TextField.Root
                size="3"
                placeholder="Enter your username or email"
                onChange={(e) => setUserName(e.target.value)}
                value={username}
                onKeyPress={handleKeyPress}
                className="w-full border-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-800 text-gray-100"
              />
            </Box>

            <Box>
              <Text as="label" size="2" className="font-medium text-gray-200 mb-2 block">
                Password
              </Text>
              <TextField.Root
                type="password"
                size="3"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                onKeyPress={handleKeyPress}
                className="w-full border-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-gray-800 text-gray-100"
              />
            </Box>

            <Button 
              onClick={onSubmit} 
              disabled={isLoading || !username || !password}
              size="3"
              className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Flex align="center" gap="2">
                  <Spinner size="2" />
                  <Text>Signing in...</Text>
                </Flex>
              ) : (
                "Sign In"
              )}
            </Button>
          </Flex>

          {/* Footer */}
          <Box className="text-center">
            <Text size="2" className="text-gray-500">
              Need help? Contact your library administrator
            </Text>
          </Box>
        </Flex>
      </Card>
    </div>
  );
};

export default Login;