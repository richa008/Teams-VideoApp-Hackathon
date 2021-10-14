class SmoothneesFilter extends ImageFilter {
    constructor() {
      super();
    }
  
    getFragmentShader() {
      return `precision highp float;
        varying highp vec2 v_texCoord;
        uniform sampler2D textureY;
        uniform sampler2D textureUV;
        uniform vec2 texSize;
        
        vec3 yuv2r = vec3(1.164, 0.0, 1.596);
        vec3 yuv2g = vec3(1.164, -0.391, -0.813);
        vec3 yuv2b = vec3(1.164, 2.018, 0.0);

        float V(vec3 c) {
          float result = (0.439 * c.r) - (0.368 * c.g) - (0.071 * c.b) + 0.5;
          return result;
        }
          
        float U(vec3 c) {
          float result = -(0.148 * c.r) - (0.291 * c.g) + (0.439 * c.b) + 0.5;
          return result;
        }
          
        float Y(vec3 c)  {
          float result = (0.257 * c.r) + (0.504 * c.g) + (0.098 * c.b) + 0.0625;
          return result;
        }
          
        vec3 uv12_to_rgb(vec2 texCoord){
          vec3 yuv;
          yuv.x = texture2D(textureY, texCoord).r - 0.0625;
          yuv.y = texture2D(textureUV, texCoord).r - 0.5;
          yuv.z = texture2D(textureUV, texCoord).a - 0.5;
          vec3 rgb = vec3(dot(yuv, yuv2r), dot(yuv, yuv2g), dot(yuv, yuv2b));
          return rgb;
        }

        void main() {
          vec2 dx = vec2(1.0 / texSize.x, 0.0);
          vec2 dy = vec2(0.0, 1.0 / texSize.y);
          vec4 srcColor = vec4(uv12_to_rgb(v_texCoord.xy), 1.0);
          float bigTotal = 0.0;
          float smallTotal = 0.0;
          vec3 bigAverage = vec3(0.0);
          vec3 smallAverage = vec3(0.0);
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
                vec3 sample = uv12_to_rgb(v_texCoord.xy + dx * x + dy * y).rgb;
                bigAverage += sample;
                bigTotal += 1.0;
                if (abs(x) + abs(y) < 2.0) {
                    smallAverage += sample;
                    smallTotal += 1.0;
                }
            }
          }
          vec3 edge = max(vec3(0.0), bigAverage / bigTotal - smallAverage / smallTotal);
          vec4 result = vec4(srcColor.rgb - dot(edge, edge) * 0.25 * 100000.0, srcColor.a);
          gl_FragColor = vec4(Y(result.rgb), U(result.rgb), V(result.rgb), 1.0);
        }`;
    }
  }
  