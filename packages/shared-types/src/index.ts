export interface Training {
  id: number;
  title: string;
  description: string | null;
  date: Date | string;
  maxParticipants: number;
  currentParticipants: number;
  price: number | null;
  coachName: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateTrainingDto {
  title: string;
  description?: string | null;
  date: Date | string;
  maxParticipants?: number;
  price?: number | null;
  coachName?: string | null;
  location?: string | null;
}

export interface UpdateTrainingDto extends Partial<CreateTrainingDto> {
  isActive?: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: Date | string;
}

export interface Booking {
  id: number;
  userId: number;
  trainingId: number;
  participants: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentId?: string | null;
  createdAt: Date | string;
}
