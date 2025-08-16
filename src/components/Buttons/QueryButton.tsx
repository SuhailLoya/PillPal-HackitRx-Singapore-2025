import { Button } from "@/components/ui/button";
import useRecorder from "@/hooks/useRecorder";

const QueryButton = () => {
    const { record } = useRecorder();
    return (
        <Button className="rounded-full h-20 w-20 text-xl" onClick={record}>
            Q
        </Button>
    );
};

export default QueryButton;
