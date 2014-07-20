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
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0, 0, 1 );
directionalLight.castShadow = true;
directionalLight.shadowDarkness = 0.5;
scene.add( directionalLight );

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 3000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0xffffff, 1);
renderer.shadowMapEnabled = true;
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
  phone.overdraw = true;
  scene.add(phone);
});

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
