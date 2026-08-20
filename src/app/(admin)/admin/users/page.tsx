"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebounced(search.trim());
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إدارة العملاء</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عرض العملاء المسجّلين على المنصة والبحث فيهم.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو البريد..."
          className="pr-9"
          aria-label="بحث"
        />
      </div>

      <UsersTable search={debounced} />
    </div>
  );
}
