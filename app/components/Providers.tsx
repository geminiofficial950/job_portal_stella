"use client";

import { AuthProvider } from "./AuthProvider";
import AppToaster from "./AppToaster";
import { AuthModalProvider } from "./AuthModalProvider";
import AuthModal from "./AuthModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        {children}
        <AuthModal />
        <AppToaster />
      </AuthModalProvider>
    </AuthProvider>
  );
}
