import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CareTeamRole = "nurse" | "case_manager" | "caregiver" | "care_recipient";

export const careTeamRoleLabels: Record<CareTeamRole, string> = {
  nurse: "Nurse",
  case_manager: "Case Manager",
  caregiver: "Caregiver",
  care_recipient: "Care Recipient",
};

export const careTeamRoleIcons: Record<CareTeamRole, string> = {
  nurse: "stethoscope",
  case_manager: "clipboard-text",
  caregiver: "hand-heart",
  care_recipient: "account-heart",
};

export const careTeamRoleColors: Record<CareTeamRole, { light: string; dark: string }> = {
  nurse: { light: "#DC2626", dark: "#F87171" }, // Red
  case_manager: { light: "#7C3AED", dark: "#A78BFA" }, // Purple
  caregiver: { light: "#059669", dark: "#34D399" }, // Green
  care_recipient: { light: "#087EA4", dark: "#58C4DC" }, // React blue
};

export type CareTeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: CareTeamRole;
  phoneNumber: string;
  email: string;
  profilePicture: string | null;
  specialty?: string; // For nurse
  organization?: string; // For case manager
  certifications?: string[]; // For caregiver
  address?: string; // For care recipient
  emergencyContact?: string; // For care recipient
};

// Mock care team data
export const mockCareTeam: CareTeamMember[] = [
  {
    id: "nurse-1",
    firstName: "Sarah",
    lastName: "Williams",
    fullName: "Sarah Williams, RN",
    role: "nurse",
    phoneNumber: "(555) 111-2222",
    email: "sarah.williams@healthcare.com",
    profilePicture: "https://i.pravatar.cc/150?u=sarah",
    specialty: "Geriatric Care",
  },
  {
    id: "cm-1",
    firstName: "Michael",
    lastName: "Rodriguez",
    fullName: "Michael Rodriguez",
    role: "case_manager",
    phoneNumber: "(555) 222-3333",
    email: "m.rodriguez@careservices.org",
    profilePicture: "https://i.pravatar.cc/150?u=michael",
    organization: "Senior Care Services",
  },
  {
    id: "cg-1",
    firstName: "Emily",
    lastName: "Chen",
    fullName: "Emily Chen",
    role: "caregiver",
    phoneNumber: "(555) 333-4444",
    email: "emily.chen@homecare.com",
    profilePicture: "https://i.pravatar.cc/150?u=emily",
    certifications: ["CNA", "CPR Certified", "First Aid"],
  },
  {
    id: "cr-1",
    firstName: "Eleanor",
    lastName: "Martinez",
    fullName: "Eleanor Martinez",
    role: "care_recipient",
    phoneNumber: "(555) 444-5555",
    email: "eleanor.m@email.com",
    profilePicture: "https://i.pravatar.cc/150?u=eleanor",
    address: "123 Oak Street, Springfield, IL 62701",
    emergencyContact: "Maria Martinez (Daughter) - (555) 555-6666",
  },
];

type CareTeamStoreState = {
  careTeam: CareTeamMember[];
  setCareTeam: (members: CareTeamMember[]) => void;
  getMembersByRole: (role: CareTeamRole) => CareTeamMember[];
  getMemberById: (id: string) => CareTeamMember | undefined;
};

export const useCareTeamStore = create<CareTeamStoreState>()(
  persist(
    (set, get) => ({
      careTeam: mockCareTeam,
      
      setCareTeam: (members) => set({ careTeam: members }),
      
      getMembersByRole: (role) => {
        return get().careTeam.filter((member) => member.role === role);
      },
      
      getMemberById: (id) => {
        return get().careTeam.find((member) => member.id === id);
      },
    }),
    {
      name: "care-team-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
