import { useState } from "react";
import MedicineForm from "@/components/Medicine/MedicineForm";
import type { Medicine } from "@/types/medicine";

export default function AddMedicinePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const handleAdd = (med: Medicine) => setMedicines([...medicines, med]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Add Medicine</h1>
      <MedicineForm onAdd={handleAdd} />
    </div>
  );
}
