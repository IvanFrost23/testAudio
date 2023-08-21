var button = document.getElementById('myButton');
button.addEventListener('click', function() {
    document.getElementById("audioElement").play();
    Recorder.start({});
    setTimeout(function () {
        Recorder.stop(function () {
            Recorder.saveVideo("video")
        }.bind(this));
    }, 30000);
});
