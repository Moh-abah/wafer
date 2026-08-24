"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePwaStore } from "@/store/pwa.store";

export type PwaPortal = "customer" | "owner";

const DISMISS_KEY: Record<PwaPortal, string> = {
  customer: "wafir-install-dismissed",
  owner: "wafir-owner-install-dismissed",
};

/* حدث داخلي لإشعار المتجر عند التخزين من نفس التبويب */
const DISMISS_EVENT = "wafir-install-dismissed-change";

function isDismissed(portal: PwaPortal): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY[portal]) === "1";
  } catch {
    return false;
  }
}

function subscribeToDismiss(onChange: () => void): () => void {
  window.addEventListener(DISMISS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(DISMISS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function usePwaInstall(portal: PwaPortal) {
  const { promptEvent, standalone, ios, setPromptEvent } = usePwaStore();

  /* قراءة الرفض من localStorage عبر useSyncExternalStore:
     لقطة الخادم «مرفوض» (إخفاء) حتى لا يختلف الترطيب،
     ولقطة العميل القيمة الحقيقية */
  const dismissed = useSyncExternalStore(
    subscribeToDismiss,
    () => isDismissed(portal),
    () => true
  );

  const canShow = !standalone && !dismissed && (Boolean(promptEvent) || ios);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY[portal], "1");
    } catch {
      /* التخزين غير متاح — الإخفاء لهذه الجلسة فقط */
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }, [portal]);

  const install = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unsupported"
  > => {
    const event = usePwaStore.getState().promptEvent;
    if (!event) return "unsupported";
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "dismissed") {
      /* رفض المستخدم لمطالبة المتصفح — نعتبره رفضاً دائماً */
      setPromptEvent(null);
      dismiss();
    }
    return choice.outcome;
  }, [dismiss, setPromptEvent]);

  return {
    canShow,
    canPrompt: Boolean(promptEvent),
    isIos: ios,
    isStandalone: standalone,
    install,
    dismiss,
  };
}
