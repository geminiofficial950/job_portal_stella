import AdminUsersPanel from "@/app/components/AdminUsersPanel";

export default function AdminRecruitersPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <AdminUsersPanel roleFilter="recruiter" title="Recruiters" />
    </main>
  );
}
