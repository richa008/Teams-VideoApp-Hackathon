class BlackWhiteFilter extends ImageFilter {
  constructor() {
    super();
    this.textureCurveLocation = null;
    this.textureCurve;
  }

  getFragmentShader() {
    return "\
      precision highp float;\
      varying highp vec2 v_texCoord;\
      uniform sampler2D textureCurve;\
      float rand(vec2 co) {\
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\
      }\
      void main() {\
          vec4 color = texture2D(textureCurve, v_texCoord);\
          \
          float diff = (rand(v_texCoord) - 0.5) * 0.5;\
          color.r += diff;\
          color.g += diff;\
          color.b += diff;\
          \
          gl_FragColor = color;\
      }\
  ";
  }

  initAsset() {
    this.textureCurve = getFilterAssets("antique", "textureCurve")[0];
  }

  initLocation() {
    super.initLocation();

    this.textureCurveLocation = gl.getUniformLocation(
      this.program,
      "textureCurve"
    );
  }
}
