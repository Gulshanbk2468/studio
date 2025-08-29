
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
import { createBus, createRoad, createScenery, createStudents, createObstacles, createSchool, createRoadMarkings, createTrees, createShops, createZebraCross, createFlowers, createRoadSigns } from "@/lib/game-elements";
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
  
  const [gameState, setGameState] = React.useState<"menu" | "playing">("menu");
  
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
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Light sky blue for daytime
    scene.fog = new THREE.Fog(0x87CEEB, 150, 600);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
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
    
    bus.position.set(212, 0.5, -25);
    bus.rotation.y = Math.PI;

    scene.add(createRoad());
    scene.add(createRoadMarkings());
    scene.add(createScenery());
    scene.add(createTrees());
    scene.add(createShops());
    
    const school = createSchool();
    scene.add(school);
    const gateLeft = school.getObjectByName('gateLeft');
    const gateRight = school.getObjectByName('gateRight');

    scene.add(createFlowers());
    scene.add(createRoadSigns());
    
    const zebraCrossings = [createZebraCross(-150), createZebraCross(-350), createZebraCross(50)];
    zebraCrossings.forEach(z => scene.add(z));
    
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

    let moveSpeed = 0;
    const acceleration = 12;
    const deceleration = 0.98;
    const maxSpeed = 15.0;
    const turnSpeed = 1.0;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (gameState === "playing") {
        const moveDirection = (keysPressed['arrowup'] ? 1 : 0) - (keysPressed['arrowdown'] ? 1 : 0);
        if (moveDirection !== 0) {
            moveSpeed += moveDirection * acceleration * delta;
        } else {
            moveSpeed *= deceleration;
        }
        moveSpeed = Math.max(-maxSpeed * 0.5, Math.min(maxSpeed, moveSpeed));

        if(Math.abs(moveSpeed) > 0.1) {
            const turnDirection = (keysPressed['arrowleft'] ? 1 : 0) - (keysPressed['arrowright'] ? 1 : 0);
            bus.rotation.y += turnDirection * turnSpeed * delta * Math.sign(moveSpeed);
        }
        
        bus.translateZ(moveSpeed * delta);

        const MAIN_HIGHWAY_X_MAX = 12;
        const MAIN_HIGHWAY_X_MIN = -12;
        const MAIN_HIGHWAY_Z_MAX = 10;
        const MAIN_HIGHWAY_Z_MIN = -510;

        const SUB_ROAD_X_MAX = 12 + 200;
        const SUB_ROAD_X_MIN = 12;
        const SUB_ROAD_Z_MAX = -45;
        const SUB_ROAD_Z_MIN = -55;
        
        const SCHOOL_COMPOUND_X_MAX = 12 + 200 + 35;
        const SCHOOL_COMPOUND_X_MIN = 12 + 200 - 35;
        const SCHOOL_COMPOUND_Z_MAX = -50 + 60;
        const SCHOOL_COMPOUND_Z_MIN = -50 - 60;

        let inSchoolCompound = bus.position.x >= SCHOOL_COMPOUND_X_MIN && bus.position.x <= SCHOOL_COMPOUND_X_MAX &&
                                bus.position.z >= SCHOOL_COMPOUND_Z_MIN && bus.position.z <= SCHOOL_COMPOUND_Z_MAX;
        
        let onMainHighway = bus.position.x >= MAIN_HIGHWAY_X_MIN && bus.position.x <= MAIN_HIGHWAY_X_MAX &&
                             bus.position.z >= MAIN_HIGHWAY_Z_MIN && bus.position.z <= MAIN_HIGHWAY_Z_MAX;
        
        let onSubRoad = bus.position.x >= SUB_ROAD_X_MIN && bus.position.x <= SUB_ROAD_X_MAX &&
                         bus.position.z >= SUB_ROAD_Z_MIN && bus.position.z <= SUB_ROAD_Z_MAX;
        

        if (onMainHighway && !onSubRoad) {
            bus.position.x = Math.max(MAIN_HIGHWAY_X_MIN, Math.min(MAIN_HIGHWAY_X_MAX, bus.position.x));
            bus.position.z = Math.max(MAIN_HIGHWAY_Z_MIN, Math.min(MAIN_HIGHWAY_Z_MAX, bus.position.z));
        } else if (onSubRoad && !onMainHighway) {
             bus.position.z = Math.max(SUB_ROAD_Z_MIN, Math.min(SUB_ROAD_Z_MAX, bus.position.z));
             bus.position.x = Math.max(SUB_ROAD_X_MIN, Math.min(SUB_ROAD_X_MAX, bus.position.x));
        } else if (inSchoolCompound) {
          bus.position.x = Math.max(SCHOOL_COMPOUND_X_MIN, Math.min(SCHOOL_COMPOUND_X_MAX, bus.position.x));
          bus.position.z = Math.max(SCHOOL_COMPOUND_Z_MIN, Math.min(SCHOOL_COMPOUND_Z_MAX, bus.position.z));
        } else if (!onMainHighway && !onSubRoad && !inSchoolCompound) {
          // Fallback if bus gets out of bounds somehow
        }

        // Gate logic
        if (gateLeft && gateRight) {
          const gateProximity = bus.position.distanceTo(school.position);
          const gateOpenPosition = 10;
          const gateClosedPosition = 0;
          
          if (gateProximity < 40) { // Bus is near the gate
              // Open gate
              gateLeft.position.x = THREE.MathUtils.lerp(gateLeft.position.x, -gateOpenPosition, 0.05);
              gateRight.position.x = THREE.MathUtils.lerp(gateRight.position.x, gateOpenPosition, 0.05);
          } else {
              // Close gate
              gateLeft.position.x = THREE.MathUtils.lerp(gateLeft.position.x, gateClosedPosition, 0.05);
              gateRight.position.x = THREE.MathUtils.lerp(gateRight.position.x, gateClosedPosition, 0.05);
          }
        }


        // Camera follow
        const offset = new THREE.Vector3(0, 7, 12); // Camera behind the bus
        offset.applyQuaternion(bus.quaternion);
        camera.position.lerp(bus.position.clone().add(offset), 0.1);
        camera.lookAt(bus.position);
      } else { // Menu animation
        camera.position.set(bus.position.x, 5, bus.position.z + 10 + Math.sin(time*0.3) * 2);
        camera.lookAt(bus.position);
      }


      busBox.setFromObject(bus);

      // Obstacle logic
      obstacles.forEach((obstacle, i) => {
        if (obstacle.userData.type && ['car', 'bike', 'truck', 'bicycle'].includes(obstacle.userData.type)) {
            const speed = delta * obstacle.userData.speed;
            obstacle.position.z += speed * obstacle.userData.direction;
            
            if (obstacle.userData.direction === 1 && obstacle.position.z > 20) { // Moving towards start
                obstacle.position.z = -510;
            } else if (obstacle.userData.direction === -1 && obstacle.position.z < -510) { // Moving away from start
                obstacle.position.z = 20;
            }
        }
        
        if (gameState === "playing") {
          obstacleBoxes[i].setFromObject(obstacle);
          if (busBox.intersectsBox(obstacleBoxes[i])) {
              handleInfraction(obstacle.name);
              obstacle.position.z += 20 * (obstacle.userData.direction || 1); // Move away to prevent multiple hits
          }
        }
      });

      // Student pickup logic
      if (gameState === "playing") {
        studentZones.forEach((zone, i) => {
          if (studentsRef.current[i].visible && busBox.intersectsBox(zone)) {
            const currentBusSpeed = Math.abs(moveSpeed);
            if (currentBusSpeed < 1.0) {
              studentsRef.current[i].visible = false;
              setScore(s => s + 10);
              const newStudentsCollected = studentsCollected + 1;
              setStudentsCollected(c => c + 1);
              addLog(`Picked up student.`);
              if(newStudentsCollected === totalStudents){
                  addLog("All students collected! Return to school.");
                  setCoachMessage("All students collected! Return to school.");
              }
            }
          }
        });

        // Finish condition
        const schoolFinishZone = new THREE.Box3(
          new THREE.Vector3(212 - 15, 0, -50 - 15),
          new THREE.Vector3(212 + 15, 5, -50 + 15)
        );

        if(studentsCollected === totalStudents && busBox.intersectsBox(schoolFinishZone)) {
          addLog("Mission Accomplished! You can continue driving.");
          setCoachMessage("Mission Accomplished! You can continue driving.");
          // To prevent message from repeatedly showing, maybe set a new game state.
        }
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
  }, [gameState, studentsCollected, totalStudents]);

  const startGame = () => {
    setScore(0);
    setGameLog([]);
    setCoachMessage("");
    setInfractionCount(0);
    setStudentsCollected(0);
    setGameState("playing");
    addLog("Game started. Pick up all students and return to school.");
  };

  return (
    <div className="relative h-screen w-screen">
       <div ref={mountRef} className="absolute inset-0 z-0" />
      {gameState === 'playing' ? (
        <>
          <header className="absolute top-0 left-0 right-0 z-20 flex justify-center p-4">
            <h1 className="text-2xl md:text-4xl font-bold font-headline text-center bg-primary/80 text-primary-foreground py-2 px-6 rounded-lg shadow-lg backdrop-blur-sm whitespace-nowrap">
              Hemja Highway Hero
            </h1>
          </header>
          <ControlsGuide />
        </>
      ) : (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 animate-fade-in">
             <div className="w-full max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold text-white font-headline drop-shadow-lg mb-4">
                  Hemja Highway Hero
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground bg-primary/80 rounded-md py-2 px-4 inline-block mb-8">
                  Shree Ambika Secondary School Edition
                </h2>
                <p className="text-lg text-white max-w-2xl mx-auto mb-8 drop-shadow-md">
                    Your mission: Safely pick up all the students and bring them back to school. Avoid obstacles and drive carefully!
                </p>
                <Button onClick={startGame} size="lg" className="w-auto text-xl py-8 px-10">
                    Start Driving
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
