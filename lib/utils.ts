import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertTemp(temp: number, unit: "C" | "F"): number {
  if (unit === "F") {
    return Math.round((temp * 9/5) + 32);
  }
  return temp;
}