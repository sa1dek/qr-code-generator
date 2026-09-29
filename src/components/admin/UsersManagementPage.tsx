import React, { useState, useEffect } from "react";
import {
  Shield,
  User,
  RefreshCw,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { getSupabaseClient } from "../../lib/supabase/client";

interface Profile {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  created_at?: string;
}

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();
  const supabase = getSupabaseClient();

  const fetchUsers = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toastError("فشل في جلب قائمة المستخدمين");
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!supabase) return;
    const newRole = currentRole === "admin" ? "user" : "admin";

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId); 

    if (error) {
      toastError("فشل تحديث الصلاحية");
    } else {
      success("تم تحديث الصلاحية بنجاح");
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            إدارة المستخدمين والصلاحيات
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            تحكم كامل في الحسابات المسجلة، وقم بترقية أي حساب ليكون مسؤولاً
            (Admin) بضغطة زر.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          leftIcon={
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          }
        >
          تحديث القائمة
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase">
                <th className="py-3 px-4">اسم المستخدم (Username)</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4">الصلاحية الحالية</th>
                <th className="py-3 px-4 text-left">إجراءات الصلاحية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-40 bg-slate-100 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-20 bg-slate-100 rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="h-8 w-28 bg-slate-100 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                        @{u.username || "بدون اسم"}
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isAdmin
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAdmin ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          {isAdmin ? "مدير نظام (Admin)" : "مستخدم عادي (User)"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-left">
                        <Button
                          size="sm"
                          variant={isAdmin ? "outline" : "primary"}
                          onClick={() => handleToggleRole(u.id, u.role)}
                        >
                          {isAdmin ? "إرجاع لمستخدم عادي" : "ترقية إلى Admin"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-500 text-xs"
                  >
                    لا توجد حسابات مسجلة حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
