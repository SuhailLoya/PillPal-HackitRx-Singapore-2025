import { Routes, Route } from "react-router-dom";
import MainPage from "@/pages/MainPage";
import AddMedicinePage from "./pages/AddMedicinePage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/medicines/add" element={<AddMedicinePage />} />
        </Routes>
    );
}
