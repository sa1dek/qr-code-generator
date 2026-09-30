import React, { useState, useEffect } from "react";
import { CreditCard, Layers, PlusCircle } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { validateCardId, parseCardRange } from "../../../validation/card";
import { useToast } from "../../../components/ui/Toast";
import { type BulkGenerateResult, type AuthUser } from "../../../types/card";
import { createSingleCard, createBulkCards } from "../../cards/services/cardService";

//--------------|| Component Props Interface ||--------------//
interface GenerateCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser?: AuthUser | null;
  mode?: "single" | "both";
}

//--------------|| Generate Cards Modal Component ||--------------//
export const GenerateCardsModal: React.FC<GenerateCardsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  mode: modeProp = "both",
}) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  useEffect(() => {
    setMode("single");
  }, [modeProp]);
  const [singleId, setSingleId] = useState("");
  const [startId, setStartId] = useState("CARD-100");
  const [endId, setEndId] = useState("CARD-120");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkGenerateResult | null>(null);
  const { success, error: toastError } = useToast();

  //--------------|| Reset Form State ||--------------//
  const handleReset = () => {
    setSingleId("");
    setErrorMsg(null);
    setBulkResult(null);
  };

  //--------------|| Single Card Generation Submission ||--------------//
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateCardId(singleId);
    if (!val.isValid) {
      setErrorMsg(val.error || null);
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const formattedCardId = singleId.trim().toUpperCase();
      const res = await createSingleCard(formattedCardId, currentUser?.id);

      if (!res.success) {
        throw new Error(res.error || "تعذر إنشاء الكارت");
      }

      success(`تم إنشاء الكارت ${res.card?.card_id || singleId} بنجاح`);
      handleReset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
      toastError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  //--------------|| Bulk Cards Generation Submission ||--------------//
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseCardRange(startId, endId);
    if (parsed.error) {
      setErrorMsg(parsed.error);
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    setBulkResult(null);

    try {
      const res = await createBulkCards(
        startId.trim().toUpperCase(),
        endId.trim().toUpperCase(),
        currentUser?.id,
      );

      setBulkResult(res);

      if (res.totalCreated > 0) {
        success(`تم إنشاء ${res.totalCreated} كارت بنجاح`);
        onSuccess();
      } else {
        setErrorMsg("لم يتم إنشاء أي كروت، قد تكون جميعها موجودة بالفعل");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      toastError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="إنشاء كروت NFC جديدة"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1 text-right" dir="rtl">
        {modeProp === "both" && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode("single");
                handleReset();
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === "single"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              كارت منفرد (Single)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("bulk");
                handleReset();
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === "bulk"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              توليد جماعي (Bulk)
            </button>
          </div>
        )}

        {/*--------------|| Error Notification Alert ||--------------//*/}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/*--------------|| Single Card Mode Form ||--------------//*/}
        {mode === "single" && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <Input
              label="معرف الكارت (Card ID)"
              placeholder="مثال: CARD-006"
              value={singleId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSingleId(e.target.value.toUpperCase());
                setErrorMsg(null);
              }}
              helperText="المعرف الثابت المطبوع على الكارت أو المبرمج في شريحة NFC."
              className="font-mono"
              autoFocus
            />

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
              سيتم إنشاء الكارت كـ{" "}
              <strong className="text-slate-900">غير مخصص (Unassigned)</strong>{" "}
              حتى تقوم بربطه بعميل ورابط تقييم Google Review لاحقاً.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                إنشاء الكارت
              </Button>
            </div>
          </form>
        )}

        {/*--------------|| Bulk Generation Mode Form ||--------------//*/}
        {mode === "bulk" && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="بداية النطاق (Start)"
                placeholder="CARD-100"
                value={startId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setStartId(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                className="font-mono text-center"
              />
              <Input
                label="نهاية النطاق (End)"
                placeholder="CARD-150"
                value={endId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEndId(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                className="font-mono text-center"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">
                قواعد التوليد التلقائي:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                <li>يجب أن يتطابق المقطع النصي (البادئة) في كلا الحقلين.</li>
                <li>يتم حفظ طول الأرقام مع الأصفار المسبقة تلقائياً.</li>
                <li>يتم تخطي أي معرف كارت موجود مسبقاً في قاعدة البيانات.</li>
              </ul>
            </div>

            {bulkResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-emerald-900">نتيجة العملية:</p>
                <p className="text-emerald-700">
                  تم إنشاء: {bulkResult.totalCreated} كارت جديد.
                </p>
                {bulkResult.totalSkipped > 0 && (
                  <p className="text-amber-700">
                    تم تخطي: {bulkResult.totalSkipped} (موجودة مسبقاً).
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
              >
                إغلاق
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Layers className="w-4 h-4" />}
              >
                توليد دفعة الكروت
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
