import { useState } from "react";
import { type Medicine } from "@/types/medicine";
import { calcRemainingTimeForMedicine } from "@/lib/utils";

interface MedicineDispenserBoxProps {
    medicine: Medicine;
    onDispense: () => void;
}

export default function MedicineDispenserBox({
    medicine,
    onDispense,
}: MedicineDispenserBoxProps) {
    const [pills, setPills] = useState<number>(5); // starting number of pills
    const [animating, setAnimating] = useState(false);
    const remainingMs = calcRemainingTimeForMedicine(medicine);

    const dispense = () => {
        if (pills === 0 || animating) return;

        setAnimating(true);
        setTimeout(() => {
            setPills((prev) => prev - 1);
            setAnimating(false);
        }, 600); // match animation duration
        onDispense();
    };

    const pillSize = 20; // px
    const spacing = 4; // px between pills

    const color = remainingMs <= 0 ? "bg-green-600" : "bg-red-500";

    return (
        <div className="bg-white/95 border rounded p-2 shadow w-24 flex flex-col items-center">
            <div className="min-h-8 flex ">
                <h3
                    className="font-medium text-center"
                    style={{ fontSize: "10px" }}
                >
                    {medicine.medicineName}
                </h3>
            </div>

            {/* Pill Box */}
            <div className="relative h-24 w-12 mt-2 flex justify-center items-end border rounded bg-gray-100 overflow-hidden">
                {Array.from({ length: pills }).map((_, idx) => {
                    // Stack from bottom
                    const bottomPosition =
                        idx === pills - 1 && animating
                            ? -pillSize // animate downward out of the box
                            : (pills - idx - 1) * (pillSize + spacing);
                    return (
                        <div
                            key={idx}
                            className="absolute w-5 h-5 bg-blue-400 rounded-full transition-all duration-500 ease-in-out"
                            style={{
                                bottom: bottomPosition,
                            }}
                        ></div>
                    );
                })}
            </div>

            <button
                onClick={dispense}
                className={`mt-2 px-2 py-1 ${color} text-white rounded hover:${color} disabled:bg-gray-400`}
                style={{ fontSize: "9px" }}
                disabled={pills === 0 || animating}
            >
                Dispense
            </button>
        </div>
    );
}
