
import * as THREE from 'three';

// Create the school bus
export function createBus(): THREE.Group {
  const bus = new THREE.Group();
  bus.name = "bus";
  bus.position.y = 1.0;

  const busYellow = new THREE.MeshStandardMaterial({ color: 0xE2A900, roughness: 0.3, metalness: 0.2 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.1, transparent: true, opacity: 0.6 });
  const light = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
  const red = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  const silver = new THREE.MeshStandardMaterial({color: 0xC0C0C0, roughness: 0.2, metalness: 0.8});

  // Main body
  const bodyGeo = new THREE.BoxGeometry(2.8, 2.2, 9);
  const body = new THREE.Mesh(bodyGeo, busYellow);
  body.position.y = 1.1;
  bus.add(body);
  
  // Front cabin shape
  const frontGeo = new THREE.BoxGeometry(2.8, 1.8, 1);
  const front = new THREE.Mesh(frontGeo, busYellow);
  front.position.set(0, 0.9, 5);
  front.rotation.x = 0.1;
  bus.add(front);

  // Roof
  const roofGeo = new THREE.BoxGeometry(2.7, 0.2, 10);
  const roof = new THREE.Mesh(roofGeo, busYellow);
  roof.position.y = 2.3;
  bus.add(roof);

  // Bumpers
  const bumperGeo = new THREE.BoxGeometry(2.9, 0.3, 0.5);
  const frontBumper = new THREE.Mesh(bumperGeo, silver);
  frontBumper.position.set(0, 0.15, 4.7);
  bus.add(frontBumper);
  const rearBumper = frontBumper.clone();
  rearBumper.position.z = -4.7;
  bus.add(rearBumper);

  // Grille
  const grilleGeo = new THREE.PlaneGeometry(2, 0.5);
  const grille = new THREE.Mesh(grilleGeo, black);
  grille.position.set(0, 0.7, 4.51);
  bus.add(grille);

  // Headlights
  const headlightGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
  const headlightL = new THREE.Mesh(headlightGeo, light);
  headlightL.position.set(-1, 0.7, 4.51);
  headlightL.rotation.x = -0.1;
  headlightL.rotation.z = Math.PI / 2;
  bus.add(headlightL);
  const headlightR = headlightL.clone();
  headlightR.position.x = 1;
  bus.add(headlightR);
  
  // Taillights
  const taillightGeo = new THREE.BoxGeometry(0.2, 0.4, 0.1);
  const taillightL = new THREE.Mesh(taillightGeo, red);
  taillightL.position.set(-1.2, 0.8, -4.75);
  bus.add(taillightL);
  const taillightR = taillightL.clone();
  taillightR.position.x = 1.2;
  bus.add(taillightR);

  // Windshield
  const windshieldGeo = new THREE.PlaneGeometry(2.4, 1.2);
  const windshield = new THREE.Mesh(windshieldGeo, glass);
  windshield.position.set(0, 1.6, 4.55);
  windshield.rotation.x = 0.1;
  bus.add(windshield);

  // Side Windows
  const sideWindowGeo = new THREE.PlaneGeometry(1.8, 0.8);
  for(let i=0; i<4; i++){
    const windowYPos = 1.7;
    const windowZPos = -2.5 + i * 1.9;
    const sideWindowL = new THREE.Mesh(sideWindowGeo, glass);
    sideWindowL.position.set(-1.41, windowYPos, windowZPos);
    sideWindowL.rotation.y = Math.PI/2;
    bus.add(sideWindowL);

    if (i !== 3) { // No door on the left side
      const sideWindowR = new THREE.Mesh(sideWindowGeo, glass);
      sideWindowR.position.set(1.41, windowYPos, windowZPos);
      sideWindowR.rotation.y = -Math.PI/2;
      bus.add(sideWindowR);
    }
  }
  
  // Door
  const doorGeo = new THREE.PlaneGeometry(1, 1.8);
  const door = new THREE.Mesh(doorGeo, glass);
  door.position.set(1.41, 1.2, 3.5);
  door.rotation.y = -Math.PI/2;
  bus.add(door);
  
  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 24);
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
  const wheelPositions = [
    {x: -1.5, z: 3.5}, {x: 1.5, z: 3.5},
    {x: -1.5, z: -3.5}, {x: 1.5, z: -3.5},
  ];
  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, -0.5, pos.z);
    bus.add(wheel);
  });
  
  // Add Text
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#B82E00'; // Dark Red
    context.font = 'bold 36px "PT Sans"';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Shree Ambika Secondary School', 512, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const textMeshL = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), textMaterial);
  textMeshL.position.set(-1.41, 1.3, 0);
  textMeshL.rotation.y = Math.PI / 2;
  bus.add(textMeshL);
  
  const textMeshR = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), textMaterial.clone());
  textMeshR.position.set(1.41, 1.3, 0);
  textMeshR.rotation.y = -Math.PI / 2;
  bus.add(textMeshR);


  return bus;
}


