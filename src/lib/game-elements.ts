import * as THREE from 'three';

// Create the school bus
export function createBus(): THREE.Group {
  const bus = new THREE.Group();
  bus.position.y = 0.4;
  
  const busYellow = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
  const black = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const grey = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const glass = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.5 });
  const light = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
  const red = new THREE.MeshLambertMaterial({ color: 0xFF0000 });

  // Main body
  const bodyGeo = new THREE.BoxGeometry(2.8, 2.2, 9);
  const body = new THREE.Mesh(bodyGeo, busYellow);
  body.position.y = 1.1;
  bus.add(body);
  
  // Front cabin shape
  const frontGeo = new THREE.BoxGeometry(2.8, 1.5, 1);
  const front = new THREE.Mesh(frontGeo, busYellow);
  front.position.set(0, 0.75, 5);
  bus.add(front);

  // Roof
  const roofGeo = new THREE.BoxGeometry(2.7, 0.2, 10);
  const roof = new THREE.Mesh(roofGeo, busYellow);
  roof.position.y = 2.3;
  bus.add(roof);

  // Bumper
  const bumperGeo = new THREE.BoxGeometry(2.9, 0.3, 0.5);
  const bumper = new THREE.Mesh(bumperGeo, black);
  bumper.position.set(0, 0.15, 4.7);
  bus.add(bumper);

  // Grille
  const grilleGeo = new THREE.PlaneGeometry(2, 0.5);
  const grille = new THREE.Mesh(grilleGeo, black);
  grille.position.set(0, 0.7, 5.51);
  bus.add(grille);

  // Headlights
  const headlightGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
  const headlightL = new THREE.Mesh(headlightGeo, light);
  headlightL.position.set(-1, 0.7, 5.51);
  headlightL.rotation.z = Math.PI / 2;
  bus.add(headlightL);
  const headlightR = headlightL.clone();
  headlightR.position.x = 1;
  bus.add(headlightR);
  
  // Taillights
  const taillightGeo = new THREE.BoxGeometry(0.2, 0.4, 0.1);
  const taillightL = new THREE.Mesh(taillightGeo, red);
  taillightL.position.set(-1.2, 0.8, -4.51);
  bus.add(taillightL);
  const taillightR = taillightL.clone();
  taillightR.position.x = 1.2;
  bus.add(taillightR);


  // Windshield
  const windshieldGeo = new THREE.PlaneGeometry(2.4, 1.2);
  const windshield = new THREE.Mesh(windshieldGeo, glass);
  windshield.position.set(0, 1.6, 4.5);
  bus.add(windshield);

  // Side Windows
  const sideWindowGeo = new THREE.PlaneGeometry(1.8, 0.8);
  for(let i=0; i<4; i++){
    const sideWindowL = new THREE.Mesh(sideWindowGeo, glass);
    sideWindowL.position.set(-1.41, 1.7, -2 + i * 2);
    sideWindowL.rotation.y = Math.PI/2;
    bus.add(sideWindowL);

    const sideWindowR = new THREE.Mesh(sideWindowGeo, glass);
    sideWindowR.position.set(1.41, 1.7, -2 + i * 2);
    sideWindowR.rotation.y = -Math.PI/2;
    bus.add(sideWindowR);
  }
  
  // Door
  const doorGeo = new THREE.PlaneGeometry(1, 1.8);
  const door = new THREE.Mesh(doorGeo, glass);
  door.position.set(1.41, 1.2, 3.5);
  door.rotation.y = -Math.PI/2;
  bus.add(door);
  
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 24);
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const wheelPositions = [
    {x: -1.5, z: 3.5}, {x: 1.5, z: 3.5},
    {x: -1.5, z: -3.5}, {x: 1.5, z: -3.5},
  ];
  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, 0, pos.z);
    bus.add(wheel);
  });
  
  // Add Text
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#000000';
    context.font = 'bold 32px PT Sans';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Shree Ambika Secondary School', 512, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), textMaterial);
  textMesh.position.set(-1.41, 1.3, 0);
  textMesh.rotation.y = Math.PI / 2;
  bus.add(textMesh.clone());
  textMesh.position.x = 1.41;
  textMesh.rotation.y = -Math.PI / 2;
  bus.add(textMesh);


  return bus;
}


// Create the road
export function createRoad(): THREE.Mesh {
  const roadLength = 500;
  const roadGeometry = new THREE.PlaneGeometry(24, roadLength);
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
    
    // 3 lanes on each side means 2 dividing lines per side.
    for (let j = -2; j <= 2; j++) {
      if (j === 0) continue; // Center is open
      for (let i = 0; i < 60; i++) {
          const line = new THREE.Mesh(lineGeometry, lineMaterial);
          line.position.z = -i * 8;
          line.position.x = j * 4;
          markings.add(line);
      }
    }
    markings.position.z = -20;
    return markings;
}

