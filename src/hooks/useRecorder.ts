import { useRef } from "react";
import { useState } from "react";

const useRecorder = () => {
    const recognitionRef = useRef(null);
    const [transcript, setTranscript] = useState<string>("");

    if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.webkitSpeechRecognition;
        // @ts-expect-error - TypeScript doesn't recognize webkitSpeechRecognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        // @ts-expect-error - TypeScript doesn't recognize onresult event variable type
        recognition.onresult = (event) => {
            const lastTranscript =
                event.results[event.results.length - 1][0].transcript;
            console.log("User said:", lastTranscript);
            setTranscript(lastTranscript); // update state
            // @ts-expect-error - Assuming you have a function to handle the stop of recording
            recognitionRef.current?.stop();
        };
        recognitionRef.current = recognition;
    }

    const record = () => {
        console.log("Starting recording...");
        // @ts-expect-error - Assuming you have a function to handle the start of recording
        recognitionRef.current?.start();
    };

    return { record, transcript };
};

export default useRecorder;
