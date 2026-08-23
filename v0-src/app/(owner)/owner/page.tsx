import type { Metadata } from "next";
import OwnerFacilitiesContent from "./OwnerFacilitiesContent";

export const metadata: Metadata = {
  title: "منشآتي | وفر",
};

export default function OwnerPage() {
  return <OwnerFacilitiesContent />;
}
