import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDays, subDays, format } from "date-fns";

// Payment status enum
export type PaymentStatus = 
  | "pending"
  | "processing" 
  | "completed"
  | "failed";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Deposited",
  failed: "Failed",
};

export const paymentStatusColors: Record<PaymentStatus, { light: string; dark: string }> = {
  pending: { light: "#F59E0B", dark: "#FBBF24" }, // Amber
  processing: { light: "#3B82F6", dark: "#60A5FA" }, // Blue
  completed: { light: "#10B981", dark: "#34D399" }, // Emerald/Green
  failed: { light: "#EF4444", dark: "#F87171" }, // Red
};

// Payment type enum
export type PaymentType = 
  | "visit_payment"
  | "bonus"
  | "adjustment"
  | "stipend";

export const paymentTypeLabels: Record<PaymentType, string> = {
  visit_payment: "Visit Payment",
  bonus: "Bonus",
  adjustment: "Adjustment",
  stipend: "Stipend",
};

// Payment type
export type Payment = {
  id: string;
  amount: number; // in cents
  type: PaymentType;
  status: PaymentStatus;
  date: string; // ISO date string
  depositDate: string | null; // ISO date string when deposited
  description: string;
  visitId: string | null; // Reference to visit if visit_payment
  careRecipientName: string | null; // For visit payments
  payPeriodStart: string; // ISO date
  payPeriodEnd: string; // ISO date
};

// Store state type
type StipendStoreState = {
  payments: Payment[];
  balance: number; // Available balance in cents
  pendingBalance: number; // Pending balance in cents
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  getPaymentsForPeriod: (start: string, end: string) => Payment[];
};

// Generate mock payments
function generateMockPayments(): Payment[] {
  const payments: Payment[] = [];
  const today = new Date();
  
  // Past payments (completed)
  const pastPayments = [
    {
      id: "pay-1",
      amount: 28500, // $285.00
      type: "visit_payment" as PaymentType,
      status: "completed" as PaymentStatus,
      date: format(subDays(today, 14), "yyyy-MM-dd"),
      depositDate: format(subDays(today, 12), "yyyy-MM-dd"),
      description: "Weekly visits - 5 visits completed",
      visitId: null,
      careRecipientName: null,
      payPeriodStart: format(subDays(today, 21), "yyyy-MM-dd"),
      payPeriodEnd: format(subDays(today, 15), "yyyy-MM-dd"),
    },
    {
      id: "pay-2",
      amount: 31200, // $312.00
      type: "visit_payment" as PaymentType,
      status: "completed" as PaymentStatus,
      date: format(subDays(today, 7), "yyyy-MM-dd"),
      depositDate: format(subDays(today, 5), "yyyy-MM-dd"),
      description: "Weekly visits - 6 visits completed",
      visitId: null,
      careRecipientName: null,
      payPeriodStart: format(subDays(today, 14), "yyyy-MM-dd"),
      payPeriodEnd: format(subDays(today, 8), "yyyy-MM-dd"),
    },
    {
      id: "pay-3",
      amount: 5000, // $50.00
      type: "bonus" as PaymentType,
      status: "completed" as PaymentStatus,
      date: format(subDays(today, 7), "yyyy-MM-dd"),
      depositDate: format(subDays(today, 5), "yyyy-MM-dd"),
      description: "Perfect attendance bonus",
      visitId: null,
      careRecipientName: null,
      payPeriodStart: format(subDays(today, 14), "yyyy-MM-dd"),
      payPeriodEnd: format(subDays(today, 8), "yyyy-MM-dd"),
    },
  ];
  
  // Current period payments (processing/pending)
  const currentPayments = [
    {
      id: "pay-4",
      amount: 29700, // $297.00
      type: "visit_payment" as PaymentType,
      status: "processing" as PaymentStatus,
      date: format(today, "yyyy-MM-dd"),
      depositDate: null,
      description: "Weekly visits - 5 visits completed",
      visitId: null,
      careRecipientName: null,
      payPeriodStart: format(subDays(today, 7), "yyyy-MM-dd"),
      payPeriodEnd: format(subDays(today, 1), "yyyy-MM-dd"),
    },
    {
      id: "pay-5",
      amount: 5400, // $54.00
      type: "visit_payment" as PaymentType,
      status: "pending" as PaymentStatus,
      date: format(today, "yyyy-MM-dd"),
      depositDate: null,
      description: "Eleanor Martinez - 2hr visit",
      visitId: "visit-today-1",
      careRecipientName: "Eleanor Martinez",
      payPeriodStart: format(today, "yyyy-MM-dd"),
      payPeriodEnd: format(addDays(today, 6), "yyyy-MM-dd"),
    },
    {
      id: "pay-6",
      amount: 4050, // $40.50
      type: "visit_payment" as PaymentType,
      status: "pending" as PaymentStatus,
      date: format(today, "yyyy-MM-dd"),
      depositDate: null,
      description: "Robert Johnson - 1.5hr visit",
      visitId: "visit-today-2",
      careRecipientName: "Robert Johnson",
      payPeriodStart: format(today, "yyyy-MM-dd"),
      payPeriodEnd: format(addDays(today, 6), "yyyy-MM-dd"),
    },
  ];
  
  return [...pastPayments, ...currentPayments];
}

const mockPayments = generateMockPayments();

// Calculate balances from payments
const calculateBalances = (payments: Payment[]) => {
  let completed = 0;
  let pending = 0;
  
  payments.forEach((p) => {
    if (p.status === "completed") {
      completed += p.amount;
    } else if (p.status === "pending" || p.status === "processing") {
      pending += p.amount;
    }
  });
  
  return { balance: completed, pendingBalance: pending };
};

const initialBalances = calculateBalances(mockPayments);

export const useStipendStore = create<StipendStoreState>()(
  persist(
    (set, get) => ({
      payments: mockPayments,
      balance: initialBalances.balance,
      pendingBalance: initialBalances.pendingBalance,
      
      setPayments: (payments) => {
        const balances = calculateBalances(payments);
        set({ payments, ...balances });
      },
      
      addPayment: (payment) => set((state) => {
        const newPayments = [...state.payments, payment];
        const balances = calculateBalances(newPayments);
        return { payments: newPayments, ...balances };
      }),
      
      updatePayment: (paymentId, updates) => set((state) => {
        const newPayments = state.payments.map((payment) =>
          payment.id === paymentId ? { ...payment, ...updates } : payment
        );
        const balances = calculateBalances(newPayments);
        return { payments: newPayments, ...balances };
      }),
      
      getPaymentsForPeriod: (start, end) => {
        const state = get();
        return state.payments.filter((payment) => {
          return payment.date >= start && payment.date <= end;
        });
      },
    }),
    {
      name: "stipend-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper to format currency
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
