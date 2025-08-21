import { calcRemainingTimeForMedicine } from "@/lib/utils";
import type { Medicine } from "@/types/medicine";

const MedicineCard = ({ medicine }: { medicine: Medicine }) => {
  const remainingMs = calcRemainingTimeForMedicine(medicine);
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
    <div className="p-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white min-w-[120px]">
      <h2 className="font-medium text-white" style={{ fontSize: "9px" }}>
        {medicine.medicineName}
      </h2>
      <p className="text-gray-300" style={{ fontSize: "8px" }}>
        {medicine.dose}
      </p>
      <p className="text-gray-300" style={{ fontSize: "8px" }}>
        {medicine.timesPerDay} times/day · {medicine.durationDays} days
      </p>
      <p className="text-gray-400" style={{ fontSize: "8px" }}>
        {medicine.instructions}
      </p>

      {/* Small Progress bar */}
      <div className="mt-1 w-full bg-gray-600 rounded-full h-0.5 overflow-hidden">
        <div
          className={`h-0.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Remaining time */}
      <p
        className="text-gray-300 mt-1 font-medium"
        style={{ fontSize: "11px" }}
      >
        {remainingMin > 0
          ? `${remainingMin} min until next dose`
          : "Time for next dose!"}
      </p>
    </div>
  );
};

export default MedicineCard;
