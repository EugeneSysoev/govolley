import { notFound } from "next/navigation";
import Link from "next/link";
import GlobalBackground from "@/components/background/global-background";
import { BookingSidebar } from "./booking-sidebar";
import { TrainingLocationView } from "./training-details-view";
import { LOCATIONS } from "../../locations/constants";

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/training/${id}`,
    { cache: "no-store" },
  );

  if (!response.ok) notFound();
  const training = await response.json();

  const locationInfo = LOCATIONS.find(
    (l) => l.name.toLowerCase() === training.location.toLowerCase(),
  );

  return (
    <div className="relative min-h-screen text-white pt-30 lg:pt-40 pb-20 overflow-hidden">
      <GlobalBackground />

      <div className="container relative z-10 mx-auto px-4">
        <header className="mb-2">
          <h1 className="heading-hero2 text-center text-[clamp(4rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight">
            {training.title}
          </h1>
        </header>

        <Link
          href="/training"
          className="group inline-flex items-center mb-8 lg:mb-12 text-white/40 hover:text-brand-lime transition-colors"
        >
          <span className="mr-2 transition-transform group-hover:-translate-x-2 text-xl">
            ←
          </span>
          <span className="text-[10px] uppercase font-black tracking-[0.2em]">
            Назад к расписанию
          </span>
        </Link>

        {/* Изменено: gap-6 для мобилок, order-1 для локации, order-2 для сайдбара */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 lg:px-20 items-stretch">
          <div className="lg:col-span-7 h-full order-1">
            <TrainingLocationView
              name={training.location}
              image={locationInfo?.image}
              googleUrl={locationInfo?.googleUrl}
              fullHeight
            />
          </div>

          <aside className="lg:col-span-5 h-full order-2">
            <BookingSidebar training={training} />
          </aside>
        </div>
      </div>
    </div>
  );
}