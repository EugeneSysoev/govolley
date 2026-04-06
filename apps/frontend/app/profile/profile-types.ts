export interface Booking {
  id: number;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  training: {
    id: number;
    title: string;
    date: string;
    startTime: string;
    location: string;
  };
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  skillLevel: string;
}
