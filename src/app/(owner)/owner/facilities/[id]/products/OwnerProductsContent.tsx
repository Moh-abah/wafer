"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useOwnerProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductAvailability,
} from "@/hooks/useOwnerProducts";
import { formatCurrency } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductCreate, ProductUpdate, ValidationError } from "@/types/api.generated";
import type { OwnerApiError } from "@/services/owner-api-client";

// ─── Types ───
interface ProductFormValues {
  name: string;
  price: string;
  category: string;
  description: string;
  image_url: string;
  is_available: boolean;
  display_order: number;
}

const EMPTY_FORM: ProductFormValues = {
  name: "",
  price: "",
  category: "",
  description: "",
  image_url: "",
  is_available: true,
  display_order: 0,
};

// ─── Helpers ───
function extractFieldErrors(body: unknown): Record<string, string> {
  const record: Record<string, string> = {};
  const data = body as Record<string, unknown> | null;
  if (!data || !Array.isArray(data.detail)) return record;
  const details = data.detail as ValidationError[];
  for (const v of details) {
    const fieldName = v.loc[v.loc.length - 1];
    if (typeof fieldName === "string") {
      record[fieldName] = v.msg;
    }
  }
  return record;
}

function productToForm(p: Product): ProductFormValues {
  return {
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description ?? "",
    image_url: p.image_url ?? "",
    is_available: p.is_available,
    display_order: p.display_order,
  };
}

