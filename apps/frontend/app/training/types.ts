export interface Training {
  id: number;
  title: string;
  description?: string;
  date: string;
  location: string;
  coachName: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  isActive: boolean;
  targetLevel: string;
  startTime: string;
  endTime: string;
}
