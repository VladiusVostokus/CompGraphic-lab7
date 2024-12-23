'use strict';

const vsSource = `#version 300 es
in vec2 aPosition;
out vec2 aTexCoord;
out vec2 vTexCoord;

void main() {
    gl_Position =  vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}`;

const fsSource = `#version 300 es
precision mediump float;

in vec2 vTexCoord;
out vec4 fragColor;
uniform sampler2D uSampler;

void main() {
    fragColor = texture(uSampler, vTexCoord);
}`;

function main() {
    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Failde to get context for WebGL");
        return;
    }
    const program = gl.createProgram();
    const vsShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsShader, vsSource);
    gl.compileShader(vsShader);
    gl.attachShader(program, vsShader);

    const fsShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsShader, fsSource);
    gl.compileShader(fsShader);
    gl.attachShader(program, fsShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vsShader));
        console.log(gl.getShaderInfoLog(fsShader));
    }

    gl.clearColor(0.5, 0.2, 0.6, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);

    const aPosition = gl.getAttribLocation(program, 'aPosition');

    const bufferData = new Float32Array([
        -0.5,  0.5,  
        -0.5, -0.5, 
         0.5,  0.5,  
         0.5, -0.5,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPosition, 2 , gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

window.onload = () => {
    main()
}
