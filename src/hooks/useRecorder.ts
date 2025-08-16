import { useRef } from "react";

const useRecorder = () => {
    const recognitionRef = useRef(null);

    if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript;
            console.log("User said:", transcript);
            recognitionRef.current?.stop();
        };
        recognitionRef.current = recognition;
    }

    const record = () => {
        console.log("Starting recording...");
        recognitionRef.current?.start();
    };

    return { record };
};

export default useRecorder;
