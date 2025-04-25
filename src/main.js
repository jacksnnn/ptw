import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import SplineLoader from '@splinetool/loader';

// camera
const camera = new THREE.PerspectiveCamera(40.7, window.innerWidth / window.innerHeight, 17, 100000);
camera.position.set(-0.29, 57.78, -81.97);
camera.quaternion.setFromEuler(new THREE.Euler(-3.08, 0, -3.14));

// scene
const scene = new THREE.Scene();
// CSS3D scene for HTML elements
const cssScene = new THREE.Scene();

// screens data
const screens = [
  {
    name: 'LEFT', // Left screen from Spline model
    position: new THREE.Vector3(0, 0, 0), // Will be updated when model loads
    rotation: new THREE.Euler(0, 0, 0),   // Will be updated when model loads
    size: { width: 0, height: 0 },        // Will be updated when model loads
    content: 'screen1',
    cssObject: null,
    htmlElement: null
  },
  {
    name: 'MIDDLE', // Middle screen from Spline model
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    size: { width: 0, height: 0 },
    content: 'screen2',
    cssObject: null,
    htmlElement: null
  },
  {
    name: 'RIGHT', // Right screen from Spline model
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    size: { width: 0, height: 0 },
    content: 'screen3',
    cssObject: null,
    htmlElement: null
  }
];

// raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Create HTML elements for each screen
screens.forEach(screen => {
  // Create wrapper div for the screen content
  const element = document.createElement('div');
  element.id = screen.content;
  element.classList.add('screen-content', 'screen-3d');
  
  // Add content for each screen
  if (screen.content === 'screen1') {
    element.innerHTML = `
      <h2>Navigation Console</h2>
      <p>This is the ship's navigation system. From here you can:</p>
      <ul>
        <li>Set course coordinates</li>
        <li>Monitor stellar anomalies</li>
        <li>Track nearby vessel movements</li>
      </ul>
      <div class="screen-graphic">
        <div class="radar-circle"></div>
      </div>
      <button class="screen-button">View Details</button>
    `;
  } else if (screen.content === 'screen2') {
    element.innerHTML = `
      <h2>Ship Status</h2>
      <p>Main systems status:</p>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">Engines</span>
          <span class="value online">Online</span>
        </div>
        <div class="status-item">
          <span class="label">Life Support</span>
          <span class="value online">Optimal</span>
        </div>
        <div class="status-item">
          <span class="label">Shields</span>
          <span class="value warning">87%</span>
        </div>
        <div class="status-item">
          <span class="label">Power Core</span>
          <span class="value online">93%</span>
        </div>
      </div>
      <button class="screen-button">View Details</button>
    `;
  } else if (screen.content === 'screen3') {
    element.innerHTML = `
      <h2>Communications</h2>
      <p>Incoming transmission from Command:</p>
      <div class="message-container">
        <p class="message">Greetings, Captain. Your next mission coordinates have been uploaded to your navigation system.</p>
        <p class="sender">— Admiral Chen</p>
      </div>
      <button class="screen-button">View Details</button>
    `;
  }
  
  // Store the HTML element reference
  screen.htmlElement = element;
  
  // We'll add this to the DOM but hide it initially
  element.style.visibility = 'hidden';
  document.body.appendChild(element);
});

