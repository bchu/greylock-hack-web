var socket = io('/');

// Controls and Events

var zeroOffset = new THREE.Quaternion();
document.querySelector('.zero').addEventListener('click', function() {
  zeroOffset = phoneProps.quaternion.clone().inverse();
});

var manualOffset = new THREE.Quaternion();
manualOffset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 2 );
document.querySelector('.forward').addEventListener('click', function() {
  manualOffset = new THREE.Quaternion();
});
document.querySelector('.back').addEventListener('click', function() {
  manualOffset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 2 );
});
var loosenCamera = false;
document.querySelector('.loosen').addEventListener('click', function() {
  loosenCamera = !loosenCamera;
});
document.querySelector('.tilt').addEventListener('click', function() {
  manualOffset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 4 );
});

window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});


// Data

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

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 3000);
camera.position.set(0,0, 1300);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;


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


socket.on('update', function(data) {
  phoneProps.accelerationX = data.accelerationX;
  phoneProps.accelerationY = data.accelerationY;
  phoneProps.accelerationZ = data.accelerationZ;

  if (loosenCamera) {
    loosenCameraHandler();
  }

  phoneProps.quaternion.set.apply(phoneProps.quaternion, data.quaternion);
});


var origX = 0, origY = 0, origZ = 1300;
var prevX = 0;
var prevY = 0;
var prevZ = 1300;
var loosenCameraHandler = function() {
  var vector = new THREE.Vector3(phoneProps.accelerationX, phoneProps.accelerationY, phoneProps.accelerationZ).negate();
  var x = vector.x;
  var y = vector.y;
  var z = vector.z;
  if (Math.abs(x) > 0.9) {
    prevX += 7 * x;
  }
  else {
    prevX += (origX - prevX) / 8;
  }
  if (Math.abs(y) > 0.9) {
    prevY += 7 * y;
  }
  else {
    prevY += (origY - prevY) / 8;
  }
  if (Math.abs(z) > 1.5) {
    prevZ += -6 * z;
  }
  else {
    prevZ += (origZ - prevZ) / 8;
  }
  prevX = Math.max(-500, Math.min(500, prevX));
  prevY = Math.max(-500, Math.min(500, prevY));
  prevZ = Math.max(0, Math.min(2000, prevZ));
  camera.position.set(prevX, prevY, prevZ);
};



socket.on('update screencast', function(file){
  var imageBlob = new Blob([file], {type: 'image/jpeg'});
  var image = new Image(320, 568);
  image.src = URL.createObjectURL(imageBlob);
  image.onload = function() {
    screen.map = new THREE.Texture(image);
    screen.map.needsUpdate = true;
  };
});

// Lighting

var ambient = new THREE.AmbientLight( 0x404040 );
scene.add( ambient );
var frontLight = new THREE.DirectionalLight( 0xffffff, 1 );
frontLight.position.set( 0, 0, 800 );
frontLight.castShadow = true;
frontLight.shadowDarkness = 0.5;
scene.add( frontLight );

var topLight = new THREE.DirectionalLight( 0xffffff, 1 );
topLight.position.set( 0, 1000, 0 );
topLight.castShadow = true;
topLight.shadowDarkness = 0.5;
scene.add(topLight);

var phone;
var screen;
var loader = new THREE.JSONLoader();
loader.load('/models/iphone-model.json', function (geometry, materials) {
  screen = materials[1];
  phone = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
  phone.castShadow = true;
  phone.overdraw = true;
  scene.add(phone);

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
  phone.quaternion = manualOffset.clone();
  phone.quaternion.multiplyQuaternions(manualOffset, phoneProps.quaternion);
  phone.quaternion.multiplyQuaternions(phone.quaternion, zeroOffset);
  renderer.render(scene, camera);
};
render();

