export default function Footer() {
  return (
    <footer className="bg-phuket-dark text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Логотип и описание */}
          <div>
            <div className="font-montserrat text-2xl font-bold mb-4">
              Go<span className="text-phuket-yellow">Volley</span>
            </div>
            <p className="text-white/70 mb-6">
              Пляжный волейбол на Пхукете. <br />
              Профессиональные тренировки, <br />
              дружная атмосфера.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-phuket-purple transition-colors"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-phuket-purple transition-colors"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-phuket-purple transition-colors"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h4 className="font-montserrat font-bold text-lg mb-6">
              Быстрые ссылки
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className="text-white/70 hover:text-phuket-yellow transition-colors"
                >
                  Главная
                </a>
              </li>
              <li>
                <a
                  href="/training"
                  className="text-white/70 hover:text-phuket-yellow transition-colors"
                >
                  Тренировки
                </a>
              </li>
              <li>
                <a
                  href="/trainers"
                  className="text-white/70 hover:text-phuket-yellow transition-colors"
                >
                  Тренеры
                </a>
              </li>
              <li>
                <a
                  href="/schedule"
                  className="text-white/70 hover:text-phuket-yellow transition-colors"
                >
                  Расписание
                </a>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-montserrat font-bold text-lg mb-6">Контакты</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-phuket-yellow mt-1 mr-3"></i>
                <span className="text-white/70">Пхукет, Таиланд</span>
              </li>
              <li className="flex items-start">
                <i className="fab fa-whatsapp text-phuket-yellow mt-1 mr-3"></i>
                <span className="text-white/70">+7 (924) 537-91-55</span>
              </li>
              <li className="flex items-start">
                <i className="far fa-envelope text-phuket-yellow mt-1 mr-3"></i>
                <span className="text-white/70">sport-eugene@yandex.ru</span>
              </li>
            </ul>
          </div>

          {/* Часы работы */}
          <div>
            <h4 className="font-montserrat font-bold text-lg mb-6">
              Часы работы
            </h4>
            <div className="space-y-3">
              <div className="text-white/70">
                <div className="font-medium">Утренние тренировки</div>
                <div>07:00 - 09:00</div>
              </div>
              <div className="text-white/70">
                <div className="font-medium">Вечерние тренировки</div>
                <div>16:00 - 18:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/50 text-sm">
          <p>
            © 2026 GoVolley.ru. Все права защищены. Тренировки по пляжному
            волейболу на Пхукете.
          </p>
        </div>
      </div>
    </footer>
  );
}
