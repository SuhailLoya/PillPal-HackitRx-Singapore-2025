import MedicineDispenserBox from "./MedicineDispenserBox";
import { type Medicine } from "@/types/medicine";

interface MedicineDispenserBoxListProps {
    medicines: Medicine[];
    onDispense: (medicineName: string) => void;
}

export default function MedicineDispenserBoxList({
    medicines,
    onDispense
}: MedicineDispenserBoxListProps) {
    return (
        <div className="flex gap-4">
            {medicines.map((med) => (
                <div
                    key={med.id}
                    className="flex-shrink-1 flex-grow-0"
                    style={{
                        flexBasis: `${100 / medicines.length}%`,
                        minWidth: "120px",
                    }}
                >
                    <MedicineDispenserBox medicine={med} onDispense={() => onDispense(med.medicineName)} />
                </div>
            ))}
        </div>
    );
}
