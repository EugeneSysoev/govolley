import { Training } from "./types";

// Базовый URL API для тренировок
const API_BASE = "/api/training";

// Заголовки по умолчанию для всех запросов
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "69420",
};

/**
 * Обработчик ответа от сервера
 * @param res - ответ от fetch
 * @returns Распарсенные данные или ошибка
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Ошибка сервера: ${res.status}`);
  }
  return res.json();
}

// Экспортируемый API для работы с тренировками
export const trainingApi = {
  /**
   * Получение всех тренировок
   * @returns Массив тренировок или пустой массив при ошибке
   */
  getAll: async (): Promise<Training[]> => {
    try {
      const res = await fetch(API_BASE, {
        cache: "no-store",
        headers: DEFAULT_HEADERS,
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Failed to fetch trainings:", err);
      return [];
    }
  },

  /**
   * Создание новой тренировки
   * @param data - данные тренировки с значениями по умолчанию
   * @returns Созданная тренировка
   */
  create: async (data: Partial<Training>) => {
    const payload = {
      title: data.title || "Новая тренировка",
      description: data.description || "",
      coachName: data.coachName || "Евгений Сысоев",
      price: data.price !== undefined ? Number(data.price) : 0,
      maxParticipants: Number(data.maxParticipants) || 10,
      location: data.location,
      date: data.date
        ? new Date(data.date).toISOString()
        : new Date().toISOString(),
      startTime: data.startTime || "07:00",
      endTime: data.endTime || "09:00",
      targetLevel: data.targetLevel || "NOT_SET",
    };

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(payload),
    });

    return handleResponse<Training>(res);
  },

  /**
   * Обновление существующей тренировки
   * @param id - ID тренировки
   * @param data - данные для обновления
   * @returns Обновленная тренировка
   */
  update: async (id: number, data: Partial<Training>) => {
    const payload = {
      ...data,
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.maxParticipants !== undefined && {
        maxParticipants: Number(data.maxParticipants),
      }),
      ...(data.date && { date: new Date(data.date).toISOString() }),
    };

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(payload),
    });

    return handleResponse<Training>(res);
  },

  /**
   * Удаление тренировки
   * @param id - ID тренировки
   * @returns true при успешном удалении
   */
  delete: async (id: number) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: DEFAULT_HEADERS,
    });
    if (!res.ok) throw new Error("Ошибка при удалении");
    return true;
  },
};
