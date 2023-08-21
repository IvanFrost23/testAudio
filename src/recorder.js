/**
 * Created by mac on 5/23/20
 */

/**
 * In order for the canvas to be recorded without artifacts in the Chrome
 * browser, do the following:
 * 1. chrome://flags --> Accelerated 2D canvas --> Disabled
 */

Recorder = {
    init: function () {
        if (Recorder.canvas) {
            return;
        }

        Recorder.canvas = document.getElementById("GameCanvas");
    },

    start: function (params) {
        Recorder.init();

        Recorder.recorder =  new MediaRecorder(document.getElementById("audioElement").captureStream());



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

            if (params.frameCapture) {
                var startCaptureFrames = function () {
                    Recorder.captureFrames(params.frameCapture);
                };

                if (params.frameCapture.amount === 1) {
                    setTimeout(startCaptureFrames, params.frameCapture.frequency || 0);
                } else {
                    startCaptureFrames();
                }
            }
        };

        Recorder.recorder.start(10);
    },

    pause: function (f) {
        if (Recorder.recorder && Recorder.recorder.state === "recording") {
            Recorder.recorder.pause();
            console.log("Recorder paused...");
        }
        f && f();
    },

    resume: function (f) {
        if (Recorder.recorder && Recorder.recorder.state === "paused") {
            Recorder.recorder.resume();
            console.log("Recorder resumed...");
        }
        f && f();
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

    captureFrames: function (params) {
        var cnt = 0;

        var capture = function () {
            if (Recorder.recorder.state === "recording") {
                cnt++;

                if (cnt < params.amount) {
                    setTimeout(capture, params.frequency);
                }

                var framesDir = params.name + "_frames";
                var prefix = cnt === 1 ? "" : cnt + "_";
                prefix = (params.filenamePrefix || "") + prefix;
                var frameName = prefix + params.name + ".jpg";
                var fullName = cnt === 1 ? params.path + frameName : params.path + framesDir + "/" + frameName;
                var data = {
                    data: Recorder.canvas.toDataURL("image/jpeg", Recorder.IMAGE_QUALITY),
                    processed: cnt,
                    total: params.amount || 1,
                    frameCapture: true
                };

                this.post("/recorder/" + fullName, data, undefined, undefined, 120000);
            }
        }.bind(this);

        capture();
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

    screenshot: function (name) {
        Recorder.init();
        this.downloadRecordedData(Recorder.canvas.toDataURL("image/jpeg", Recorder.IMAGE_QUALITY), name + "_image.jpg");
    },

    saveVideo: function (name) {
        var blob = new Blob(Recorder.recordedBlobs, {
            type: Recorder.MIME_TYPE
        });
        this.downloadRecordedData(URL.createObjectURL(blob), name + ".webm");
    },

    save: function (path, name, options, onSuccess) {
        var fullName = path + "/" + name + Recorder.ext;

        var data = Object.assign(cleverapps.clone(Recorder.data), options || {});

        this.post("/recorder/" + fullName, data, onSuccess, undefined, 120000);

        Recorder.data = undefined;
        Recorder.ext = undefined;
    },

    runTransform: function (options) {
        options.crf = 23;

        this.post("/recorder/transform", options);
    },

    terminate: function () {
        this.post("/recorder/terminate", {});
    },

    post: function (path, data, onSuccess, onError, options) {
        if (cleverapps.config.workerTaskId && path.indexOf("http") !== 0) {
            path = "http://localhost:3201" + path;
        }

        data.project = cleverapps.config.name;
        data.workerTaskId = cleverapps.config.workerTaskId;

        cleverapps.RestClient.post(path, data, onSuccess, onError, options);
    }
};

Recorder.MIME_TYPE = "video/webm";
Recorder.IMAGE_QUALITY = 0.9;