// spline scene
const loader = new SplineLoader();
loader.load(
  'https://prod.spline.design/ET-jtBCSNLdm8VZI/scene.splinecode',
  (splineScene) => {
    scene.add(splineScene);
    
    // Ensure transformations are up-to-date
    scene.updateMatrixWorld(true);
    
    // Log all object names to help identify screens
    console.log('All objects in scene:');
    const objectNames = [];
    splineScene.traverse(object => {
      if (object.name) {
        objectNames.push(object.name);
        console.log(object.name);
      }
    });
    
    // Find screens in the loaded scene and update their positions
    screens.forEach(screenData => {
      let screenObj = null; // Reset for each screen iteration
      
      // Use traverse to find the object by EXACT name
      splineScene.traverse(object => {
        if (object.name === screenData.name) {
          if (!screenObj) { // Assign only the first exact match
            screenObj = object;
          } else {
            console.warn(`Found multiple objects with exact name: ${screenData.name}. Using the first one.`);
          }
        }
      });
      
      if (screenObj) {
        // We need the matrixWorld for accurate world position/rotation/scale
        screenObj.updateMatrixWorld(true);
        
        // Get world position, quaternion, and scale from the matrixWorld
        const worldPosition = new THREE.Vector3();
        const worldQuaternion = new THREE.Quaternion();
        const worldScale = new THREE.Vector3();
        screenObj.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);

        // Store world position and rotation (as Euler)
        screenData.position.copy(worldPosition);
        // screenData.rotation.setFromQuaternion(worldQuaternion); // Store Euler for later use maybe
        
        // Estimate the screen size based on the object's geometry if available
        // Otherwise, fall back to bounding box (which might be less accurate for planes)
        let size = new THREE.Vector3(1, 1, 1); // Default size
        if (screenObj.geometry && screenObj.geometry.parameters) {
          size.x = screenObj.geometry.parameters.width || 1;
          size.y = screenObj.geometry.parameters.height || 1;
        } else {
            const bbox = new THREE.Box3().setFromObject(screenObj);
            bbox.getSize(size);
        }
        
        // Account for the object's world scale
        size.multiply(worldScale);
        
        // Set screen dimensions
        screenData.size = {
          width: Math.abs(size.x),
          height: Math.abs(size.y)
        };
        
        // Create a CSS3D object for the screen content
        const cssObject = new CSS3DObject(screenData.htmlElement);
        
        // Position and rotate the CSS3D object using the decomposed world matrix values
        cssObject.position.copy(screenData.position);
        // cssObject.rotation.copy(screenData.rotation); // Use quaternion instead
        cssObject.quaternion.copy(worldQuaternion);
        
        // Scale the CSS object. This requires careful tuning.
        // Let's start with a scale factor that roughly maps 1 world unit to 10 CSS pixels.
        // const scaleFactor = 0.05; // Previous value
        const scaleFactor = 0.1; // Reset to baseline - ADJUST THIS VALUE LATER
        cssObject.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        /* // Temporarily disable offset
        // Adjust position slightly to place in front of the screen
        // Use the screen's world quaternion to get the correct normal direction
        const normalVector = new THREE.Vector3(0, 0, 1);
        normalVector.applyQuaternion(worldQuaternion); // Use world quaternion
        normalVector.multiplyScalar(0.01); // Very small offset
        cssObject.position.add(normalVector);
        */
        
        // Store the CSS object and show the element
        screenData.cssObject = cssObject;
        screenData.htmlElement.style.visibility = 'visible';
        
        // Set the element's size based on the screen's physical size and the scale factor
        screenData.htmlElement.style.width = `${screenData.size.width / scaleFactor}px`;
        screenData.htmlElement.style.height = `${screenData.size.height / scaleFactor}px`;
        
        // Add the CSS object to the CSS scene
        cssScene.add(cssObject);
        
        console.log(`Screen: ${screenData.name}`);
        console.log(`  3D Pos:`, screenData.position);
        console.log(`  3D Rot:`, screenData.rotation);
        console.log(`  3D Size: ${screenData.size.width.toFixed(2)}x${screenData.size.height.toFixed(2)}`);
        console.log(`  CSS Size: ${screenData.htmlElement.style.width}x${screenData.htmlElement.style.height}`);

      } else {
        console.warn(`Screen not found: ${screenData.name}`);
      }
    });
  }
);

// WebGL renderer for 3D content
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// CSS3D renderer for HTML content
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.pointerEvents = 'none'; // Let events pass through to WebGL renderer
document.body.appendChild(cssRenderer.domElement);

// scene settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
scene.background = new THREE.Color('#2d2e32');
renderer.setClearAlpha(0);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.125;

// Create UI overlay container for zoomed view
const uiContainer = document.createElement('div');
uiContainer.id = 'ui-container';
uiContainer.style.position = 'absolute';
uiContainer.style.top = '0';
uiContainer.style.left = '0';
uiContainer.style.width = '100%';
uiContainer.style.height = '100%';
uiContainer.style.pointerEvents = 'none';
uiContainer.style.display = 'none';
document.body.appendChild(uiContainer);

