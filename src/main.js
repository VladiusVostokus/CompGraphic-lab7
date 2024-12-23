'use strict';

const vsSource = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
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


const loadImage = (name) => new Promise(resolve => {
    const image = new Image();
    image.src = `src/${name}.png`;
    image.addEventListener('load', () => resolve(image));
});

const initializeProgram = (glContext) => {
    const program = glContext.createProgram();
    const vsShader = glContext.createShader(glContext.VERTEX_SHADER);
    glContext.shaderSource(vsShader, vsSource);
    glContext.compileShader(vsShader);
    glContext.attachShader(program, vsShader);

    const fsShader = glContext.createShader(glContext.FRAGMENT_SHADER);
    glContext.shaderSource(fsShader, fsSource);
    glContext.compileShader(fsShader);
    glContext.attachShader(program, fsShader);

    glContext.linkProgram(program);

    return program
};

const setImage = async (glContext, name) => {
    const image = await loadImage(name);
    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGB, glContext.RGB, glContext.UNSIGNED_BYTE, image);
    glContext.generateMipmap(glContext.TEXTURE_2D);
};

const main = async() => {
    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Failde to get context for WebGL");
        return;
    }
    
    const program = initializeProgram(gl);

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
    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');

    const bufferData = new Float32Array([
        -0.5,  0.5,  
        -0.5, -0.5, 
         0.5,  0.5,  
         0.5, -0.5,
    ]);

    const textureBufferData = new Float32Array([
        0, 0,
        0, 1,
        1, 0,
        1, 1,
    ]);

    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

    gl.vertexAttribPointer(aPosition, 2 , gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aTexCoord, 2 , gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    await setImage(gl, 'grass');
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    let isGrass = true;

    canvas.addEventListener('click', async(e) => {
        isGrass = !isGrass;
        let image = '';
        if (isGrass) {
            image = 'grass';
        } else {
            image = 'stone';
        }
        await setImage(gl, image);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
};

window.onload = async() => {
    await main();
};