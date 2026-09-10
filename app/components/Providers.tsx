"use client";

import { AuthProvider } from "./AuthProvider";
import AppToaster from "./AppToaster";
import { AuthModalProvider } from "./AuthModalProvider";
import AuthModal from "./AuthModal";
import SmoothScroll from "./SmoothScroll";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <SmoothScroll>
          {children}
          <AuthModal />
          <AppToaster />
        </SmoothScroll>
      </AuthModalProvider>
    </AuthProvider>
  );
}
