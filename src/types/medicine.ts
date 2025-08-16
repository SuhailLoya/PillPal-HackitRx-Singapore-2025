export interface Medicine {
  id: string;
  name: string;
  dose: string;
  timesPerDay: number;
  durationDays: number;
  instructions: string;
}

export const defaultMedicine: Medicine = {
  id: "1",
  name: "paracetamol",
  dose: "1",
  timesPerDay: 0,
  durationDays: 0,
  instructions: "take with water",
};
