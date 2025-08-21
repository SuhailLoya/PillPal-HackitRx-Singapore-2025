import type { Medicine } from "@/types/medicine";
import MedicineCard from "./MedicineCard";

interface Props {
  medicines: Medicine[];
}

const MedicineCardList = ({ medicines }: Props) => {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {medicines.map((med) => (
        <MedicineCard key={med.id} medicine={med} />
      ))}
    </div>
  );
};

export default MedicineCardList;
