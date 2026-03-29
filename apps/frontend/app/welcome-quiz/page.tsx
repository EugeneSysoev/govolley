"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  { id: 1, text: "Как давно ты играешь в пляжный волейбол?", options: ["Первый раз", "Меньше года", "Больше года"] },
  { id: 2, text: "Как ты подаешь мяч?", options: ["Снизу", "Сверху стабильно", "В прыжке / Силовая"] },
  { id: 3, text: "Умеешь ли ты делать 'накат' (shot)?", options: ["Нет", "Иногда получается", "Да, в любую зону"] },
  // Добавь еще 2 вопроса по вкусу
];

export default function WelcomeQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const router = useRouter();

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    if (step < questions.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      // Здесь будет логика сохранения в БД через Server Action
      saveResults(newAnswers);
    }
  };

  const saveResults = async (finalAnswers: string[]) => {
    // Примерная логика расчета: если много "профи" ответов -> LEVEL_B, иначе LEVEL_C
    const level = finalAnswers.includes("В прыжке / Силовая") ? "LEVEL_B" : "LEVEL_C";
    
    // В будущем тут будет fetch('/api/user/update-level')
    console.log("Определенный уровень:", level);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
      <h2 className="text-xl mb-4 text-brand-lime">Вопрос {step + 1} из {questions.length}</h2>
      <p className="text-lg mb-8">{questions[step].text}</p>
      <div className="flex flex-col gap-3">
        {questions[step].options.map((opt) => (
          <button 
            key={opt}
            onClick={() => handleAnswer(opt)}
            className="p-4 bg-white/10 hover:bg-brand-lime hover:text-black transition-all rounded-xl"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}