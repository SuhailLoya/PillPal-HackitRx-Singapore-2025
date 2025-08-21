import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  readNextReply: () => void;
  unreadCount?: number; // optional
}

const VoiceButton = ({ readNextReply, unreadCount = 0 }: VoiceButtonProps) => {
  return (
    <div className="relative inline-block">
      <Button
        className="rounded-full h-20 w-20 text-3xl font-bold relative bg-yellow-700 hover:bg-orange-600 text-white"
        onClick={readNextReply}
      >
        M
      </Button>

      {unreadCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1 
            bg-red-500 text-white text-xs font-bold 
            rounded-full h-6 w-6 flex items-center justify-center
            shadow-md
          "
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default VoiceButton;
