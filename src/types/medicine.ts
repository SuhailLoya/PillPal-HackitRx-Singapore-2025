
export interface Medicine {
    id: string;
    medicineName: string;
    dose: string;
    timesPerDay: number;
    durationDays: number;
    instructions: string;
    nextDoseTime: Date ; // optional, calculated based on lastDoseTime and timesPerDay
}

export const defaultMedicine: Medicine = {
    id: "1",
    medicineName: "paracetamol",
    dose: "1",
    timesPerDay: 0,
    durationDays: 0,
    instructions: "take with water",
    nextDoseTime: new Date(),
};
