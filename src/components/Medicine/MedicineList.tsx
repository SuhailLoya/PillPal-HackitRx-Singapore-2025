import type { Medicine } from "@/types/medicine";
import MedicineCard from "./MedicineCard";

interface Props {
  medicines: Medicine[];
}

const MedicineList = ({ medicines }: Props) => {
  return (
    <div className="space-y-3">
      {medicines.map((med) => (
        <MedicineCard key={med.id} medicine={med} />
      ))}
    </div>
  );
};

export default MedicineList;
