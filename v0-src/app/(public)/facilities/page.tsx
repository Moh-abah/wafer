import type { Metadata } from "next";
import FacilitiesContent from "./FacilitiesContent";

export const metadata: Metadata = {
  title: "المنشآت | وفر",
};

export default function FacilitiesPage() {
  return <FacilitiesContent />;
}
