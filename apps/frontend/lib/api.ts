import { Training, CreateTrainingDto } from "@govolley/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getTrainings(): Promise<Training[]> {
  const res = await fetch(`${API_URL}/training`);
  if (!res.ok) throw new Error("Ошибка загрузки тренировок");
  return res.json();
}

export async function createTraining(data: CreateTrainingDto) {
  const res = await fetch(`${API_URL}/training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
