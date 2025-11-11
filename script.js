class SolarSystem3D {
            constructor() {
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.controls = null;
                
                this.animationSpeed = 1;
                this.time = 0;
                this.currentPlanet = null;
                
                this.planetData = {};
                this.planetMeshes = {};
                this.asteroidBelt = null;
                this.kuiperBelt = null;
                this.oortCloud = null;

                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();
                this.intersectPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                
                this.init();
                this.setupEventListeners();
                this.animate();
            }

            init() {
                // Scene setup
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x000011);

                // Camera setup
                this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300000);
                this.camera.position.set(0, 500, 1000);

                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                document.getElementById('container3D').appendChild(this.renderer.domElement);

                // Orbit controls
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.08;
                this.controls.minDistance = 10;
                this.controls.maxDistance = 150000;

                // Lighting
                this.setupLighting();
                
                // Create solar system components
                this.createStars();
                this.createSun();
                this.createPlanets();
                this.createAsteroidBelt();
                this.createKuiperBelt();
                this.createOortCloud();
                this.createOrbitPaths();

                // Handle window resize
                window.addEventListener('resize', () => this.onWindowResize());
            }

            setupLighting() {
                // Ambient light
                const ambientLight = new THREE.AmbientLight(0x333333);
                this.scene.add(ambientLight);

                // Sun light (point light at center)
                this.sunLight = new THREE.PointLight(0xffffff, 2, 100000);
                this.scene.add(this.sunLight);

                // Directional light from sun
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLight.position.set(50, 50, 50);
                this.scene.add(directionalLight);
            }

            createStars() {
                const starGeometry = new THREE.BufferGeometry();
                const starMaterial = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 2,
                    sizeAttenuation: true
                });

                const starVertices = [];
                for (let i = 0; i < 4000; i++) {
                    const x = (Math.random() - 0.5) * 100000;
                    const y = (Math.random() - 0.5) * 100000;
                    const z = (Math.random() - 0.5) * 100000;
                    starVertices.push(x, y, z);
                }

                starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
                const stars = new THREE.Points(starGeometry, starMaterial);
                this.scene.add(stars);
            }

            createSun() {
                const sunGeometry = new THREE.SphereGeometry(120, 32, 32);
                const sunMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffff00,
                    emissive: 0xffff00,
                    emissiveIntensity: 0.9
                });
                
                this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
                this.scene.add(this.sun);

                // Sun glow effect
                const glowGeometry = new THREE.SphereGeometry(180, 32, 32);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff6600,
                    transparent: true,
                    opacity: 0.18
                });
                const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
                this.scene.add(sunGlow);
            }

            createPlanets() {
                // Consolidated planet dataset (AU values included where relevant)
                this.planetData = {
                    solarSystem: { 
                        name: "Solar System", 
                        description: "A view of the entire solar system.", 
                        funFact: "The solar system is over 4.5 billion years old!" 
                    },
                    sun: { 
                        name: "Sun", 
                        radius: 120, 
                        color: 0xffff00, 
                        funFact: "The Sun contains 99.86% of the solar system mass.", 
                        description: "Our magnificent star at the center of the solar system, providing light and energy to all planets.", 
                        detailsUrl: "sun/index.html", 
                        au: 0 
                    },
                    mercury: { 
                        name: "Mercury", 
                        radius: 9, 
                        orbitRadius: 234, 
                        orbitPeriod: 88, 
                        color: 0x8c7853, 
                        tilt: 0.034, 
                        rotationPeriod: 58.6, 
                        funFact: "Mercury has no atmosphere and temperatures swing from 800°F to -290°F!", 
                        description: "The closest planet to the Sun and the fastest in our solar system!", 
                        detailsUrl: "mercury/index.html", 
                        moons: 0, 
                        au: 0.39 
                    },
                    venus: { 
                        name: "Venus", 
                        radius: 21, 
                        orbitRadius: 432, 
                        orbitPeriod: 225, 
                        color: 0xffc649, 
                        tilt: 177.4, 
                        rotationPeriod: -243, 
                        funFact: "Venus spins backwards! A day on Venus is longer than its year!", 
                        description: "The hottest planet with a thick toxic atmosphere and volcanic landscape.", 
                        detailsUrl: "venus/index.html", 
                        moons: 0, 
                        au: 0.72 
                    },
                    earth: { 
                        name: "Earth", 
                        radius: 22.5, 
                        orbitRadius: 600, 
                        orbitPeriod: 365, 
                        color: 0x4facfe, 
                        tilt: 23.44, 
                        rotationPeriod: 1, 
                        funFact: "Earth is the only planet known to have liquid water and support life!", 
                        description: "Our beautiful home planet with perfect conditions for life as we know it.", 
                        detailsUrl: "earth/index.html", 
                        moons: 1, 
                        au: 1.00 
                    },
                    mars: { 
                        name: "Mars", 
                        radius: 12, 
                        orbitRadius: 912, 
                        orbitPeriod: 687, 
                        color: 0xff6b6b, 
                        tilt: 25.19, 
                        rotationPeriod: 1.03, 
                        funFact: "Mars has the largest volcano in the solar system - Olympus Mons!", 
                        description: "The Red Planet where scientists search for signs of ancient life.", 
                        detailsUrl: "mars/index.html", 
                        moons: 2, 
                        au: 1.52 
                    },
                    jupiter: { 
                        name: "Jupiter", 
                        radius: 72, 
                        orbitRadius: 3120, 
                        orbitPeriod: 4333, 
                        color: 0xd2691e, 
                        tilt: 3.13, 
                        rotationPeriod: 0.41, 
                        funFact: "Jupiter is so big that all other planets could fit inside it!", 
                        description: "The giant gas planet with a famous Great Red Spot storm.", 
                        detailsUrl: "jupiter/index.html", 
                        moons: 95, 
                        au: 5.20 
                    },
                    saturn: { 
                        name: "Saturn", 
                        radius: 63, 
                        orbitRadius: 5724, 
                        orbitPeriod: 10759, 
                        color: 0xfad0c4, 
                        tilt: 26.73, 
                        rotationPeriod: 0.45, 
                        funFact: "Saturn would float in water - it's less dense than water!", 
                        description: "The beautiful ringed planet with spectacular icy rings.", 
                        detailsUrl: "saturn/index.html", 
                        rings: true, 
                        moons: 146, 
                        au: 9.54 
                    },
                    uranus: { 
                        name: "Uranus", 
                        radius: 75, 
                        orbitRadius: 11520, 
                        orbitPeriod: 30687, 
                        color: 0x4dd0e1, 
                        tilt: 97.77, 
                        rotationPeriod: -0.72, 
                        funFact: "Uranus rotates on its side like a rolling ball!", 
                        description: "The tilted ice giant with faint rings and methane atmosphere.", 
                        detailsUrl: "uranus/index.html", 
                        moons: 27, 
                        au: 19.20 
                    },
                    neptune: { 
                        name: "Neptune", 
                        radius: 72, 
                        orbitRadius: 18036, 
                        orbitPeriod: 60190, 
                        color: 0x1e3c72, 
                        tilt: 28.32, 
                        rotationPeriod: 0.67, 
                        funFact: "Neptune has the strongest winds in the solar system - up to 1,200 mph!", 
                        description: "The deep blue windy planet at the edge of our solar system.", 
                        detailsUrl: "neptune/index.html", 
                        moons: 14, 
                        au: 30.06 
                    },
                    asteroidBelt: { 
                        name: "Asteroid Belt", 
                        radius: 1620, 
                        color: 0x888888, 
                        funFact: "The asteroid belt contains millions of asteroids, but they're very far apart!", 
                        description: "A region between Mars and Jupiter filled with rocky debris from the solar system's formation.", 
                        detailsUrl: "asteroid-belt/index.html" 
                    },
                    kuiperBelt: { 
                        name: "Kuiper Belt", 
                        radius: 24000, 
                        color: 0x4466aa, 
                        funFact: "Pluto is the largest known object in the Kuiper Belt!", 
                        description: "A vast region beyond Neptune containing icy bodies and dwarf planets.", 
                        detailsUrl: "kuiper-belt/index.html" 
                    },
                    oortCloud: { 
                        name: "Oort Cloud", 
                        radius: 150000, 
                        color: 0x6644aa, 
                        funFact: "The Oort Cloud may contain trillions of icy objects!", 
                        description: "A spherical shell of icy bodies surrounding our solar system nearly a light-year away.", 
                        detailsUrl: "oort-cloud/index.html" 
                    }
                };

                // Create planets
                Object.entries(this.planetData).forEach(([key, planet]) => {
                    if (!planet.orbitRadius || key === 'sun' || key === 'asteroidBelt' || key === 'kuiperBelt' || key === 'oortCloud') return;
                    
                    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
                    const material = new THREE.MeshPhongMaterial({
                        color: planet.color,
                        shininess: 20,
                        specular: 0x222222
                    });
                    
                    const planetMesh = new THREE.Mesh(geometry, material);
                    
                    // Set axial tilt
                    planetMesh.rotation.z = planet.tilt * Math.PI / 180;
                    
                    this.planetMeshes[key] = planetMesh;
                    this.scene.add(planetMesh);

                    // Create Saturn's rings
                    if (planet.rings) {
                        const ringGeometry = new THREE.RingGeometry(planet.radius + 10, planet.radius + 85, 640);
                        const ringMaterial = new THREE.MeshBasicMaterial({
                            color: 0xfad0c4,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.7
                        });
                        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                        rings.rotation.x = Math.PI / 2;
                        
                        const ringGroup = new THREE.Group();
                        ringGroup.add(rings);
                        ringGroup.rotation.z = planet.tilt * Math.PI / 180;
                        
                        planetMesh.add(ringGroup);
                    }
                });
            }

            createAsteroidBelt() {
                const asteroidCount = 1600;
                const innerRadius = 1200;
                const outerRadius = 2400;
                
                const asteroidGeometry = new THREE.BufferGeometry();
                const asteroidMaterial = new THREE.PointsMaterial({
                    color: 0x888888,
                    size: 1,
                    sizeAttenuation: true
                });

                const positions = [];
                for (let i = 0; i < asteroidCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
                    const height = (Math.random() - 0.5) * 30;
                    
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    const y = height;
                    
                    positions.push(x, y, z);
                }

                asteroidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
                this.scene.add(this.asteroidBelt);
            }

            createKuiperBelt() {
                const kuiperCount = 2000;
                const innerRadius = 18300;
                const outerRadius = 30000;
                
                const kuiperGeometry = new THREE.BufferGeometry();
                const kuiperMaterial = new THREE.PointsMaterial({
                    color: 0x4466aa,
                    size: 1.2,
                    sizeAttenuation: true
                });

                const positions = [];
                for (let i = 0; i < kuiperCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
                    const height = (Math.random() - 0.5) * 60;
                    
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    const y = height;
                    
                    positions.push(x, y, z);
                }

                kuiperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                this.kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
                this.scene.add(this.kuiperBelt);
            }

            createOortCloud() {
                const oortCount = 3000;
                const innerRadius = 120000;
                const outerRadius = 180000;
                
                const oortGeometry = new THREE.BufferGeometry();
                const oortMaterial = new THREE.PointsMaterial({
                    color: 0x6644aa,
                    size: 1,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 0.5
                });

                const positions = [];
                for (let i = 0; i < oortCount; i++) {
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
                    
                    const x = radius * Math.sin(phi) * Math.cos(theta);
                    const y = radius * Math.sin(phi) * Math.sin(theta);
                    const z = radius * Math.cos(phi);
                    
                    positions.push(x, y, z);
                }

                oortGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                this.oortCloud = new THREE.Points(oortGeometry, oortMaterial);
                this.scene.add(this.oortCloud);
            }

            createOrbitPaths() {
                Object.entries(this.planetData).forEach(([key, planet]) => {
                    if (planet.orbitRadius) {
                        const orbitGeometry = new THREE.RingGeometry(planet.orbitRadius - 0.6, planet.orbitRadius + 0.6, 128);
                        const orbitMaterial = new THREE.MeshBasicMaterial({
                            color: 0xffffff,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.08
                        });
                        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                        orbit.rotation.x = Math.PI / 2;
                        this.scene.add(orbit);
                    }
                });
            }

            setupEventListeners() {
                // Time scale buttons
                document.querySelectorAll('.time-scale-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const speed = parseFloat(e.currentTarget.dataset.speed);
                        this.animationSpeed = speed;

                        // Update active button
                        document.querySelectorAll('.time-scale-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                    });
                });

                // Planet buttons
                document.querySelectorAll('.planet-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const planet = e.currentTarget.dataset.planet;
                        this.onPlanetSelected(planet);
                        
                        // Update active button
                        document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                    });
                });

                // View details button
                document.getElementById('viewDetailsBtn').addEventListener('click', () => {
                    if (this.currentPlanet) {
                        const planet = this.planetData[this.currentPlanet];
                        if (planet.detailsUrl) {
                            window.open(planet.detailsUrl, '_blank');
                        }
                    }
                });

                // View moons button
                document.getElementById('viewMoonsBtn').addEventListener('click', () => {
                    if (!this.currentPlanet) return;
                    const p = this.planetData[this.currentPlanet];
                    if (p && Array.isArray(p.moons)) {
                        const text = p.moons.map(m => `${m.name}: ${m.fact || ''} (${m.distance || ''})`).join('\n');
                        alert(`Moons of ${p.name}:\n\n${text}`);
                    } else {
                        alert(`${p.name} has no detailed moon list.`);
                    }
                });

                // Close fact popup
                document.getElementById('closeFact').addEventListener('click', () => {
                    document.getElementById('factPopup').classList.remove('show');
                });

                // Mouse move for distance calculation
                document.addEventListener('mousemove', (event) => {
                    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                });
            }

            onPlanetSelected(planetKey) {
                // Normalize missing keys
                if (!this.planetData[planetKey]) return;
                this.currentPlanet = planetKey;
                const p = this.planetData[planetKey];

                // Info & fact
                this.updateInfoPanel(p);
                if (p.funFact) this.showFactPopup(p.funFact);

                // Animate camera
                this.animateToPlanet(planetKey);
            }

            updateInfoPanel(planet) {
                document.getElementById('planetName').textContent = planet.name || '—';
                let html = `<p>${planet.description || ''}</p>`;

                if (planet.orbitRadius) {
                    html += `<p><strong>Orbit radius (units):</strong> ${planet.orbitRadius}</p>`;
                    if (planet.orbitPeriod) html += `<p><strong>Orbital period:</strong> ${Math.round(planet.orbitPeriod)} days</p>`;
                    if (planet.rotationPeriod) html += `<p><strong>Rotation:</strong> ${Math.abs(planet.rotationPeriod)} days</p>`;
                }

                if (planet.moons !== undefined) {
                    if (Array.isArray(planet.moons)) {
                        html += `<p><strong>Moons:</strong> ${planet.moons.length}</p>`;
                    } else {
                        html += `<p><strong>Moons:</strong> ${planet.moons}</p>`;
                    }
                }

                if (typeof planet.au === 'number') {
                    html += `<p><strong>Mean distance:</strong> ${planet.au.toFixed(2)} AU</p>`;
                    document.getElementById('distance-display').textContent = `${planet.au.toFixed(2)} AU`;
                    document.getElementById('distance-display-aux').textContent = `${planet.au.toFixed(2)} AU`;
                }

                document.getElementById('planetDetails').innerHTML = html;
                document.getElementById('infoPanel').classList.add('show');
            }

            showFactPopup(text) {
                const popup = document.getElementById('factPopup');
                const factText = document.getElementById('factText');
                factText.textContent = text || '';
                popup.classList.add('show');
                // auto-hide after 5s
                clearTimeout(this._factTimeout);
                this._factTimeout = setTimeout(() => popup.classList.remove('show'), 5000);
            }

            animateToPlanet(planetKey) {
                const p = this.planetData[planetKey];
                let targetPosition = new THREE.Vector3();
                let lookAtPosition = new THREE.Vector3();
                // sensible defaults
                if (planetKey === 'solarSystem') {
                    targetPosition.set(0, 15000, 30000);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'sun') {
                    targetPosition.set(0, 150, 450);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'asteroidBelt') {
                    targetPosition.set(0, 300, 1500);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'kuiperBelt') {
                    targetPosition.set(0, 600, 6000);
                    lookAtPosition.set(0, 0, 0);
                } else if (planetKey === 'oortCloud') {
                    targetPosition.set(0, 1500, 210000);
                    lookAtPosition.set(0, 0, 0);
                } else {
                    // compute planet's current position in orbit
                    const angle = (this.time / (p.orbitPeriod || 1)) * 2 * Math.PI;
                    const planetPos = new THREE.Vector3(
                        Math.cos(angle) * (p.orbitRadius || 600),
                        0,
                        Math.sin(angle) * (p.orbitRadius || 600)
                    );
                    lookAtPosition.copy(planetPos);
                    // camera offset slightly above and back relative to planet
                    targetPosition.copy(planetPos).add(new THREE.Vector3(0, Math.max(120, p.radius * 3), Math.max(240, p.radius * 8)));
                }

                // Duration and easing
                const duration = 1200;
                const startTime = performance.now();
                const startPos = this.camera.position.clone();
                const startTarget = this.controls.target.clone();

                const animate = (t) => {
                    const elapsed = t - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);

                    this.camera.position.lerpVectors(startPos, targetPosition, ease);
                    this.controls.target.lerpVectors(startTarget, lookAtPosition, ease);
                    this.controls.update();

                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }

            animate() {
                requestAnimationFrame(() => this.animate());

                if (this.animationSpeed !== 0) {
                    this.time += 0.016 * this.animationSpeed;

                    // Update planet positions and rotations
                    Object.entries(this.planetData).forEach(([key, planet]) => {
                        if (planet.orbitRadius && this.planetMeshes[key]) {
                            const mesh = this.planetMeshes[key];
                            const angle = (this.time / (planet.orbitPeriod || 1)) * 2 * Math.PI;
                            mesh.position.x = Math.cos(angle) * planet.orbitRadius;
                            mesh.position.z = Math.sin(angle) * planet.orbitRadius;
                            const rotationSpeed = (2 * Math.PI) / (planet.rotationPeriod || 1);
                            mesh.rotation.y += rotationSpeed * 0.016 * this.animationSpeed;

                            if (planet.rings) {
                                const ringGroup = mesh.children.find(child => child.type === 'Group');
                                if (ringGroup) {
                                    ringGroup.rotation.y += rotationSpeed * 0.016 * this.animationSpeed;
                                }
                            }
                        }
                    });

                    // Rotate belts for visual effect
                    if (this.asteroidBelt) {
                        this.asteroidBelt.rotation.y += 0.0009 * this.animationSpeed;
                    }
                    if (this.kuiperBelt) {
                        this.kuiperBelt.rotation.y += 0.0004 * this.animationSpeed;
                    }
                }

                // Distance under cursor (aux)
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersection = new THREE.Vector3();
                this.raycaster.ray.intersectPlane(this.intersectPlane, intersection);
                const distance = intersection.length();
                const auDistance = distance / 600; // 1 AU = 600 units (consistent with data)
                const aux = document.getElementById('distance-display-aux');
                if (aux) aux.textContent = `${auDistance.toFixed(2)} AU`;

                this.controls.update();
                this.renderer.render(this.scene, this.camera);
            }

            onWindowResize() {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        }

        // Initialize the solar system when the page loads
        window.addEventListener('load', () => {
            new SolarSystem3D();
        });
