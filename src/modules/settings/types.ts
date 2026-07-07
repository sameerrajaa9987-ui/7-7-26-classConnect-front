export interface Settings {
  id: string;
  organizationId: string;
  institute: {
    legalName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
    principalName: string;
    affiliationNo: string;
    gstin: string;
  };
  academic: {
    currentSession: string;
    sessionStartMonth: number;
    gradingScheme: "percentage" | "gpa" | "letter";
    passPercentage: number;
    weekOff: number[];
  };
  fees: {
    currency: string;
    invoicePrefix: string;
    receiptPrefix: string;
    lateFeePerDay: number;
    taxEnabled: boolean;
    taxRatePct: number;
  };
  attendance: {
    absenceAlertAfterDays: number;
    lateGraceMinutes: number;
    notifyParentOnAbsent: boolean;
    notifyParentOnLate: boolean;
  };
  ids: { admissionNoPrefix: string; studentIdPrefix: string };
  notifications: {
    channels: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      push: boolean;
    };
    quietHoursStart: number;
    quietHoursEnd: number;
  };
  updatedAt: string;
}

export type SettingsPatch = {
  institute?: Partial<Settings["institute"]>;
  academic?: Partial<Settings["academic"]>;
  fees?: Partial<Settings["fees"]>;
  attendance?: Partial<Settings["attendance"]>;
  ids?: Partial<Settings["ids"]>;
  notifications?: {
    channels?: Partial<Settings["notifications"]["channels"]>;
    quietHoursStart?: number;
    quietHoursEnd?: number;
  };
};
