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
          vec4 srcColor = vec4(uv12_to_rgb(v_texCoord.xy), 1.0);
          vec4 color = srcColor;
          float total = 0.0;
          for (float x = -4.0; x <= 4.0; x += 1.0) {
            for (float y = -4.0; y <= 4.0; y += 1.0) {
                vec4 sample = texture2D(texture, texCoord + vec2(x, y) / texSize);
                float weight = 1.0 - abs(dot(sample.rgb - srcColor.rgb, vec3(0.25)));\
                weight = pow(weight, 15.0);
                color += sample * weight;
                total += weight;
            }
          }
          vec4 result = color / total;
          gl_FragColor = vec4(Y(result.rgb), U(result.rgb), V(result.rgb), 1.0);
        }`;
    }
  }
  