import { useState } from "react";
import type { Medicine } from "@/types/medicine";

const MedicineForm = () => {
  const [form, setForm] = useState<Partial<Medicine>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicineName) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("medicineName", form.medicineName || "");
      formData.append("dose", form.dose || "");
      formData.append("timesPerDay", String(form.timesPerDay || ""));
      formData.append("durationDays", String(form.durationDays || ""));
      formData.append("instructions", form.instructions || "");

      const response = await fetch(
        "https://n8n.n8n-projects.dev/webhook/sheets-update?sheet=Reminders",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        console.error("Failed to submit form", response.statusText);
      } else {
        console.log("Form submitted successfully");
        setForm({});
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
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
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-blue-500"
        }`}
      >
        {loading ? "Submitting..." : "Add Medicine"}
      </button>
    </form>
  );
};

export default MedicineForm;
