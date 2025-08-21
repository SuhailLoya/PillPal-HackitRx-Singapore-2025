import { Button } from "@/components/ui/button";
import useRecorder from "@/hooks/useRecorder";
import { scheduleSpeak } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface QueryButtonProps {
  languageSetting: string; // e.g., "English" or "Cantonese"
}

const QueryButton = ({ languageSetting }: QueryButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { record, transcript } = useRecorder();
  const languageRef = useRef(languageSetting);

  // update ref whenever languageSetting changes
  useEffect(() => {
    languageRef.current = languageSetting;
  }, [languageSetting]);

  useEffect(() => {
    if (!transcript) return; // don't send empty transcript
    const sendTranscript = async () => {
      setLoading(true); // disable button
      const formData = new FormData();
      formData.append("languageSetting", languageRef.current);
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
          scheduleSpeak(data.agentResponse);
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
      className="rounded-full h-20 w-20 text-3xl font-bold bg-yellow-700 hover:bg-orange-600 text-white"
      onClick={record}
      disabled={loading} // disable while waiting for API
    >
      {loading ? "..." : "?"}
    </Button>
  );
};

export default QueryButton;
