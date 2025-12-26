"use client";

import { Users, Mail, Shield, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useGetCompanyUsersQuery } from "~/apis/companies/queries";
import { Loader } from "~/components/loader";

interface CompanyUsersListProps {
  companyId: string;
}

export function CompanyUsersList({ companyId }: CompanyUsersListProps) {
  const { data: usersData, isLoading } = useGetCompanyUsersQuery(companyId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Loader mode="icon" />
        </CardContent>
      </Card>
    );
  }

  const users = usersData?.data || [];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      admin: "secondary",
      recruiter: "outline",
    };
    return variants[role] || "outline";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {users.length} {users.length === 1 ? "member" : "members"} in your company
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No team members yet</p>
            <p className="text-sm">Invite recruiters to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {user.username || user.email?.split("@")[0] || "User"}
                      </p>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <Badge variant={getRoleBadge(user.role)} className="capitalize">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

