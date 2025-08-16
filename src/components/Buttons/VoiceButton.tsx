import { Button } from "@/components/ui/button";

const VoiceButton = () => {
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(
      "Hello! This is your medical dispenser. Please take your medicines on time."
    );
    speechSynthesis.speak(utterance);
  };

  return (
    <Button className="rounded-full h-20 w-20 text-xl" onClick={handleSpeak}>
      V
    </Button>
  );
};

export default VoiceButton;
