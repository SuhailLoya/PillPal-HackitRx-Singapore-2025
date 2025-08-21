import MedicineDispenserBox from "./MedicineDispenserBox";
import { type Medicine } from "@/types/medicine";

interface MedicineDispenserBoxListProps {
  medicines: Medicine[];
  onDispense: (medicineName: string) => void;
}

export default function MedicineDispenserBoxList({
  medicines,
  onDispense,
}: MedicineDispenserBoxListProps) {
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {medicines.map((med) => (
        <div
          key={med.id}
          className="flex-shrink-0"
          style={{
            minWidth: "60px",
            maxWidth: "100px",
          }}
        >
          <MedicineDispenserBox
            medicine={med}
            onDispense={() => onDispense(med.medicineName)}
          />
        </div>
      ))}
    </div>
  );
}
