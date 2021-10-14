microsoftTeams.initialize(() => {}, [
  "https://richa008.github.io",
]);
// This is the effect for processing

let filterOrchestrator;
let canvas;
let gl;
canvas = document.createElement("canvas");
gl = canvas.getContext("webgl");
let selectedEffectId;

let errorOccurs = false;

//Sample video effect
function videoFrameHandler(videoFrame, notifyVideoProcessed, notifyError) {
  processAndSend(videoFrame, notifyVideoProcessed, notifyError);
}

function processAndSend(videoFrame, notifyVideoProcessed, notifyError) {

  if (selectedEffectId !== undefined) {
    filterOrchestrator.processImage(
      videoFrame.data,
      videoFrame.width,
      videoFrame.height,
      selectedEffectId
    );
    console.log(selectedEffectId);
  }

  //send notification the effect processing is finshed.
  notifyVideoProcessed();

  //send error to Teams
  if (errorOccurs) {
    notifyError("some error message");
  }
}

function effectParameterChanged(effectName) {
  selectedEffectId = effectName;
}

function preload() {
  microsoftTeams.appInitialization.notifySuccess();
  filterOrchestrator = new FilterOrchestrator();

  microsoftTeams.video.registerForVideoEffect(effectParameterChanged);
  microsoftTeams.video.registerForVideoFrame(videoFrameHandler, {
    format: "NV12",
  });
}

preload();

function showArrayAsStr(arr) {
  var s = "";
  for (let i = 0; i < arr.length; i++) {
    s = s + "," + arr[i];
  }
  return s;
}

function getShader(source, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("ERROR IN SHADER : " + gl.getShaderInfoLog(shader));
    return false;
  }
  return shader;
}

function resizeCanvas(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
}
