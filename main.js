// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f8ff); // Light blue background

// Set initial camera position for mobile or desktop
const isMobile = window.innerWidth < 768;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, isMobile ? 2 : 1.5, isMobile ? 10 : 6);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 10);
pointLight.position.set(5, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

// --- Global Variables ---
let confettiGroup, heartsGroup;

// --- Helper Functions for Object Creation ---
function createConfetti() {
    confettiGroup = new THREE.Group();
    const confettiCount = 500;
    const colors = [0xffd700, 0xff69b4, 0x00ffff, 0xffa500, 0x98fb98, 0x87ceeb]; // Gold, Pink, Cyan, Orange, Light Green, Sky Blue

    for (let i = 0; i < confettiCount; i++) {
        const confettiMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.05, 0.05),
            new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)] })
        );
        confettiMesh.position.set(
            (Math.random() - 0.5) * 8,
            8 + Math.random() * 5,
            (Math.random() - 0.5) * 8
        );
        confettiMesh.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            -0.1 - Math.random() * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        confettiGroup.add(confettiMesh);
    }
    confettiGroup.visible = false;
    scene.add(confettiGroup);
}

function createHearts() {
    heartsGroup = new THREE.Group();
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0.25, 0.25);
    heartShape.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
    heartShape.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
    heartShape.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
    heartShape.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
    heartShape.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
    heartShape.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);

    const heartGeometry = new THREE.ShapeGeometry(heartShape);
    const colors = [0xff0000, 0xff69b4, 0xffc0cb];

    for (let i = 0; i < 20; i++) {
        const heartMesh = new THREE.Mesh(
            heartGeometry,
            new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)] })
        );
        heartMesh.position.set(
            (Math.random() - 0.5) * 2,
            -2 + Math.random() * 4,
            (Math.random() - 0.5) * 2
        );
        heartMesh.scale.set(0.1, 0.1, 0.1);
        heartsGroup.add(heartMesh);
    }
    heartsGroup.visible = false;
    scene.add(heartsGroup);
}

// --- Main Animation Function ---
function animateScene() {
    const startScreen = document.getElementById('start-screen');
    const finalMessageScreen = document.getElementById('final-message');

    // Hide start screen
    gsap.to('#start-screen', { opacity: 0, duration: 0.5, onComplete: () => {
        startScreen.classList.add('hidden');
        document.querySelector('.overlay').style.pointerEvents = 'none';
    }});

    const tl = gsap.timeline();
    
    // Show confetti and hearts
      tl.to(heartsGroup, {
          onStart: () => {
              heartsGroup.visible = true;
              gsap.to(heartsGroup.children, { y: '+=2', opacity: 0, duration: 2, stagger: 0.05, ease: "power1.out" });
          }
      }, "<")
      .to(confettiGroup, {
          onStart: () => {
              confettiGroup.visible = true;
              gsap.to(confettiGroup.children, { y: '-=10', opacity: 0, duration: 5, stagger: 0.01, ease: "power1.in" });
          }
      }, "<")
    
    // Show popup with a slight delay
      .to(finalMessageScreen, { opacity: 1, scale: 1, duration: 1, onStart: () => {
          finalMessageScreen.classList.remove('hidden');
      }}, ">-1");
}

// --- Main Animation Loop (rendering) ---
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);

    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (confettiGroup && confettiGroup.visible) {
        confettiGroup.children.forEach(confetti => {
            confetti.position.add(confetti.velocity.clone().multiplyScalar(delta * 60));
            if (confetti.position.y < -5) {
                confetti.position.y = 8 + Math.random() * 5;
                confetti.position.x = (Math.random() - 0.5) * 8;
                confetti.position.z = (Math.random() - 0.5) * 8;
                confetti.material.opacity = 1;
            }
        });
    }

    renderer.render(scene, camera);
}

// --- Responsiveness ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adjust camera for mobile
    if (window.innerWidth < 768) {
        camera.position.set(0, 2, 10);
    } else {
        camera.position.set(0, 1.5, 6);
    }
});

// --- Initialization ---
createConfetti();
createHearts();
document.getElementById('start-btn').addEventListener('click', animateScene);

document.getElementById('say-thanks-btn').addEventListener('click', () => {
    const message = "Thank you so much for the beautiful birthday surprise! It means a lot to me. 😊";
    const phoneNumber = "+923315484629";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
});

animate(0);