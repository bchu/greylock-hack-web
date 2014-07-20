var socket = io('/');

var utcMilliseconds = new Date().getUTCMilliseconds();
var zeroOffset = new THREE.Quaternion();
document.querySelector('.zero').addEventListener('click', function() {
  zeroOffset = phoneProps.quaternion.clone().inverse();
});

var offset = new THREE.Quaternion();
offset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 2 );
document.querySelector('.forward').addEventListener('click', function() {
  offset = new THREE.Quaternion();
});
document.querySelector('.back').addEventListener('click', function() {
  offset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 2 );
});
var loosenCamera = false;
document.querySelector('.loosen').addEventListener('click', function() {
  loosenCamera = !loosenCamera;
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

/* Initialize scene */
var scene = new THREE.Scene();
// var scene = new Physijs.Scene();
// scene.setGravity(new THREE.Vector3(0,0,0));
// scene.addEventListener('update', function() {
//     var vector = new THREE.Vector3(phoneProps.accelerationX, phoneProps.accelerationY, phoneProps.accelerationZ);
//     console.log(vector.length());
//     if (vector && vector.length() > 10) {
//       applyForce(phone, vector);
//     }
//     scene.simulate( undefined, 1 );
// });
// var applyForce = function(item, vector) {
//   var strength = 100, distance, effect, offset;
//   effect = vector.clone().sub( item.position ).normalize().multiplyScalar( strength ).negate(),
//   offset = vector.clone().sub( item.position );
//   item.applyImpulse( effect, offset );
// };
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

var Matrix4 = THREE.Matrix4;
var rotationY = new Matrix4();
var rotationX = new Matrix4();
var translation = new Matrix4();
var matrix = new Matrix4();

var setCameraSphere = function(longitude, latitude, radius) {
  rotationY.makeRotationY(longitude);
  rotationX.makeRotationX(-latitude);
  translation.makeTranslation(0, 0, radius);
  matrix.multiplyMatrices(rotationY, rotationX).multiply(translation);

  camera.matrix.identity();
  camera.applyMatrix(matrix);
};

var prevX = 0;
var prevY = 0;//Math.PI/18;
var prevZ = 1300;
// setCameraSphere(prevX, prevY, 1300);


socket.on('update', function(data) {
  phoneProps.accelerationX = data.accelerationX;
  phoneProps.accelerationY = data.accelerationY;
  phoneProps.accelerationZ = data.accelerationZ;

  if (loosenCamera) {
    var vector = new THREE.Vector3(phoneProps.accelerationX, phoneProps.accelerationY, phoneProps.accelerationZ).negate();
    // var x = vector.clone().projectOnVector(new THREE.Vector3(1,0,0)).x;
    // var y = vector.clone().projectOnVector(new THREE.Vector3(0,1,0)).y;
    // var z = vector.clone().projectOnVector(new THREE.Vector3(0,0,1)).z;
    var x = vector.x;
    var y = vector.y;
    var z = vector.z;
    // console.log('x', x);
    // console.log('y', y);
    if (Math.abs(x) > 1) {
      console.log('x');
      prevX += 5 * x;
    }
    if (Math.abs(y) > 1) {
      console.log('y');
      prevY += 5 * y;
    }
    if (Math.abs(z) > 1.5) {
      console.log('z');
      prevZ += 5 * z;
    }
    prevX = Math.max(-500, Math.min(500, prevX));
    prevY = Math.max(-500, Math.min(500, prevY));
    prevZ = Math.max(0, Math.min(2000, prevZ));
    // setCameraSphere(prevX, prevY, 1300);
    camera.position.set(prevX, prevY, prevZ);
  }

  phoneProps.quaternion.set.apply(phoneProps.quaternion, data.quaternion);
  var delta = data.utcMilliseconds - utcMilliseconds;
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

// Physijs.scripts.worker = '/javascripts/physijs_worker.js';
// Physijs.scripts.ammo = '/javascripts/ammo.js';

var updatePosition = function updatePosition(delta) {
  // computedProps.velocityX += phoneProps.accelerationX * delta;
  // computedProps.velocityY += phoneProps.accelerationY * delta;
  // computedProps.velocityZ += phoneProps.accelerationZ * delta;
};


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


/* Load iphone model */
var loader = new THREE.JSONLoader();
loader.load('/models/iphone-model.json', function (geometry, materials) {
  screen = materials[1];
  // phone = new Physijs.BoxMesh( geometry, new THREE.MeshFaceMaterial(materials) );
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

var tex = THREE.ImageUtils.loadTexture( '/images/halftone.png') ;
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
var render = function () { 
  requestAnimationFrame(render);
  if (!phone) { return; }
  // phone.position.set(computedProps.velocityX, computedProps.velocityY, computedProps.velocityZ);
  // phone.position.set(phoneProps.accelerationX * 10, phoneProps.accelerationY * 10, phoneProps.accelerationZ * 10);
  phone.quaternion = offset.clone();
  phone.quaternion.multiplyQuaternions(offset, phoneProps.quaternion);
  phone.quaternion.multiplyQuaternions(phone.quaternion, zeroOffset);
  // scene.simulate();
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
