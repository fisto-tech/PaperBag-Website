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

  //Load image
  let loader = new THREE.TextureLoader();

  loader.load("images/bag model.png", function (texture) {
    const aspect = texture.image.width / texture.image.height;
    const geometry = new THREE.PlaneGeometry(60 * aspect, 60);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    object = new THREE.Mesh(geometry, material);
    scene.add(object);

    // SCALE THE NEW MODEL
    const initialScale = window.innerWidth < 768 ? 0.65 : 1;
    object.scale.set(initialScale, initialScale, initialScale);

    animate();

    //POSITIONG
    object.position.x = window.innerWidth < 768 ? 0 : 40; // Center perfectly on mobile (or adjust if needed)
    object.position.y = window.innerWidth < 768 ? -5 : -2; // Adjust vertical centering on mobile

    function removePreLoader() {
      const preloader = document.querySelector(".preloader");
      if (preloader) {
        preloader.classList.add("hidden");
        // Optional: wait for transition to end before display none, but visibility hidden handles it
      }
    }
    setTimeout(removePreLoader, 2000);

    // SCROLLING ANIMATION

    gsap.registerPlugin(ScrollTrigger);

    // Section 1 to Section 2 (Center and Face Front)
    gsap.to(object.position, {
      x: 0,
      y: 0, // Center it vertically as well!
      ease: "power1.inOut",
      scrollTrigger: {
        start: "top top",
        end: vh(100),
        scrub: 1,
      },
    });

    // Section 3 (Scale down to fit circle as it enters)
    gsap.to(object.scale, {
      x: 0.55,
      y: 0.55,
      z: 0.55,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: ".ellipse-bg-container",
        start: "top bottom",
        end: "center center",
        scrub: 1,
      },
    });

    // Move up with Section 3 to stay fixed on the circle
    gsap.to(object.position, {
      y: () => {
        const sec3 = document.querySelector('#section3');
        const circle = document.querySelector('.ellipse-bg-container') || sec3;
        const sec3Rect = sec3.getBoundingClientRect();
        const circleRect = circle.getBoundingClientRect();
        const circleCenter = (circleRect.top - sec3Rect.top) + (circleRect.height / 2);
        const sec3Bottom = sec3Rect.height;
        const dist = sec3Bottom - circleCenter + (window.innerHeight / 2);
        return 0 + (dist * (94.6 / window.innerHeight)); 
      },
      ease: "none",
      scrollTrigger: {
        trigger: ".ellipse-bg-container",
        start: "center center",
        endTrigger: "#section3",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    // Section 3 to Section 4 (Fade out image)
    gsap.to(object.material, {
      opacity: 0,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#section3",
        start: "bottom center",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Section 8 Text Animations
    gsap.from("#carry-text", {
      y: -300,
      opacity: 0,
      ease: "power1.out",
      scrollTrigger: {
        trigger: "#carry-text",
        start: "top bottom",
        end: "top center",
        scrub: 1,
      },
    });

    gsap.from("#leave-text", {
      y: -300,
      opacity: 0,
      ease: "power1.out",
      scrollTrigger: {
        trigger: "#leave-text",
        start: "top bottom",
        end: "top center",
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
    // Only force initial position if at the very top of the page
    if (window.scrollY < 10) {
      object.position.x = window.innerWidth < 768 ? 0 : 40;
      object.position.y = window.innerWidth < 768 ? -5 : -2;
      const initialScale = window.innerWidth < 768 ? 0.65 : 1;
      object.scale.set(initialScale, initialScale, initialScale);
    }
  }
  //VH
  vh = (unit) => window.innerHeight * (unit / 100);
}
window.addEventListener("resize", onWindowResize);

// CAROUSEL CARDS ANIMATION ===============================================

function initCarousel() {
  // A. Initial State Setup
  document.querySelectorAll(".card").forEach((card) => {
    const rot = parseFloat(card.dataset.rot) || 0;
    card.dataset.restRot = rot;

    // Store original computed Y so we preserve the tailwind translate-y staggers
    const computedY = gsap.getProperty(card, "y");
    card.dataset.restY = computedY;

    // Set them to fall from the top
    gsap.set(card, { opacity: 0, y: -800, rotation: rot + 15 });
  });

  ScrollTrigger.create({
    trigger: ".cards-section",
    start: "top 80%",
    onEnter: () => {
      gsap.to(".card", {
        opacity: 1,
        y: (i, target) => parseFloat(target.dataset.restY) || 0,
        rotation: (i, target) => parseFloat(target.dataset.restRot) || 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "back.out(1.2)",
        onComplete: startFloating
      });
    },
    once: true
  });

  // B. Continuous Float Animation
  function startFloating() {
    document.querySelectorAll(".card").forEach((card, i) => {
      const rot = parseFloat(card.dataset.restRot) || 0;
      gsap.to(card, {
        y: `+=${8 + (i % 3) * 5}`,
        rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
        duration: 3 + (i % 4) * 0.5,
        delay: i * 0.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    });
  }

  // C. Mouse Parallax
  const cardsSection = document.querySelector(".cards-section");
  if (cardsSection) {
    let mx = 0, my = 0, tx = 0, ty = 0;
    cardsSection.addEventListener("mousemove", (e) => {
      const r = cardsSection.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    function parallax() {
      tx += (mx - tx) * 0.05;
      ty += (my - ty) * 0.05;
      document.querySelectorAll(".card").forEach((card) => {
        const d = parseFloat(card.dataset.depth) || 8;
        card.style.translate = `${tx * d}px ${ty * d * 0.5}px`;
      });
      requestAnimationFrame(parallax);
    }
    parallax();
  }

  // D. 3D Hover Lift
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateX: -py * 16,
        rotateY: px * 16,
        scale: 1.25,
        zIndex: 50,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 700,
        overwrite: "auto"
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        zIndex: card.style.zIndex || "",
        duration: 0.8,
        ease: "elastic.out(1, 0.6)",
        overwrite: "auto"
      });
    });
  });

  // E. Scroll-Triggered Fan Out
  ScrollTrigger.create({
    trigger: ".cards-section",
    start: "center center",
    end: "bottom top",
    scrub: 0.8,
    onUpdate: (self) => {
      const p = self.progress;
      const moves = [
        { x: -260, y: -40, rot: -25 }, // 1
        { x: -200, y: 20, rot: -18 }, // 2
        { x: -120, y: 80, rot: -10 }, // 3
        { x: -40, y: 120, rot: -4 }, // 4
        { x: 40, y: 120, rot: 4 }, // 5
        { x: 120, y: 80, rot: 12 }, // 6
        { x: 200, y: 20, rot: 22 }, // 7
        { x: 260, y: -40, rot: 28 } // 8
      ];
      document.querySelectorAll(".card").forEach((card, i) => {
        const m = moves[i];
        if (!m) return;
        const rest = parseFloat(card.dataset.restRot) || 0;
        gsap.set(card, {
          x: m.x * p,
          // Tailwind translation y overrides GSAP y sometimes if we aren't careful, but GSAP uses transform matrix which incorporates both usually.
          y: m.y * p,
          rotation: rest + m.rot * p
        });
      });
    }
  });
}

// Initialize carousel once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  initVideoSequence();
});

// IMAGE SEQUENCE ANIMATION (Section 5) ===================================
function initVideoSequence() {
  const canvas = document.getElementById("video-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
  });

  // User should specify the number of frames and filename pattern here.
  const frameCount = 300; // Update with the actual number of frames
  const currentFrame = (index) =>
    `images/Video-Frame/${(index + 1).toString().padStart(5, "0")}.webp`; // Adjust extension (e.g. .jpg or .png) and format

  const images = [];
  const seq = { frame: 0 };

  // Preload frames
  let loadedFrames = 0;
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload = () => {
      loadedFrames++;
      if (i === 0) render(); // initial draw
    };
    img.src = currentFrame(i);
    images.push(img);
  }

  gsap.to(seq, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: "#section5",
      start: "top top",
      end: "+=200%", // Depends on section height (we set 300vh, so +200% works perfectly to finish when reaching bottom of section5)
      scrub: 0.5, // Smooth scrubbing
    },
    onUpdate: render, // Render the frame every update
  });

  // Call render immediately to show fallback if images aren't there yet
  render();

  function render() {
    // Check if the current frame is actually loaded
    if (images[seq.frame] && images[seq.frame].complete && images[seq.frame].naturalWidth > 0) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scaling to cover the canvas (object-cover equivalent)
      const img = images[seq.frame];
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      let renderWidth = canvas.width;
      let renderHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (canvasRatio > imgRatio) {
        renderHeight = canvas.width / imgRatio;
        y = (canvas.height - renderHeight) / 2;
      } else {
        renderWidth = canvas.height * imgRatio;
        x = (canvas.width - renderWidth) / 2;
      }

      // Draw image to canvas
      context.drawImage(img, x, y, renderWidth, renderHeight);

      // Chroma key to remove black background
      // This makes the black background transparent so the DOM background shows through,
      // without making the bag itself transparent.
      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        // Process pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If the pixel is close to black, make it transparent
          if (r < 25 && g < 25 && b < 25) {
            data[i + 3] = 0; // Set alpha to 0
          }
        }
        context.putImageData(imageData, 0, 0);
      } catch (e) {
        // Handle potential CORS errors if running locally without a server
        console.warn("Canvas ImageData cannot be read due to CORS", e);
      }
    }
  }
}

