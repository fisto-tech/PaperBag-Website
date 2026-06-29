//3D ======================================================================

let container;
let camera;
let renderer;
let scene;
let object;
let rightsidePosition = (window.innerWidth * 5) / 100;
let vh = (unit) => window.innerHeight * (unit / 100);

function init() {
  container = document.querySelector(".scene");

  //Create scene
  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 500;

  //Camera setup
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 150);

  //Light
  const ambient = new THREE.AmbientLight(0x404040, 3);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(0, 0, 10);
  scene.add(light);

  //Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);

  renderer.setPixelRatio(window.devicePixelRatio);

  container.appendChild(renderer.domElement);

  //Load model
  let loader = new THREE.GLTFLoader();

  loader.load("images/Paper bag-2.glb", function (gltf) {
    scene.add(gltf.scene);

    object = gltf.scene.children[0];
    
    // SCALE THE NEW MODEL
    object.scale.set(65, 65, 65);
    
    animate();

    //POSITIONG
    object.position.x = rightsidePosition - 15; // Moved slightly to the left
    object.position.y = -25; // Moved down
    object.rotation.y = -0.785; // Rotate 45 degrees

    function removePreLoader() {
      const preloader = document.querySelector(".preloader");
      if (preloader) {
        preloader.style.display = "none";
      }
    }
    object.onLoad = removePreLoader();

    // SCROLLING ANIMATION

    gsap.registerPlugin(ScrollTrigger);

    let tl = gsap.timeline();

    tl.to(object.position, {
        x: 1,
        ease: "power1.inOut",
        scrollTrigger: {
          start: "top top",
          end: vh(100),
          scrub: 1,
        },
      })
      .to(object.rotation, {
        y: -3,
        ease: "power1.inOut",
        scrollTrigger: {
          start: vh(101),
          end: vh(200),
          scrub: 1,
        },
      })
      .fromTo(object.rotation, { y: -3 }, {
        y: -20,
        ease: "power1.inOut",
        scrollTrigger: {
          start: vh(250),
          end: vh(500),
          scrub: 1,
        },
      });

  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();

//make it responsive
function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);

  // POSITION ON THE RIGHT
  rightsidePosition = window.innerWidth * (4.5 / 100);

  if (object) {
    object.position.x = rightsidePosition - 15;
    object.position.y = -25;
  }
  //VH
  vh = (unit) => window.innerHeight * (unit / 100);
}
window.addEventListener("resize", onWindowResize);
