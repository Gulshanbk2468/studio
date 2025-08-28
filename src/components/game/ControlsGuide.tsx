import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";

export function ControlsGuide() {
  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-2 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Kbd><ArrowUp className="h-4 w-4" /></Kbd>
        <Kbd><ArrowDown className="h-4 w-4" /></Kbd>
        <Kbd><ArrowLeft className="h-4 w-4" /></Kbd>
        <Kbd><ArrowRight className="h-4 w-4" /></Kbd>
        <p className="text-sm font-semibold ml-2">Use arrow keys to drive</p>
      </div>
    </Card>
  );
}
