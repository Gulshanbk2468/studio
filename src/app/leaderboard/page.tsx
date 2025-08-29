import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Placeholder data - we will connect this to Firebase later
const placeholderScores = [
  { name: "Player 1", score: 15000 },
  { name: "Player 2", score: 12500 },
  { name: "Player 3", score: 11000 },
  { name: "Player 4", score: 9800 },
  { name: "Player 5", score: 8500 },
  { name: "Player 6", score: 7200 },
  { name: "Player 7", score: 6800 },
  { name: "Player 8", score: 5500 },
  { name: "Player 9", score: 4200 },
  { name: "Player 10", score: 3000 },
];

export default function Leaderboard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">🏆 Leaderboard 🏆</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderScores.map((player, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="text-right">{player.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-center mt-6">
            <Link href="/">
              <Button>Back to Menu</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
