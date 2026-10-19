"use client";

import { useMemo } from "react";

import { useAuth } from "@/context/AuthContext";

export default function NewHomeGreeting() {
  const { user, full_name } = useAuth();

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 6) return "Burning the Midnight Oil";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Late Night Grind";
  }, []);

  const firstName =
    full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const headingText = `${timeGreeting}, ${firstName}!`;

  return <span>{headingText}</span>;
}
