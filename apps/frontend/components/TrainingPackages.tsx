// apps/frontend/components/TrainingPackages.tsx
export default function TrainingPackages() {
  const packages = [
    {
      title: "Разовое занятие",
      price: "1,200",
      currency: "THB",
      popular: false,
      features: [
        "1.5 часа тренировки",
        "Инвентарь включен",
        "Фото с тренировки",
        "Группа до 10 человек",
      ],
    },
    {
      title: "Пакет 'Неделя'",
      price: "5,500",
      currency: "THB",
      popular: true,
      features: [
        "5 тренировок за неделю",
        "Инвентарь включен",
        "Видеоанализ техники",
        "Фотосессия на закате",
        "Фирменная футболка",
      ],
    },
    {
      title: "Индивидуальная",
      price: "2,500",
      currency: "THB",
      popular: false,
      features: [
        "1.5 часа персонально",
        "Инвентарь включен",
        "Программа под цели",
        "Гибкое расписание",
      ],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-phuket-dark mb-4">
            Тренировки и пакеты
          </h2>
          <p className="text-xl text-phuket-dark/60 max-w-2xl mx-auto">
            Выберите формат, который подходит именно вам
          </p>

          {/* Декоративная линия */}
          <div className="w-24 h-1 bg-linear-to-r from-phuket-yellow to-phuket-purple mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2 ${
                pkg.popular
                  ? "border-phuket-yellow shadow-xl"
                  : "border-phuket-light shadow-soft hover:shadow-hover"
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-4 right-4 bg-phuket-yellow text-phuket-dark font-montserrat font-bold text-sm px-4 py-1 rounded-full">
                  Популярно
                </div>
              )}

              <div className="p-8">
                <div className="mb-8">
                  <h3 className="font-montserrat font-bold text-2xl text-phuket-dark mb-2">
                    {pkg.title}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="font-montserrat font-bold text-4xl text-phuket-purple">
                      {pkg.price}
                    </span>
                    <span className="text-phuket-dark/50 ml-2">
                      {pkg.currency}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <i className="fas fa-check text-phuket-yellow mt-1 mr-3"></i>
                      <span className="text-phuket-dark/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl font-montserrat font-bold transition-colors ${
                    pkg.popular
                      ? "bg-linear-to-r from-phuket-yellow to-phuket-yellow-dark text-phuket-dark hover:shadow-lg"
                      : "bg-phuket-purple text-white hover:bg-phuket-purple-dark"
                  }`}
                >
                  {pkg.popular ? "Выбрать пакет" : "Записаться"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Примечание */}
        <div className="mt-12 text-center">
          <p className="text-phuket-dark/60 inline-flex items-center">
            <i className="fas fa-info-circle text-phuket-purple mr-2"></i>
            Все цены указаны в тайских батах. Возможна оплата в рублях по курсу
            дня.
          </p>
        </div>
      </div>
    </section>
  );
}
