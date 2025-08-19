import { calcRemainingTimeForMedicine } from "@/lib/utils";
import type { Medicine } from "@/types/medicine";

const MedicineCard = ({ medicine }: { medicine: Medicine }) => {
    const remainingMs = calcRemainingTimeForMedicine(medicine);
    // console.log("a");
    const remainingMin = Math.max(0, Math.floor(remainingMs / 60000));

    // Calculate percentage (1 = full time until next dose, 0 = time's up)
    const doseIntervalMs = (24 / medicine.timesPerDay) * 60 * 60 * 1000;
    const progress = Math.min(
        100,
        Math.max(0, (remainingMs / doseIntervalMs) * 100)
    );

    // Pick color based on percentage left
    let color = "bg-green-500";
    if (progress <= 60) color = "bg-yellow-500";
    if (progress <= 30) color = "bg-red-500";

    return (
        <div className="p-3 border rounded-xl shadow-md">
            <h2 className="font-bold">{medicine.medicineName}</h2>
            <p>{medicine.dose}</p>
            <p>
                {medicine.timesPerDay} times/day · {medicine.durationDays} days
            </p>
            <p className="text-sm text-gray-500">{medicine.instructions}</p>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Remaining time */}
            <p className="text-xs text-gray-600 mt-1">
                {remainingMin > 0
                    ? `${remainingMin} min until next dose`
                    : "Time for next dose!"}
            </p>
        </div>
    );
};

export default MedicineCard;
