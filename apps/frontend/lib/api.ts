import { Training, CreateTrainingDto } from "@govolley/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function getTrainings(): Promise<Training[]> {
  const res = await fetch(`${API_URL}/training`, {
    cache: "no-store",
  });
  if (!res.ok) {
    console.error(`API Error: ${res.status}`);
    throw new Error("Ошибка загрузки тренировок");
  }
  return res.json();
}

export async function createTraining(data: CreateTrainingDto) {
  const formattedData = {
    ...data,
    date: new Date(data.date).toISOString(),
  };

  const res = await fetch(`${API_URL}/training`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formattedData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create training");
  }
  return res.json();
}
