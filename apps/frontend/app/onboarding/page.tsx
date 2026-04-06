"use client";

// Импорты
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { QUESTIONS } from "./constants";

// URL бэкенда
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3000/api";

export default function OnboardingPage() {
  // Сессия пользователя
  const { data: session, update } = useSession();
  // Текущий шаг и ответы
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUESTIONS.length).fill(null),
  );
  // Состояние отправки
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Расчет общего балла
  const totalScore = answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);

  // Обработка выбора ответа
  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = score;
    const trimmedAnswers = newAnswers.slice(0, currentStep + 1);
    setAnswers(trimmedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Финальный балл с коррекцией
      const finalScore = totalScore + score - (answers[currentStep] ?? 0);
      finishTest(finalScore);
    }
  };

  // Возврат к предыдущему шагу
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Завершение теста и отправка на бэкенд
  const finishTest = async (finalScore: number) => {
    const token = (session as any)?.accessToken;
    if (!token) {
      alert(
        "Ошибка: Токен не найден. Попробуйте обновить страницу или войти заново.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/complete-onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ totalScore: finalScore }),
      });

      if (res.ok) {
        const data = await res.json();
        await update({
          ...session,
          user: {
            ...session?.user,
            skillLevel: data.skillLevel,
          },
        });
        router.push("/profile");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(
          `Ошибка: ${errorData.message || "Не удалось сохранить результат"}`,
        );
      }
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Не удалось связаться с сервером бэкенда.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Текущий вопрос
  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl p-8">
        {/* Прогресс-бар */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-brand-lime font-bold text-sm tracking-widest uppercase">
              Определяем твой уровень
            </span>
            <span className="text-zinc-400 text-xs font-mono">
              {currentStep + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-lime h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(163,230,53,0.5)]"
              style={{
                width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Вопрос */}
        <div className="min-h-25 flex items-center mb-8">
          <h2 className="text-2xl font-bold text-white leading-tight">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, index) => {
            const isSelected = answers[currentStep] === opt.score;
            return (
              <button
                key={index}
                disabled={isSubmitting}
                onClick={() => handleAnswer(opt.score)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group ${
                  isSelected
                    ? "bg-brand-lime text-black border-brand-lime"
                    : "border-white/5 bg-white/5 hover:bg-brand-lime hover:text-black hover:border-brand-lime"
                }`}
              >
                <span className="font-semibold block transition-colors">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Кнопка "Назад" и индикатор загрузки */}
        <div className="mt-8 flex justify-between items-center">
          {currentStep > 0 && !isSubmitting && (
            <button
              onClick={goBack}
              className="text-white/40 hover:text-brand-lime text-sm uppercase tracking-wider font-mono transition-colors"
            >
              ← Назад
            </button>
          )}
          <div className="flex-1" />
          {isSubmitting && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-400 text-xs animate-pulse">
                Сохраняем...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