// Create the road
export function createRoad(): THREE.Group {
  const roadGroup = new THREE.Group();
  const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });

  // Main Highway
  const mainRoadLength = 520;
  const mainRoadGeometry = new THREE.PlaneGeometry(24, mainRoadLength);
  const mainRoad = new THREE.Mesh(mainRoadGeometry, roadMaterial);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.z = -mainRoadLength / 2 + 10;
  roadGroup.add(mainRoad);

  // Sub-road to school
  const subRoadLength = 190;
  const subRoadGeometry = new THREE.PlaneGeometry(10, subRoadLength);
  const subRoad = new THREE.Mesh(subRoadGeometry, roadMaterial);
  subRoad.rotation.x = -Math.PI / 2;
  subRoad.position.x = 20;
  subRoad.position.z = 10 + subRoadLength / 2;
  roadGroup.add(subRoad);

  return roadGroup;
}

// Create road markings
export function createRoadMarkings(): THREE.Group {
    const markings = new THREE.Group();
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineGeometry = new THREE.BoxGeometry(0.2, 0.01, 3);
    
    // Center dashed lines for main highway
    for (let i = 0; i < 65; i++) {
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.z = -i * 8;
        line.position.x = 0; // Center of the 24-width road
        markings.add(line);
    }
    
    markings.position.z = -10;
    return markings;
}

