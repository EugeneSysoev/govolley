import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const response = await fetch(`http://localhost:3000/training/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch training");
  }

  const training = await response.json();

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/training"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Назад к списку
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero изображение */}
          <div className="h-64 bg-linear-to-r from-blue-500 to-blue-700 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-8xl mb-4">🏐</div>
                <h1 className="text-4xl font-bold">{training.title}</h1>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-blue-700">
                  {training.price ? `${training.price} ₽` : "Бесплатно"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Основная информация */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">О тренировке</h2>
                <p className="text-gray-700 text-lg mb-8">
                  {training.description}
                </p>

                {/* Детали */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      📅 Дата и время
                    </div>
                    <div className="text-xl font-bold">
                      {new Date(training.date).toLocaleDateString("ru-RU", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-gray-600">
                      {new Date(training.date).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl">
                    <div className="text-sm text-green-600 font-medium mb-2">
                      👥 Участники
                    </div>
                    <div className="text-xl font-bold">
                      {training.currentParticipants}/{training.maxParticipants}
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (training.currentParticipants /
                                training.maxParticipants) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Осталось{" "}
                        {training.maxParticipants -
                          training.currentParticipants}{" "}
                        мест
                      </div>
                    </div>
                  </div>
                </div>

                {/* Тренер */}
                {training.coachName && (
                  <div className="bg-white border rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold mb-4">👤 Тренер</h3>
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        {training.coachName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="font-bold text-lg">
                          {training.coachName}
                        </div>
                        <div className="text-gray-600">
                          Профессиональный тренер по волейболу
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Боковая панель */}
              <div>
                <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                  <h3 className="text-xl font-bold mb-4">
                    Запись на тренировку
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Стоимость:</span>
                      <span className="font-bold text-lg">
                        {training.price ? `${training.price} ₽` : "Бесплатно"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Мест доступно:</span>
                      <span className="font-bold">
                        {training.maxParticipants -
                          training.currentParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Длительность:</span>
                      <span>2 часа</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors mb-4">
                    Записаться сейчас
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    Оплата на месте. Отмена за 24 часа бесплатно.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
