import type { Metadata } from "next";
import {
  ShieldCheck,
  Database,
  Ban,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { WafirLogo } from "@/components/shared/WafirLogo";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | وفر",
  description:
    "سياسة خصوصية منصة وفر — البيانات المجموعة وهدفها، وعدم مشاركتها مع أطراف ثالثة، وآلية حذفها.",
};

/** بيانات التواصل الحقيقية — مصدرها مواصفة المشروع حصراً */
const CONTACT_PHONE = "0547669078";
const CONTACT_PHONE_DISPLAY = "0547 669 078";
const CONTACT_EMAIL = "s72468483@gmail.com";
const CONTACT_WHATSAPP = "https://wa.me/966547669078";

/**
 * صفحة سياسة الخصوصية — إلزامية لقبول Google Play.
 * مكوّن Server بسيط بالهوية، يعمل على نطاقي العميل والمالك.
 */
export default function PrivacyPage() {
  const sections: ReadonlyArray<{
    icon: typeof Database;
    title: string;
    points: readonly string[];
  }> = [
    {
      icon: Database,
      title: "البيانات التي نجمعها",
      points: [
        "الاسم الكامل — لعرضه في حسابك وبطاقة عضويتك الرقمية.",
        "البريد الإلكتروني — معرّفاً لحسابك ووسيلة تواصل أساسية.",
        "رقم الجوال — للتحقق من هويتك والتواصل بشأن عضويتك.",
        "رقم العضوية وتاريخ انتهائها — لإدارة استحقاقك للخصومات لدى المنشآت المشتركة.",
      ],
    },
    {
      icon: ShieldCheck,
      title: "الهدف من جمع البيانات",
      points: [
        "إنشاء وإدارة حسابك وعضويتك في منصة وفر.",
        "إتاحة عرض بطاقة الخصم الرقمية الخاصة بك عند الاستخدام.",
        "تشغيل الخدمة الأساسية: عرض المنشآت والمنتجات والعروض المشتركة.",
      ],
    },
    {
      icon: Ban,
      title: "عدم المشاركة مع أطراف ثالثة",
      points: [
        "لا نبيع بياناتك ولا نشاركها مع أي طرف ثالث لأغراض تسويقية أو إعلانية.",
        "تُستخدم بياناتك حصراً لتشغيل خدمة وفر كما هو موصوف في هذه السياسة.",
      ],
    },
    {
      icon: Trash2,
      title: "حذف بياناتك",
      points: [
        "يحق لك طلب حذف بياناتك وحسابك نهائياً في أي وقت.",
        "يتم الحذف عبر التواصل المباشر معنا بالهاتف أو البريد الموضحين أدناه.",
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      {/* ترويسة بالهوية */}
      <header className="gradient-ocean relative overflow-hidden rounded-2xl">
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <WafirLogo className="h-12 w-auto" onDark />
          </div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            سياسة الخصوصية
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/80">
            خصوصيتك أمانة — هذه السياسة تشرح بشفافية البيانات التي نجمعها في
            منصة وفر، ولماذا، وكيف تتحكم بها بالكامل.
          </p>
        </div>
      </header>

      {/* الأقسام */}
      <div className="mt-6 space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft"
              aria-label={section.title}
            >
              <h2 className="flex items-center gap-3 text-lg font-bold text-foreground">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* التواصل */}
        <section
          className="rounded-2xl border border-border/50 bg-card p-6 shadow-soft"
          aria-label="التواصل بشأن الخصوصية"
        >
          <h2 className="flex items-center gap-3 text-lg font-bold text-foreground">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
              <Phone className="h-5 w-5 text-accent" aria-hidden="true" />
            </span>
            للطلب أو الاستفسار
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            لطلب حذف بياناتك أو أي استفسار يتعلق بالخصوصية، تواصل معنا
            مباشرة عبر:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <a
              href={`tel:${CONTACT_PHONE}`}
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted"
            >
              <Phone
                className="h-4 w-4 shrink-0 text-secondary"
                aria-hidden="true"
              />
              <span dir="ltr" className="text-sm font-medium text-foreground">
                {CONTACT_PHONE_DISPLAY}
              </span>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted"
            >
              <Mail
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span
                dir="ltr"
                className="truncate text-sm font-medium text-foreground"
              >
                {CONTACT_EMAIL}
              </span>
            </a>
            <a
              href={CONTACT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted"
            >
              <MessageCircle
                className="h-4 w-4 shrink-0 text-success"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-foreground">واتساب</span>
            </a>
          </div>
        </section>

        <p className="pb-6 text-center text-xs leading-relaxed text-muted-foreground">
          آخر تحديث لهذه السياسة: الإصدار الأول من تطبيق وفر
        </p>
      </div>
    </div>
  );
}
