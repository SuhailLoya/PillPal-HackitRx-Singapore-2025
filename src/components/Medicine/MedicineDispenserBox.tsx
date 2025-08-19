import { useState } from "react";
import { type Medicine } from "@/types/medicine";

interface MedicineDispenserBoxProps {
    medicine: Medicine;
    onDispense: () => void;
}

export default function MedicineDispenserBox({
    medicine,
    onDispense
}: MedicineDispenserBoxProps) {
    const [pills, setPills] = useState<number>(5); // starting number of pills
    const [animating, setAnimating] = useState(false);

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

    return (
        <div className="border rounded p-3 shadow w-32 flex flex-col items-center">
            <div className="min-h-15 flex ">
                <h3 className="font-semibold text-sm text-center">
                    {medicine.medicineName}
                </h3>
            </div>

            {/* Pill Box */}
            <div className="relative h-32 w-16 mt-3 flex justify-center items-end border rounded bg-gray-100 overflow-hidden">
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
                className="mt-3 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
                disabled={pills === 0 || animating}
            >
                Dispense
            </button>
        </div>
    );
}
