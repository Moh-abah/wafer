import type { Metadata } from "next";
import ImportProductsContent from "./ImportProductsContent";

export const metadata: Metadata = {
  title: "استيراد المنتجات | وفر",
};

export default function ImportProductsPage() {
  return <ImportProductsContent />;
}
