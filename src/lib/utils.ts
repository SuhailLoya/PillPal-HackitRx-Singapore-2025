import type { Medicine } from "@/types/medicine";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getDateStringInSGT(date: Date): string {
    return date.toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export function parseSGTStringToDate(dateStr: string): Date {
    // Example input: "17/08/2025, 08:00:00 pm"
    const [datePart, timePart, meridiem] = dateStr.split(/[, ]+/);
    // datePart = "17/08/2025"
    // timePart = "08:00:00"
    // meridiem = "pm"

    const [day, month, year] = datePart.split("/").map(Number);
    // eslint-disable-next-line prefer-const
    let [hours, minutes, seconds] = timePart.split(":").map(Number);

    // Convert 12-hour to 24-hour format
    if (meridiem.toLowerCase() === "pm" && hours < 12) hours += 12;
    if (meridiem.toLowerCase() === "am" && hours === 12) hours = 0;

    // SGT = UTC+8, so subtract 8h to get UTC
    return new Date(
        Date.UTC(year, month - 1, day, hours - 8, minutes, seconds)
    );
}

export function calcNextDoseTime(
    timesPerDay: number,
    lastDoseTime?: Date
): Date {
    const hoursBetween = 24 / timesPerDay;
    const nextDose = lastDoseTime
        ? new Date(lastDoseTime.getTime() + hoursBetween * 60 * 60 * 1000)
        : new Date(); // if no history, due now
    return nextDose;
}

export function calcRemainingTimeForMedicine(m: Medicine): number {
    const nextDose = m.nextDoseTime;
    const remaining = Math.max(0, nextDose.getTime() - Date.now());
    return remaining;
}


//TODO: make it sequential currently might over write previosu audio
export async function scheduleSpeak(message: string) {
    try {
        const formData = new FormData();
        formData.append("message", message);

        const response = await fetch(
            "https://n8n.n8n-projects.dev/webhook/elevenlabs-tts",
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("TTS request failed");
        }

        const audioBlob = await response.blob(); // get the audio file
        const audioUrl = URL.createObjectURL(audioBlob); // create URL for playback
        console.log("Audio URL:", audioUrl);
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error("Error playing TTS:", error);
    }
}