function createHouses(): THREE.Group {
    const houses = new THREE.Group();
  
    // Traditional Nepali House
    const createOldNepaliHouse = () => {
      const house = new THREE.Group();
      const brickMat = new THREE.MeshLambertMaterial({ color: 0x945E3D }); // Darker brown
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x5C3D2E });
      const roofMat = new THREE.MeshLambertMaterial({ color: 0x7B6C61 }); // Slate gray
      
      const base = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 7), brickMat);
      base.position.y = 2;
      house.add(base);

      // Pitched Roof
      const roofGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -3.5, 4, 4,   3.5, 4, 4,   3.5, 6, 0,
        -3.5, 4, 4,  -3.5, 6, 0,   3.5, 6, 0,
        -3.5, 4, -4,  -3.5, 6, 0,  -3.5, 4, 4,
         3.5, 4, -4,   3.5, 4, 4,   3.5, 6, 0,
        -3.5, 4, -4,   3.5, 4, -4,  3.5, 6, 0,
        -3.5, 4, -4,   3.5, 6, 0,  -3.5, 6, 0,
      ]);
      roofGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      roofGeo.computeVertexNormals();
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 0;
      house.add(roof);

      // Wooden beams/windows
      const windowGeo = new THREE.BoxGeometry(1.5, 1, 0.2);
      const window1 = new THREE.Mesh(windowGeo, woodMat);
      window1.position.set(-1.5, 2.5, 3.51);
      house.add(window1);
      const window2 = window1.clone();
      window2.position.x = 1.5;
      house.add(window2);

      return house;
    };
  
    // Modern style house with clean lines
    const createModernHouse = () => {
      const house = new THREE.Group();
      const mainMat = new THREE.MeshLambertMaterial({ color: 0xE0E0E0 }); // LightGray
      const accentMat = new THREE.MeshLambertMaterial({ color: 0x757575 }); // MidGray
      
      const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 5), mainMat);
      mainBlock.position.y = 2.5;
      house.add(mainBlock);
  
      const accentBlock = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 4), accentMat);
      accentBlock.position.set(-2.5, 3, 1.5);
      house.add(accentBlock);
  
      const windowMat = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: 0.6 });
      const window = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), windowMat);
      window.position.set(1.5, 3, 2.51);
      house.add(window);
  
      return house;
    };

    // Big building with glass
    const createGlassBuilding = () => {
        const building = new THREE.Group();
        const frameMat = new THREE.MeshLambertMaterial({ color: 0xACACAC });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x6495ED, transparent: true, opacity: 0.4 });

        const floors = 5;
        const floorHeight = 4;

        for (let i = 0; i < floors; i++) {
            // Frame
            const frame = new THREE.Mesh(new THREE.BoxGeometry(10, floorHeight, 8), frameMat);
            frame.position.y = i * floorHeight + floorHeight/2;
            building.add(frame);
            // Glass panels
            const glassWall = new THREE.Mesh(new THREE.PlaneGeometry(9, floorHeight - 0.5), glassMat);
            glassWall.position.y = frame.position.y;
            glassWall.position.z = 4.01;
            building.add(glassWall);

            const glassWallSide = new THREE.Mesh(new THREE.PlaneGeometry(7, floorHeight - 0.5), glassMat);
            glassWallSide.position.y = frame.position.y;
            glassWallSide.position.x = -5.01;
            glassWallSide.rotation.y = Math.PI / 2;
            building.add(glassWallSide);
        }
        return building;
    }
  
    const houseTypes = [createOldNepaliHouse, createModernHouse, createGlassBuilding];

    for (let i = 0; i < 40; i++) {
      const randomTypeIndex = Math.floor(Math.random() * houseTypes.length);
      const house = houseTypes[randomTypeIndex]();
      
      const onLeftSide = Math.random() > 0.5;
      
      house.position.x = onLeftSide ? -25 - Math.random() * 15 : 25 + Math.random() * 15;
      house.position.z = -i * 12 - 20 - Math.random() * 5;
      house.rotation.y = onLeftSide ? Math.PI / 2 + (Math.random()-0.5) * 0.2 : -Math.PI / 2 + (Math.random()-0.5) * 0.2;
      
      houses.add(house);
    }
  
    return houses;
}

export function createTrees(): THREE.Group {
    const trees = new THREE.Group();
    
    const createPineTree = () => {
        const tree = new THREE.Group();
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x654321 }); 
        const leavesMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5, 8), trunkMat);
        trunk.position.y = 1.25;
        tree.add(trunk);
        
        let h = 2.5;
        for(let i=0; i<3; i++) {
            const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.5 - i*0.3, 2, 8), leavesMat);
            leaves.position.y = h;
            h += 1;
            tree.add(leaves);
        }
        return tree;
    }

    const createDeciduousTree = () => {
        const tree = new THREE.Group();
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const leavesMat = new THREE.MeshLambertMaterial({ color: 0x006400 });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 3, 8), trunkMat);
        trunk.position.y = 1.5;
        tree.add(trunk);
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), leavesMat);
        leaves.position.y = 4;
        tree.add(leaves);
        return tree;
    }

    const treeTypes = [createPineTree, createDeciduousTree];
  
    for (let i = 0; i < 120; i++) {
      const treeTypeIndex = Math.floor(Math.random() * treeTypes.length);
      const tree = treeTypes[treeTypeIndex]();
  
      const onLeftSide = Math.random() > 0.5;
      tree.position.x = onLeftSide ? -18 - Math.random() * 40 : 18 + Math.random() * 40;
      tree.position.z = -i * 8 - Math.random() * 8;

      if(tree.position.x > -15 && tree.position.x < 15) continue; // Avoid trees on the road

      trees.add(tree);
    }
    return trees;
}

