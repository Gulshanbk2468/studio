"use client";

import * as React from "react";
import * as THREE from "three";
import Image from "next/image";
import { ControlsGuide } from "./ControlsGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBus, createRoad, createScenery, createStudents, createObstacles, createSchool, createRoadMarkings, createZebraCross, createTrees, createShops, createUTurnMarkings } from "@/lib/game-elements";
import { useToast } from "@/hooks/use-toast";

const COACH_TIPS = [
  "Keep a safe distance from other vehicles.",
  "Watch out for animals on the road.",
  "Smooth driving is safe driving.",
  "Remember to check your surroundings before turning.",
  "Stick to the speed limit for a safer journey.",
];

export default function Game() {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const keysPressed = React.useRef<{ [key: string]: boolean }>({}).current;
  
  const [score, setScore] = React.useState(0);
  const [gameLog, setGameLog] = React.useState<string[]>([]);
  const [coachMessage, setCoachMessage] = React.useState("");
  const [infractionCount, setInfractionCount] = React.useState(0);
  
  const [gameState, setGameState] = React.useState<"menu" | "playing" | "finished">("menu");
  
  const studentsRef = React.useRef<THREE.Mesh[]>([]);
  const [studentsCollected, setStudentsCollected] = React.useState(0);
  const [totalStudents, setTotalStudents] = React.useState(0);

  const { toast } = useToast();

  const addLog = (message: string) => {
    setGameLog(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 20));
  };

  const handleInfraction = (reason: string) => {
    setScore(s => Math.max(0, s - 5));
    addLog(`Collision: ${reason}`);
    setInfractionCount(c => c + 1);
    toast({
      variant: "destructive",
      title: "Collision!",
      description: `You hit a ${reason}. Drive carefully.`,
    })
  }

  React.useEffect(() => {
    if (infractionCount > 2) {
      setCoachMessage(COACH_TIPS[Math.floor(Math.random() * COACH_TIPS.length)]);
      setInfractionCount(0);
      const timer = setTimeout(() => setCoachMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [infractionCount]);

  React.useEffect(() => {
    if (gameState !== "playing") return;

    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF2F0E1);
    scene.fog = new THREE.Fog(0xF2F0E1, 150, 400);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Game elements
    const bus = createBus();
    scene.add(bus);
    bus.position.x = 20;
    bus.position.z = 10;
    bus.rotation.y = -Math.PI / 2;

    scene.add(createRoad());
    scene.add(createRoadMarkings());
    scene.add(createZebraCross());
    scene.add(createUTurnMarkings());
    scene.add(createScenery());
    scene.add(createTrees());
    scene.add(createShops());
    scene.add(createSchool());
    
    const initialStudents = createStudents();
    studentsRef.current = initialStudents;
    studentsRef.current.forEach(s => scene.add(s));
    setTotalStudents(initialStudents.length);

    const obstacles = createObstacles();
    obstacles.forEach(o => scene.add(o));

    const busBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    const obstacleBoxes = obstacles.map(() => new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()));
    const studentZones = studentsRef.current.map(s => new THREE.Box3().setFromObject(s).expandByVector(new THREE.Vector3(3,3,3)));
    
    // Controls
    const onKeyDown = (e: KeyboardEvent) => { keysPressed[e.key.toLowerCase()] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keysPressed[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const moveSpeed = 15.0 * delta;
      const turnSpeed = 0.8 * delta;

      if (keysPressed['arrowup']) bus.translateZ(-moveSpeed);
      if (keysPressed['arrowdown']) bus.translateZ(moveSpeed);
      if (keysPressed['arrowleft']) bus.rotation.y += turnSpeed;
      if (keysPressed['arrowright']) bus.rotation.y -= turnSpeed;
      
      // Keep bus on road
      bus.position.x = Math.max(-12, Math.min(30, bus.position.x));
      bus.position.z = Math.max(-490, Math.min(20, bus.position.z));
      
      // Camera follow
      const offset = new THREE.Vector3(0, 7, 12);
      offset.applyQuaternion(bus.quaternion);
      camera.position.lerp(bus.position.clone().add(offset), 0.1);
      camera.lookAt(bus.position);

      busBox.setFromObject(bus);

      // Obstacle logic
      obstacles.forEach((obstacle, i) => {
        if (obstacle.userData.type === 'car' || obstacle.userData.type === 'bike' || obstacle.userData.type === 'truck') {
            obstacle.position.z += delta * obstacle.userData.speed;
            if (obstacle.position.z > 20) {
              obstacle.position.z = -490;
              // Vary speed and lane on reset
              obstacle.userData.speed = 15 + Math.random() * 20;
              obstacle.position.x = (Math.random() > 0.5 ? 1 : -1) * (obstacle.userData.type === 'bike' ? 10 : 6);
            }
        }
        
        obstacleBoxes[i].setFromObject(obstacle);
        if (busBox.intersectsBox(obstacleBoxes[i])) {
            handleInfraction(obstacle.name);
            obstacle.position.z += 20; // Move away to prevent multiple hits
        }
      });

      // Student pickup logic
      studentZones.forEach((zone, i) => {
        if (studentsRef.current[i].visible && busBox.intersectsBox(zone)) {
          const busSpeed = Math.abs(keysPressed['arrowup'] ? moveSpeed : 0);
          if (busSpeed < 0.1) {
            studentsRef.current[i].visible = false;
            setScore(s => s + 10);
            setStudentsCollected(c => c + 1);
            addLog(`Picked up student.`);
            if(studentsCollected + 1 === totalStudents){
                addLog("All students collected! Return to school.");
                setCoachMessage("All students collected! Return to school.");
            }
          }
        }
      });

      // Finish condition
      if(studentsCollected === totalStudents && bus.position.z > -5 && bus.position.z < 20 && bus.position.x > 15) {
        setGameState("finished");
      }

      renderer.render(scene, camera);
    }
    
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setGameLog([]);
    setCoachMessage("");
    setInfractionCount(0);
    setStudentsCollected(0);
    setGameState("playing");
    addLog("Game started. Pick up all students and return to school.");
  };

  const restartGame = () => {
    setGameState("menu");
  }

  return (
    <div className="relative h-screen w-screen">
       <header className="absolute top-0 left-0 right-0 z-20 flex justify-center p-4">
        <h1 className="text-2xl md:text-4xl font-bold font-headline text-center bg-primary/80 text-primary-foreground py-2 px-6 rounded-lg shadow-lg backdrop-blur-sm">
          Hemja Highway Hero
        </h1>
      </header>
      {gameState === 'playing' && (
        <>
          <ControlsGuide />
        </>
      )}

      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
          <Card className="max-w-xl p-4 text-center shadow-2xl">
            <CardHeader className="p-2">
                <Image 
                    src="https://picsum.photos/800/400" 
                    width={800} 
                    height={400} 
                    alt="Shree Ambika Secondary School"
                    data-ai-hint="school building" 
                    className="rounded-t-lg"
                />
            </CardHeader>
            <CardContent className="p-4">
                <h2 className="text-3xl font-bold font-headline mb-2">Shree Ambika Secondary School</h2>
                <p className="text-muted-foreground mb-6">Your mission: Safely pick up all the students and bring them back to school. Avoid obstacles and drive carefully!</p>
                <Button onClick={startGame} size="lg" className="text-lg">Start Driving</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <Card className="max-w-md p-6 text-center">
            <h2 className="text-2xl font-bold font-headline mb-2">Mission Accomplished!</h2>
            <p className="text-muted-foreground mb-4">You have safely transported all the students. Great job!</p>
            <p className="text-xl font-bold mb-4">Final Score: {score}</p>
            <Button onClick={restartGame} size="lg">Play Again</Button>
          </Card>
        </div>
      )}

      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}
