"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import GlobalBackground from "@/components/background/global-background";

// Импорт компонентов профиля
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileBookings } from "./profile-bookings";
import { PhotoModal } from "./photo-modal";
import { Booking, ProfileFormData } from "./profile-types";

// URL бэкенда
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3000/api";

export default function ProfilePage() {
  // Получение сессии пользователя
  const { data: session, update, status } = useSession();
  const user = session?.user as any;
  const accessToken = (session as any)?.accessToken;

  // Состояния для редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния для аватара
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Данные формы профиля
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    skillLevel: "NOT_SET",
  });

  // Список бронирований
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Инициализация данных формы из сессии
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        skillLevel: user.skillLevel || "NOT_SET",
      });
      setAvatarPreview(user.image || null);
    }
  }, [user]);

  // Загрузка бронирований пользователя
  useEffect(() => {
    if (!user || !accessToken) return;
    fetch(`${BACKEND_URL}/users/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data) ? data : data?.bookings || [];
        setBookings([...normalized]);
      })
      .catch(() => setBookings([]));
  }, [user, accessToken]);

  // Сохранение профиля
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = new FormData();
      if (avatarFile) payload.append("image", avatarFile);
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("skillLevel", formData.skillLevel);

      const response = await fetch(`${BACKEND_URL}/users/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: payload,
      });

      if (!response.ok) throw new Error("Ошибка сохранения");
      const updatedUser = await response.json();

      await update({ user: { ...session?.user, ...updatedUser } });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Подтверждение уровня навыков
  const handleVerifyLevel = async () => {
    if (!accessToken || !user?.id) return;
    setIsVerifying(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/users/verify-level/${user.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isLevelVerified: true }),
        },
      );

      if (!response.ok) throw new Error("Ошибка подтверждения уровня");

      // Обновляем сессию, чтобы isLevelVerified стал true
      await update({ user: { ...session?.user, isLevelVerified: true } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Загрузка сессии
  if (status === "loading") return null;

  return (
    <main className="relative min-h-screen pt-30 lg:pt-40 pb-20 overflow-hidden">
      <GlobalBackground />

      <div className="container relative z-10 mx-auto px-4">
        {/* Заголовок страницы */}
        <header className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="heading-hero2 text-center text-[clamp(3.5rem,8vw,6rem)] text-brand-white block drop-shadow-lg/50 tracking-tight"
          >
            Профиль
          </motion.h1>
        </header>

        {/* Ссылка на главную */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href="/"
              className="group inline-flex items-center text-white/40 hover:text-brand-lime transition-colors"
            >
              <span className="mr-2 transition-transform group-hover:-translate-x-2 text-xl">
                ←
              </span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em]">
                На главную
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="max-w-xl mx-auto">
          {/* Карточка профиля */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/2 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 flex flex-col hover:border-brand-lime/20 transition-all duration-500 relative overflow-hidden"
          >
            <ProfileHeader
              user={user}
              accessToken={accessToken}
              isEditing={isEditing}
              formData={formData}
              setFormData={setFormData}
              avatarPreview={avatarPreview}
              onAvatarClick={() => avatarPreview && setIsPhotoModalOpen(true)}
              onAvatarChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAvatarFile(file);
                  setAvatarPreview(URL.createObjectURL(file));
                }
              }}
              fileInputRef={fileInputRef}
            />

            <ProfileStats
              user={user}
              userRole={user?.role}
              isEditing={isEditing}
              formData={formData}
              setFormData={setFormData}
              onVerify={handleVerifyLevel}
              isVerifying={isVerifying}
            />

            {/* Сообщение об ошибке */}
            {error && (
              <div className="mt-6 text-[clamp(0.65rem,1.5vw,0.7rem)] text-red-400 font-mono tracking-widest">
                {error}
              </div>
            )}

            {/* Кнопки действий */}
            <div className="mt-10 flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-2 px-10 py-4 bg-brand-lime text-black font-black uppercase text-[11px] tracking-widest rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {isSaving ? "Сохранение..." : "Сохранить"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-nav-premium w-full max-w-sm mx-auto py-4 text-[10px] uppercase tracking-[0.25em]"
                >
                  Редактировать профиль
                </button>
              )}
            </div>
            {!isEditing && <LogoutButton />}
          </motion.div>

          {/* Секция бронирований */}
          <div className="mt-8">
            <ProfileBookings bookings={bookings} />
          </div>
        </div>
      </div>

      {/* Модальное окно фото */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        photoUrl={avatarPreview}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </main>
  );
}
