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

var scene = new THREE.Scene();

var ambient = new THREE.AmbientLight( 0x404040 );
scene.add( ambient );
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 0, 0, 1 );
scene.add( directionalLight );

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 3000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0xffffff, 1);
document.body.appendChild(renderer.domElement);
var phone;
camera.position.z = 1000;

var loader = new THREE.JSONLoader();
loader.load('/models/iphone-model.json', function (geometry, materials) {
  phone = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials) );
  // phone.overdraw = true;
  scene.add(phone);
});

var render = function () { 
  requestAnimationFrame(render);
  if (!phone) { return; }
  phone.quaternion.set.apply(phone.quaternion, phoneProps.quaternion);
  renderer.render(scene, camera);
};
render();



window.addEventListener('resize', function() {
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
});
