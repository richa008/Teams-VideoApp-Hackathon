class ColorPopFilter extends ImageFilter {
    constructor() {
      super();
    }
  
    getFragmentShader() {
      return `precision highp float;
        varying highp vec2 v_texCoord;
        uniform sampler2D textureY;
        uniform sampler2D textureUV;
        
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
            
          /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */
          float angle = -0.5 * 3.14159265;
          float s = sin(angle), c = cos(angle);
          vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
          float len = length(srcColor.rgb);
          srcColor.rgb = vec3(
            dot(srcColor.rgb, weights.xyz),
            dot(srcColor.rgb, weights.zxy),
            dot(srcColor.rgb, weights.yzx)
          );
            
          /* saturation adjustment */
          float average = (srcColor.r + srcColor.g + srcColor.b) / 3.0;
          if (0. > 0.0) {
            srcColor.rgb += (average - srcColor.rgb) * (1.0 - 1.0 / (1.001 - 0.7));
          } else {
            srcColor.rgb += (average - srcColor.rgb) * (-0.7);
          }
            
          gl_FragColor = vec4(Y(srcColor.rgb), U(srcColor.rgb), V(srcColor.rgb), 1.0);
        }`;
    }
  }
  