export function createShops(): THREE.Group {
    const shops = new THREE.Group();
    const shopNames = ['Kirana Store', 'Bakery', 'Electronics', 'Cafe', 'Pustak Pasal', 'Chatpate Center'];
  
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
        sign.position.set(0, 5.5, 3.01);
        shop.add(sign);
    
        return shop;
    }

    for (let i = 0; i < shopNames.length; i++) {
        const shop = createShop(shopNames[i]);
        const onLeftSide = Math.random() > 0.5;
        shop.position.x = onLeftSide ? -25 : 25;
        shop.position.z = -50 - i * 80 - Math.random() * 20;
        shop.rotation.y = onLeftSide ? Math.PI / 2 : -Math.PI / 2;
        shops.add(shop);
    }
  
    return shops;
}

// Create scenery
export function createScenery(): THREE.Group {
  const scenery = new THREE.Group();

  // Ground with Terraced Fields
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // ForestGreen
  const groundGeometry = new THREE.PlaneGeometry(800, 1000);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.position.z = 0;
  scenery.add(ground);

  // Terraced Fields
  const terraceMat = new THREE.MeshLambertMaterial({ color: 0x3CB371 }); // MediumSeaGreen
  for(let i = 0; i < 20; i++) {
      const terraceGeo = new THREE.BoxGeometry(120 + Math.random()*80, 0.5, 30 + Math.random()*15);
      const terrace = new THREE.Mesh(terraceGeo, terraceMat);
      const onLeftSide = Math.random() > 0.5;
      terrace.position.x = onLeftSide ? -100 - Math.random()*40 : 100 + Math.random()*40;
      terrace.position.y = i * 0.2;
      terrace.position.z = -i * 50 - Math.random() * 20;
      scenery.add(terrace);
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
export function createObstacles(): (THREE.Mesh | THREE.Group)[] {
    const obstacles: (THREE.Mesh | THREE.Group)[] = [];
  
    const createCar = () => {
        const car = new THREE.Group();
        const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xffffff];
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)], roughness: 0.3, metalness: 0.2 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1, 4), bodyMat);
        body.position.y = 0.5;
        car.add(body);
        
        const cabinGeo = new THREE.BoxGeometry(1.8, 0.8, 2.5);
        const cabin = new THREE.Mesh(cabinGeo, bodyMat);
        cabin.position.set(0, 1.2, -0.2);
        car.add(cabin);

        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        const wheelPositions = [{x: -0.9, z: 1.3}, {x: 0.9, z: 1.3}, {x: -0.9, z: -1.3}, {x: 0.9, z: -1.3}];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.3, pos.z);
            car.add(wheel);
        });

        car.name = 'car';
        car.userData = { type: 'car' };
        return car;
    }

    const createMotorbike = () => {
        const bike = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({color: 0x333333, roughness: 0.5, metalness: 0.5});
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.8), frameMat);
        frame.position.y = 0.5;
        bike.add(frame);

        const wheelGeo = new THREE.CylinderGeometry(0.35,0.35,0.1,24);
        const wheelMat = new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.8});
        const wheelF = new THREE.Mesh(wheelGeo, wheelMat);
        wheelF.rotation.z = Math.PI / 2;
        wheelF.position.set(0, 0.35, 0.7);
        bike.add(wheelF);
        const wheelB = wheelF.clone();
        wheelB.position.z = -0.7;
        bike.add(wheelB);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), frameMat);
        handle.position.set(0, 0.8, 0.6);
        bike.add(handle);

        bike.name = 'motorbike';
        bike.userData = { type: 'bike' };
        return bike;
    }
    
    const createBicycle = () => {
        const bicycle = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({color: 0xcccccc, roughness: 0.4, metalness: 0.6});
        
        const bar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2), frameMat);
        bar1.rotation.x = Math.PI / 4;
        bar1.position.set(0, 0.6, -0.2);
        bicycle.add(bar1);

        const bar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8), frameMat);
        bar2.rotation.z = Math.PI / 1.5;
        bar2.position.set(0, 0.8, 0.3);
        bicycle.add(bar2);

        const wheelGeo = new THREE.TorusGeometry(0.35, 0.02, 8, 32);
        const wheelMat = new THREE.MeshStandardMaterial({color: 0x333333, roughness: 0.8});
        const wheelF = new THREE.Mesh(wheelGeo, wheelMat);
        wheelF.position.set(0, 0.35, 0.7);
        bicycle.add(wheelF);
        const wheelB = wheelF.clone();
        wheelB.position.z = -0.7;
        bicycle.add(wheelB);

        bicycle.name = 'bicycle';
        bicycle.userData = { type: 'bicycle' };
        return bicycle;
    }

    const createTruck = () => {
        const truck = new THREE.Group();
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0000dd, roughness: 0.4 });
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.2, 2.8), cabinMat);
        cabin.position.set(0, 1.1, 2.6);
        truck.add(cabin);

        const cargoMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.7 });
        const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 6), cargoMat);
        cargo.position.set(0, 1.25, -1.5);
        truck.add(cargo);

        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        const wheelPositions = [{x: -1.25, z: 3.5}, {x: 1.25, z: 3.5}, {x: -1.25, z: -2.5}, {x: 1.25, z: -2.5}];
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.4, pos.z);
            truck.add(wheel);
        });

        truck.name = 'truck';
        truck.userData = { type: 'truck' };
        return truck;
    }

    const createCow = () => {
        const cow = new THREE.Group();
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Tan color
        const spotMat = new THREE.MeshLambertMaterial({ color: 0x4F4F4F }); // Dark grey spots
        
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 2), bodyMat);
        body.position.y = 0.7;
        cow.add(body);
        
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), bodyMat);
        head.position.set(0, 1, 1.2);
        cow.add(head);

        const legGeo = new THREE.CylinderGeometry(0.15, 0.1, 0.7, 8);
        const legPositions = [{x: -0.5, z: 0.8}, {x: 0.5, z: 0.8}, {x: -0.5, z: -0.8}, {x: 0.5, z: -0.8}];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, bodyMat);
            leg.position.set(pos.x, 0.35, pos.z);
            cow.add(leg);
        });
        
        // Spots
        for(let i=0; i<5; i++){
            const spot = new THREE.Mesh(new THREE.SphereGeometry(Math.random()*0.3+0.1, 8, 8), spotMat);
            spot.position.set((Math.random()-0.5)*1.2, (Math.random()-0.5)*1+0.7, (Math.random()-0.5)*2);
            cow.add(spot);
        }

        cow.name = 'cow';
        cow.userData = { type: 'cow' };
        return cow;
    }
    
    // Create instances
    const vehicleTypes = [createCar, createMotorbike, createTruck, createBicycle];
    for (let i = 0; i < 20; i++) {
        const typeIndex = Math.floor(Math.random() * vehicleTypes.length);
        const vehicle = vehicleTypes[typeIndex]();
        const onLeftSide = Math.random() > 0.5;
        
        vehicle.position.set(
            onLeftSide ? -6 : 6, 
            0, 
            -Math.random() * 500
        );
        vehicle.userData.speed = 10 + Math.random() * 20;
        vehicle.userData.direction = onLeftSide ? 1 : -1; // -1 for returning, 1 for outgoing
        if(!onLeftSide) vehicle.rotation.y = Math.PI;

        obstacles.push(vehicle);
    }

    for (let i = 0; i < 5; i++) {
      const cow = createCow();
      cow.position.set((Math.random()-0.5)*30, 0, -100 - i * 150 * Math.random());
      if(cow.position.x > -15 && cow.position.x < 15) continue;
      obstacles.push(cow);
    }
  
    return obstacles as (THREE.Mesh | THREE.Group)[];
}

