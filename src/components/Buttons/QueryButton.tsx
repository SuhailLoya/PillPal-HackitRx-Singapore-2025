import { Button } from "@/components/ui/button";
import useRecorder from "@/hooks/useRecorder";
import { useEffect, useState } from "react";

const QueryButton = () => {
    const [loading, setLoading] = useState(false);
    const { record, transcript } = useRecorder();
    useEffect(() => {
        if (!transcript) return; // don't send empty transcript

        const sendTranscript = async () => {
            setLoading(true); // disable button
            const formData = new FormData();
            formData.append("languageSetting", "English");
            formData.append("userInput", transcript);

            try {
                const response = await fetch(
                    "https://n8n.n8n-projects.dev/webhook/agent",
                    {
                        method: "POST",
                        body: formData,
                    }
                );
                const data = await response.json();
                console.log("Agent Response:", data.agentResponse);

                if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(
                        data.agentResponse
                    );
                    speechSynthesis.speak(utterance);
                }
            } catch (err) {
                console.error("Error sending transcript:", err);
            } finally {
                setLoading(false); // re-enable button
            }
        };

        sendTranscript();
    }, [transcript]);

    return (
        <Button
            className="rounded-full h-20 w-20 text-xl"
            onClick={record}
            disabled={loading} // disable while waiting for API
        >
            {loading ? "..." : "Q"}
        </Button>
    );
};

export default QueryButton;
