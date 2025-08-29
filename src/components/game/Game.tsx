"use client";

import * as React from "react";
import * as THREE from "three";
import Image from "next/image";
import Link from "next/link";
import { ControlsGuide } from "./ControlsGuide";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createBus, createRoad, createScenery, createStudents, createObstacles, createSchool, createRoadMarkings, createTrees, createShops } from "@/lib/game-elements";
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
    const sunriseColor = 0x87CEEB; // Light sky blue for daytime
    scene.background = new THREE.Color(sunriseColor);
    scene.fog = new THREE.Fog(sunriseColor, 150, 400);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    mount.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xFFFFFF, 1.5)); // Brighter ambient light
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 2.5); // Natural sun light
    dirLight.position.set(100, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Game elements
    const bus = createBus();
    scene.add(bus);
    bus.position.x = 20;
    bus.position.z = 10;
    bus.rotation.y = -Math.PI / 2;

    scene.add(createRoad());
    scene.add(createRoadMarkings());
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
        if (obstacle.userData.type && ['car', 'bike', 'truck', 'bicycle'].includes(obstacle.userData.type)) {
            const speed = delta * obstacle.userData.speed * (obstacle.userData.direction === -1 ? -1 : 1);
            obstacle.position.z += speed;
            
            if (obstacle.userData.direction === 1 && obstacle.position.z > 20) { // Moving towards start
                obstacle.position.z = -490;
            } else if (obstacle.userData.direction === -1 && obstacle.position.z < -490) { // Moving away from start
                obstacle.position.z = 20;
            }
        }
        
        obstacleBoxes[i].setFromObject(obstacle);
        if (busBox.intersectsBox(obstacleBoxes[i])) {
            handleInfraction(obstacle.name);
            obstacle.position.z += 20 * (obstacle.userData.direction === 1 ? 1 : -1); // Move away to prevent multiple hits
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
      {gameState === 'playing' && (
        <>
          <header className="absolute top-0 left-0 right-0 z-20 flex justify-center p-4">
            <h1 className="text-2xl md:text-4xl font-bold font-headline text-center bg-primary/80 text-primary-foreground py-2 px-6 rounded-lg shadow-lg backdrop-blur-sm whitespace-nowrap">
              Hemja Highway Hero
            </h1>
          </header>
          <ControlsGuide />
        </>
      )}

      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 animate-fade-in">
             <div className="w-full max-w-4xl mx-auto">
                <Card className="overflow-hidden shadow-2xl border-4 border-primary/50">
                    <div className="relative">
                        <Image 
                            src="https://picsum.photos/seed/school/1200/600"
                            width={1200}
                            height={600}
                            alt="Shree Ambika Secondary School"
                            data-ai-hint="school building"
                            className="object-cover w-full h-96"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <h1 className="text-4xl font-bold text-white font-headline whitespace-nowrap">
                                Shree Ambika Secondary School
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center p-8 bg-card">
                        <CardDescription className="text-lg text-muted-foreground mb-8 text-center">
                            Your mission: Safely pick up all the students and bring them back to school. Avoid obstacles and drive carefully!
                        </CardDescription>
                        <CardContent className="p-0 flex flex-col gap-4">
                             <Button onClick={startGame} size="lg" className="w-full text-lg py-6">
                                Start Driving
                            </Button>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <Card className="max-w-md p-6 text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold font-headline mb-2">Mission Accomplished!</CardTitle>
              <CardDescription className="text-muted-foreground mb-4">You have safely transported all the students. Great job!</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold mb-4">Final Score: {score}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={restartGame} size="lg" className="w-full">Play Again</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}
