import { useState } from "react";
import type { Medicine } from "@/types/medicine";


const MedicineForm = () => {
  const [form, setForm] = useState<Partial<Medicine>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicineName) return;
   
    setForm({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 border rounded-lg">
      <input
        name="medicineName"
        placeholder="Medicine Name"
        value={form.medicineName || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        name="dose"
        placeholder="Dose"
        value={form.dose || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        name="timesPerDay"
        placeholder="Times per Day"
        type="number"
        value={form.timesPerDay || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        name="durationDays"
        placeholder="Duration (days)"
        type="number"
        value={form.durationDays || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        name="instructions"
        placeholder="Instructions"
        value={form.instructions || ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
        Add Medicine
      </button>
    </form>
  );
};

export default MedicineForm;
