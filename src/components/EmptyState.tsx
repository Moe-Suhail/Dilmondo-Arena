import { RefreshCw } from "lucide-react";

export function EmptyState() {
  return (
    <div className="glass-card rounded-lg p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-300/10 text-amber-200">
        <RefreshCw className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-white">لا توجد بيانات متاحة حالياً</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        لم يتم حفظ أي نسخة ناجحة من بيانات الدوري بعد. جرّب المزامنة من السيرفر؛ إذا فشل
        FPL فلن يتم اختراع أي أرقام.
      </p>
    </div>
  );
}
