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

    const patientName = "John Doe"; // Example patient

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(
                    "https://n8n.n8n-projects.dev/webhook/sheets?sheet=Logs"
                );
                const data = await res.json();

                setLogs(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <div className="p-4">Loading logs...</div>;

    // Prepare data for graph
    const graphData = logs.map((log) => ({
        medicine: log.medicineName.split("\n").join(" ").slice(0, 20), // remove \n
        supposed: parseSGTStringToDate(log.supposedLastTakenTime).getTime(),
        actual: parseSGTStringToDate(log.actualLastTakenTime).getTime(),
    }));

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-1">Pharmacy Dashboard</h1>
            <h2 className="text-xl text-gray-700 mb-6">{patientName}</h2>

            {/* View toggle */}
            <div className="mb-4">
                <button
                    className={`px-4 py-2 mr-2 rounded ${
                        view === "table"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setView("table")}
                >
                    Table View
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        view === "graph"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                    }`}
                    onClick={() => setView("graph")}
                >
                    Graph View
                </button>
            </div>

            {/* Table view */}
            {view === "table" && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">#</th>
                                <th className="px-4 py-2 text-left">
                                    Medicine
                                </th>
                                <th className="px-4 py-2 text-left">
                                    Supposed Time Taken
                                </th>
                                <th className="px-4 py-2 text-left">
                                    Actual Time Taken
                                </th>
                                <th className="px-4 py-2 text-left">Missed?</th>
                                <th className="px-4 py-2 text-left">
                                    Early Dispense?
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr
                                    key={log.row_number}
                                    className="border-t hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-2">
                                        {log.row_number - 1}
                                    </td>
                                    <td className="px-4 py-2 whitespace-pre-line">
                                        {log.medicineName}
                                    </td>
                                    <td className="px-4 py-2">
                                        {log.supposedLastTakenTime}
                                    </td>
                                    <td className="px-4 py-2">
                                        {log.actualLastTakenTime}
                                    </td>
                                    <td className="px-4 py-2">
                                        {log.isMiss == "1" ? (
                                            <span className="text-red-600 font-semibold">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="text-green-600">
                                                No
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {log.isEarlyDispense == "1" ? (
                                            <span className="text-yellow-600 font-semibold">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="text-green-600">
                                                No
                                            </span>
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
                <div className="h-200">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            layout="vertical" // <--- vertical layout swaps axes
                            data={graphData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 150,
                                bottom: 20,
                            }} // left margin for long names
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            {/* X-axis is now the time */}
                            <XAxis
                                type="number"
                                domain={["auto", "auto"]}
                                tickFormatter={(timestamp) =>
                                    new Date(timestamp).toLocaleString(
                                        "en-GB",
                                        { hour12: true }
                                    )
                                }
                            />

                            {/* Y-axis is now the medicine */}
                            <YAxis
                                type="category"
                                dataKey="medicine"
                                width={150}
                            />

                            <Tooltip
                                labelFormatter={(label) => `Medicine: ${label}`}
                                formatter={(value: number) =>
                                    new Date(value).toLocaleString("en-GB", {
                                        hour12: true,
                                    })
                                }
                            />

                            <Line
                                type="monotone"
                                dataKey="supposed"
                                name="Supposed Time"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                name="Actual Time"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                dot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
