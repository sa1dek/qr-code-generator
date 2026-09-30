import React, { useState } from "react";
import { User, Mail, Shield, Save } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../../auth/hooks/useAuth";
import { Loading } from "../../../components/ui/Loading";

export const UserProfileView: React.FC = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useUserProfile();
  const [username, setUsername] = useState(user?.username || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ username: username.trim() });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading text="جاري تحميل بيانات الملف الشخصي..." />;
  }

  return (
    <div
      className="max-w-xl mx-auto surface rounded-2xl p-4 sm:p-8 space-y-6 text-start"
      dir="rtl"
    >
      <div>
        <h2 className="text-base sm:text-lg font-bold text-text-primary">
          الملف الشخصي
        </h2>
        <p className="text-xs text-text-muted mt-1">
          إدارة بيانات حسابك وتحديث اسم المستخدم الخاص بك.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          value={profile?.email || user?.email || ""}
          disabled
          leftIcon={<Mail className="w-4 h-4" />}
          helperText="لا يمكن تغيير البريد الإلكتروني الأساسي."
        />

        <Input
          label="اسم المستخدم"
          value={username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          placeholder="أدخل اسم المستخدم"
          required
        />

        <div className="p-3 bg-surface-800/60 border border-border-subtle rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-text-muted">نوع الصلاحية:</span>
          <span className="font-bold flex items-center gap-1.5 text-brand">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            {profile?.role === "admin" ? "مسؤول النظام (Admin)" : "مستخدم عادي (User)"}
          </span>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isSaving}
            className="w-full sm:w-auto"
            leftIcon={<Save className="w-4 h-4" />}
          >
            حفظ التغييرات
          </Button>
        </div>
      </form>
    </div>
  );
};
