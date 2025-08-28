import Game from "@/components/game/Game";

export default function Home() {
  return (
    <div className="bg-background">
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-center p-4">
        <h1 className="text-2xl md:text-4xl font-bold font-headline text-center bg-primary/80 text-primary-foreground py-2 px-6 rounded-lg shadow-lg backdrop-blur-sm">
          Hemja Highway Hero
        </h1>
      </header>
      <Game />
    </div>
  );
}
