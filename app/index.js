microsoftTeams.initialize(() => {}, [
  "https://lubobill1990.github.io",
  "https://richa008.github.io",
]);
// This is the effect for processing

let filterOrchestrator;
let canvas;
let gl;
canvas = document.createElement("canvas");
gl = canvas.getContext("webgl");
let selectedEffect;

let errorOccurs = false;

//Sample video effect
function videoFrameHandler(videoFrame, notifyVideoProcessed, notifyError) {
  processAndSend(videoFrame, notifyVideoProcessed, notifyError);
}

function processAndSend(videoFrame, notifyVideoProcessed, notifyError) {

  if (selectedEffect !== undefined) {
    // filterOrchestrator.processImage(
    //   videoFrame.data,
    //   videoFrame.width,
    //   videoFrame.height,
    //   selectedEffect
    // );
    console.log(selectedEffect);
  }

  //send notification the effect processing is finshed.
  notifyVideoProcessed();

  //send error to Teams
  if (errorOccurs) {
    notifyError("some error message");
  }
}

function effectParameterChanged(effectName) {
  selectedEffect = effectName;
}

function preload() {
  // var content = document.getElementsByClassName("co");
  // var imgs = document.getElementsByClassName("candidate");
  // for (var i = 0; i < imgs.length; i++) {
  //   imgs[i].addEventListener("click", function (event) { addCheckMark(event.target.parentNode.id, true) });
  // }

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
