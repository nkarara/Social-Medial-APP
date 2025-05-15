
import { useEffect, useState } from 'react';
import { Profile } from '@/types/supabase';
import UserFilterBar from './user-management/UserFilterBar';
import UserCard from './user-management/UserCard';
import { fetchAllUsers, blockUser, deleteUser, filterUsers } from './user-management/userService';

export const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);
  
  useEffect(() => {
    // Apply filters whenever filter criteria change
    const filtered = filterUsers(users, searchQuery, roleFilter, statusFilter);
    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    const usersData = await fetchAllUsers();
    setUsers(usersData);
    setFilteredUsers(usersData);
    setLoading(false);
  };

  const handleSearch = () => {
    // Filters are already applied in the useEffect
    // This is just to trigger search on button click
  };

  const resetSearch = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    const success = await blockUser(userId, isBlocked);
    if (success) {
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_blocked: isBlocked } 
          : user
      ));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="space-y-4">
      <UserFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleSearch={handleSearch}
        resetSearch={resetSearch}
      />
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-4">
          {filteredUsers.map(user => (
            <UserCard 
              key={user.id}
              user={user}
              handleBlockUser={handleBlockUser}
              handleDeleteUser={handleDeleteUser}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  );
};

export default UserManagement;