// Create the school compound
export function createSchool(): THREE.Group {
    const school = new THREE.Group();
    school.position.x = 20;
    school.position.z = 200;

    // Compound Wall
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xD2B48C }); // Tan
    const wallGeoSide = new THREE.BoxGeometry(0.2, 4, 60); // Longer walls
    const rightWall = new THREE.Mesh(wallGeoSide, wallMat);
    rightWall.position.set(25, 2, -30);
    school.add(rightWall);
    
    const leftWall = new THREE.Mesh(wallGeoSide, wallMat);
    leftWall.position.set(-25, 2, -30);
    school.add(leftWall);

    const wallGeoBack = new THREE.BoxGeometry(50, 4, 0.2);
    const backWall = new THREE.Mesh(wallGeoBack, wallMat);
    backWall.position.set(0, 2, -60);
    school.add(backWall);

    // School Building (U-shape for more realism)
    const buildingMat = new THREE.MeshStandardMaterial({color: 0xF5DEB3, roughness: 0.8});
    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(30, 12, 10), buildingMat);
    mainBuilding.position.set(0, 6, -50);
    school.add(mainBuilding);

    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 30), buildingMat);
    leftWing.position.set(-15, 6, -35);
    school.add(leftWing);
    
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 30), buildingMat);
    rightWing.position.set(15, 6, -35);
    school.add(rightWing);

    // Windows
    const windowMat = new THREE.MeshLambertMaterial({color: 0x444444});
    const windowGeo = new THREE.BoxGeometry(1.5, 2, 0.2);
    for(let j=0; j<2; j++) { // 2 floors
        for(let i=0; i<6; i++){ // 6 windows on main building
            const window = new THREE.Mesh(windowGeo, windowMat);
            window.position.set(-12.5 + i * 5, 4 + j * 5, -44.9);
            school.add(window);
        }
        for(let i=0; i<5; i++){ // 5 windows on each wing
            const windowL = new THREE.Mesh(windowGeo, windowMat);
            windowL.rotation.y = Math.PI / 2;
            windowL.position.set(-20.1, 4 + j * 5, -45 + i * 5);
            school.add(windowL);
            const windowR = new THREE.Mesh(windowGeo, windowMat);
            windowR.rotation.y = -Math.PI / 2;
            windowR.position.set(20.1, 4 + j * 5, -45 + i * 5);
            school.add(windowR);
        }
    }


    // Gate
    const gate = new THREE.Group();
    const postMat = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
    const postGeo = new THREE.BoxGeometry(1, 5, 1);
    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(-7, 2.5, 0);
    gate.add(post1);
    
    const post2 = post1.clone();
    post2.position.x = 7;
    gate.add(post2);

    const gateBarMat = new THREE.MeshLambertMaterial({color: 0x555555});
    const gateBarGeo = new THREE.BoxGeometry(6.5, 0.2, 0.2);
    for(let i=0; i < 10; i++){
        const barL = new THREE.Mesh(gateBarGeo, gateBarMat);
        barL.position.set(-3.25, 0.6 + i*0.4, 0);
        gate.add(barL);
        const barR = barL.clone();
        barR.position.x = 3.25;
        gate.add(barR);
    }
    gate.position.z = 0.5;


    // Gate Sign
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#003366';
        context.fillRect(0,0,1024,256);
        context.fillStyle = 'white';
        context.font = 'bold 64px "PT Sans"';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Shree Ambika Secondary School', 512, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const signMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3), signMaterial);
    sign.position.set(0, 5.5, 0);
    gate.add(sign);

    school.add(gate);
    return school;
}

