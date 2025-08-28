import type { FC } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bot, Star, ListCollapse } from "lucide-react";

interface DashboardProps {
  score: number;
  log: string[];
  coachMessage: string;
  studentsToCollect: number;
  studentsCollected: number;
}

export const Dashboard: FC<DashboardProps> = ({ score, log, coachMessage, studentsToCollect, studentsCollected }) => {
  return (
    <Card className="absolute top-4 right-4 z-10 w-80 bg-card/80 backdrop-blur-sm max-h-[calc(100vh-2rem)] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance</span>
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <Star className="h-5 w-5 fill-primary" />
            {score}
          </div>
        </CardTitle>
        <CardDescription>
          Students Picked Up: {studentsCollected} / {studentsToCollect}
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-0 flex-grow min-h-0">
        <div className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                Driver Coach
            </h3>
            <p className="text-sm text-destructive font-medium h-10">{coachMessage}</p>
        </div>
        <Separator />
         <div className="p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
                <ListCollapse className="h-4 w-4 mr-2" />
                Event Log
            </h3>
            <ScrollArea className="h-48">
              <div className="flex flex-col-reverse gap-1 pr-4">
                {log.map((entry, index) => (
                  <p key={index} className="text-xs text-muted-foreground">{entry}</p>
                ))}
              </div>
            </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
