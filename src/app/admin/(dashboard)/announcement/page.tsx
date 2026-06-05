import { AdminAnnouncementForm } from "@/components/admin/AdminAnnouncementForm";
import { getStore } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementPage() {
  const store = await getStore();
  const announcement = store.homepageAnnouncements.find((item) => item.active) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-amber-200">Homepage Announcement</p>
        <h1 className="mt-2 text-4xl font-black text-white">إعلان الصفحة الرئيسية</h1>
      </div>
      <AdminAnnouncementForm initialAnnouncement={announcement} />
    </div>
  );
}
