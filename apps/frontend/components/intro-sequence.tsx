"use client";

import { useEffect, useState, useMemo } from "react";
import {
  motion,
  Transition,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { interpolate } from "flubber";
import GlobalBackground from "@/components/background/global-background";

interface IntroProps {
  onComplete: () => void;
}

const PATHS = {
  HEAD: "M7360 8530 c-256 -66 -460 -275 -516 -527 -24 -107 -15 -271 19 -376 99 -304 394 -505 713 -484 274 18 514 190 614 439 77 193 63 427 -35 603 -97 173 -257 296 -449 345 -103 26 -244 26 -346 0z",
  HEART:
    "M7500 7200 c200 300 600 300 800 0 c200 -400 -300 -800 -800 -1200 c-500 400 -1000 800 -800 1200 c200 300 600 300 800 0z",
};

export default function IntroSequence({ onComplete }: IntroProps) {
  const [step, setStep] = useState(0);
  const morphProgress = useMotionValue(0);

  // Интерполятор flubber
  const headToHeart = useMemo(
    () => interpolate(PATHS.HEAD, PATHS.HEART, { maxSegmentLength: 10 }),
    [],
  );

  const pathD = useTransform(morphProgress, [0, 1], [PATHS.HEAD, PATHS.HEART], {
    mixer: () => headToHeart,
  });

  useEffect(() => {
    const timeline = [
      { s: 1, t: 400 }, // Появление тела и головы
      { s: 2, t: 600 }, // Появление круга
      { s: 3, t: 800 }, // Появление текста
      { s: 4, t: 1600 }, // Исчезновение текста
      { s: 5, t: 1900 }, // Исчезновение круга и тела
      { s: 6, t: 2300 }, // Рост головы и морфинг в СЕРДЦЕ
      { s: 7, t: 2700 }, // Дрожание сердца
      { s: 8, t: 3200 }, // ВЗРЫВ
      { s: "end", t: 3600 },
    ];

    const timers: NodeJS.Timeout[] = [];

    timeline.forEach(({ s, t }) => {
      const timer = setTimeout(() => {
        if (s === "end") onComplete();
        else {
          setStep(Number(s));
          if (s === 6) {
            animate(morphProgress, 1, { duration: 0.4, ease: "easeOut" });
          }
        }
      }, t as number);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete, morphProgress]);

  const pulseKeyframes = {
    filter: [
      "drop-shadow(0 0 8px rgba(201, 237, 74, 0.7))",
      "drop-shadow(0 0 15px rgba(201, 237, 74, 1))",
      "drop-shadow(0 0 8px rgba(201, 237, 74, 0.7))",
      "drop-shadow(0 10px 8px rgba(0, 0, 0, 0.5))",
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  };

  const pulseTransition: Transition = {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  };
  const explosionEase = [0.7, 0, 0.3, 1] as [number, number, number, number];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#042540" }}
    >
      <GlobalBackground />
      <div className="relative w-80 md:w-112.5 aspect-1565/991">
        <svg
          viewBox="0 0 1565 991"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              {/* Размытие для создания ореола */}
              <feGaussianBlur stdDeviation="8" result="blur" />
              {/* Усиление яркости свечения */}
              <feComposite
                in="blur"
                in2="SourceGraphic"
                operator="out"
                result="glowOut"
              />
              <feMerge>
                <feMergeNode in="glowOut" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(-4.6, 994.7) scale(0.1, -0.1)" fill="#c2ff3f">
            {/* ТЕКСТ */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 3 && step < 4 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Пути текста здесь (ваши path d="...") */}
              <path d="M1020 2273 c-470 -74 -828 -391 -947 -840 -23 -85 -26 -119 -27 -258 -1 -220 30 -351 127 -537 168 -326 476 -540 851 -594 445 -64 914 171 1129 566 86 157 117 296 117 525 l0 165 -597 -2 -598 -3 -3 -252 -2 -253 277 -2 278 -3 -60 -57 c-110 -106 -243 -158 -406 -158 -351 0 -632 324 -581 673 18 126 72 230 171 329 119 118 259 178 420 178 158 0 278 -49 398 -163 71 -67 75 -70 97 -56 51 32 386 303 386 312 0 5 -33 43 -72 85 -226 234 -511 355 -828 351 -58 -1 -116 -3 -130 -6z" />
              <path d="M3292 2265 c-409 -74 -735 -350 -875 -742 -46 -126 -60 -230 -54 -398 5 -179 32 -295 100 -439 60 -125 115 -205 211 -304 108 -111 190 -171 327 -236 245 -118 502 -143 764 -76 453 116 791 513 834 979 10 105 -1 267 -23 365 -120 514 -572 869 -1101 865 -60 0 -143 -7 -183 -14z m331 -531 c211 -54 383 -230 433 -440 23 -99 15 -247 -19 -338 -60 -162 -199 -300 -360 -356 -87 -31 -249 -38 -337 -15 -207 54 -381 227 -434 431 -20 78 -21 213 -1 288 37 142 149 289 279 365 125 74 303 100 439 65z" />
              <path d="M4537 2253 c-2 -5 158 -495 357 -1091 l360 -1082 301 2 300 3 357 1075 c197 591 358 1081 358 1088 0 9 -61 12 -274 12 l-274 0 -30 -82 c-16 -46 -120 -356 -231 -690 -112 -335 -207 -608 -211 -608 -5 0 -27 55 -48 123 -117 363 -407 1234 -415 1245 -7 9 -75 12 -278 12 -147 0 -270 -3 -272 -7z" />
              <path d="M7427 2265 c-354 -67 -650 -290 -811 -612 -181 -360 -145 -806 92 -1143 59 -84 200 -224 281 -279 214 -146 496 -219 740 -192 288 31 517 143 711 347 281 296 378 707 259 1099 -57 187 -142 330 -278 466 -144 145 -317 243 -519 296 -124 32 -353 41 -475 18z m390 -545 c143 -50 270 -162 332 -295 49 -103 65 -170 64 -275 -1 -263 -184 -498 -439 -564 -77 -20 -221 -20 -294 -1 -144 38 -286 144 -363 272 -144 237 -104 530 99 722 80 77 177 132 272 156 83 21 249 14 329 -15z" />
              <path d="M8967 2253 c-4 -3 -7 -494 -7 -1090 l0 -1083 690 0 690 0 0 250 0 250 -422 2 -423 3 -2 710 c-2 391 -3 767 -3 838 l0 127 -258 0 c-142 0 -262 -3 -265 -7z" />
              <path d="M10550 1170 l0 -1090 690 0 690 0 -2 248 -3 247 -420 5 -420 5 -3 838 -2 837 -265 0 -265 0 0 -1090z" />
              <path d="M12130 2133 c0 -136 0 -1911 0 -2000 l0 -53 690 0 690 0 0 250 0 250 -425 0 -425 0 0 180 0 180 378 2 377 3 3 248 2 247 -232 1 c-128 0 -298 1 -378 2 l-145 2 0 155 0 155 145 2 c80 1 265 2 412 2 l267 1 3 123 c2 67 2 179 0 250 l-3 127 -680 0 -679 0 0 -127z" />
              <path d="M13630 2249 c0 -6 36 -77 79 -158 151 -280 469 -867 579 -1072 l112 -205 0 -367 0 -367 265 0 265 0 0 366 0 366 152 282 c83 154 170 315 192 356 22 41 127 237 233 434 106 198 193 364 193 368 0 5 -133 7 -296 6 l-296 -3 -88 -160 c-48 -88 -146 -268 -218 -400 -71 -132 -134 -239 -138 -238 -5 2 -107 183 -228 403 l-219 400 -293 0 c-210 0 -294 -3 -294 -11z" />
            </motion.g>

            {/* КРУГ */}
            <motion.path
              d="M7610 9939 c-1080 -62 -2073 -622 -2692 -1519 -373 -541 -586 -1168 -617 -1818 -37 -774 160 -1497 584 -2142 331 -502 866 -968 1405 -1224 342 -162 696 -265 1100 -322 158 -23 682 -26 830 -6 433 60 774 158 1136 327 441 206 903 574 1223 975 545 684 809 1499 770 2380 -6 140 -17 280 -23 280 -1 0 -84 -35 -427 -179 l-196 -83 -6 -231 c-8 -345 -49 -580 -153 -887 -309 -908 -1080 -1620 -2009 -1854 -274 -69 -483 -91 -790 -83 -314 8 -544 47 -815 137 -438 146 -804 372 -1131 699 -385 385 -640 836 -764 1353 -165 689 -70 1428 261 2033 353 646 927 1132 1609 1360 324 109 577 149 945 148 320 0 564 -39 863 -137 483 -159 883 -418 1235 -799 61 -67 116 -123 121 -125 5 -2 97 34 203 79 106 44 213 89 238 99 25 10 76 32 113 49 l68 31 -78 101 c-315 409 -740 757 -1219 997 -432 217 -875 333 -1384 362 -192 11 -192 11 -400 -1z"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 2 && step < 5 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* ТЕЛО */}
            <motion.path
              d="M10825 7954 c-71 -31 -170 -73 -220 -93 -180 -75 -1083 -454 -1205 -506 -69 -29 -249 -105 -400 -168 -151 -63 -405 -170 -565 -237 -159 -67 -384 -161 -500 -210 -115 -48 -365 -153 -555 -233 -190 -80 -442 -185 -560 -235 -118 -49 -298 -125 -398 -167 -101 -43 -187 -73 -192 -69 -15 17 -41 195 -47 326 -13 314 78 657 243 916 19 29 34 56 34 60 0 4 -29 26 -63 49 -34 23 -152 103 -261 177 -110 75 -204 136 -210 136 -13 0 -19 -8 -101 -150 -315 -540 -386 -1232 -188 -1845 51 -160 223 -535 245 -535 11 0 682 279 1148 477 85 37 186 79 223 94 l68 28 11 -27 c5 -15 39 -112 73 -217 131 -392 224 -845 255 -1235 6 -80 13 -160 16 -177 l5 -33 122 0 c484 0 935 136 1329 401 92 62 216 163 333 271 l69 64 -17 193 c-46 509 -157 1040 -296 1415 -23 60 -41 112 -41 116 0 9 -41 -9 885 380 226 94 509 214 630 265 121 51 286 121 368 155 81 34 147 68 147 74 0 72 -213 596 -242 596 -7 0 -71 -26 -143 -56z"
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 1 && step < 5 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* ГОЛОВА -> СЕРДЦЕ */}
            <motion.path
              d={pathD}
              initial={{ opacity: 0, scale: 1 }}
              animate={
                step < 8
                  ? {
                      opacity: step >= 1 ? 1 : 0,
                      scale: step >= 6 ? 5 : 1,
                      x: step === 7 ? [0, -4, 4, -4, 4, 0] : 0,
                      // Статичное свечение без анимации
                      filter:
                        step >= 1 && step < 6
                          ? "drop-shadow(0 0 8px rgba(201, 237, 74, 0.7))"
                          : "none",
                    }
                  : {
                      scale: 100,
                      opacity: 0,
                      transition: { duration: 0.5, ease: explosionEase },
                    }
              }
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: step === 6 ? 1 : 0.4, ease: "easeInOut" },
                x: { duration: 0.1, repeat: step === 7 ? Infinity : 0 },
                filter: { duration: 0.3 },
              }}
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
              shapeRendering="geometricPrecision"
            />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}
