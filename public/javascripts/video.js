var socket = io('/');
window.addEventListener('readyToAddVideo', function(e) {
  var screenMat = e.material;
  var swaps = 0;
  var activeVideo = document.querySelector('video.first');
  var activeTex = new THREE.Texture(activeVideo);
  var loadingVideo = document.querySelector('video.second');
  var loadingTex = new THREE.Texture(loadingVideo);

  var swapListener = function() {
    screenMat.map = loadingTex;
    console.log('swap#', ++swaps);
    // loadingVideo.style.zIndex = 2;
    // activeVideo.style.zIndex = 1;
    activeVideo.pause();

    var tmpTex = activeTex;
    var tmp = activeVideo;
    activeVideo = loadingVideo;
    activeTex = loadingTex;
    loadingVideo = tmp;
    loadingTex = tmpTex;
  };
  // only one of these plays at any time, but it could be either
  loadingVideo.addEventListener('playing', swapListener);
  activeVideo.addEventListener('playing', swapListener);

  socket.on('update video', function(data) {
    var videoBlob = new Blob([data], {type: 'video/mp4'});
    var url = URL.createObjectURL(videoBlob);
    console.log('video updated');

    var oldURL = loadingVideo.src;
    URL.revokeObjectURL(oldURL); // reclaim memory
    loadingVideo.pause();
    loadingVideo.src = url; // this triggers the 'playing' event after video is loaded
  });
});