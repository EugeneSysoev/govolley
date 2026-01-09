// apps/frontend/app/training/page.tsx
import { Training } from "@govolley/shared-types";
import TrainingCard from "@/components/TrainingCard";
import SunsetSection from "@/components/SunsetSection";

export default async function TrainingPage() {
  const response = await fetch("http://localhost:3000/training", {
    cache: "no-store",
  });

  if (!response.ok)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-phuket-yellow">😕</div>
          <h1 className="text-2xl font-bold mb-2 text-phuket-dark">
            Ошибка загрузки
          </h1>
          <p className="text-phuket-dark/60">
            Не удалось загрузить тренировки. Попробуйте позже.
          </p>
        </div>
      </div>
    );

  const trainings: Training[] = await response.json();

  return (
    <div className="pt-20">
      {/* Hero секция */}
      <SunsetSection
        title="Тренировки на закате"
        subtitle="Выберите подходящий формат тренировки на пляже Карон"
      />

      <div className="container mx-auto px-4 py-16">
        {/* Фильтры */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-10 border border-phuket-light">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="font-montserrat font-medium text-phuket-dark">
              Фильтры:
            </div>
            <button className="px-5 py-2 bg-phuket-purple text-white rounded-lg font-montserrat font-medium">
              Все тренировки
            </button>
            <button className="px-5 py-2 bg-phuket-light text-phuket-dark rounded-lg font-montserrat hover:bg-phuket-sand transition-colors">
              <i className="fas fa-sun text-phuket-yellow mr-2"></i> Закатные
            </button>
            <button className="px-5 py-2 bg-phuket-light text-phuket-dark rounded-lg font-montserrat hover:bg-phuket-sand transition-colors">
              <i className="fas fa-users text-phuket-purple mr-2"></i> Групповые
            </button>
            <button className="px-5 py-2 bg-phuket-light text-phuket-dark rounded-lg font-montserrat hover:bg-phuket-sand transition-colors">
              <i className="fas fa-user text-phuket-peach mr-2"></i>{" "}
              Индивидуальные
            </button>
            <div className="ml-auto">
              <select className="px-5 py-2 border border-phuket-light rounded-lg bg-white font-montserrat text-phuket-dark focus:outline-none focus:ring-2 focus:ring-phuket-purple">
                <option>Сначала новые</option>
                <option>Сначала дешевые</option>
                <option>С ближайшей датой</option>
              </select>
            </div>
          </div>
        </div>

        {/* Список тренировок */}
        {trainings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 text-phuket-yellow">🏐</div>
            <h2 className="text-3xl font-bold mb-4 font-montserrat text-phuket-dark">
              Пока нет тренировок
            </h2>
            <p className="text-phuket-dark/60 text-lg max-w-md mx-auto">
              Тренировки скоро появятся. Оставайтесь на связи!
            </p>
            <a
              href="/contact"
              className="inline-block mt-8 bg-phuket-yellow text-phuket-dark px-8 py-3 rounded-xl font-montserrat font-semibold hover:bg-phuket-yellow-dark transition-colors"
            >
              Предложить тренировку
            </a>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold font-montserrat text-phuket-dark">
                  Доступные тренировки{" "}
                  <span className="text-phuket-purple">
                    ({trainings.length})
                  </span>
                </h2>
                <p className="text-phuket-dark/60 mt-2">
                  Забронируйте место на самой красивой тренировке дня
                </p>
              </div>
              <a
                href="/booking"
                className="mt-4 sm:mt-0 bg-phuket-purple text-white px-8 py-3 rounded-xl font-montserrat font-semibold hover:bg-phuket-purple-dark transition-colors shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-plus mr-2"></i> Новая тренировка
              </a>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {trainings.map((training) => (
                <TrainingCard key={training.id} training={training} />
              ))}
            </div>

            {/* Статистика */}
            <div className="mt-16 p-8 bg-linear-to-r from-phuket-purple/10 to-phuket-yellow/10 rounded-2xl border border-phuket-purple/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-phuket-purple font-montserrat">
                    {trainings.length}
                  </div>
                  <div className="text-phuket-dark/70 mt-2">Тренировок</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-phuket-yellow font-montserrat">
                    {trainings.reduce(
                      (sum, t) => sum + (t.currentParticipants || 0),
                      0
                    )}
                  </div>
                  <div className="text-phuket-dark/70 mt-2">Участников</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-phuket-peach font-montserrat">
                    {trainings.filter((t) => t.coachName).length}
                  </div>
                  <div className="text-phuket-dark/70 mt-2">
                    Профессиональных тренеров
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-phuket-purple font-montserrat">
                    {trainings.filter((t) => !t.price || t.price === 0).length}
                  </div>
                  <div className="text-phuket-dark/70 mt-2">
                    Бесплатных тренировок
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
