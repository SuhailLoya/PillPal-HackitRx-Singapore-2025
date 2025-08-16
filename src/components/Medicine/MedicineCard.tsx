import type { Medicine } from "@/types/medicine";

const MedicineCard = ({ medicine }: { medicine: Medicine }) => {
  return (
    <div className="p-3 border rounded-xl shadow-md">
      <h2 className="font-bold">{medicine.name}</h2>
      <p>{medicine.dose}</p>
      <p>
        {medicine.timesPerDay} times/day · {medicine.durationDays} days
      </p>
      <p className="text-sm text-gray-500">{medicine.instructions}</p>
    </div>
  );
};

export default MedicineCard;
