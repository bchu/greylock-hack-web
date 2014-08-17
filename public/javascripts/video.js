var socket = io('/');
var swaps = 0;
var activeVideo = document.querySelector('video.first');
var loadingVideo = document.querySelector('video.second');
var swapListener = function() {
  console.log('swap', ++swaps);
  loadingVideo.style.zIndex = 2;
  activeVideo.style.zIndex = 1;
  activeVideo.pause();
  var tmp = activeVideo;
  activeVideo = loadingVideo;
  loadingVideo = tmp;
};
loadingVideo.addEventListener('playing', swapListener);
activeVideo.addEventListener('playing', swapListener);

socket.on('update video', function(data) {
  console.log(data);

  loadingVideo.pause();
  loadingVideo.setAttribute('src', '/video/' + data);
});