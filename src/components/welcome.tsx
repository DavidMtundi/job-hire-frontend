"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { X, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export const Welcome = () => {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    const key = `welcome_shown_${session.user.email}`;
    const hasShown = sessionStorage.getItem(key);

    if (!hasShown) {
      setVisible(true);
      sessionStorage.setItem(key, "true");
    }
  }, [session]);

  // if (!visible || !session?.user) return null;

  const welcomeMessage = useMemo(() => {
    if (session?.user?.role === "candidate") {
      return "Monitor your job applications and manage your profile.";
    } else if (session?.user?.role === "manager") {
      return "Track team performance, manage applications, and oversee recruitment analytics.";
    } else {
      return "Monitor your recruitment activities and manage hiring processes.";
    }
  }, [session?.user?.role]);

  return (
    <Card className="shadow-none bg-slate-50">
      <CardContent className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            👋 Welcome, {session?.user?.username || "there"}!
          </h1>
          <p className="text-gray-700">{welcomeMessage}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setVisible(false)}>
          <XIcon className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
