import { useState, useEffect } from 'react';
import { useFrappeAuth, useFrappePostCall } from 'frappe-react-sdk';

export interface UserRoles {
  roles: string[];
  isLibrarian: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserRoles = (): UserRoles => {
  const { currentUser, isLoading: authLoading } = useFrappeAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { call: getCurrentUserRoles } = useFrappePostCall('library_app.api.get_current_user_roles');

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!currentUser || authLoading) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user roles from our custom API
        const response = await getCurrentUserRoles({});

        if (response?.message) {
          const userRoles = response.message.roles || [];
          setRoles(userRoles);
          console.log('Fetched user roles:', userRoles);
        } else {
          setRoles([]);
          console.log('No roles found in response:', response);
        }
      } catch (err: any) {
        console.error('Error fetching user roles:', err);
        setError(err.message || 'Failed to fetch user roles');
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [currentUser, authLoading, getCurrentUserRoles]);

  const isLibrarian = roles.some(role =>
    ['Librarian', 'Library Manager', 'System Manager'].includes(role)
  );

  const isMember = roles.some(role =>
    ['Library Member', 'Librarian', 'Library Manager', 'System Manager'].includes(role)
  );

  const isAdmin = roles.some(role =>
    ['System Manager'].includes(role)
  );

  return {
    roles,
    isLibrarian,
    isMember,
    isAdmin,
    isLoading: authLoading || isLoading,
    error
  };
}; 