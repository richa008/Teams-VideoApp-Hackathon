microsoftTeams.initialize(() => {}, [
  "https://lubobill1990.github.io",
  "https://richa008.github.io",
]);
// This is the effect for processing

let appliedEffect = {
  effect: null,
};

let filterOrchestrator;
let canvas;
let gl;
canvas = document.createElement("canvas");
gl = canvas.getContext("webgl");

// This is the effect linked with UI
let uiSelectedEffect = {};

let errorOccurs = false;

//Sample video effect
function videoFrameHandler(videoFrame, notifyVideoProcessed, notifyError) {
  processAndSend(videoFrame, notifyVideoProcessed, notifyError);
}

function processAndSend(videoFrame, notifyVideoProcessed, notifyError) {
  console.log(
    "height:",
    videoFrame.height,
    "width:",
    videoFrame.width,
    "numRes:",
    videoFrame.data.length
  );

  // if (appliedEffect.effect != null) {
  filterOrchestrator.processImage(
    videoFrame.data,
    videoFrame.width,
    videoFrame.height
  );
  // }

  //send notification the effect processing is finshed.
  notifyVideoProcessed();

  //send error to Teams
  if (errorOccurs) {
    notifyError("some error message");
  }
}

function effectParameterChanged(effectName) {
  // if (effectName != undefined) {
  //   // addCheckMark(previewFilterMapping[effectName], false);
  //   uiSelectedEffect.effect = previewFilterMapping[effectName]
  // }

  appliedEffect = {
    ...appliedEffect,
    ...uiSelectedEffect,
  };
}

// function addCheckMark(id, isClickListener) {
//   var _this = document.getElementById(id)

//   var current = document.getElementsByClassName("selected");
//   if (current.length) {
//     var checked = document.getElementById("selected");
//     checked.parentNode.removeChild(checked);
//     current[0].className = current[0].className.replace(" selected", "");
//   }
//   _this.className += " selected";
//   var checked = document.getElementById("template").cloneNode(true);
//   checked.setAttributeNS(null, "id", "selected");
//   checked.setAttributeNS(null, "class", "checked");
//   _this.appendChild(checked);

//   console.log("Current using filter:", id)

//   if (isClickListener) {
//     // call Teams API to annouce the selected filter
//     uiSelectedEffect.effect = id;
//     microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged", previewFilterMappingRevert[id]);
//     // microsoftTeams.videoApp.notifySelectedVideoEffectChanged("EffectChanged", previewFilterMappingRevert[id]);
//   }

// }

function preload() {
  // var content = document.getElementsByClassName("co");
  // var imgs = document.getElementsByClassName("candidate");
  // for (var i = 0; i < imgs.length; i++) {
  //   imgs[i].addEventListener("click", function (event) { addCheckMark(event.target.parentNode.id, true) });
  // }

  microsoftTeams.appInitialization.notifySuccess();

  filterOrchestrator = new FilterOrchestrator();
  // await loadDataAsync();

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
