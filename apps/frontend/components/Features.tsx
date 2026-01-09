// apps/frontend/components/Features.tsx
export default function Features() {
  const features = [
    {
      icon: "fas fa-sun",
      color: "text-phuket-yellow",
      bgColor: "bg-phuket-yellow/10",
      title: "Закатные тренировки",
      description:
        "Занимаемся в самое красивое время дня, когда солнце не палит, а пляж окрашивается в пурпурно-золотые тона.",
    },
    {
      icon: "fas fa-volleyball-ball",
      color: "text-phuket-purple",
      bgColor: "bg-phuket-purple/10",
      title: "Профессиональные тренеры",
      description:
        "Наши инструкторы - опытные игроки с педагогическим подходом. Работаем как с новичками, так и с продвинутыми.",
    },
    {
      icon: "fas fa-users",
      color: "text-phuket-yellow",
      bgColor: "bg-phuket-yellow/10",
      title: "Разные уровни групп",
      description:
        "Группы для начинающих, продолжающих и продвинутых игроков. Индивидуальный подход в каждой группе.",
    },
    {
      icon: "fas fa-concierge-bell",
      color: "text-phuket-purple",
      bgColor: "bg-phuket-purple/10",
      title: "Весь инвентарь предоставляем",
      description:
        "Мячи, сетка, защита от солнца - все необходимое для комфортной тренировки уже включено.",
    },
  ];

  return (
    <section className="py-20 bg-phuket-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-phuket-dark mb-4">
            Почему тренируются с нами
          </h2>
          <p className="text-xl text-phuket-dark/60 max-w-2xl mx-auto">
            Мы создаем идеальные условия для вашего прогресса
          </p>

          {/* Декоративная линия */}
          <div className="w-24 h-1 bg-linear-to-r from-phuket-yellow to-phuket-purple mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-hover transition-all duration-300 border border-phuket-light group hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <i className={`${feature.icon} ${feature.color} text-2xl`}></i>
              </div>

              <h3 className="font-montserrat font-bold text-xl text-phuket-dark mb-4">
                {feature.title}
              </h3>

              <p className="text-phuket-dark/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
