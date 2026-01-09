interface SunsetSectionProps {
  title: string;
  subtitle: string;
}

export default function SunsetSection({ title, subtitle }: SunsetSectionProps) {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Фоновый градиент */}
      <div className="absolute inset-0 bg-linear-to-r from-phuket-purple/20 via-phuket-yellow/10 to-phuket-peach/10"></div>

      {/* Декоративные элементы */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-phuket-yellow/10 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-phuket-purple/10 blur-xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-phuket-yellow to-phuket-purple mb-4">
              <i className="fas fa-sun text-white text-3xl"></i>
            </div>
          </div>

          <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-phuket-dark mb-4">
            {title}
          </h1>

          <p className="text-xl text-phuket-dark/70 mb-8">{subtitle}</p>

          {/* Декоративная линия */}
          <div className="w-24 h-1 bg-linear-to-r from-phuket-yellow to-phuket-purple mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Волна внизу */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
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
