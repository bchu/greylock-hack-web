var socket = io('/');

var utcMilliseconds = new Date().getUTCMilliseconds();
var zeroOffset = new THREE.Quaternion();
document.querySelector('.zero').addEventListener('click', function() {
  zeroOffset = phoneProps.quaternion.clone().inverse();
});
var phoneProps = {
  'accelerationX': 0,
  'accelerationY': 0,
  'accelerationZ': 0,
  'quaternion': new THREE.Quaternion()
};

var computedProps = {
  velocityX: 0,
  velocityY: 0,
  velocityZ: 0
};

socket.on('update', function(data) {
  phoneProps.accelerationX = data.accelerationX;
  phoneProps.accelerationY = data.accelerationY;
  phoneProps.accelerationZ = data.accelerationZ;
  phoneProps.quaternion.set.apply(phoneProps.quaternion, data.quaternion);
  var delta = utcMilliseconds - data.utcMilliseconds;
  utcMilliseconds = data.utcMilliseconds;
  updatePosition(delta);
});


socket.on('update screencast', function(file){
  var imageBlob = new Blob([file], {type: 'image/jpeg'});
  var image = new Image(320, 568);
  image.src = URL.createObjectURL(imageBlob);
  image.onload = function() {
    screen.map = new THREE.Texture(image);
    screen.map.needsUpdate = true;
  };
});

var updatePosition = function updatePosition(delta) {
  // computedProps.velocityX += phoneProps.accelerationX * delta;
  // computedProps.velocityY += phoneProps.accelerationY * delta;
  // computedProps.velocityZ += phoneProps.accelerationZ * delta;
};


/* Initialize scene */
var scene = new THREE.Scene();
var ambient = new THREE.AmbientLight( 0x404040 );
scene.add( ambient );
var frontLight = new THREE.DirectionalLight( 0xffffff, 1 );
frontLight.position.set( 0, 0, 800 );
frontLight.castShadow = true;
frontLight.shadowDarkness = 0.5;
// frontLight.shadowCameraVisible = true;
scene.add( frontLight );

var topLight = new THREE.DirectionalLight( 0xffffff, 1 );
topLight.position.set( 0, 1000, 0 );
topLight.castShadow = true;
topLight.shadowDarkness = 0.5;
// topLight.shadowCameraVisible = true;
scene.add(topLight);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 3000);
// camera.position.set(0,800,1300);
camera.position.set(0,0, 1300);
// camera.rotation.x = -Math.PI/6;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0xffffff, 1);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
var phone;
var screen;


/* Load iphone model */
var loader = new THREE.JSONLoader();
loader.load('/models/iphone-model.json', function (geometry, materials) {
  screen = materials[1];
  console.log(screen);
  phone = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
  phone.castShadow = true;
  phone.overdraw = true;
  scene.add(phone);

  /*var dir = new THREE.Vector3( 1, 0, 0 );
  var origin = new THREE.Vector3( 0, 0, 500 );
  var length = 300;
  var hex = 0xffff00;

  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 75, 50);
  scene.add( arrowHelper );*/

  document.body.appendChild(renderer.domElement);
});

var tex = THREE.ImageUtils.loadTexture( '/images/geometry2.png') ;
tex.wrapS = THREE.RepeatWrapping;
tex.wrapT = THREE.RepeatWrapping;
tex.repeat.x = 1000;
tex.repeat.y = 1000;
var floorMaterial = new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } );
var plane = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), floorMaterial);
plane.rotation.x  = -Math.PI / 2;
plane.position.set(0, -800, 500);
plane.scale.set(100,1000,1000);
plane.receiveShadow = true;
scene.add(plane);

/* Animate rotations */
var offset = new THREE.Quaternion();
offset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 2 );
var render = function () { 
  requestAnimationFrame(render);
  if (!phone) { return; }
  phone.position.set(computedProps.velocityX, computedProps.velocityY, computedProps.velocityZ);
  phone.quaternion = offset.clone();
  phone.quaternion.multiplyQuaternions(offset, phoneProps.quaternion);
  phone.quaternion.multiplyQuaternions(phone.quaternion, zeroOffset);
  renderer.render(scene, camera);
};
render();

/* Resize with window */
window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});
