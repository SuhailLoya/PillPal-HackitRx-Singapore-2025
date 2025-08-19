import { useState, useEffect, useRef } from "react";
import VoiceButton from "@/components/Buttons/VoiceButton";
import QueryButton from "@/components/Buttons/QueryButton";
import { Button } from "@/components/ui/button";
import MedicineCardList from "@/components/Medicine/MedicineCardList";
import MedicineDispenserBoxList from "@/components/Medicine/MedicineDispenserBoxList";
import { type Medicine } from "@/types/medicine";
import { useTheme } from "@/context/themeContext";
import {
    calcNextDoseTime,
    calcRemainingTimeForMedicine,
    getDateStringInSGT,
    parseSGTStringToDate,
} from "@/lib/utils";

function MainPage() {
    const [isStarted, setIsStarted] = useState(false);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const { theme, toggle } = useTheme();
    const [, setCounter] = useState(0); // ticker
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

    // --- Ticker updates every second // can change to every minute if needed
    useEffect(() => {
        if (!isStarted) return;
        const interval = setInterval(
            () => setCounter((prev) => prev + 1),
            1000
        );
        return () => clearInterval(interval);
    }, [isStarted]);

    // --- Play/Stop Alarm Sound
    const activeAlarms = medicines.filter(
        (m) => calcRemainingTimeForMedicine(m) <= 0
    );

    // --- Play/Stop Alarm Sound
    useEffect(() => {
        if (!isStarted) return;
        if (!alarmAudioRef.current) {
            console.log("Initializing alarm audio");
            alarmAudioRef.current = new Audio("./rickroll_but_lofi.mp3"); // put alarm.mp3 in /public
            console.log("alarmAudioRef.current", alarmAudioRef.current);
            alarmAudioRef.current.volume = 0.5; // adjust volume as needed
            alarmAudioRef.current.loop = true;
        }

        if (activeAlarms.length > 0) {
            if (alarmAudioRef.current.paused) {
                console.log("Playing alarm sound");
                alarmAudioRef.current.play().catch(() => {
                    console.error("Failed to play alarm sound");
                });
            }
        } else {
            alarmAudioRef.current.pause();
            alarmAudioRef.current.currentTime = 0;
        }
    }, [activeAlarms, isStarted]);

    // --- Dispense action
    const handleDispense = async (medicineName: string) => {
        const nowTime = new Date();

        setMedicines((prev) =>
            prev.map((m) =>
                m.medicineName === medicineName
                    ? {
                          ...m,
                          nextDoseTime: calcNextDoseTime(
                              m.timesPerDay,
                              nowTime
                          ),
                      }
                    : m
            )
        );

        const med = medicines.find((m) => m.medicineName === medicineName);

        if (!med) return;

        const supposedTime = med.nextDoseTime;
        const actualTime = nowTime;
        const diffMinutes = Math.abs(
            (actualTime.getTime() - supposedTime.getTime()) / 60000
        );
        const isMiss = diffMinutes > 15 ? 1 : 0;
        const isEarlyDispense = actualTime < supposedTime ? 1 : 0;

        const supposedLastTakenTime = getDateStringInSGT(supposedTime);
        const actualLastTakenTime = getDateStringInSGT(actualTime);

        try {
            const res = await fetch(
                "https://n8n.n8n-projects.dev/webhook/sheets-update?sheet=Logs",
                {
                    method: "POST",
                    body: new URLSearchParams({
                        medicineName: med.medicineName,
                        supposedLastTakenTime,
                        actualLastTakenTime,
                        isMiss: isMiss.toString(),
                        isEarlyDispense: isEarlyDispense.toString(),
                    }),
                }
            );
            const data = await res.text();
            console.log("Dispense logged successfully:", data);
        } catch (err) {
            console.error("Failed to log dispense:", err);
        }
    };

    useEffect(() => {
        if (!isStarted) return;
        const fetchData = async () => {
            try {
                // Fetch medicines
                const res = await fetch(
                    "https://n8n.n8n-projects.dev/webhook/sheets?sheet=Reminders"
                );
                const data = await res.json();

                // Format medicines
                // @ts-expect-error assuming backend shape
                const formatted: Medicine[] = data.map((item) => ({
                    id: item.row_number.toString(),
                    medicineName: item["medicineName"] || "", // <-- note: capitalized key from your example
                    dose: item["dose"] || "",
                    timesPerDay: Number(item["timesPerDay"]) || 0,
                    durationDays: Number(item["durationDays"]) || 0,
                    instructions: item["instructions"]?.trim() || "",
                    nextDoseTime: new Date(),
                    remaining: 0,
                }));

                // Fetch logs
                const logsRes = await fetch(
                    "https://n8n.n8n-projects.dev/webhook/sheets?sheet=Logs"
                );
                const logsData = await logsRes.json();

                // Map logs: get the latest actualLastTakenTime for each medicine
                const latestLogs: Record<string, string> = {};
                // @ts-expect-error assuming backend shape
                logsData.forEach((log) => {
                    if (log.medicineName && log.actualLastTakenTime) {
                        latestLogs[log.medicineName] = log.actualLastTakenTime;
                    }
                });

                // Merge logs into medicines
                const merged: Medicine[] = formatted.map((med) => {
                    med.nextDoseTime = calcNextDoseTime(
                        med.timesPerDay,
                        latestLogs[med.medicineName]
                            ? parseSGTStringToDate(latestLogs[med.medicineName])
                            : undefined
                    );

                    // can potentiall add alarms here if needed
                    return med;
                });
                console.log(merged);
                setMedicines(merged);
            } catch (error) {
                console.error("Failed to fetch medicines/logs:", error);
            }
        };

        fetchData();
    }, [isStarted]);

    // --- Render
    if (!isStarted) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Button
                    className="px-6 py-3 text-lg rounded-xl shadow-md"
                    onClick={() => setIsStarted(true)}
                >
                    Start
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-4 space-y-4">
            <div className="flex gap-4">
                <VoiceButton />
                <QueryButton />
                <Button
                    onClick={toggle}
                    className="ml-auto px-3 py-1 rounded border shadow"
                >
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                </Button>
            </div>
            <MedicineCardList medicines={medicines} />
            {/* probably there's a better way to handle ondispense logic but suffices for now*/}
            <MedicineDispenserBoxList
                medicines={medicines}
                onDispense={handleDispense}
            />
        </div>
    );
}

export default MainPage;
