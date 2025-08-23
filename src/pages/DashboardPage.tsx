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

// Custom dot component for missed doses (red dots)
const MissedDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isMissed = payload?.isMissed;

  if (!isMissed) return null;

  return (
    <circle cx={cx} cy={cy} r={8} fill="red" stroke="darkred" strokeWidth={2} />
  );
};

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

  const patientName = "Patient"; // Will be updated based on actual data

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(
          "https://n8n.n8n-projects.dev/webhook/sheets?sheet=Logs"
        );
        const data = await res.json();

        console.log("Fetched data:", data); // Debug log to see actual structure
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
    const actualDate =
      log.isMiss == "1" ? null : parseSGTStringToDate(log.actualLastTakenTime);

    // Get time in minutes from start of day (0-1440 minutes)
    const supposedTimeMinutes =
      supposedDate.getHours() * 60 + supposedDate.getMinutes();
    const actualTimeMinutes = actualDate
      ? actualDate.getHours() * 60 + actualDate.getMinutes()
      : null;

    // Calculate time difference in seconds
    const timeDiffSeconds = actualDate
      ? Math.abs((actualDate.getTime() - supposedDate.getTime()) / 1000)
      : null;

    const isMissed = log.isMiss == "1";

    return {
      date: supposedDate.toLocaleDateString("en-GB"),
      dateForAxis: supposedDate.toLocaleDateString("en-GB"),
      supposedTimeMinutes: isMissed ? null : supposedTimeMinutes, // Set to null for missed doses to break line
      actualTimeMinutes,
      supposedTimeMinutesForDot: supposedTimeMinutes, // Keep original for red dot positioning
      isMissed,
      timeDiffSeconds,
      supposedTimeString: supposedDate.toLocaleTimeString("en-GB", {
        hour12: true,
      }),
      actualTimeString: actualDate
        ? actualDate.toLocaleTimeString("en-GB", { hour12: true })
        : "Not Taken",
      dayIndex: index,
    };
  });

  // Calculate time domain for X-axis (±3 hours from min/max times)
  const allTimes = graphData
    .flatMap((entry) => [
      entry.supposedTimeMinutes,
      entry.actualTimeMinutes,
      entry.supposedTimeMinutesForDot,
    ])
    .filter((time) => time !== null) as number[];

  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const timeRange = maxTime - minTime;
  const padding = Math.max(180, timeRange * 0.1); // 3 hours (180 minutes) or 10% of range, whichever is larger
  const xAxisMin = Math.max(0, minTime - padding);
  const xAxisMax = Math.min(1440, maxTime + padding);

  // Calculate statistics for the selected medicine
  const calculateStatistics = () => {
    const totalDoses = filteredLogs.length;
    const missedDoses = filteredLogs.filter((log) => log.isMiss == "1").length;
    const takenDoses = totalDoses - missedDoses;
    const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

    // Calculate timing adherence (delays)
    const timingData = filteredLogs
      .filter((log) => log.isMiss == "0")
      .map((log) => {
        const supposedDate = parseSGTStringToDate(log.supposedLastTakenTime);
        const actualDate = parseSGTStringToDate(log.actualLastTakenTime);
        return Math.abs(
          (actualDate.getTime() - supposedDate.getTime()) / (1000 * 60)
        ); // minutes
      });

    const avgDelay =
      timingData.length > 0
        ? timingData.reduce((sum, delay) => sum + delay, 0) / timingData.length
        : 0;

    // Calculate consecutive misses
    let consecutiveMisses = 0;
    let maxConsecutive = 0;
    filteredLogs.forEach((log) => {
      if (log.isMiss == "1") {
        consecutiveMisses++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveMisses);
      } else {
        consecutiveMisses = 0;
      }
    });

    return {
      totalDoses,
      missedDoses,
      takenDoses,
      adherenceRate,
      avgDelay,
      maxConsecutive,
      timingVariability:
        timingData.length > 1
          ? Math.sqrt(
              timingData.reduce(
                (sum, delay) => sum + Math.pow(delay - avgDelay, 2),
                0
              ) /
                (timingData.length - 1)
            )
          : 0,
    };
  };

  // Calculate overall statistics across all medicines
  const calculateOverallStatistics = () => {
    const totalDoses = logs.length;
    const missedDoses = logs.filter((log) => log.isMiss == "1").length;
    const overallAdherence =
      totalDoses > 0 ? ((totalDoses - missedDoses) / totalDoses) * 100 : 0;

    // Medicine-specific adherence
    const medicineStats = uniqueMedicines.map((medicine) => {
      const medicineLogs = logs.filter((log) => log.medicineName === medicine);
      const medMissed = medicineLogs.filter((log) => log.isMiss == "1").length;
      const medTotal = medicineLogs.length;
      const medAdherence =
        medTotal > 0 ? ((medTotal - medMissed) / medTotal) * 100 : 0;

      return {
        medicine,
        adherence: medAdherence,
        total: medTotal,
        missed: medMissed,
      };
    });

    return {
      overallAdherence,
      medicineStats,
    };
  };

  const stats = calculateStatistics();
  const overallStats = calculateOverallStatistics();

  // Helper functions for styling
  const getTimingColor = (delay: number) => {
    if (delay <= 15) return "#16a34a";
    if (delay <= 60) return "#f59e0b";
    return "#dc2626";
  };

  const getTimingStatus = (delay: number) => {
    if (delay <= 15) return "Excellent timing";
    if (delay <= 60) return "Acceptable timing";
    return "Poor timing";
  };

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
                    {log.isEarlyDispense === "1" ? (
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

      {/* Graph view */}
      {view === "graph" && (
        <div className="h-96 relative">
          <h3 className="text-lg font-semibold mb-4">
            {selectedMedicine} - Medication Timeline
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphData}
              margin={{
                top: 20,
                right: 50,
                left: 80,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              {/* X-axis shows dates */}
              <XAxis
                dataKey="dateForAxis"
                angle={-45}
                textAnchor="end"
                height={60}
                label={{ value: "Date", position: "insideBottom", offset: -10 }}
              />

              {/* Y-axis shows time */}
              <YAxis
                type="number"
                domain={[xAxisMin, xAxisMax]}
                tickFormatter={(minutes) => {
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  return `${hours.toString().padStart(2, "0")}:${mins
                    .toString()
                    .padStart(2, "0")}`;
                }}
                label={{
                  value: "Time of Day",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip
                formatter={(value: number, name: string) => {
                  if (
                    name === "supposedTimeMinutes" ||
                    name === "actualTimeMinutes"
                  ) {
                    const hours = Math.floor(value / 60);
                    const minutes = value % 60;
                    return [
                      `${hours.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}`,
                      name === "supposedTimeMinutes"
                        ? "Supposed Time"
                        : "Actual Time",
                    ];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />

              {/* Points for supposed times (connected green line, skips missed doses) */}
              <Line
                type="monotone"
                dataKey="supposedTimeMinutes"
                name="Supposed Time"
                stroke="green"
                strokeWidth={3}
                dot={{
                  r: 8,
                  fill: "green",
                  stroke: "darkgreen",
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />

              {/* Separate line for missed doses (red dots only, no line connection) */}
              <Line
                type="monotone"
                dataKey="supposedTimeMinutesForDot"
                name="Missed Dose"
                stroke="transparent"
                strokeWidth={0}
                dot={<MissedDot />}
                connectNulls={false}
              />

              {/* Points for actual times (only when not missed) */}
              <Line
                type="monotone"
                dataKey="actualTimeMinutes"
                name="Actual Time"
                stroke="purple"
                strokeWidth={3}
                dot={{
                  r: 8,
                  fill: "purple",
                  stroke: "darkpurple",
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Statistics Dashboard */}
      {view === "graph" && (
        <div className="mt-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Adherence Analytics
          </h3>

          {/* Overall Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Adherence Rate */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Overall Adherence Rate
              </h4>
              <div
                className="text-3xl font-bold mb-2"
                style={{
                  color:
                    overallStats.overallAdherence >= 80 ? "#16a34a" : "#dc2626",
                }}
              >
                {overallStats.overallAdherence.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                {logs.length - logs.filter((log) => log.isMiss == "1").length}{" "}
                of {logs.length} doses taken
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${overallStats.overallAdherence}%`,
                      backgroundColor:
                        overallStats.overallAdherence >= 80
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Medicine Adherence */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                {selectedMedicine} Adherence
              </h4>
              <div
                className="text-3xl font-bold mb-2"
                style={{
                  color: stats.adherenceRate >= 80 ? "#16a34a" : "#dc2626",
                }}
              >
                {stats.adherenceRate.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                {stats.takenDoses} of {stats.totalDoses} doses taken
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${stats.adherenceRate}%`,
                      backgroundColor:
                        stats.adherenceRate >= 80 ? "#16a34a" : "#dc2626",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Timing Adherence */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                Average Timing Delay
              </h4>
              <div
                className="text-3xl font-bold mb-2"
                style={{
                  color:
                    stats.avgDelay <= 15
                      ? "#16a34a"
                      : stats.avgDelay <= 60
                      ? "#f59e0b"
                      : "#dc2626",
                }}
              >
                {stats.avgDelay.toFixed(0)}
                <span className="text-lg"> min</span>
              </div>
              <p className="text-sm text-gray-600">
                Variability: ±{stats.timingVariability.toFixed(0)} min
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {stats.avgDelay <= 15
                  ? "Excellent timing"
                  : stats.avgDelay <= 60
                  ? "Acceptable timing"
                  : "Poor timing"}
              </div>
            </div>
          </div>

          {/* Medicine Comparison and Pattern Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medicine-Specific Adherence */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Medication Comparison
              </h4>
              <div className="space-y-3">
                {overallStats.medicineStats.map((med) => (
                  <div
                    key={med.medicine}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">
                          {med.medicine}
                        </span>
                        <span
                          className="font-bold"
                          style={{
                            color: med.adherence >= 80 ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {med.adherence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${med.adherence}%`,
                            backgroundColor:
                              med.adherence >= 80 ? "#16a34a" : "#dc2626",
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {med.total - med.missed}/{med.total} doses taken
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Missed Dose Patterns
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Missed Doses:</span>
                  <span className="font-bold text-red-600">
                    {stats.missedDoses}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Consecutive Misses:</span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        stats.maxConsecutive <= 1
                          ? "#16a34a"
                          : stats.maxConsecutive <= 2
                          ? "#f59e0b"
                          : "#dc2626",
                    }}
                  >
                    {stats.maxConsecutive}
                  </span>
                </div>
                <div
                  className="mt-4 p-3 rounded-md"
                  style={{
                    backgroundColor:
                      stats.maxConsecutive <= 1
                        ? "#f0fdf4"
                        : stats.maxConsecutive <= 2
                        ? "#fffbeb"
                        : "#fef2f2",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{
                      color:
                        stats.maxConsecutive <= 1
                          ? "#166534"
                          : stats.maxConsecutive <= 2
                          ? "#92400e"
                          : "#991b1b",
                    }}
                  >
                    {stats.maxConsecutive <= 1
                      ? "✓ Good adherence pattern"
                      : stats.maxConsecutive <= 2
                      ? "⚠ Minor adherence gaps"
                      : "⚠ Significant adherence concerns"}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{
                      color:
                        stats.maxConsecutive <= 1
                          ? "#166534"
                          : stats.maxConsecutive <= 2
                          ? "#92400e"
                          : "#991b1b",
                    }}
                  >
                    {stats.maxConsecutive <= 1
                      ? "No concerning patterns detected"
                      : stats.maxConsecutive <= 2
                      ? "Monitor for developing patterns"
                      : "Consider intervention strategies"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">
              Key Clinical Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">
                  <strong>Adherence Status:</strong>{" "}
                  {overallStats.overallAdherence >= 80 ? "Good" : "Poor"}(
                  {overallStats.overallAdherence >= 80 ? "Above" : "Below"} 80%
                  threshold)
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <strong>Timing Consistency:</strong>{" "}
                  {stats.avgDelay <= 15
                    ? "Excellent"
                    : stats.avgDelay <= 60
                    ? "Acceptable"
                    : "Needs improvement"}
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <strong>Pattern Risk:</strong>{" "}
                  {stats.maxConsecutive <= 1
                    ? "Low"
                    : stats.maxConsecutive <= 2
                    ? "Moderate"
                    : "High"}
                  {stats.maxConsecutive > 2 && " - Consider patient counseling"}
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <strong>Medication Priority:</strong>{" "}
                  {overallStats.medicineStats.length > 1
                    ? `Focus on ${
                        overallStats.medicineStats.sort(
                          (a, b) => a.adherence - b.adherence
                        )[0]?.medicine || "N/A"
                      }`
                    : "Single medication tracking"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
