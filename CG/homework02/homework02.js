import { resizeAspectRatio, setupText, createProgram,readShaderFile } from './util.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

setupText(canvas, "Use arrow keys to move the rectangle");

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

canvas.width = 600;
canvas.height = 600;

resizeAspectRatio(gl, canvas);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1.0);

async function main() {
    const vertexShaderSource = await readShaderFile('./vertex.glsl');
    const fragmentShaderSource = await readShaderFile('./fragment.glsl');
    
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    const vertices = new Float32Array([
        -0.1, -0.1, 0.0,  // Bottom left
        0.1, -0.1, 0.0,  // Bottom right
        -0.1, 0.1, 0.0,  // Top left
        0.1, -0.1, 0.0,  // Bottom right
        0.1,  0.1, 0.0,  // Top right
        -0.1, 0.1, 0.0   // Top left
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  
    gl.enableVertexAttribArray(0);

    gl.useProgram(program);

    const uLocation = gl.getUniformLocation(program, 'uTranslation');
    const uColorLocation = gl.getUniformLocation(program, "uColor");

    let dx = 0;
    let dy = 0;


    window.addEventListener("keydown", (event) => {
        const speed = 0.01;
        console.log(dx, dy);
        switch(event.key){
            case 'ArrowLeft':
                if(dx>-0.9){
                    dx -= speed;
                }
                break;
            case 'ArrowRight':
                if(dx<0.9){
                    dx+= speed;
                }
                break;
            case 'ArrowUp':
                if(dy<0.9){
                    dy += speed;
                }
                break;
            case 'ArrowDown':
                if(dy>-0.9){
                    dy -= speed;
                }
                break;
        }
    });

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.uniform2f(uLocation, dx, dy);
        gl.uniform4fv(uColorLocation, [1, 0, 0, 1]);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 6); // 0: first, 3: number of elements

        requestAnimationFrame(render); 
    }

    render();
}

main();