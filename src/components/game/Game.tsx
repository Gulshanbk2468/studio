"use client";

import * as React from "react";
import * as THREE from "three";
import { Dashboard } from "./Dashboard";
import { ControlsGuide } from "./ControlsGuide";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBus, createRoad, createScenery, createStudents, createObstacles, createSchool, createRoadMarkings, createZebraCross } from "@/lib/game-elements";
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

    scene.add(createRoad());
    scene.add(createRoadMarkings());
    scene.add(createZebraCross());
    scene.add(createScenery());
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
      const turnSpeed = 1.0 * delta;

      if (keysPressed['arrowup']) bus.position.z -= moveSpeed;
      if (keysPressed['arrowdown']) bus.position.z += moveSpeed;
      if (keysPressed['arrowleft']) bus.rotation.y += turnSpeed;
      if (keysPressed['arrowright']) bus.rotation.y -= turnSpeed;
      
      // Keep bus on road
      bus.position.x = Math.max(-12, Math.min(12, bus.position.x));
      bus.position.z = Math.max(-490, Math.min(20, bus.position.z));
      
      // Camera follow
      const offset = new THREE.Vector3(0, 7, 12);
      offset.applyQuaternion(bus.quaternion);
      camera.position.lerp(bus.position.clone().add(offset), 0.1);
      camera.lookAt(bus.position);

      busBox.setFromObject(bus);

      // Obstacle logic
      obstacles.forEach((obstacle, i) => {
        if (obstacle.name === 'car' || obstacle.name === 'bike') {
            obstacle.position.z += delta * (obstacle.name === 'car' ? 20 : 30);
            if (obstacle.position.z > 20) obstacle.position.z = -490;
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
      if(studentsCollected === totalStudents && bus.position.z > 0 && bus.position.z < 10) {
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
    addLog("Game started. Pick up all students.");
  };

  const restartGame = () => {
    setGameState("menu");
  }

  return (
    <div className="relative h-screen w-screen">
      {gameState === 'playing' && (
        <>
          <Dashboard score={score} log={gameLog} coachMessage={coachMessage} studentsCollected={studentsCollected} studentsToCollect={totalStudents} />
          <ControlsGuide />
        </>
      )}

      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
          <Card className="max-w-md p-6 text-center">
            <h2 className="text-2xl font-bold font-headline mb-2">Welcome to Hemja Highway Hero!</h2>
            <p className="text-muted-foreground mb-4">Your mission is to safely pick up all the students waiting at bus stops and bring them back to school. Avoid obstacles on the road. Good luck!</p>
            <Button onClick={startGame} size="lg">Start Driving</Button>
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
