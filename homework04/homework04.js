import { resizeAspectRatio, setupText, updateText, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';

// Global variables
let isInitialized = false; 
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;
let positionBuffer;
let indexBuffer;
let axes = new Axes(gl, 1);
let lastTime = 0;
let animationId;

// Rotation and revolution variables
let sunRotation = 0;
let earthRotation = 0;
let earthRevolution = 0;
let moonRotation = 0;
let moonRevolution = 0;

// mouse 쓸 때 main call 방법
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => { // call main function
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        lastTime = performance.now();
        animate();
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
    
    return true;
}

function setupCanvas() {
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);

    window.addEventListener("resize", render);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.2, 0.3, 1.0);
}

function setupBuffers(shader) {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const squareVertices = new Float32Array([
        -0.5, -0.5, 0.0,  // Bottom-left
        0.5, -0.5, 0.0,   // Bottom-right
        0.5, 0.5, 0.0,    // Top-right
        -0.5, 0.5, 0.0    // Top-left
    ]);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, squareVertices, gl.STATIC_DRAW);

    shader.setAttribPointer('a_position', 3, gl.FLOAT, false, 0, 0);

    const indices = new Uint16Array([
        0, 1, 2, 
        0, 2, 3 
    ]);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    axes.draw(mat4.create(), mat4.create());
    
    shader.use();
    gl.bindVertexArray(vao);
    
    // Sun
    let modelMatrix = mat4.create();
    mat4.rotateZ(modelMatrix, modelMatrix, sunRotation);
    mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 1.0]);
    shader.setMat4('u_model', modelMatrix);
    shader.setVec4('u_color', [1.0, 0.0, 0.0, 1.0]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    
    // Earth
    modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [
        0.7 * Math.cos(earthRevolution),
        0.7 * Math.sin(earthRevolution),
        0.0
    ]);
    mat4.rotateZ(modelMatrix, modelMatrix, earthRotation);
    mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 1.0]);
    shader.setMat4('u_model', modelMatrix);
    shader.setVec4('u_color', [0.0, 1.0, 1.0, 1.0]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    
    // Moon
    modelMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, [
        0.7 * Math.cos(earthRevolution),
        0.7 * Math.sin(earthRevolution),
        0.0
    ]);
    mat4.translate(modelMatrix, modelMatrix, [
        0.2 * Math.cos(moonRevolution),
        0.2 * Math.sin(moonRevolution),
        0.0
    ]);
    mat4.rotateZ(modelMatrix, modelMatrix, moonRotation);
    mat4.scale(modelMatrix, modelMatrix, [0.05, 0.05, 1.0]); // Edge length = 0.05
    shader.setMat4('u_model', modelMatrix);
    shader.setVec4('u_color', [1.0, 1.0, 0.0, 1.0]); // Yellow color
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    
    gl.bindVertexArray(null);
}

function animate() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Rotation Speedss; (degrees per second) * Math.PI / 180
    const sunRotationDelta = 45 * Math.PI / 180;
    const earthRotationDelta = 180 * Math.PI / 180;
    const earthRevolutionDelta = 30 * Math.PI / 180;
    const moonRotationDelta = 180 * Math.PI / 180;
    const moonRevolutionDelta = 360 * Math.PI / 180;

    sunRotation += sunRotationDelta * deltaTime / 1000;
    earthRotation += earthRotationDelta * deltaTime / 1000;
    earthRevolution += earthRevolutionDelta * deltaTime / 1000;
    moonRotation += moonRotationDelta * deltaTime / 1000;
    moonRevolution += moonRevolutionDelta * deltaTime / 1000;
    
    render();
    animationId = requestAnimationFrame(animate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        // 셰이더 초기화
        shader = await initShader();
        
        // 나머지 초기화
        setupCanvas();
        setupBuffers(shader);
        shader.use();
        
        // 초기 렌더링
        render();

        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}