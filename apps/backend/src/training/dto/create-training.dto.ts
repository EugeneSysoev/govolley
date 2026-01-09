// Упрощённая версия БЕЗ декораторов
export class CreateTrainingDto {
  title!: string;
  description?: string;
  date!: Date;
  maxParticipants?: number = 10;
  price?: number;
  coachName?: string;
  location?: string;
}
