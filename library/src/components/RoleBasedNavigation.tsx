import { Link, useLocation } from 'react-router-dom';
import { useUserRoles } from '../hooks/useUserRoles';
import { Button, DropdownMenu } from '@radix-ui/themes';
import React, { useState } from 'react';

interface NavigationItem {
  label: string;
  path: string;
  roles: string[];
  requireLibrarian?: boolean;
  requireMember?: boolean;
  requireAdmin?: boolean;
  icon?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    roles: ['Library Member', 'Librarian', 'Library Manager'],
    icon: '🏠'
  },
  {
    label: 'Books',
    path: '/books',
    roles: ['Library Member', 'Librarian', 'Library Manager'],
    icon: '📚'
  },
  {
    label: 'Add Book',
    path: '/books/new',
    roles: ['Librarian', 'Library Manager'],
    requireLibrarian: true,
    icon: '➕'
  },
  {
    label: 'Members',
    path: '/members',
    roles: ['Librarian', 'Library Manager'],
    requireLibrarian: true,
    icon: '👥'
  },
  {
    label: 'Add Member',
    path: '/members/new',
    roles: ['Librarian', 'Library Manager'],
    requireLibrarian: true,
    icon: '➕'
  },
  {
    label: 'Loans',
    path: '/loans',
    roles: ['Librarian', 'Library Manager'],
    requireLibrarian: true,
    icon: '📖'
  },
  {
    label: 'New Loan',
    path: '/loans/new',
    roles: ['Librarian'],
    requireLibrarian: true,
    icon: '➕'
  },
  {
    label: 'My Loans',
    path: '/my-loans',
    roles: ['Library Member'],
    requireMember: true,
    icon: '📚'
  },
  {
    label: 'Reservations',
    path: '/reservations',
    roles: ['Library Member', 'Librarian', 'Library Manager'],
    icon: '⏰'
  },
  {
    label: 'My Reservations',
    path: '/my-reservations',
    roles: ['Library Member'],
    requireMember: true,
    icon: '⏰'
  },
  {
    label: 'Create Test Users',
    path: '/create-test-users',
    roles: ['Library Manager','Librarian'],
    requireAdmin: true,
    icon: '👤'
  }
];

export const RoleBasedNavigation = () => {
  const { roles, isLibrarian, isMember, isAdmin, isLoading } = useUserRoles();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  const hasAccess = (item: NavigationItem): boolean => {
    const hasRole = item.roles.some(role => roles.includes(role));
    const hasLibrarianAccess = !item.requireLibrarian || isLibrarian;
    const hasMemberAccess = !item.requireMember || isMember;
    const hasAdminAccess = !item.requireAdmin || isAdmin;

    return hasRole && hasLibrarianAccess && hasMemberAccess && hasAdminAccess;
  };

  const visibleItems = navigationItems.filter(hasAccess);

  // Group items by category
  const mainItems = visibleItems.filter(item => 
    ['Dashboard', 'Books'].includes(item.label)
  );
  
  const librarianItems = visibleItems.filter(item => 
    ['Add Book', 'Members', 'Add Member', 'Loans', 'New Loan'].includes(item.label)
  );
  
  const memberItems = visibleItems.filter(item => 
    ['My Loans', 'Reservations', 'My Reservations'].includes(item.label)
  );
  
  const adminItems = visibleItems.filter(item => 
    ['Create Test Users'].includes(item.label)
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex items-center gap-2">
      {/* Main Navigation - Always visible */}
      <div className="hidden md:flex items-center gap-1">
        {mainItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span className="mr-1">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Librarian Actions */}
      {librarianItems.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="mr-1">📚</span>
              <span className="hidden sm:inline">Manage</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
            {librarianItems.map((item) => (
              <DropdownMenu.Item key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 ${
                    isActive(item.path) ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}

      {/* Member Actions */}
      {memberItems.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="mr-1">👤</span>
              <span className="hidden sm:inline">Others</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
            {memberItems.map((item) => (
              <DropdownMenu.Item key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 ${
                    isActive(item.path) ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}

      {/* Admin Actions */}
      {adminItems.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="mr-1">⚙️</span>
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800">
            {adminItems.map((item) => (
              <DropdownMenu.Item key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2 ${
                    isActive(item.path) ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}

      {/* Mobile Navigation - Show all items in a single dropdown */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50">
        {/* Backdrop overlay when menu is open */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setMobileMenuOpen(false)} />
        )}
        <DropdownMenu.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenu.Trigger>
            <Button variant="ghost" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full flex justify-between items-center px-4 py-3 shadow-md">
              <span className="mr-1">☰</span>
              Menu
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 w-full max-h-[80vh] overflow-y-auto shadow-2xl transition-all duration-300"
            sideOffset={0}
            align="start"
          >
            {/* Close button at the top right */}
            <div className="flex justify-end p-2">
              <button aria-label="Close menu" className="text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            {/* Menu items with dividers */}
            {visibleItems.map((item, idx) => (
              <React.Fragment key={item.path}>
                <DropdownMenu.Item asChild>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-3 w-full ${
                      isActive(item.path)
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                </DropdownMenu.Item>
                {idx < visibleItems.length - 1 && <div className="border-t border-gray-200 dark:border-gray-800 mx-4" />}
              </React.Fragment>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}; 