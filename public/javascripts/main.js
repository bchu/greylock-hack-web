var socket = io('/');

var phoneProps = {
  'rotX': 0,
  'rotY': 0,
  'rotZ': 0,
  'quaternion': [0,0,0,0]
};

socket.on('update rotation', function(data) {
  phoneProps.rotX = data.x;
  phoneProps.rotY = data.y;
  phoneProps.rotZ = data.z;
  phoneProps.quaternion = data.quaternion;
});

var counter = 0;

socket.on('update screencast', function(file){
  var imageBlob = new Blob([file], {type: 'image/jpeg'});
  var image = new Image(320, 568);
  image.src = URL.createObjectURL(imageBlob);
  image.onload = function() {
    document.body.appendChild(canvas);
    screen.map = new THREE.Texture(image);
    screen.map.needsUpdate = true;
  }
  //screen.map = new THREE.Texture(THREE.ImageUtils.getNormalMap(image));
});

/* Initialize scene */
var scene = new THREE.Scene();
var ambient = new THREE.AmbientLight( 0x404040 );
scene.add( ambient );
var frontLight = new THREE.DirectionalLight( 0xffffff, 1 );
frontLight.position.set( 0, 0, 1 );
frontLight.castShadow = true;
frontLight.shadowDarkness = 0.5;
// frontLight.shadowCameraVisible = true;
scene.add( frontLight );

var topLight = new THREE.DirectionalLight( 0xffffff, 1 );
topLight.position.set( 0, 1, 0 );
topLight.castShadow = true;
topLight.shadowDarkness = 0.5;
// topLight.shadowCameraVisible = true;
scene.add(topLight);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 3000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0xffffff, 1);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
document.body.appendChild(renderer.domElement);
var phone;
var screen;
camera.position.z = 1000;

/* Load iphone model */
var loader = new THREE.JSONLoader();
loader.load('/models/iphone-model.json', function (geometry, materials) {
  screen = materials[1];
  console.log(screen);
  phone = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
  phone.castShadow = true;
  phone.overdraw = true;
  scene.add(phone);
});


var plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 1), new THREE.MeshBasicMaterial( { color: 0xffffff } ));
plane.position.y = -10;
plane.rotation.z  = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);


/* Animate rotations */
var offset = new THREE.Quaternion();
offset.setFromAxisAngle( new THREE.Vector3( -1, 0, 0 ), Math.PI / 2 );
var render = function () { 
  requestAnimationFrame(render);
  if (!phone) { return; }
  var arr = phoneProps.quaternion;
  phone.quaternion.set(arr[0], arr[1], arr[2], arr[3]);
  phone.quaternion.multiplyQuaternions(offset, phone.quaternion);
  renderer.render(scene, camera);
};
render();

/* Add screencasting */
canvas = document.createElement('canvas');


/* Resize with window */
window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});
