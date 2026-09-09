"use client";

import { usePathname } from "next/navigation";
import type { RecruiterCompanyAccess } from "@/lib/recruiterCompanyAccess";
import RecruiterLockedPanel, {
  RecruiterApprovalBanner,
} from "@/app/components/RecruiterLockedPanel";

const OPEN_WITHOUT_APPROVAL = [
  "/dashboard/recruiter/company",
  "/dashboard/recruiter/settings",
];

function isOpenPath(pathname: string) {
  return OPEN_WITHOUT_APPROVAL.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default function RecruiterAccessShell({
  access,
  children,
}: {
  access: RecruiterCompanyAccess;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const allowed = access.approved || isOpenPath(pathname);

  return (
    <>
      {allowed ? <RecruiterApprovalBanner access={access} /> : null}
      {allowed ? children : <RecruiterLockedPanel access={access} />}
    </>
  );
}
