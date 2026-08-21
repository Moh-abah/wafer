"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useImportProducts } from "@/hooks/useImportProducts";
import type { ProductImportResult } from "@/types/api.generated";

const ALLOWED_EXTENSIONS = [".xlsx", "..xls"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ─── Generate Template ───
function downloadTemplate() {
  import("xlsx").then((XLSX) => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: "قهوة عربية",
        price: 15,
        category: "مشروبات",
        description: "قهوة عربية أصيلة",
        image_url: "",
        is_available: true,
        display_order: 0,
      },
    ]);
    ws["!cols"] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 30 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المنتجات");
    XLSX.writeFile(wb, "wafir_product_template.xlsx");
  });
}

// ─── Client Validation ───
function validateFile(file: File): string | null {
  const ext = file.name.substring(file.name.lastIndexOf("."));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "يرجى اختيار ملف بامتداد .xlsx أو .xls";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "حجم الملف يتجاوز الحد المسموح (٢ ميجابايت)";
  }
  return null;
}

export default function ImportProductsContent() {
  const params = useParams<{ id: string }>();
  const facilityId = Number(params.id);
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ProductImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportProducts(facilityId);

  const handleFile = useCallback((f: File) => {
    setClientError(null);
    setResult(null);
    const err = validateFile(f);
    if (err) {
      setClientError(err);
      return;
    }
    setFile(f);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function handleUpload() {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (r) => setResult(r),
    });
  }

  function handleReset() {
    setFile(null);
    setClientError(null);
    setResult(null);
    importMutation.reset();
  }

  // ─── Result ───
  if (result) {
    const isSuccess = result.status === "success";
    const isPartial = result.status === "partial" || result.errors.length > 0;
    const statusColor = isSuccess
      ? "text-teal-600 dark:text-teal-400"
      : isPartial
        ? "text-amber-600 dark:text-amber-400"
        : "text-destructive";

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">نتيجة الاستيراد</h1>
        </div>

        <Card className={`rounded-2xl border-2 ${isSuccess ? "border-teal-500/50" : isPartial ? "border-amber-500/50" : "border-destructive/50"}`}>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            {isSuccess ? (
              <CheckCircle2 className="h-16 w-16 text-teal-600 dark:text-teal-400" />
            ) : isPartial ? (
              <AlertCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
            <div>
              <p className={`text-lg font-bold ${statusColor}`}>{result.message}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                تم استيراد <strong>{result.imported_count}</strong> منتج
                {result.errors.length > 0 && ` مع ${result.errors.length} خطأ`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Errors table */}
        {result.errors.length > 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <h3 className="mb-4 font-semibold">الأخطاء</h3>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-start font-medium">الصف</th>
                      <th className="px-3 py-2 text-start font-medium">الحقل</th>
                      <th className="px-3 py-2 text-start font-medium">الرسالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">
                          <Badge variant="secondary">
                            {String((err as Record<string, unknown>).row ?? idx + 1)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {String((err as Record<string, unknown>).field ?? "—")}
                        </td>
                        <td className="px-3 py-2 text-destructive">
                          {String((err as Record<string, unknown>).message ?? "—")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            className="rounded-full bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => router.push(`/owner/facilities/${facilityId}/products`)}
          >
            العودة للمنتجات
          </Button>
          <Button variant="outline" className="rounded-full" onClick={handleReset}>
            استيراد ملف آخر
          </Button>
        </div>
      </div>
    );
  }

  // ─── Upload Form ───
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">استيراد المنتجات</h1>
      </div>

      {/* Drop zone */}
      <div
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : file
              ? "border-teal-500/50 bg-teal-500/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {file ? (
          <>
            <FileSpreadsheet className="h-12 w-12 text-teal-600 dark:text-teal-400" />
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} كيلوبايت
            </p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-medium">
              اسحب ملف Excel هنا أو <span className="text-primary">انقر للاختيار</span>
            </p>
            <p className="text-xs text-muted-foreground">
              xlsx أو xls — بحد أقصى ٢ ميجابايت
            </p>
          </>
        )}
      </div>

      {/* Client error */}
      {clientError && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {clientError}
        </div>
      )}

      {/* Server error */}
      {importMutation.isError && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {importMutation.error.message}
        </div>
      )}

      {/* Progress */}
      {importMutation.isPending && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ رفع الملف واستيراد المنتجات...
          </div>
          <Progress value={undefined} className="h-2" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={downloadTemplate}
        >
          <Download className="h-4 w-4" />
          تحميل قالب جاهز
        </Button>
        <Button
          className="gap-2 rounded-full bg-teal-600 text-white hover:bg-teal-700"
          disabled={!file || importMutation.isPending}
          onClick={handleUpload}
        >
          {importMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          استيراد
        </Button>
      </div>
    </div>
  );
}
