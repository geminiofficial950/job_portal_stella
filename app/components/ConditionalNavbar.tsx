"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDDEN_PREFIXES = ["/login", "/register"];

export default function ConditionalNavbar() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <Navbar />;
}
