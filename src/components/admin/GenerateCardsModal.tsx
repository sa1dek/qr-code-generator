import React, { useState } from "react";
import { CreditCard, Layers, PlusCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { validateCardId, parseCardRange } from "../../lib/validation/card";
import { useToast } from "../ui/Toast";
import { type BulkGenerateResult } from "../../types/card";
import { createCardApi, createBulkCardsApi } from "../../lib/fetchUtils";

//--------------|| Component Props Interface ||--------------//
interface GenerateCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

//--------------|| Generate Cards Modal Component ||--------------//
export const GenerateCardsModal: React.FC<GenerateCardsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"single" | "bulk">("single");
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
      const res = await createCardApi(formattedCardId);

      if (!res.ok || !res.data?.success) {
        throw new Error(res.data?.error || "تعذر إنشاء الكارت");
      }

      success(`تم إنشاء الكارت ${res.data.card?.card_id || singleId} بنجاح`);
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
      const res = await createBulkCardsApi(
        startId.trim().toUpperCase(),
        endId.trim().toUpperCase(),
      );

      if (!res.ok || !res.data?.success) {
        throw new Error(res.data?.error || "فشلت عملية الإنشاء بالجملة");
      }

      const createdCards = res.data.createdCards || [];
      const totalCreated = createdCards.length;

      setBulkResult({
        totalCreated,
        totalSkipped: 0,
        createdCards,
        skippedCardIds: [],
      });

      success(`تم إنشاء ${totalCreated} كارت بنجاح`);
      onSuccess();
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
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="توليد وإضافة كروت جديدة"
      description="أضف كارت فردي أو ولّد دفعة كروت متسلسلة لطباعتها وبرمجتها عبر NFC."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1" dir="rtl">
        {/*--------------|| Mode Switcher Controls ||--------------*/}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("single");
              setErrorMsg(null);
              setBulkResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "single"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>كارت فردي (Single Card)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("bulk");
              setErrorMsg(null);
              setBulkResult(null);
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "bulk"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>توليد كميات (Bulk Generate)</span>
          </button>
        </div>

        {/*--------------|| Error Notification Banner ||--------------*/}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/*--------------|| Single Card Mode Form ||--------------*/}
        {mode === "single" && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <Input
              label="معرف الكارت (Card ID)"
              placeholder="مثال: CARD-006"
              value={singleId}
              onChange={(e) => {
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
                variant="outline"
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

        {/*--------------|| Bulk Generation Mode Form ||--------------*/}
        {mode === "bulk" && (
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="بداية النطاق (Start)"
                placeholder="CARD-100"
                value={startId}
                onChange={(e) => {
                  setStartId(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                className="font-mono text-center"
              />
              <Input
                label="نهاية النطاق (End)"
                placeholder="CARD-150"
                value={endId}
                onChange={(e) => {
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
              <p>ينشئ الكروت بالترتيب التسلسلي من البداية إلى النهاية.</p>
              <p>
                • في حال وجود معرفات مكررة، يتم تخطيها تلقائياً وإكمال الباقي
                دون توقف.
              </p>
            </div>

            {/*--------------|| Bulk Action Results Feedback ||--------------*/}
            {bulkResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl space-y-1">
                <p className="font-bold text-sm">
                  تم إنشاء {bulkResult.totalCreated} كارت بنجاح
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
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
                بدء التوليد الجماعي
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