// Create fullscreen content elements for zoomed view
screens.forEach(screen => {
  const contentDiv = document.createElement('div');
  contentDiv.id = `${screen.content}-zoomed`;
  contentDiv.classList.add('screen-content', 'zoomed-content');
  contentDiv.style.display = 'none';
  contentDiv.style.pointerEvents = 'auto';
  
  // Add expanded content for each screen
  if (screen.content === 'screen1') {
    contentDiv.innerHTML = `
      <h2>Navigation Console</h2>
      <p>This is the ship's navigation system. From here you can:</p>
      <ul>
        <li>Set course coordinates</li>
        <li>Monitor stellar anomalies</li>
        <li>Track nearby vessel movements</li>
      </ul>
      <div class="screen-graphic">
        <div class="radar-circle"></div>
      </div>
      <div class="interactive-controls">
        <div class="control-section">
          <h3>Course Plotter</h3>
          <div class="control-row">
            <label>Destination:</label>
            <select>
              <option>Centauri System</option>
              <option>Proxima Station</option>
              <option>Vega Colony</option>
            </select>
          </div>
          <div class="control-row">
            <label>Speed:</label>
            <input type="range" min="1" max="10" value="7">
          </div>
        </div>
      </div>
      <button class="back-button">Return to Ship</button>
    `;
  } else if (screen.content === 'screen2') {
    contentDiv.innerHTML = `
      <h2>Ship Status</h2>
      <p>Main systems status:</p>
      <div class="status-grid expanded">
        <div class="status-item">
          <span class="label">Engines</span>
          <span class="value online">Online</span>
        </div>
        <div class="status-item">
          <span class="label">Life Support</span>
          <span class="value online">Optimal</span>
        </div>
        <div class="status-item">
          <span class="label">Shields</span>
          <span class="value warning">87%</span>
        </div>
        <div class="status-item">
          <span class="label">Power Core</span>
          <span class="value online">93%</span>
        </div>
        <div class="status-item">
          <span class="label">Navigation</span>
          <span class="value online">Operational</span>
        </div>
        <div class="status-item">
          <span class="label">Communications</span>
          <span class="value online">Operational</span>
        </div>
        <div class="status-item">
          <span class="label">Weapon Systems</span>
          <span class="value warning">Standby</span>
        </div>
        <div class="status-item">
          <span class="label">Medical Bay</span>
          <span class="value online">Operational</span>
        </div>
      </div>
      <div class="interactive-controls">
        <div class="control-section">
          <h3>System Diagnostics</h3>
          <button class="function-button">Run Full Diagnostic</button>
          <button class="function-button">Optimize Power Distribution</button>
        </div>
      </div>
      <button class="back-button">Return to Ship</button>
    `;
  } else if (screen.content === 'screen3') {
    contentDiv.innerHTML = `
      <h2>Communications</h2>
      <p>Incoming transmission from Command:</p>
      <div class="message-container expanded">
        <p class="message">Greetings, Captain. Your next mission coordinates have been uploaded to your navigation system. Proceed to the Centauri system for further instructions. Be advised that the region has reported increased pirate activity. Maintain your vessel's defensive capabilities at ready status.</p>
        <p class="sender">— Admiral Chen, Starfleet Command</p>
      </div>
      <div class="interactive-controls">
        <div class="control-section">
          <h3>Communication Controls</h3>
          <textarea placeholder="Type your response here..."></textarea>
          <div class="button-row">
            <button class="function-button">Reply</button>
            <button class="function-button">Archive</button>
            <button class="function-button">Forward to Crew</button>
          </div>
        </div>
      </div>
      <button class="back-button">Return to Ship</button>
    `;
  }
  
  uiContainer.appendChild(contentDiv);
});

// Store original camera position and rotation for returning
const originalCameraPosition = camera.position.clone();
const originalCameraQuaternion = camera.quaternion.clone();

