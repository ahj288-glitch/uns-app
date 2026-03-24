import React from "react";
import { Redirect } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
