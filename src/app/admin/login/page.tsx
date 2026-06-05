import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { adminLoginNotice } from "@/lib/auth";

export default function AdminLoginPage() {
  return (
    <main className="arena-shell flex min-h-screen items-center justify-center px-4 py-10">
      <AdminLoginForm notice={adminLoginNotice()} />
    </main>
  );
}
