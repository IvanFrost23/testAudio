/**
 * Created by mac on 5/23/20
 */

/**
 * In order for the canvas to be recorded without artifacts in the Chrome
 * browser, do the following:
 * 1. chrome://flags --> Accelerated 2D canvas --> Disabled
 */

Recorder = {
    start: function (params) {
        const audioContext = window.audioContext = new AudioContext();
        const audioElement = document.querySelector("audio");
        const track = audioContext.createMediaElementSource(audioElement);
        track.connect(audioContext.destination);

        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        track.connect(mediaStreamDestination);

        Recorder.recorder = new MediaRecorder(mediaStreamDestination.stream);

        Recorder.recordedBlobs = [];

        Recorder.recorder.ondataavailable = function (event) {
            Recorder.recordedBlobs.push(event.data);
        };

        Recorder.recorder.onstop = function (event) {
            console.log("Recorder stopped: ", event);

            soundStream.getTracks().forEach(function (track) {
                track.stop();
            });
        };

        Recorder.recorder.onstart = function (event) {
            console.log("Recorder started: ", event);
        };

        Recorder.recorder.start(10);
    },

    stop: function (f) {
        if (Recorder.recorder) {
            Recorder.recorder.stop();

            var blob = new Blob(Recorder.recordedBlobs, {
                type: Recorder.MIME_TYPE
            });

            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function (event) {
                if (Recorder.data && Recorder.data.data) {
                    Recorder.data.data.push(event.target.result);
                } else {
                    Recorder.data = { data: [event.target.result] };
                }
                Recorder.ext = ".webm";
                f();
            };
        } else {
            f();
        }
    },

    downloadRecordedData: function (url, name) {
        var element = document.createElement("a");
        element.href = url;
        element.download = name;
        element.style.display = "none";

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },

    saveVideo: function (name) {
        var blob = new Blob(Recorder.recordedBlobs, {
            type: Recorder.MIME_TYPE
        });
        this.downloadRecordedData(URL.createObjectURL(blob), name + ".webm");
    }
};

Recorder.MIME_TYPE = "video/webm";
Recorder.IMAGE_QUALITY = 0.9;