export function createZebraCross(z: number): THREE.Group {
    const zebraCross = new THREE.Group();
    const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeGeometry = new THREE.BoxGeometry(1.5, 0.02, 10);
    for (let i = 0; i < 7; i++) {
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.rotation.y = Math.PI / 2;
        stripe.position.x = -3 + i * 2.5;
        zebraCross.add(stripe);
    }
    zebraCross.position.z = z;
    zebraCross.position.x = 0;
    return zebraCross;
}

export function createFlowers(): THREE.Group {
    const flowers = new THREE.Group();
    const flowerColors = [0xff0000, 0xffff00, 0xff00ff, 0x00ffff];
    const stemMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5);

    for (let i = 0; i < 100; i++) {
        const flowerBed = new THREE.Group();
        const flowerColor = new THREE.MeshBasicMaterial({ color: flowerColors[i % 4] });
        const flowerGeo = new THREE.SphereGeometry(0.15, 8, 8);
        
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.25;
        flowerBed.add(stem);

        const flower = new THREE.Mesh(flowerGeo, flowerColor);
        flower.position.y = 0.5;
        flowerBed.add(flower);

        const onLeftSide = Math.random() > 0.5;
        flowerBed.position.x = onLeftSide ? 13.5 : 26.5;
        flowerBed.position.z = 20 + i * 1.8;
        
        flowers.add(flowerBed);
    }
    return flowers;
}
