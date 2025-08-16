import { useState } from "react";
import VoiceButton from "@/components/Buttons/VoiceButton";
import QueryButton from "@/components/Buttons/QueryButton";
import { Button } from "@/components/ui/button";
import MedicineList from "@/components/Medicine/MedicineList";
import { defaultMedicine, type Medicine } from "@/types/medicine";
import { useTheme } from "@/context/themeContext";

function MainPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([defaultMedicine]);
    const { theme, toggle } = useTheme();


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
            <MedicineList medicines={medicines} />
        </div>
    );
}

export default MainPage;
