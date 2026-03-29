import { ReactNode } from "react";

export interface SocialLink {
  id: string;
  icon: ReactNode;
  href: string;
  color: string;
}

export interface ContactItem {
  label: string;
  value: string;
  href: string;
}

export interface ScheduleItem {
  title: string;
  time: string;
}
