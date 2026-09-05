"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

export interface MembershipQRProps {
  /** The membership number to encode (raw digits, no formatting). */
  value: string;
  /** Pixel size of the rendered canvas. Defaults to 96. */
  size?: number;
  className?: string;
  /** Optional title shown above the QR for accessibility. */
  title?: string;
}

/**
 * Real, scannable QR code generated client-side from the membership number.
 *
 * The QR encodes the raw 16-digit membership number so a merchant can scan
 * the customer's card to verify the membership. Generated as a canvas and
 * rendered inside a white rounded pad for high contrast against dark cards.
 *
 * Works offline (the `qrcode` lib runs entirely client-side, no network).
 */
export function MembershipQR({
  value,
  size = 96,
  className,
  title = "رمز التحقق",
}: MembershipQRProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#003B55",
        light: "#FFFFFF",
      },
    }).catch(() => setError(true));
  }, [value, size]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl bg-white/95 p-2.5 shadow-soft",
        className
      )}
      dir="ltr"
    >
      <span className="sr-only">{title}</span>
      {error ? (
        <div
          className="flex items-center justify-center text-[9px] font-medium text-destructive"
          style={{ width: size, height: size }}
        >
          تعذّر توليد الرمز
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block rounded-md"
          role="img"
          aria-label={title}
        />
      )}
      <span className="text-[8px] font-bold tracking-widest text-[#003B55] uppercase">
        WAFIR · SCAN
      </span>
    </div>
  );
}