// ─── Product Form Fields ───
function ProductFormFields({
  form,
  setForm,
  errors,
}: {
  form: ProductFormValues;
  setForm: (f: ProductFormValues) => void;
  errors: Record<string, string>;
}) {
  const set = (key: keyof ProductFormValues, value: string | number | boolean) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="p-name">اسم المنتج *</Label>
        <Input
          id="p-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="p-price">السعر *</Label>
          <Input
            id="p-price"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-order">الترتيب</Label>
          <Input
            id="p-order"
            type="number"
            dir="ltr"
            value={form.display_order}
            onChange={(e) => set("display_order", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="p-category">التصنيف *</Label>
        <Input
          id="p-category"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        />
        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="p-desc">الوصف</Label>
        <Textarea
          id="p-desc"
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="p-image">رابط الصورة</Label>
        <Input
          id="p-image"
          dir="ltr"
          value={form.image_url}
          onChange={(e) => set("image_url", e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="p-available">متاح للعرض</Label>
          <p className="text-xs text-muted-foreground">عند التعطيل لن يظهر للعملاء</p>
        </div>
        <Switch
          id="p-available"
          checked={form.is_available}
          onCheckedChange={(v) => set("is_available", v)}
        />
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function OwnerProductsContent() {
  const params = useParams<{ id: string }>();
  const facilityId = Number(params.id);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Search with debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Dialog/Sheet state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete confirmation
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Debounce search
  const updateSearch = useCallback((val: string) => {
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
  }, []);

  // Queries & mutations
  const { data, isLoading, isError, error } = useOwnerProducts(facilityId, {
    search: debouncedSearch || undefined,
    category: categoryFilter || undefined,
    only_available: onlyAvailable || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const createMutation = useCreateProduct(facilityId);
  const updateMutation = useUpdateProduct(facilityId, editingProduct?.id ?? 0);
  const deleteMutation = useDeleteProduct(facilityId);
  const toggleMutation = useToggleProductAvailability(facilityId);

  // ─── Form handlers ───
  function openCreate() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm(productToForm(product));
    setFormErrors({});
    setFormOpen(true);
  }

  async function handleSave() {
    setFormErrors({});
    const payload: ProductCreate = {
      name: form.name,
      price: parseFloat(form.price) || 0,
      category: form.category,
      description: form.description || null,
      image_url: form.image_url || null,
      is_available: form.is_available,
      display_order: form.display_order,
    };

    try {
      if (editingProduct) {
        const updatePayload: ProductUpdate = { ...payload };
        await updateMutation.mutateAsync(updatePayload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (err) {
      const apiErr = err as unknown as OwnerApiError;
      if (apiErr.status === 422 && apiErr.body) {
        const fieldErrors = extractFieldErrors(apiErr.body);
        if (Object.keys(fieldErrors).length > 0) {
          setFormErrors(fieldErrors);
        }
        const msg = (apiErr.body as Record<string, unknown>).detail;
        if (typeof msg === "string" && msg.includes("already exists")) {
          setFormErrors((prev) => ({ ...prev, name: "اسم المنتج موجود مسبقًا" }));
          toast({ title: "اسم مكرر", description: "اسم المنتج موجود مسبقًا", variant: "destructive" });
        }
      }
    }
  }

  function handleDelete() {
    if (!deletingProduct) return;
    deleteMutation.mutate(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
    });
  }

  function handleToggleAvailability(product: Product) {
    toggleMutation.mutate({
      productId: product.id,
      data: { is_available: !product.is_available },
    });
  }

  // Collect unique categories for filter
  const categories = data?.items
    ? [...new Set(data.items.map((p) => p.category))]
    : [];

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-12 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-medium text-destructive">
          {(error as Error).message || "حدث خطأ أثناء تحميل المنتجات"}
        </p>
        <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // ─── Empty ───
  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => router.push(`/owner/facilities/${facilityId}/products/import`)}
            >
              <Upload className="h-4 w-4" />
              استيراد
            </Button>
            <Button className="gap-2 rounded-full bg-teal-600 text-white hover:bg-teal-700" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-medium">لا توجد منتجات</p>
          <p className="text-sm text-muted-foreground">أضف أول منتج أو استوردها من ملف Excel</p>
        </div>
      </div>
    );
  }

  // ─── Data ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">المنتجات</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={() => router.push(`/owner/facilities/${facilityId}/products/import`)}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">استيراد</span>
          </Button>
          <Button
            className="gap-2 rounded-full bg-teal-600 text-white hover:bg-teal-700"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            className="rounded-full ps-4 pe-10"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.length > 1 && (
            <select
              className="h-10 rounded-full border bg-background px-3 text-sm"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">كل التصنيفات</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <Button
            variant={onlyAvailable ? "default" : "outline"}
            className="gap-1.5 rounded-full"
            onClick={() => { setOnlyAvailable(!onlyAvailable); setPage(1); }}
          >
            <Filter className="h-3.5 w-3.5" />
            {onlyAvailable ? "متاح فقط" : "الكل"}
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      {!isMobile && (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">صورة</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead className="w-16">ترتيب</TableHead>
                <TableHead className="w-24 text-center">توفر</TableHead>
                <TableHead className="w-24">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <ImageOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatCurrency(product.price)}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {product.display_order}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={product.is_available}
                      onCheckedChange={() => handleToggleAvailability(product)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingProduct(product)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile Cards */}
      {isMobile && (
        <div className="space-y-3">
          {data.items.map((product) => (
            <div key={product.id} className="rounded-2xl border p-4">
              <div className="flex gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <ImageOff className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold leading-tight">{product.name}</h3>
                    <Switch
                      checked={product.is_available}
                      onCheckedChange={() => handleToggleAvailability(product)}
                      className="ms-2"
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    <span className="font-mono">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 gap-1.5 text-xs"
                  onClick={() => openEdit(product)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  تعديل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 gap-1.5 text-xs text-destructive hover:text-destructive"
                  onClick={() => setDeletingProduct(product)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {data.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog (Desktop) */}
      {!isMobile && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="rounded-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            </DialogHeader>
            <ProductFormFields form={form} setForm={setForm} errors={formErrors} />
            <DialogFooter className="flex-row-reverse gap-2">
              <Button
                className="rounded-full bg-teal-600 text-white hover:bg-teal-700"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={handleSave}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingProduct ? "حفظ التعديلات" : "إضافة"}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setFormOpen(false)}>
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create/Edit Sheet (Mobile) */}
      {isMobile && (
        <Sheet open={formOpen} onOpenChange={setFormOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</SheetTitle>
            </SheetHeader>
            <ProductFormFields form={form} setForm={setForm} errors={formErrors} />
            <SheetFooter className="flex-row-reverse gap-2">
              <Button
                className="rounded-full bg-teal-600 text-white hover:bg-teal-700"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={handleSave}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editingProduct ? "حفظ التعديلات" : "إضافة"}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setFormOpen(false)}>
                إلغاء
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف &quot;{deletingProduct?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              حذف
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full" disabled={deleteMutation.isPending}>
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
