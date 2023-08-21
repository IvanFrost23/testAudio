var canvas = document.getElementById("canvas");
var videoCtx = new VideoContext(canvas);

// var videoNode = videoCtx.video(
//   "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
// );
// videoNode.connect(videoCtx.destination);
// videoNode.start(0);
// videoNode.stop(30);

var button = document.getElementById('myButton');
button.addEventListener('click', function() {
    document.getElementById("audioElement").play();
    Recorder.start({});
    //videoCtx.play();
    setTimeout(function () {
        Recorder.stop(function () {
            Recorder.saveVideo("video")
        }.bind(this));
    }, 30000);
});
