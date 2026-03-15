export interface EmergencyContact {
  id: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface EmergencyInfo {
  id: string;
  lockScreenVisible: boolean;
  healthPlan?: string;
  bloodType?: string;
  allergies?: string;
  healthConditions?: string;
  medications: string[];
  contacts: EmergencyContact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyInfoInput {
  lockScreenVisible: boolean;
  healthPlan?: string;
  bloodType?: string;
  allergies?: string;
  healthConditions?: string;
  medications: string[];
  contacts: EmergencyContact[];
}
