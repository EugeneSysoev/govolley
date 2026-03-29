"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const QUESTIONS = [
  {
    id: 1,
    text: "Как часто вы играете в пляжный волейбол 2х2?",
    options: [
      { label: "Редко или никогда (зал/классика)", score: 1 },
      { label: "Периодически (1-2 раза в месяц)", score: 2 },
      { label: "Регулярно тренируюсь с тренером", score: 3 },
      { label: "Постоянно участвую в турнирах", score: 4 },
    ],
  },
  {
    id: 2,
    text: "Насколько стабильна ваша подача?",
    options: [
      { label: "Часто ошибаюсь, главное перекинуть", score: 1 },
      { label: "Стабильно, но без направления/силы", score: 2 },
      { label: "Точно в зону или сложный планер", score: 3 },
      { label: "Силовая в прыжке или острый планер", score: 4 },
    ],
  },
  {
    id: 3,
    text: "Оцените ваш контроль мяча (пас напарнику):",
    options: [
      { label: "Мяч часто летит не туда", score: 1 },
      { label: "Довожу до сетки, но пас неудобный", score: 2 },
      { label: "Стабильный пас под атаку", score: 3 },
      { label: "Идеально под рабочую руку", score: 4 },
    ],
  },
  {
    id: 4,
    text: "Знакомы ли вы с тактикой защиты и блоков?",
    options: [
      { label: "Просто стараюсь отбить мяч", score: 1 },
      { label: "Знаю позиции, но часто путаюсь", score: 2 },
      { label: "Использую сигналы пальцами, крою зоны", score: 3 },
      { label: "Читаю нападающего, полная координация", score: 4 },
    ],
  },
  {
    id: 5,
    text: "Ваше отношение к погоде (ветер, песок):",
    options: [
      { label: "Ветер делает игру невозможной", score: 1 },
      { label: "Сильно мешает, быстро устаю", score: 2 },
      { label: "Умею делать поправку на ветер", score: 3 },
      { label: "Погода не влияет, использую ветер", score: 4 },
    ],
  },
];

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Извлекаем userId безопасно
  const userId = (session?.user as any)?.id;

  const handleAnswer = (score: number) => {
    const nextScore = totalScore + score;
    if (currentStep < QUESTIONS.length - 1) {
      setTotalScore(nextScore);
      setCurrentStep(currentStep + 1);
    } else {
      // Чтобы избежать проблем с асинхронностью стейта, передаем счет напрямую
      finishTest(nextScore);
    }
  };

  const finishTest = async (finalScore: number) => {
    if (!userId) {
      console.error("USER ID IS MISSING");
      alert(
        "Ошибка: сессия истекла или ID пользователя не найден. Перезайдите на сайт.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // КРИТИЧЕСКИЙ ФИКС: Используем только префикс /api.
      // Это направит запрос через Next.js Rewrites на порт 3000.
      const API_ENDPOINT = "/api/users/complete-onboarding";

      console.log("Submitting Onboarding:", { userId, totalScore: finalScore });

      const res = await fetch(API_ENDPOINT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Заголовок для обхода окна-предупреждения ngrok
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ userId, totalScore: finalScore }),
      });

      if (res.ok) {
        // 1. Обновляем сессию (skillLevel теперь в БД)
        await update({ skillLevel: "STATED_IN_DB" });

        // 2. Жесткий редирект для сброса кэша всех гардов
        window.location.href = "/profile";
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Backend Error Response:", errorData);
        alert(
          `Ошибка сохранения: ${errorData.message || "Неверный формат данных"}`,
        );
      }
    } catch (error) {
      console.error("Onboarding submission error:", error);
      alert("Не удалось связаться с сервером. Проверьте соединение.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950">
      <div className="max-w-md w-full bg-zinc-900 rounded-3xl border border-white/5 shadow-2xl p-8">
        {/* Прогресс-бар */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-brand-lime font-bold text-sm tracking-widest uppercase">
              Onboarding
            </span>
            <span className="text-zinc-500 text-xs">
              {currentStep + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-lime h-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Вопрос */}
        <h2 className="text-2xl font-bold mb-8 text-white leading-tight">
          {QUESTIONS[currentStep].text}
        </h2>

        {/* Варианты */}
        <div className="space-y-3">
          {QUESTIONS[currentStep].options.map((opt, index) => (
            <button
              key={index}
              disabled={isSubmitting}
              onClick={() => handleAnswer(opt.score)}
              className="w-full text-left p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-brand-lime hover:text-black hover:border-brand-lime transition-all duration-200 active:scale-[0.98] disabled:opacity-50 group"
            >
              <span className="font-semibold block">{opt.label}</span>
            </button>
          ))}
        </div>

        {isSubmitting && (
          <p className="mt-6 text-center text-zinc-500 text-sm animate-pulse">
            Сохраняем ваш уровень...
          </p>
        )}
      </div>
    </div>
  );
}
