import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRoles } from '../hooks/useUserRoles';
import { Flex, Text, Spinner, Callout } from '@radix-ui/themes';

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requireLibrarian?: boolean;
  requireMember?: boolean;
  requireAdmin?: boolean;
  fallbackPath?: string;
  fallbackMessage?: string;
}

export const RoleBasedRoute = ({
  children,
  requiredRoles = [],
  requireLibrarian = false,
  requireMember = false,
  requireAdmin = false,
  fallbackPath = '/',
  fallbackMessage = 'You do not have permission to access this page.'
}: RoleBasedRouteProps) => {
  const { roles, isLibrarian, isMember, isAdmin, isLoading, error } = useUserRoles();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" className="h-64">
        <Spinner size="3" />
        <Text ml="2">Loading permissions...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Callout.Root color="red">
        <Callout.Text>Error loading permissions: {error}</Callout.Text>
      </Callout.Root>
    );
  }

  // Check role-based permissions
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => roles.includes(role));
  
  const hasLibrarianAccess = !requireLibrarian || isLibrarian;
  const hasMemberAccess = !requireMember || isMember;
  const hasAdminAccess = !requireAdmin || isAdmin;

  // Check if user has all required permissions
  const hasAccess = hasRequiredRole && hasLibrarianAccess && hasMemberAccess && hasAdminAccess;

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Convenience components for common permission patterns
export const LibrarianOnly = ({ children, ...props }: Omit<RoleBasedRouteProps, 'requireLibrarian'>) => (
  <RoleBasedRoute requireLibrarian={true} {...props}>
    {children}
  </RoleBasedRoute>
);

export const MemberOnly = ({ children, ...props }: Omit<RoleBasedRouteProps, 'requireMember'>) => (
  <RoleBasedRoute requireMember={true} {...props}>
    {children}
  </RoleBasedRoute>
);

export const AdminOnly = ({ children, ...props }: Omit<RoleBasedRouteProps, 'requireAdmin'>) => (
  <RoleBasedRoute requireAdmin={true} {...props}>
    {children}
  </RoleBasedRoute>
); 