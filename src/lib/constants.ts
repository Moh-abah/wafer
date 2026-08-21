import {
  UtensilsCrossed,
  Coffee,
  Landmark,
  Building2,
  Users,
  Package,
  ShoppingBag,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import type { FacilityType } from "@/types/api.generated";

export const TYPE_LABEL: Record<FacilityType, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  public_facility: "مرفق عام",
};

export const TYPE_ICON: Record<FacilityType, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  public_facility: Landmark,
};

export const FILTER_CHIPS = [
  { key: "all", label: "الكل" },
  { key: "restaurant", label: "مطاعم" },
  { key: "cafe", label: "كافيهات" },
  { key: "public_facility", label: "مرافق عامة" },
] as const;

export type FilterKey = (typeof FILTER_CHIPS)[number]["key"];

export const NOTIFICATION_ICONS = {
  Store: Building2,
  UserPlus: Users,
  Package: Package,
  ShoppingBag: ShoppingBag,
  AlertTriangle: AlertTriangle,
  CreditCard: CreditCard,
} as const;

export const SCHEMA_ORG_TYPE: Record<FacilityType, string> = {
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  public_facility: "LocalBusiness",
};
