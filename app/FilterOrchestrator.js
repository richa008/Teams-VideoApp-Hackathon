class FilterOrchestrator {

    constructor() {
  
      // filter
      this.filter;
  
      // data
      this.outputFrame;
  
      // effect tracker
    //   this.currentEffect;
      this.currentWidth;
      this.currentHeight;
  
      this.init();
    }
  
    init() {
      if (gl === undefined || canvas === undefined){
        throw "Please first create canvas and gl context."
      }
    }
  
    setPreliminary(imageWidth, imageHeight) {
      this.setCanvas(imageWidth, imageHeight);
      this.setOutputFrame(imageWidth, imageHeight);
      this.setResolution(imageWidth, imageHeight);
      this.setFilter();
    }
  
    setCanvas(imageWidth, imageHeight) {
      if (canvas == undefined){
        throw "Canvas has not been initialized."
      }
      canvas.width = imageWidth;
      canvas.height = imageHeight;
    }
  
    setOutputFrame(imageWidth, imageHeight) {
      if (this.outputFrame === undefined || imageWidth != this.currentWidth || imageHeight != this.currentHeight) {
        this.outputFrame = new Uint8Array(imageWidth * imageHeight * 4);
      }
    }
  
    setResolution(imageWidth, imageHeight) {
      this.currentWidth = imageWidth;
      this.currentHeight = imageHeight;
    }
  
    setFilter() {
      this.filter = new BlackWhiteFilter();  
      // this.currentEffect = effect;
    }
  
    getRGBTransformedFrame(image, imageWidth, imageHeight) {  
      this.setPreliminary(imageWidth, imageHeight);
  
      var vertices = new Float32Array([
        -2, -1, 0,
        -1, 1, 1,
        0, 1, 2
      ])
  
      var indices = new Int16Array([0, 1, 2, 0, 2, 3])
  
      const dataY = new Uint8ClampedArray(image.slice(0,  imageWidth * imageHeight), 0, imageWidth * imageHeight);
      const dataUV = new Uint8ClampedArray(image.slice(imageWidth * imageHeight, image.length), 0, imageWidth / 2 * imageHeight / 2);
  
      this.filter.onDrawFrame(dataY, dataUV, vertices, indices, imageWidth, imageHeight);
      gl.readPixels(0, 0, imageWidth, imageHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.outputFrame); 
    }
  
    dataAligment(nv12Input, imageWidth, imageHeight) { 
      for (let i = 0; i < imageHeight * imageWidth; i += 1) {
        nv12Input[i] = this.outputFrame[4 * i];
      }
  
      var widthIndex = 0;
      var curIndex = 0;
  
      for (let i = imageHeight * imageWidth; i < nv12Input.length; i += 2) {
        //smaple effect just change the value to 100, which effect some pixel value of video frame
  
        nv12Input[i] = this.outputFrame[4 * curIndex + 1];
        nv12Input[i + 1] = this.outputFrame[4 * curIndex + 2];
  
        widthIndex += 2
        curIndex += 2
  
        if (widthIndex > imageWidth) {
          curIndex += imageWidth;
          widthIndex = widthIndex % imageWidth;
        }
      }
    }
  
    processImage(nv12Input, imageWidth, imageHeight){
      this.getRGBTransformedFrame(nv12Input, imageWidth, imageHeight);
      this.dataAligment(nv12Input, imageWidth, imageHeight)
    }
  }