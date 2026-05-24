/**
 * Client information for agent orders
 * Captured at order time and embedded in order documents
 */

export interface ClientInfo {
  completeName: string;
  storeName: string;
  address: string;
  contactNo: string;
  pinLocation: string;
  storeImage: string; // URI or URL
}

export type PaymentMode = "cash" | "card" | "check" | "bank-transfer";

export const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "check", label: "Check" },
  { value: "bank-transfer", label: "Bank Transfer" },
];
