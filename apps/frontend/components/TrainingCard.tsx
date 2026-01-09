// apps/frontend/components/TrainingCard.tsx
import { Training } from "@govolley/shared-types";
import Link from "next/link";

interface TrainingCardProps {
  training: Training;
}

export default function TrainingCard({ training }: TrainingCardProps) {
  const date = new Date(training.date);
  const isFull = training.currentParticipants >= training.maxParticipants;
  const isSunset = date.getHours() >= 17 && date.getHours() <= 20;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 border border-phuket-light group">
      {/* Верхний баннер */}
      <div
        className={`p-4 ${isSunset ? "bg-sunset-gradient" : "bg-phuket-light"}`}
      >
        <div className="flex justify-between items-center">
          <span
            className={`font-montserrat font-semibold ${
              isSunset ? "text-white" : "text-phuket-dark"
            }`}
          >
            {isSunset ? "🌅 Закатная тренировка" : "🏐 Стандартная"}
          </span>
          {isFull && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Мест нет
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Заголовок и цена */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-montserrat font-bold text-xl text-phuket-dark group-hover:text-phuket-purple transition-colors">
            {training.title}
          </h3>
          <div className="bg-phuket-purple/10 text-phuket-purple font-bold px-3 py-1 rounded-lg font-montserrat">
            {training.price ? `${training.price} ₽` : "Бесплатно"}
          </div>
        </div>

        {/* Описание */}
        <p className="text-phuket-dark/70 mb-6 line-clamp-2">
          {training.description ||
            "Тренировка на пляже Карон с профессиональным тренером"}
        </p>

        {/* Детали */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center text-phuket-dark">
            <div className="w-8 text-phuket-yellow">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div>
              <div className="font-montserrat font-medium">
                {date.toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <div className="text-sm text-phuket-dark/50">
                {date.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {training.coachName && (
            <div className="flex items-center text-phuket-dark">
              <div className="w-8 text-phuket-purple">
                <i className="fas fa-user"></i>
              </div>
              <span>
                Тренер:{" "}
                <span className="font-montserrat font-medium">
                  {training.coachName}
                </span>
              </span>
            </div>
          )}

          {training.location && (
            <div className="flex items-center text-phuket-dark">
              <div className="w-8 text-phuket-peach">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <span>{training.location}</span>
            </div>
          )}

          {/* Прогресс бар участников */}
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-phuket-dark/60">Участники:</span>
              <span className="font-montserrat font-medium">
                {training.currentParticipants || 0}/{training.maxParticipants}
              </span>
            </div>
            <div className="w-full bg-phuket-light rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  isFull ? "bg-red-500" : "bg-phuket-yellow"
                }`}
                style={{
                  width: `${
                    ((training.currentParticipants || 0) /
                      training.maxParticipants) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            {!isFull && (
              <div className="text-xs text-phuket-dark/50 mt-1">
                Осталось{" "}
                {training.maxParticipants - (training.currentParticipants || 0)}{" "}
                мест
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex space-x-3">
          <button
            className={`flex-1 py-3 rounded-xl font-montserrat font-semibold transition-colors ${
              isFull
                ? "bg-phuket-light text-phuket-dark/40 cursor-not-allowed"
                : "bg-phuket-purple text-white hover:bg-phuket-purple-dark"
            }`}
            disabled={isFull}
          >
            {isFull ? "Мест нет" : "Записаться"}
          </button>
          <Link
            href={`/training/${training.id}`}
            className="flex items-center justify-center w-12 border border-phuket-light rounded-xl hover:bg-phuket-sand transition-colors text-phuket-dark hover:text-phuket-purple"
          >
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