function createHouses(): THREE.Group {
    const houses = new THREE.Group();
  
    // Old style house
    const createOldHouse = () => {
      const house = new THREE.Group();
      const baseMat = new THREE.MeshLambertMaterial({ color: 0xDEB887 }); // BurlyWood
      const base = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 6), baseMat);
      base.position.y = 2;
      house.add(base);
  
      const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // SaddleBrown
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 2, 4), roofMat);
      roof.position.y = 4 + 1;
      roof.rotation.y = Math.PI / 4;
      house.add(roof);
      return house;
    };
  
    // Modern style house
    const createModernHouse = () => {
      const house = new THREE.Group();
      const mainMat = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 }); // LightGray
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 5), mainMat);
      mainBlock.position.y = 2.5;
      house.add(mainBlock);
  
      const accentMat = new THREE.MeshLambertMaterial({ color: 0x696969 }); // DimGray
      const accentBlock = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 4), accentMat);
      accentBlock.position.set(-2, 3, 1);
      house.add(accentBlock);
  
      const windowMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const window = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), windowMat);
      window.position.set(1.5, 3, 2.51);
      house.add(window);
  
      return house;
    };
  
    for (let i = 0; i < 8; i++) {
      const isModern = Math.random() > 0.5;
      const house = isModern ? createModernHouse() : createOldHouse();
      const onLeftSide = Math.random() > 0.5;
      
      house.position.x = onLeftSide ? -25 : 25;
      house.position.z = -20 - i * 55 - Math.random() * 20;
      house.rotation.y = onLeftSide ? Math.PI / 2 : -Math.PI / 2;
      
      houses.add(house);
    }
  
    return houses;
}

export function createTrees(): THREE.Group {
    const trees = new THREE.Group();
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // SaddleBrown
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x006400 }); // DarkGreen
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const leavesGeo = new THREE.ConeGeometry(1.5, 4, 8);
  
    for (let i = 0; i < 40; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1;
      tree.add(trunk);
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 2 + 2;
      tree.add(leaves);
  
      const onLeftSide = Math.random() > 0.5;
      tree.position.x = onLeftSide ? -18 - Math.random() * 5 : 18 + Math.random() * 5;
      tree.position.z = -i * 12 - Math.random() * 5;
      trees.add(tree);
    }
    return trees;
}

export function createShops(): THREE.Group {
    const shops = new THREE.Group();
    const shopNames = ['Kirana Store', 'Bakery', 'Electronics', 'Cafe'];
  
    const createShop = (name: string) => {
        const shop = new THREE.Group();
        const baseMat = new THREE.MeshLambertMaterial({ color: 0xA9A9A9 });
        const base = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), baseMat);
        base.position.y = 2.5;
        shop.add(base);
    
        const awningMat = new THREE.MeshLambertMaterial({ color: 0xB22222 });
        const awning = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.5, 2.5), awningMat);
        awning.position.set(0, 4.5, 4);
        awning.rotation.x = 0.2;
        shop.add(awning);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const context = canvas.getContext('2d');
        if (context) {
            context.fillStyle = 'white';
            context.fillRect(0, 0, 512, 128);
            context.fillStyle = 'black';
            context.font = 'bold 48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(name, 256, 64);
        }
        const texture = new THREE.CanvasTexture(canvas);
        const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), signMaterial);
        sign.position.set(0, 4, 3.01);
        shop.add(sign);
    
        return shop;
    }

    for (let i = 0; i < 4; i++) {
        const shop = createShop(shopNames[i]);
        const onLeftSide = Math.random() > 0.5;
        shop.position.x = onLeftSide ? -25 : 25;
        shop.position.z = -50 - i * 100 - Math.random() * 20;
        shop.rotation.y = onLeftSide ? Math.PI / 2 : -Math.PI / 2;
        shops.add(shop);
    }
  
    return shops;
}

export function createUTurnMarkings(): THREE.Group {
    const markings = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0xFFD700 }); // Yellow
  
    const createUTurn = (z: number) => {
      const uTurn = new THREE.Group();
      const arcShape = new THREE.Shape();
      arcShape.moveTo(0, 0);
      arcShape.absarc(0, 0, 3.5, 0, Math.PI, false);
      arcShape.absarc(0, 0, 2.5, Math.PI, 0, true);
  
      const geometry = new THREE.ShapeGeometry(arcShape);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.z = z;
      
      const arrowHeadGeo = new THREE.ConeGeometry(0.8, 1, 4);
      const arrowHead = new THREE.Mesh(arrowHeadGeo, material);
      arrowHead.position.set(2.5, 0, z+1);
      arrowHead.rotation.set(-Math.PI/2, 0, -Math.PI/4);
      
      uTurn.add(mesh);
      uTurn.add(arrowHead);
      return uTurn;
    }
  
    markings.add(createUTurn(-200));
    markings.add(createUTurn(-400));
  
    return markings;
}
  

// Create scenery
export function createScenery(): THREE.Group {
  const scenery = new THREE.Group();

  // Ground
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // ForestGreen
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
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
    
    // Position hills away from the road
    const side = Math.random() > 0.5 ? 1 : -1;
    const xPos = side * (50 + Math.random() * 150); // Position between 50 and 200 units away from center

    hill.position.set(
      xPos,
      14,
      -200 - Math.random() * 150
    );
    scenery.add(hill);
  }

  scenery.add(createHouses());

  return scenery;
}

