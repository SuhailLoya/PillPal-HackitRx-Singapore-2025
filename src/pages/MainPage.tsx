import { useState, useEffect } from "react";
import VoiceButton from "@/components/Buttons/VoiceButton";
import QueryButton from "@/components/Buttons/QueryButton";
import { Button } from "@/components/ui/button";
import MedicineCardList from "@/components/Medicine/MedicineCardList";
import MedicineDispenserBoxList from "@/components/Medicine/MedicineDispenserBoxList";
import { type Medicine } from "@/types/medicine";
import { useTheme } from "@/context/themeContext";

function MainPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const { theme, toggle } = useTheme();

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const res = await fetch(
                    "https://n8n.n8n-projects.dev/webhook/sheets?sheet=Reminders"
                );
                const data = await res.json();

                // Map response to your Medicine type
                // @ts-expect-error - Assuming data is an array of objects with the expected structure
                const formatted: Medicine[] = data.map((item) => ({
                    id: item.row_number.toString(),
                    medicineName: item["Medicine name"] || "",
                    dose: item["dose"] || "",
                    timesPerDay: Number(item["times_per_day:"]) || 0,
                    durationDays: Number(item["duration_days:"]) || 0,
                    instructions: item["instructions:"]?.trim() || "",
                }));

                setMedicines(formatted);
            } catch (error) {
                console.error("Failed to fetch medicines:", error);
            }
        };

        fetchMedicines();
    }, []);

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
            <MedicineDispenserBoxList medicines={medicines} />
        </div>
    );
}

export default MainPage;
