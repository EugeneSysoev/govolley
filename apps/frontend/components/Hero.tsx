export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden mt-16">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 z-0 bg-beach-gradient"></div>

      {/* Фоновое изображение */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-montserrat text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Пляжный волейбол на Пхукете
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl">
            Тренировки на закате пляжа Карон. Профессиональные тренеры, дружная
            атмосфера и море позитива!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/booking"
              className="bg-phuket-purple text-white px-8 py-4 rounded-xl font-montserrat font-semibold text-lg hover:bg-phuket-purple-dark transition-colors shadow-lg hover:shadow-xl text-center"
            >
              Записаться на тренировку
            </a>
            <a
              href="/training"
              className="bg-phuket-yellow text-phuket-dark px-8 py-4 rounded-xl font-montserrat font-semibold text-lg hover:bg-phuket-yellow-dark transition-colors shadow-lg hover:shadow-xl text-center"
            >
              Смотреть расписание
            </a>
          </div>
        </div>
      </div>

      {/* Волна внизу */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#F8F5F0"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
