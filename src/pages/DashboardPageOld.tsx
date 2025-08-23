import { parseSGTStringToDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type LogEntry = {
  row_number: number;
  medicineName: string;
  supposedLastTakenTime: string;
  actualLastTakenTime: string;
  isMiss: string;
  isEarlyDispense: string;
};

export default function DashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "graph">("table");
  const [selectedMedicine, setSelectedMedicine] = useState<string>("");

  const patientName = "John Doe"; // Example patient

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(
          "https://n8n.n8n-projects.dev/webhook/sheets?sheet=Logs"
        );
        const data = await res.json();

        setLogs(data);

        // Set first medicine as default selected if logs exist
        if (data.length > 0) {
          const medicines = [
            ...new Set(data.map((log: LogEntry) => log.medicineName)),
          ];
          setSelectedMedicine(medicines[0] as string);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <div className="p-4">Loading logs...</div>;

  // Get unique medicines
  const uniqueMedicines = [...new Set(logs.map((log) => log.medicineName))];

  // Filter logs by selected medicine
  const filteredLogs = logs.filter(
    (log) => log.medicineName === selectedMedicine
  );

  // Prepare data for graph - only for selected medicine
  const graphData = filteredLogs.map((log, index) => {
    const supposedDate = parseSGTStringToDate(log.supposedLastTakenTime);
    const actualDate = log.isMiss === "1" ? null : parseSGTStringToDate(log.actualLastTakenTime);
    
    // Get time in minutes from start of day (0-1440 minutes)
    const supposedTimeMinutes = supposedDate.getHours() * 60 + supposedDate.getMinutes();
    const actualTimeMinutes = actualDate ? actualDate.getHours() * 60 + actualDate.getMinutes() : null;
    
    // Calculate time difference in seconds
    const timeDiffSeconds = actualDate ? Math.abs((actualDate.getTime() - supposedDate.getTime()) / 1000) : null;
    
    return {
      date: supposedDate.toLocaleDateString("en-GB"),
      dateForAxis: supposedDate.toLocaleDateString("en-GB"),
      supposedTimeMinutes,
      actualTimeMinutes,
      isMissed: log.isMiss === "1",
      timeDiffSeconds,
      supposedTimeString: supposedDate.toLocaleTimeString("en-GB", { hour12: true }),
      actualTimeString: actualDate ? actualDate.toLocaleTimeString("en-GB", { hour12: true }) : "Not Taken",
      dayIndex: index,
    };
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">Pharmacy Dashboard</h1>
      <h2 className="text-xl text-gray-700 mb-6">{patientName}</h2>

      {/* View toggle */}
      <div className="mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded ${
            view === "table" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("table")}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 rounded ${
            view === "graph" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setView("graph")}
        >
          Graph View
        </button>
      </div>

      {/* Medicine Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {uniqueMedicines.map((medicine) => (
              <button
                key={medicine}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedMedicine === medicine
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMedicine(medicine)}
              >
                {medicine}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Medicine</th>
                <th className="px-4 py-2 text-left">Supposed Time Taken</th>
                <th className="px-4 py-2 text-left">Actual Time Taken</th>
                <th className="px-4 py-2 text-left">Missed?</th>
                <th className="px-4 py-2 text-left">Early Dispense?</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr
                  key={log.row_number}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-pre-line">
                    {log.medicineName}
                  </td>
                  <td className="px-4 py-2">{log.supposedLastTakenTime}</td>
                  <td className="px-4 py-2">
                    {log.isMiss == "1" ? (
                      <span className="text-red-600 font-semibold">
                        Not Taken
                      </span>
                    ) : (
                      log.actualLastTakenTime
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {log.isMiss == "1" ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {log.isEarlyDispense == "1" ? (
                      <span className="text-yellow-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

  // Custom component to render the graph elements
  const CustomGraphContent = ({ data }: { data: any[] }) => {
    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {data.map((entry, index) => {
          if (!entry.isMissed && entry.actualTimeMinutes !== null) {
            // Calculate positions (these are approximate - in a real implementation you'd need to map to chart coordinates)
            const chartHeight = 350; // Approximate chart height
            const chartWidth = 800; // Approximate chart width
            const leftMargin = 60;
            const topMargin = 20;
            const bottomMargin = 40;
            
            // Map date to Y position (dates are on Y axis)
            const yPos = topMargin + (index / (data.length - 1)) * (chartHeight - topMargin - bottomMargin);
            
            // Map time to X position (time is on X axis, 0-1440 minutes = 0-24 hours)
            const supposedX = leftMargin + (entry.supposedTimeMinutes / 1440) * (chartWidth - leftMargin - 50);
            const actualX = leftMargin + (entry.actualTimeMinutes / 1440) * (chartWidth - leftMargin - 50);
            
            return (
              <g key={index}>
                {/* Red line connecting supposed and actual times */}
                <line
                  x1={supposedX}
                  y1={yPos}
                  x2={actualX}
                  y2={yPos}
                  stroke="red"
                  strokeWidth={2}
                />
                {/* Label with time difference */}
                <text
                  x={(supposedX + actualX) / 2}
                  y={yPos - 8}
                  fill="red"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {entry.timeDiffSeconds}s
                </text>
              </g>
            );
          } else if (entry.isMissed) {
            // Red X for missed doses
            const chartHeight = 350;
            const chartWidth = 800;
            const leftMargin = 60;
            const topMargin = 20;
            const bottomMargin = 40;
            
            const yPos = topMargin + (index / (data.length - 1)) * (chartHeight - topMargin - bottomMargin);
            const xPos = leftMargin + (entry.supposedTimeMinutes / 1440) * (chartWidth - leftMargin - 50);
            
            return (
              <g key={index}>
                {/* Red X mark */}
                <line x1={xPos - 5} y1={yPos - 5} x2={xPos + 5} y2={yPos + 5} stroke="red" strokeWidth={3} />
                <line x1={xPos - 5} y1={yPos + 5} x2={xPos + 5} y2={yPos - 5} stroke="red" strokeWidth={3} />
              </g>
            );
          }
          return null;
        })}
      </svg>
    );
  };
      {view === "graph" && (
        <div className="h-96">
          <h3 className="text-lg font-semibold mb-4">
            {selectedMedicine} - Medication Timeline
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="dayIndex"
                tickFormatter={(value) => `Day ${value + 1}`}
              />

              <YAxis
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={(timestamp) =>
                  new Date(timestamp).toLocaleTimeString("en-GB", {
                    hour12: true,
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />

              <Tooltip
                labelFormatter={(label) => `Day ${Number(label) + 1}`}
                formatter={(value: number, name: string) => [
                  value
                    ? new Date(value).toLocaleString("en-GB", {
                        hour12: true,
                      })
                    : "Not taken",
                  name === "supposedTime" ? "Supposed Time" : "Actual Time",
                ]}
              />

              <Line
                type="monotone"
                dataKey="supposedTime"
                name="Supposed Time"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="actualTime"
                name="Actual Time"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
