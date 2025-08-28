import * as THREE from 'three';

// Create the school bus
export function createBus(): THREE.Group {
  const bus = new THREE.Group();

  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xE2A900 }); // Saturated Yellow
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 5), bodyMaterial);
  body.position.y = 0.6;
  bus.add(body);
  
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.8, 4), bodyMaterial);
  top.position.y = 1.6;
  bus.add(top);

  const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
  const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.6), windowMaterial);
  frontWindow.position.set(0, 1.6, 2.51);
  bus.add(frontWindow);
  
  const sideWindow = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.5), windowMaterial);
  sideWindow.position.set(1.16, 1.6, 0);
  sideWindow.rotation.y = Math.PI / 2;
  bus.add(sideWindow.clone());
  sideWindow.position.x = -1.16;
  bus.add(sideWindow);

  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 18);
  
  const wheels: [number, number, number][] = [
    [1.3, 0.4, 1.8], [-1.3, 0.4, 1.8],
    [1.3, 0.4, -1.8], [-1.3, 0.4, -1.8],
  ];

  wheels.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos[0], pos[1], pos[2]);
    bus.add(wheel);
  });
  
  // Add Text
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#B82E00';
    context.font = 'bold 32px PT Sans';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Shree Ambika Secondary School', 256, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), textMaterial);
  textMesh.position.set(-1.26, 0.8, 0);
  textMesh.rotation.y = -Math.PI / 2;
  bus.add(textMesh.clone());
  textMesh.position.x = 1.26;
  textMesh.rotation.y = Math.PI / 2;
  bus.add(textMesh);


  return bus;
}

// Create the road
export function createRoad(): THREE.Mesh {
  const roadLength = 400;
  const roadGeometry = new THREE.PlaneGeometry(12, roadLength);
  const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.z = -roadLength / 2 + 50;
  return road;
}

// Create road markings
export function createRoadMarkings(): THREE.Group {
    const markings = new THREE.Group();
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineGeometry = new THREE.BoxGeometry(0.2, 0.01, 3);
    for (let i = 0; i < 50; i++) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.z = -i * 8;
        markings.add(line);
    }
    markings.position.z = -20;
    return markings;
}

// Create scenery
export function createScenery(): THREE.Group {
  const scenery = new THREE.Group();

  // Ground
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // ForestGreen
  const groundGeometry = new THREE.PlaneGeometry(500, 400);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.position.z = -200;
  scenery.add(ground);

  // Hills
  const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F }); // DarkOliveGreen
  const hillGeometry = new THREE.ConeGeometry(50, 30, 16);
  for (let i = 0; i < 10; i++) {
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(
      (Math.random() - 0.5) * 400,
      14,
      -150 - Math.random() * 100
    );
    scenery.add(hill);
  }

  // Roadside shops
  const shopMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // SaddleBrown
  const shopGeometry = new THREE.BoxGeometry(6, 4, 4);
  for (let i = 0; i < 5; i++) {
    const shop = new THREE.Mesh(shopGeometry, shopMaterial);
    shop.position.set(
      Math.random() > 0.5 ? 10 : -10,
      2,
      -50 - i * 60 - Math.random() * 20
    );
    scenery.add(shop);
  }

  return scenery;
}

// Create students at bus stops
export function createStudents(): THREE.Mesh[] {
  const studentMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF }); // Blue
  const studentGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
  const students: THREE.Mesh[] = [];

  const busStops = [-50, -150, -250, -350];
  busStops.forEach(zPos => {
    for(let i=0; i<3; i++) {
      const student = new THREE.Mesh(studentGeometry, studentMaterial);
      student.position.set(7 + Math.random(), 0.75, zPos + (Math.random()-0.5)*5);
      student.name = `student_stop_${zPos}`;
      students.push(student);
    }
  });
  return students;
}

// Create obstacles
export function createObstacles(): THREE.Mesh[] {
    const obstacles: THREE.Mesh[] = [];
  
    // Cars
    const carMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);
    for (let i = 0; i < 3; i++) {
      const car = new THREE.Mesh(carGeometry, carMaterial);
      car.name = 'car';
      car.position.set(-3, 0.5, -70 - i * 100);
      obstacles.push(car);
    }

    // Bikes
    const bikeMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const bikeGeometry = new THREE.BoxGeometry(0.5, 0.8, 1.5);
     for (let i = 0; i < 3; i++) {
      const bike = new THREE.Mesh(bikeGeometry, bikeMaterial);
      bike.name = 'bike';
      bike.position.set(3, 0.4, -40 - i * 120);
      obstacles.push(bike);
    }
  
    // Cows
    const cowMaterial = new THREE.MeshLambertMaterial({ color: 0x964B00 });
    const cowGeometry = new THREE.BoxGeometry(1.5, 1, 2.5);
    for (let i = 0; i < 2; i++) {
      const cow = new THREE.Mesh(cowGeometry, cowMaterial);
      cow.name = 'cow';
      cow.position.set((Math.random()-0.5)*10, 0.5, -100 - i * 150);
      obstacles.push(cow);
    }
  
    return obstacles;
}

// Create the school compound
export function createSchool(): THREE.Group {
    const school = new THREE.Group();

    // Building
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Tan
    const building = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 8), buildingMat);
    building.position.set(20, 5, 10);
    school.add(building);

    // Gate
    const gate = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
    const postGeo = new THREE.BoxGeometry(0.5, 5, 0.5);
    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(6.25, 2.5, 5);
    gate.add(post1);
    const post2 = post1.clone();
    post2.position.x = -6.25;
    gate.add(post2);

    // Gate Sign
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#003366';
        context.fillRect(0,0,1024,128);
        context.fillStyle = 'white';
        context.font = 'bold 48px PT Sans';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Shree Ambika Secondary School', 512, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.5), signMaterial);
    sign.position.y = 4;
    gate.add(sign);
    gate.position.z = 2;

    school.add(gate);
    return school;
}