// Handle click events
let currentScreen = null;
let isZoomedIn = false;
window.addEventListener('click', onMouseClick);
window.addEventListener('touchend', onTouchEnd);

function onMouseClick(event) {
  // If we're already zoomed in, let the UI handle clicks
  if (isZoomedIn) return;
  
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  checkIntersections();
}

function onTouchEnd(event) {
  if (isZoomedIn) return;
  
  if (event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    checkIntersections();
  }
}

function checkIntersections() {
  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Get all objects that intersect the ray
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    // Check if we clicked on a screen
    for (const screen of screens) {
      // Find the screen in the intersected objects
      for (const intersect of intersects) {
        // Check if the object name contains the screen name
        if (intersect.object.name && intersect.object.name.includes(screen.name)) {
          focusOnScreen(screen);
          return;
        }
      }
    }
  }
}

// Focus camera on a screen
function focusOnScreen(screen) {
  // Disable orbit controls temporarily
  controls.enabled = false;
  isZoomedIn = true;
  
  // Store which screen we're looking at
  currentScreen = screen;
  
  // Calculate position in front of the screen
  const offsetDistance = 10; // Distance from screen
  
  // Create a normal vector pointing out from the screen
  const normalVector = new THREE.Vector3(0, 0, 1);
  normalVector.applyEuler(screen.rotation); // Use the stored Euler rotation
  
  // Calculate a position in front of the screen
  const newCameraPosition = screen.position.clone().add(
    normalVector.clone().multiplyScalar(offsetDistance)
  );
  
  // Create a target position vector (the screen center)
  const targetLookAt = screen.position.clone();
  
  // Animate the camera to the new position
  const duration = 1500; // ms
  const startTime = Date.now();
  const startPosition = camera.position.clone();
  const startQuaternion = camera.quaternion.clone();
  
  // Calculate the target quaternion (rotation)
  const targetQuaternion = new THREE.Quaternion();
  const lookAtMatrix = new THREE.Matrix4();
  lookAtMatrix.lookAt(newCameraPosition, targetLookAt, new THREE.Vector3(0, 1, 0));
  targetQuaternion.setFromRotationMatrix(lookAtMatrix);
  
  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease function (ease-out cubic)
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    // Update camera position
    camera.position.lerpVectors(startPosition, newCameraPosition, easeProgress);
    
    // Update camera rotation
    camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, easeProgress);
    
    // Continue animation if not finished
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      // Animation complete, show zoomed UI
      uiContainer.style.display = 'block';
      
      // Hide the CSS3D version of the screen while zoomed
      if (screen.cssObject) {
        screen.cssObject.visible = false;
      }
      
      // Show the zoomed content
      document.getElementById(`${screen.content}-zoomed`).style.display = 'block';
      
      // Add event listeners to back buttons
      const backButtons = document.querySelectorAll('.back-button');
      backButtons.forEach(button => {
        button.addEventListener('click', returnToSpaceship);
      });
    }
  }
  
  // Start animation
  animateCamera();
}

// Return to original view
function returnToSpaceship() {
  // Hide zoomed UI
  uiContainer.style.display = 'none';
  document.getElementById(`${currentScreen.content}-zoomed`).style.display = 'none';
  
  // Show the CSS3D version of the screen again
  if (currentScreen.cssObject) {
    currentScreen.cssObject.visible = true;
  }
  
  // Animate back to original position
  const duration = 1500; // ms
  const startTime = Date.now();
  const startPosition = camera.position.clone();
  const startQuaternion = camera.quaternion.clone();
  
  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease function
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    // Update camera position
    camera.position.lerpVectors(startPosition, originalCameraPosition, easeProgress);
    
    // Update camera rotation
    camera.quaternion.slerpQuaternions(startQuaternion, originalCameraQuaternion, easeProgress);
    
    // Continue animation if not finished
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      // Animation complete, enable controls
      controls.enabled = true;
      currentScreen = null;
      isZoomedIn = false;
    }
  }
  
  // Start animation
  animateCamera();
}

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
  controls.update();
  renderer.render(scene, camera);
  cssRenderer.render(cssScene, camera);
}