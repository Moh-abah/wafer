/**
 * API types generated from OpenAPI spec at https://api.wafir.gleeze.com/openapi.json
 * Source of truth: openapi.json (saved locally)
 */

// ─── Enums ────────────────────────────────────────────
export type FacilityType = 'restaurant' | 'cafe' | 'public_facility';
export type UserRole = 'admin' | 'owner' | 'customer';

// ─── Shared / Common ──────────────────────────────────
export interface TokenOut {
  access_token: string;
  token_type: string;
}

export interface MessageOut {
  detail: string;
  status_code?: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// ─── Region ────────────────────────────────────────────
export interface Region {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface RegionCreate {
  name: string;
  slug?: string;
  is_active?: boolean;
}

export interface RegionUpdate {
  name?: string;
  slug?: string;
  is_active?: boolean;
}

// ─── Card ──────────────────────────────────────────────
export interface CardBrief {
  id: number;
  name: string;
  discount_rate: number;
}

export interface Card {
  id: number;
  name: string;
  platform_name: string;
  discount_rate: number;
  region_id: number;
  is_published: boolean;
  display_order: number;
  facilities: CardBrief[];
  created_at: string;
}

export interface CardCreate {
  name: string;
  platform_name?: string;
  discount_rate?: number;
  region_id: number;
  is_published?: boolean;
  display_order?: number;
}

export interface CardUpdate {
  name?: string;
  platform_name?: string;
  discount_rate?: number;
  region_id?: number;
  is_published?: boolean;
  display_order?: number;
}

// ─── Facility ──────────────────────────────────────────
export interface Facility {
  id: number;
  name: string;
  type: FacilityType;
  region_id: number;
  description: string | null;
  is_visible: boolean;
  display_order: number;
  cards: CardBrief[];
  owner_id: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  working_hours: string | null;
  image_url: string | null;
  created_at: string;
}

export interface FacilityCreate {
  name: string;
  type?: FacilityType;
  region_id: number;
  description?: string | null;
  is_visible?: boolean;
  display_order?: number;
  card_ids?: number[];
  owner_id?: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  working_hours?: string | null;
  image_url?: string | null;
}

export interface FacilityUpdate {
  name?: string;
  type?: FacilityType;
  region_id?: number;
  description?: string | null;
  is_visible?: boolean;
  display_order?: number;
  card_ids?: number[];
  owner_id?: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  working_hours?: string | null;
  image_url?: string | null;
}

export interface OwnerFacilityUpdate {
  name?: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  working_hours?: string | null;
  image_url?: string | null;
  is_visible?: boolean;
}

// ─── Product ───────────────────────────────────────────
export interface Product {
  id: number;
  facility_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  image_url: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string | null;
  price: number | string;
  category: string;
  image_url?: string | null;
  is_available?: boolean;
  display_order?: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  price?: number | string | null;
  category?: string;
  image_url?: string | null;
  is_available?: boolean;
  display_order?: number;
}

export interface ProductAvailabilityUpdate {
  is_available: boolean;
}

export interface ProductImportResult {
  status: string;
  imported_count: number;
  errors: Record<string, unknown>[];
  message: string;
}

// ─── User ──────────────────────────────────────────────
export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  role: UserRole;
  created_at: string;
}

export interface UserCard {
  card_id: number;
  card_name: string;
  discount_rate: number;
  assignment_date: string;
}

export interface UserDetail extends User {
  card: UserCard | null;
}

export interface UserRegister {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  region_id?: number | null;
}

export interface RoleUpdate {
  role: string;
}

// ─── Admin Login ───────────────────────────────────────
export interface AdminLogin {
  identifier: string;
  password: string;
}

// ─── Audit Log ─────────────────────────────────────────
export interface AuditLog {
  id: number;
  user_id: number | null;
  action_type: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ─── Dashboard ─────────────────────────────────────────
export interface DashboardStats {
  regions: number;
  cards: number;
  published_cards: number;
  facilities: number;
  customers: number;
  owners: number;
  products: number;
  available_products: number;
}

// ─── Paginated ─────────────────────────────────────────
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

// ─── Register Response (actually MessageOut) ───────────
export type RegisterResponse = MessageOut;

// ─── Legacy aliases (keep for backward compat during migration) ───
/** @deprecated Use Card */
export type CardOut = Card;
/** @deprecated Use Facility */
export type FacilityOut = Facility;
/** @deprecated Use User */
export type UserOut = User;
/** @deprecated Use UserDetail */
export type UserDetailOut = UserDetail;
/** @deprecated Use AuditLog */
export type AuditLogOut = AuditLog;
/** @deprecated Use TokenOut */
export type AdminLoginResponse = TokenOut;
