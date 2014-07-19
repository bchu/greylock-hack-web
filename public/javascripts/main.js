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
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0xffffff, 1);
document.body.appendChild(renderer.domElement);
var geometry = new THREE.BoxGeometry(2.31, 4.87, 0.30);
var material = new THREE.MeshBasicMaterial({color: 0x000000});
var phone = new THREE.Mesh(geometry, material);
scene.add(phone);
camera.position.z = 5;

var render = function () {
  requestAnimationFrame(render);
  phone.quaternion.set.apply(phone.quaternion, phoneProps.quaternion);
  renderer.render(scene, camera);
};
render();
