import { useRef } from "react";

const useRecorder = () => {
    const recognitionRef = useRef(null);

    if (!recognitionRef.current && "webkitSpeechRecognition" in window) {

        const SpeechRecognition = (window).webkitSpeechRecognition;
        // @ts-expect-error - TypeScript doesn't recognize webkitSpeechRecognition
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        // @ts-expect-error - TypeScript doesn't recognize onresult event variable type
        recognition.onresult = (event) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript;
            console.log("User said:", transcript);
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

    return { record };
};

export default useRecorder;