// Create students at bus stops
export function createStudents(): THREE.Mesh[] {
  const studentMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF }); // Blue
  const studentGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
  const students: THREE.Mesh[] = [];

  const busStops = [-50, -150, -250, -350, -450];
  busStops.forEach(zPos => {
    for(let i=0; i<2; i++) {
      const student = new THREE.Mesh(studentGeometry, studentMaterial);
      student.position.set(13 + Math.random(), 0.75, zPos + (Math.random()-0.5)*5);
      student.name = `student_stop_${zPos}`;
      students.push(student);
    }
  });
  return students;
}

// Create obstacles
export function createObstacles(): THREE.Mesh[] {
    const obstacles: (THREE.Mesh | THREE.Group)[] = [];
  
    // Car
    const createCar = () => {
      const car = new THREE.Group();
      const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), bodyMat);
      body.position.y = 0.5;
      car.add(body);
      const cabinMat = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 2.5), cabinMat);
      cabin.position.y = 1.4;
      car.add(cabin);
      car.name = 'car';
      car.userData = { type: 'car' };
      return car;
    }

    // Bike
    const createBike = () => {
        const bike = new THREE.Group();
        const frameMat = new THREE.MeshLambertMaterial({color: 0x00ff00});
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 1.8), frameMat);
        frame.position.y = 0.35;
        bike.add(frame);
        const wheelGeo = new THREE.CylinderGeometry(0.3,0.3,0.1,16);
        const wheelMat = new THREE.MeshLambertMaterial({color: 0x333333});
        const wheelF = new THREE.Mesh(wheelGeo, wheelMat);
        wheelF.rotation.z = Math.PI / 2;
        wheelF.position.set(0, 0.3, 0.7);
        bike.add(wheelF);
        const wheelB = wheelF.clone();
        wheelB.position.z = -0.7;
        bike.add(wheelB);
        bike.name = 'bike';
        bike.userData = { type: 'bike' };
        return bike;
    }

    // Truck
    const createTruck = () => {
        const truck = new THREE.Group();
        const cabinMat = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 2.5), cabinMat);
        cabin.position.set(0, 1, 3);
        truck.add(cabin);
        const cargoMat = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 5), cargoMat);
        cargo.position.set(0, 1.1, -1);
        truck.add(cargo);
        truck.name = 'truck';
        truck.userData = { type: 'truck' };
        return truck;
    }

    // Cow
    const createCow = () => {
        const cow = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x964B00 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1.8), bodyMat);
        body.position.y = 0.7;
        cow.add(body);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6), bodyMat);
        head.position.set(0, 1, 1);
        cow.add(head);
        cow.name = 'cow';
        cow.userData = { type: 'cow' };
        return cow;
    }
    
    // Create instances
    for (let i = 0; i < 3; i++) {
        const car = createCar();
        car.position.set(-6, 0, -70 - i * 120 - Math.random()*50);
        car.userData.speed = 20 + Math.random() * 10;
        obstacles.push(car);
    }
    
    for (let i = 0; i < 3; i++) {
        const bike = createBike();
        bike.position.set(10, 0, -40 - i * 150 - Math.random()*50);
        bike.userData.speed = 30 + Math.random() * 10;
        obstacles.push(bike);
    }
    
    for (let i = 0; i < 2; i++) {
        const truck = createTruck();
        truck.position.set(6, 0, -150 - i * 180 - Math.random()*50);
        truck.userData.speed = 15 + Math.random() * 5;
        obstacles.push(truck);
    }

    for (let i = 0; i < 3; i++) {
      const cow = createCow();
      cow.position.set((Math.random()-0.5)*16, 0, -100 - i * 150);
      obstacles.push(cow);
    }
  
    return obstacles as THREE.Mesh[];
}

// Create the school compound
export function createSchool(): THREE.Group {
    const school = new THREE.Group();

    // Building
    const buildingMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Tan
    const building = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 8), buildingMat);
    building.position.set(30, 5, 10);
    school.add(building);

    // Gate
    const gate = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
    const postGeo = new THREE.BoxGeometry(0.5, 5, 0.5);
    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(8.25, 2.5, 5);
    gate.add(post1);
    const post2 = post1.clone();
    post2.position.x = -8.25;
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
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(16, 1.5), signMaterial);
    sign.position.y = 4;
    gate.add(sign);
    gate.position.z = 2;
    gate.position.x = 15;


    school.add(gate);
    return school;
}

export function createZebraCross(): THREE.Group {
    const zebraCross = new THREE.Group();
    const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeGeometry = new THREE.BoxGeometry(1.5, 0.02, 24);
    for (let i = 0; i < 7; i++) {
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.rotation.y = Math.PI / 2;
        stripe.position.z = 50 - i * 2.5; // Starts after 500m (since road starts at z=50 and goes to -450)
        zebraCross.add(stripe);
    }
    zebraCross.position.z = -450;
    return zebraCross;
}
    