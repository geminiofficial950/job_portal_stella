"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_PREFIXES = ["/login", "/register", "/dashboard"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <Footer />;
}
