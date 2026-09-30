import React, { useState } from "react";
import {
  MessageCircle,
  Link2,
  Send,
  Phone,
  MapPin,
  Star,
  MousePointerClick,
} from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { Button } from "../../../components/ui/Button";
import type { translations } from "../../../i18n/translations";

//--------------|| Types ||--------------//
type TFn = (key: keyof typeof translations.ar) => string;
type DemoId = "instagram" | "whatsapp" | "bio";

//--------------|| Brand Glyphs ||--------------//
// lucide dropped third-party brand marks, so the Instagram glyph is inlined.
const InstagramGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

//--------------|| Demo Targets ||--------------//

//--------------|| Simulator: Instagram Profile ||--------------//
const InstagramScreen: React.FC<{ t: TFn }> = ({ t }) => (
  <div className="flex flex-col h-full gap-2.5">
    <div className="flex items-center justify-between shrink-0">
      <span className="text-[10px] font-bold text-text-muted">sadek.cafe</span>
      <InstagramGlyph className="w-4 h-4 text-text-secondary" />
    </div>

    <div className="flex items-center gap-2.5 shrink-0">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand via-brand-light to-status-unassigned-icon p-[2px] shrink-0">
        <div className="w-full h-full rounded-full bg-surface-900 flex items-center justify-center text-[11px] font-bold text-text-primary">
          SC
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[11px] font-bold text-text-primary truncate"
          dir="ltr"
        >
          sadek.cafe
        </p>
        <p className="text-[9px] text-text-muted truncate">{t("demoIgBio")}</p>
      </div>
      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-brand text-text-inverse shrink-0">
        {t("demoIgFollow")}
      </span>
    </div>

    <div className="grid grid-cols-3 gap-1 px-1 shrink-0">
      {[
        { value: "248", label: t("demoIgPosts") },
        { value: "12.4K", label: t("demoIgFollowers") },
        { value: "312", label: t("demoIgFollowing") },
      ].map((stat) => (
        <div
          key={stat.label}
          className="text-center py-1.5 rounded-lg bg-surface-800/60"
        >
          <p className="text-[11px] font-bold text-text-primary" dir="ltr">
            {stat.value}
          </p>
          <p className="text-[8px] text-text-muted">{stat.label}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-3 gap-0.5 flex-1 min-h-0">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-[3px] ${
            i % 3 === 0
              ? "bg-gradient-to-br from-surface-700 to-surface-800"
              : i % 3 === 1
                ? "bg-gradient-to-br from-brand/25 to-surface-800"
                : "bg-gradient-to-br from-status-unassigned-icon/20 to-surface-800"
          }`}
        />
      ))}
    </div>
  </div>
);

//--------------|| Simulator: WhatsApp Chat ||--------------//
const WhatsAppScreen: React.FC<{ t: TFn }> = ({ t }) => {
  const { isRTL } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 pb-2 border-b border-border-subtle shrink-0">
        <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center text-[9px] font-bold text-text-inverse shrink-0">
          SC
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-text-primary truncate">
            {t("demoWaName")}
          </p>
          <p className="text-[9px] text-status-active-text flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-active-text" />
            {t("demoWaOnline")}
          </p>
        </div>
      </div>

      {/* The panel is RTL, so incoming bubbles sit on the right (tail top-right)
          and outgoing ones on the left (tail top-left). */}
      <div className="flex-1 min-h-0 py-2.5 flex flex-col gap-2 overflow-hidden">
        <div className="max-w-[85%] self-start bg-surface-800 px-2.5 py-1.5 rounded-2xl rounded-tr-sm">
          <p className="text-[10px] text-text-primary leading-relaxed">
            {t("demoWaMsg1")}
          </p>
        </div>
        <div className="max-w-[85%] self-end bg-brand px-2.5 py-1.5 rounded-2xl rounded-tl-sm">
          <p className="text-[10px] text-text-inverse leading-relaxed">
            {t("demoWaMsg2")}
          </p>
          <p
            className="text-[8px] text-text-inverse/70 text-left mt-0.5"
            dir="ltr"
          >
            09:41 ✓✓
          </p>
        </div>
        <div className="max-w-[85%] self-start bg-surface-800 px-2.5 py-1.5 rounded-2xl rounded-tr-sm">
          <div className="h-2 w-16 rounded-full bg-surface-700" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <div className="flex-1 bg-surface-800 rounded-full px-3 py-1.5">
          <span className="text-[9px] text-text-muted">
            {t("demoWaPlaceholder")}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0">
          <Send
            className={`w-3 h-3 text-text-inverse ${isRTL ? "rotate-180" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

//--------------|| Simulator: Custom Bio Link Page ||--------------//
const BioLinkScreen: React.FC<{ t: TFn }> = ({ t }) => {
  const links = [
    { icon: Star, label: t("demoBioMenu"), accent: false },
    { icon: MessageCircle, label: t("demoBioReserve"), accent: true },
    { icon: MapPin, label: t("demoBioReviews"), accent: false },
  ];

  return (
    <div className="flex flex-col h-full items-center gap-2.5">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center text-xs font-bold text-text-inverse shrink-0">
        SC
      </div>

      <div className="text-center shrink-0">
        <p className="text-[11px] font-bold text-text-primary" dir="ltr">
          sadek.cafe
        </p>
        <p className="text-[9px] text-text-muted mt-0.5">{t("demoBioTitle")}</p>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col justify-center gap-1.5">
        {links.map(({ icon: Icon, label, accent }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border ${
              accent
                ? "bg-brand/10 border-brand/30"
                : "bg-surface-800 border-border-subtle"
            }`}
          >
<Icon
                className={`w-3 h-3 shrink-0 ${accent ? "text-brand" : "text-text-muted"}`}
              />
              <span className="text-[10px] font-medium text-text-primary flex-1">
                {label}
              </span>
            </div>
        ))}
      </div>

      <p className="text-[8px] text-text-muted shrink-0">
        Dynamic Review Cards
      </p>
    </div>
  );
};

//--------------|| Live Demo Simulator Component ||--------------//
export const LiveDemoSimulator: React.FC<{
  onStart: () => void;
}> = ({ onStart }) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<DemoId>("instagram");
  const [direction, setDirection] = useState<1 | -1>(1);

  const demoOrder: DemoId[] = ["instagram", "whatsapp", "bio"];

  // Slides the incoming screen in from the side the user came from.
  // The panel is RTL, so "forward" enters from the left.
  const selectTarget = (id: DemoId) => {
    if (id === activeId) return;
    setDirection(demoOrder.indexOf(id) > demoOrder.indexOf(activeId) ? 1 : -1);
    setActiveId(id);
  };

  const targets: {
    id: DemoId;
    label: string;
    action: string;
    href: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: "instagram",
      label: t("demoInstagram"),
      action: t("demoActionInstagram"),
      href: "instagram.com/sadek.cafe",
      icon: InstagramGlyph,
    },
    {
      id: "whatsapp",
      label: t("demoWhatsapp"),
      action: t("demoActionWhatsapp"),
      href: "wa.me/966500000000",
      icon: MessageCircle,
    },
    {
      id: "bio",
      label: t("demoBioLink"),
      action: t("demoActionBio"),
      href: "sadek.cafe/links",
      icon: Link2,
    },
  ];

  const active = targets.find((target) => target.id === activeId)!;

  return (
    <div className="mt-8 lg:mt-0 space-y-4 overflow-x-hidden">
      {/*--------------|| Preview Card ||--------------*/}
      <div className="surface rounded-2xl p-3.5 sm:p-6 shadow-lg overflow-hidden mx-auto w-full max-w-lg">
        <div className="text-center space-y-1.5 mb-5">
          <h2 className="text-sm sm:text-base font-bold text-text-primary">
            {t("demoTitle")}
          </h2>
          <p className="text-[11px] text-text-muted max-w-xs mx-auto leading-relaxed text-balance">
            {t("demoDesc")}
          </p>
        </div>

        {/*--------------|| Action Copy ||--------------*/}
        <div className="text-center space-y-2.5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-muted">
              {t("demoActionLabel")}
            </p>
            {/* Keyed so the sentence re-animates on every switch. */}
            <p
              key={`action-${active.id}`}
              className="text-xs sm:text-sm font-bold text-text-primary leading-relaxed animate-in"
            >
              {active.action}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-950 border border-border-subtle">
            <active.icon className="w-3 h-3 text-brand shrink-0" />
            <span
              key={`href-${active.id}`}
              dir="ltr"
              className="font-mono text-[10px] text-text-secondary animate-in"
            >
              {active.href}
            </span>
          </div>
        </div>

        {/*--------------|| Centered 3D Stage ||--------------*/}
        {/* The outer max-w wrapper pins the whole visual to the middle of
            the viewport. The inner cluster is a fixed 342px design box that
            is scaled down per breakpoint; the stage's own max-width tracks
            the resulting visual width so the layout box never exceeds the
            viewport (no horizontal scroll on small screens). */}
        <div className="mt-5 mx-auto w-full max-w-md flex justify-center">
          <div className="w-full max-w-[236px] sm:max-w-[274px] lg:max-w-[308px] xl:max-w-[342px] flex items-center justify-center">
            <div className="w-[342px] shrink-0 -space-x-11 flex items-center justify-center origin-center scale-[0.68] sm:scale-[0.8] lg:scale-[0.9] xl:scale-100">
              {/*--------------|| NFC Card ||--------------*/}
              {/* The page is RTL, so the card (first in source) sits right and
                  the phone overlaps its inner edge. */}
              <div className="relative w-[216px] shrink-0 rotate-2 translate-y-1">
                <div className="rounded-xl p-3.5 bg-gradient-to-br from-surface-800 via-surface-850 to-surface-950 border border-surface-700 shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] tracking-[0.18em] text-text-muted uppercase">
                        {t("demoCardTag")}
                      </p>
                      <p className="text-xs font-bold text-text-primary mt-0.5">
                        NFC &amp; QR
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-brand shrink-0">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold">
                        {t("demoTapHint")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-2">
                    <p
                      dir="ltr"
                      className="font-mono text-[10px] text-text-secondary"
                    >
                      NFC-2024-8842
                    </p>
                    <div className="grid grid-cols-5 gap-[2px] shrink-0">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-[5px] h-[5px] rounded-[1px] ${
                            [0, 1, 3, 5, 6, 7, 9, 10, 12, 13, 14].includes(i)
                              ? "bg-text-primary/70"
                              : "bg-text-primary/15"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/*--------------|| Smartphone Mockup ||--------------*/}
              <div className="relative w-[170px] shrink-0 -translate-y-2 -rotate-6 z-10">
                <div className="w-full rounded-[1.75rem] border border-surface-700 bg-surface-950 p-1.5 shadow-md">
                  {/* Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-surface-700 z-10" />

                  <div className="rounded-[1.4rem] bg-surface-900 border border-border-subtle overflow-hidden">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-2.5 pt-1.5 pb-0.5 text-[7px] text-text-muted">
                      <span dir="ltr">9:41</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-1 rounded-[1px] bg-text-muted/70" />
                        <span className="w-3.5 h-1.5 rounded-[2px] border border-text-muted/70" />
                      </div>
                    </div>

                    {/* Screen - keyed so each destination animates in */}
                    <div
                      key={active.id}
                      className={`h-[252px] px-2 pt-0.5 pb-2 ${
                        direction === 1 ? "screen-in-forward" : "screen-in-back"
                      }`}
                    >
                      {active.id === "instagram" && <InstagramScreen t={t} />}
                      {active.id === "whatsapp" && <WhatsAppScreen t={t} />}
                      {active.id === "bio" && <BioLinkScreen t={t} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*--------------|| Target Toggles ||--------------*/}
        <div
          className="mt-5 pt-4 border-t border-border-subtle grid sm:grid-cols-3 gap-2"
          role="group"
          aria-label={t("demoTitle")}
        >
          {targets.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeId;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectTarget(id)}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold transition-colors duration-150 active:scale-[0.97] ${
                  isActive
                    ? "bg-brand text-text-inverse"
                    : "bg-surface-850 border border-border-subtle text-text-secondary hover:bg-surface-800 hover:text-text-primary"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/*--------------|| Primary CTA ||--------------*/}
      <div className="flex justify-center">
        <Button size="md" onClick={onStart} className="w-full sm:w-auto sm:px-7">
          {t("demoCta")}
        </Button>
      </div>
    </div>
  );
};
