microsoftTeams.initialize(() => {}, [
  "https://richa008.github.io",
]);

// This is the effect for processing
let appliedEffect = {
  pixelValue: 100,
  proportion: 3,
};

// This is the effect linked with UI
let uiSelectedEffect = {};

let errorOccurs = false;

let canvas = document.createElement("canvas");
let gl = canvas.getContext("webgl");
let context = canvas.getContext("2d");
var img = new Image();
img.src = "https://richa008.github.io/Teams-VideoApp-Hackathon/app/clown.png";
var program = gl.createProgram();

//Sample video effect
function videoFrameHandler(videoFrame, notifyVideoProcessed, notifyError) {
  const maxLen =
    (videoFrame.height * videoFrame.width) /
      Math.max(1, appliedEffect.proportion) - 4;

  for (let i = 1; i < maxLen; i += 4) {
    //smaple effect just change the value to 100, which effect some pixel value of video frame
    videoFrame.data[i + 1] = appliedEffect.pixelValue;
  }

  canvas.width = videoFrame.width;
  canvas.height = videoFrame.height;
  // var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  // var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
 
  // // lookup uniforms
  // var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  // var imageLocation = gl.getUniformLocation(program, "u_image");
 
  // // provide texture coordinates for the rectangle.
  // var texCoordBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  //     0.0,  0.0,
  //     1.0,  0.0,
  //     0.0,  1.0,
  //     0.0,  1.0,
  //     1.0,  0.0,
  //     1.0,  1.0]), gl.STATIC_DRAW);
  // gl.enableVertexAttribArray(texCoordAttributeLocation);
  // var size = 2;          // 2 components per iteration
  // var type = gl.FLOAT;   // the data is 32bit floats
  // var normalize = false; // don't normalize the data
  // var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  // var offset = 0;        // start at the beginning of the buffer
  // gl.vertexAttribPointer(
  //     texCoordAttributeLocation, size, type, normalize, stride, offset)
 
  // // Create a texture.
  // var texture = gl.createTexture();
 
  // // make unit 0 the active texture unit
  // // (i.e, the unit all other texture commands will affect.)
  // gl.activeTexture(gl.TEXTURE0 + 0);
 
  // // Bind texture to 'texture unit '0' 2D bind point
  // gl.bindTexture(gl.TEXTURE_2D, texture);
 
  // // Set the parameters so we don't need mips and so we're not filtering
  // // and we don't repeat
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
  // // Upload the image into the texture.
  // var mipLevel = 0;               // the largest mip
  // var internalFormat = gl.RGBA;   // format we want in the texture
  // var srcFormat = gl.RGBA;        // format of data we are supplying
  // var srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
  // gl.texImage2D(gl.TEXTURE_2D,
  //               mipLevel,
  //               internalFormat,
  //               srcFormat,
  //               srcType,
  //               image);

  //send notification the effect processing is finshed.
  notifyVideoProcessed();

  //send error to Teams
  if (errorOccurs) {
    notifyError("some error message");
  }
}

function effectParameterChanged(effectName) {
  console.log(effectName);
  if (effectName === undefined) {
    // If effectName is undefined, then apply the effect selected in the UI
    appliedEffect = {
      ...appliedEffect,
      ...uiSelectedEffect,
    };
  } else {
    if (effectName === "f36d7f68-7c71-41f5-8fd9-ebf0ae38f949") {
      appliedEffect.proportion = 2;
      appliedEffect.pixelValue = 200;
    } else {
      // if effectName is string sent from Teams client, the apply the effectName
      try {
        appliedEffect = {
          ...appliedEffect,
          ...JSON.parse(effectName),
        };
      } catch (e) {}
    }
  }
}

microsoftTeams.appInitialization.notifySuccess();
microsoftTeams.video.registerForVideoEffect(effectParameterChanged);
microsoftTeams.video.registerForVideoFrame(videoFrameHandler, {
  format: "NV12",
});

// any changes to the UI should notify Teams client.
document.getElementById("enable_check").addEventListener("change", function () {
  if (this.checked) {
    microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged");
  } else {
    microsoftTeams.video.notifySelectedVideoEffectChanged("EffectDisabled");
  }
});
document.getElementById("proportion").addEventListener("change", function () {
  uiSelectedEffect.proportion = this.value;
  microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged");
});
document.getElementById("pixel_value").addEventListener("change", function () {
  uiSelectedEffect.pixelValue = this.value;
  microsoftTeams.video.notifySelectedVideoEffectChanged("EffectChanged");
});
