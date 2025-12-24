"use client";

import { TUser } from '~/apis/users/schemas';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useUserModal } from '~/hooks/use-user-modal';

export const UserDetailsModal = () => {
  const { data: user, modal, isOpen, onOpenChange } = useUserModal();

  // console.log("Rendering UserDetailsModal:", user);

  return (
    <Dialog open={modal === "view" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user?.username}</DialogTitle>
          <DialogDescription>User details and permissions</DialogDescription>
        </DialogHeader>
        {user 
          ? <UserDetailsView user={user} /> 
          : (
            <div className="flex justify-center items-center">
              No user found
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  )
}

const UserDetailsView = ({ user }: { user: TUser }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Personal Information</h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Name:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Account Information</h4>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Permissions</h4>
        <div className="flex flex-wrap gap-2">
          {user.role.split(',').map((permission: string) => (
            <Badge key={permission} variant="secondary">
              {permission}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Activity Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              0
            </p>
            <p className="text-sm text-gray-600">Jobs Created</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              0
            </p>
            <p className="text-sm text-gray-600">Applications Reviewed</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              0
            </p>
            <p className="text-sm text-gray-600">Total Permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
