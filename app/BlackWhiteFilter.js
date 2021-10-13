class BlackWhiteFilter extends ImageFilter {

    constructor() {
      super();
  
    }
  
    getFragmentShader() {
      return `
        precision mediump float;
        varying vec2                v_texCoord;
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
            //vec3 rgb = vec3(texture2D(textureUV, texCoord).r, texture2D(textureUV, texCoord).g, 0);
            return rgb;
        }
  
        const float strength = 1.0;
  
        vec4 calVignette(vec2 coord, vec4 color, float texture_width, float texture_height) {
            float shade = 0.6;
            float slope = 20.0;
            float range = 1.30 - sqrt(0.8) * 0.7;
            vec2 scale;
            if (texture_width > texture_height) {
                scale.x = 1.0;
                scale.y = texture_height / texture_width;
            } else {
                scale.x = texture_width / texture_height;
                scale.y = 1.0;
            }
            float inv_max_dist = 2.0 / length(scale);
            float dist = length((coord - vec2(0.5, 0.5)) * scale);
            float lumen = shade / (1.0 + exp((dist * inv_max_dist - range) * slope)) + (1.0 - shade);
            return vec4(color.rgb * lumen, color.a);
        }
  
        vec4 calNewVignette(vec2 coord, vec4 color, float texture_width, float texture_height, float value) {
            float shade = 0.85;
            float slope = 20.0;
            float range = 1.30 - sqrt(value) * 0.7;
            vec2 scale;
            if (texture_width > texture_height) {
                scale.x = 1.0;
                scale.y = texture_height / texture_width;
            } else {
                scale.x = texture_width / texture_height;
                scale.y = 1.0;
            }
            float inv_max_dist = 2.0 / length(scale);
            float dist = length((coord - vec2(0.5, 0.5)) * scale);
            float lumen = shade / (1.0 + exp((dist * inv_max_dist - range) * slope)) + (1.0 - shade);
            return vec4(color.rgb * lumen, color.a);
        }
        vec4 calVignette2(vec4 color, vec2 coord, float strength) {
            float distance = (coord.x - 0.5) * (coord.x - 0.5) + (coord.y - 0.5) * (coord.y - 0.5);
            float scale = distance / 0.5 * strength;
            color.r = color.r - scale;
            color.g = color.g - scale;
            color.b = color.b - scale;
            return color;
        }
        vec4 calBrightnessContract(vec4 color, float brightness, float contrast, float threshold) {
            float cv = contrast <= -255.0 ? -1.0 : contrast / 255.0;
            if (contrast > 0.0 && contrast < 255.0) {
                cv = 1.0 / (1.0 - cv) - 1.0;
            }
            float r = color.r + brightness / 255.0;
            float g = color.g + brightness / 255.0;
            float b = color.b + brightness / 255.0;
            if (contrast >= 255.0) {
                r = r >= threshold / 255.0 ? 1.0 : 0.0;
                g = g >= threshold / 255.0 ? 1.0 : 0.0;
                b = b >= threshold / 255.0 ? 1.0 : 0.0;
            } else {
                r = r + (r - threshold / 255.0) * cv;
                g = g + (g - threshold / 255.0) * cv;
                b = b + (b - threshold / 255.0) * cv;
            }
            color.r = r;
            color.g = g;
            color.b = b;
            return color;
        }
        void main() {
            // vec4 sourceColor = texture2D(inputTexture, v_texCoord.xy); 
            vec4 sourceColor = vec4(uv12_to_rgb(v_texCoord.xy), 1);
            vec4 textureColor = sourceColor;
  
            float gray = dot(textureColor.rgb, vec3(0.229, 0.587, 0.114));
            float exposure = gray * 1.33;
            textureColor.r = exposure;
            textureColor.g = exposure;
            textureColor.b = exposure;
            textureColor = calVignette2(textureColor, v_texCoord, 0.5);
            textureColor = calBrightnessContract(textureColor, 0.0, 16.0, 128.0);
  
            vec4 tmp = mix(sourceColor, textureColor, strength);
            gl_FragColor = vec4(Y(tmp.rgb), U(tmp.rgb), V(tmp.rgb), 1);
        } 
        `
    }
  }