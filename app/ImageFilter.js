class ImageFilter {

    constructor() {
        this.vertexShader = this.getVertexShader();
        this.fragmentShader = this.getFragmentShader();

        this.initalized = false;

        this.program = null;

        this.positionLocation = null;
        this.texcoordLocation = null;

        this.textureYLocation = null;
        this.textureUVLocation = null;
        this.resolutionLocation = null;

        this.verticeBuffer = null;
        this.indicesBuffer = null;

    }

    getVertexShader() {
        return `
            attribute vec4 position;
            attribute vec2 texCoord;
            
            varying vec2 v_texCoord;  
            
            void main()  
            {            
            gl_Position = position;
            v_texCoord = texCoord; 
            }
        `;
    }

    getFragmentShader() {
        return `
        precision mediump float;

        varying vec2 v_texCoord;

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

        void mainImage(out vec4 fragColor, in vec2 fragCoord)
        {
            vec4 srcColor = vec4(uv12_to_rgb(uv), 1.0);
            fragColor = vec4(Y(srcColor.rgb), U(srcColor.rgb), V(srcColor.rgb), 1.0);
        }

        void main() {
            mainImage(gl_FragColor, v_texCoord);
        } 
       `;
    }

    init() {
        if (!this.initalized) {
            this.initAsset();
            this.initProgram();
            this.initLocation();
            this.initBuffer();

            this.initalized = true;
        }
    }

    initAsset() { };

    initProgram() {
        var vertexShader = getShader(this.vertexShader, gl.VERTEX_SHADER);
        var fragmentShader = getShader(this.fragmentShader, gl.FRAGMENT_SHADER);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
    }

    initLocation() {
        // get attribute
        this.positionLocation = gl.getAttribLocation(this.program, "position");
        this.texcoordLocation = gl.getAttribLocation(this.program, "texCoord");

        // get uniforms
        this.textureYLocation = gl.getUniformLocation(this.program, "textureY");
        this.textureUVLocation = gl.getUniformLocation(this.program, "textureUV");

        this.resolutionLocation = gl.getUniformLocation(this.program, "resolution");

    }

    initBuffer() {
        this.verticeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);

        this.indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    }

    textureBinding(textureYBuffer, textureUVBuffer, canvasWidth, canvasHeight) {
        gl.useProgram(this.program)

        var textureY = gl.createTexture();
        gl.uniform1i(this.textureYLocation, 0)

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, textureY);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, canvasWidth, canvasHeight, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, textureYBuffer);

        var textureUV = gl.createTexture();
        gl.uniform1i(this.textureUVLocation, 1)

        gl.activeTexture(gl.TEXTURE1);

        gl.bindTexture(gl.TEXTURE_2D, textureUV);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, canvasWidth / 2, canvasHeight / 2, 0, gl.LUMINANCE_ALPHA, gl.UNSIGNED_BYTE, textureUVBuffer);
    }

    vertexBinding(vertextBuffer, indiceBuffer) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ]), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indiceBuffer, gl.STATIC_DRAW);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticeBuffer);
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 5 * 4, 0);
        gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.enableVertexAttribArray(this.texcoordLocation);
    }

    uniformBinding(canvasWidth, canvasHeight) {
        gl.uniform2f(this.resolutionLocation, canvasWidth, canvasHeight);
    }

    onDrawFrame(textureYBuffer, textureUVBuffer, vertextBuffer, indiceBuffer, canvasWidth, canvasHeight) {

        this.init();

        gl.useProgram(this.program);

        this.textureBinding(textureYBuffer, textureUVBuffer, canvasWidth, canvasHeight);

        this.uniformBinding(canvasWidth, canvasHeight);

        gl.viewport(0, 0, canvasWidth, canvasHeight);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.vertexBinding(vertextBuffer, indiceBuffer);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

}