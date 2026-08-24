"use client";

import { AuthProvider } from "./AuthProvider";
import AppToaster from "./AppToaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AppToaster />
    </AuthProvider>
  );
}
