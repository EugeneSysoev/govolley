"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ProfileFormData } from "./profile-types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:3000/api";

interface ProfileHeaderProps {
  user: any;
  accessToken?: string;
  isEditing: boolean;
  formData: ProfileFormData;
  setFormData: (data: ProfileFormData) => void;
  avatarPreview: string | null;
  onAvatarClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function ProfileHeader({
  user,
  accessToken,
  isEditing,
  formData,
  setFormData,
  avatarPreview,
  onAvatarClick,
  onAvatarChange,
  fileInputRef,
}: ProfileHeaderProps) {
  const [joinDate, setJoinDate] = useState<string>("");

  const setDate = useCallback((createdAt: string) => {
    const date = new Date(createdAt);
    if (!isNaN(date.getTime())) {
      setJoinDate(
        date
          .toLocaleDateString("ru-RU", { month: "short", year: "numeric" })
          .replace(" г.", ""),
      );
    } else {
      setJoinDate("");
    }
  }, []);

  useEffect(() => {
    if (user?.createdAt) {
      setDate(user.createdAt);
      return;
    }

    if (!user?.id || !accessToken) return;

    const controller = new AbortController();
    const signal = controller.signal;

    fetch(`${BACKEND_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
      .then((res) => res.json())
      .then((profile) => {
        if (profile?.createdAt) setDate(profile.createdAt);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, [user?.createdAt, user?.id, accessToken, setDate]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-32 h-32 md:w-40 md:h-40 rounded-4xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden cursor-pointer group flex items-center justify-center hover:border-brand-lime/40 transition-colors"
          onClick={onAvatarClick}
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl font-black text-white/20 uppercase">
              {formData.firstName?.[0] || user?.username?.[0] || "U"}
            </span>
          )}
        </motion.div>

        {isEditing && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-lime text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          >
            +
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onAvatarChange}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
      </div>

      <div className="flex-1 text-center md:text-left space-y-2 w-full">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-brand-lime outline-none transition-all font-medium placeholder:text-white/20 text-[clamp(0.8rem,2vw,1rem)]"
              value={formData.firstName}
              placeholder="Имя"
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-brand-lime outline-none transition-all font-medium placeholder:text-white/20 text-[clamp(0.8rem,2vw,1rem)]"
              value={formData.lastName}
              placeholder="Фамилия"
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>
        ) : (
          <>
            <h2 className="heading-1 text-[clamp(2rem,4vw,3rem)] tracking-wide text-white leading-none">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-[clamp(0.8rem,2vw,1rem)] text-brand-lime font-mono tracking-widest uppercase">
              telegram @{user?.username}
            </p>
            <p className="text-[clamp(0.6rem,1.5vw,0.7rem)] text-white/40 font-mono uppercase tracking-[0.2em] mt-4">
              В GoVolley с {joinDate || "недавно"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
