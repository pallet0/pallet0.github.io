/*-----------------------------------------------------------------------------
class SquarePyramid

          v4
          /\
         /  \
        /    \
       /      \
     v0-------v3
     /|       /|
    v1-------v2

    밑기둥 (v0,v1,v2,v3), 
    (v0,v1,v4), 
    (v3,v2,v4), 
    (v2,v1,v4),
    (v0,v3,v4)

    [(v0,v1,v2), (v0,v2,v3)]
    front [(v0,v1,v4)]
    right [(v3,v2,v4)]
    back [(v2,v1,v4)]
    left [(v0,v3,v4)]

3) Vertex normals
    Each vertex in the same face has the same normal vector (flat shading)
    The normal vector is the same as the face normal vector
    base face: (0,-1,0), front face: (0,0.4472,-0.8944), 
    right face: (0.8944,0.4472,0), back face: (0,0.4472,0.8944), 
    left face: (-0.8944,0.4472,0)

4) Vertex colors
    Each vertex in the same face has the same color (flat shading)
    The color is the same as the face color
    base face: red (1,0,0,1), front face: yellow (1,1,0,1), 
    right face: green (0,1,0,1), back face: cyan (0,1,1,1), 
    left face: blue (0,0,1,1)

5) Vertex texture coordinates
    Each vertex in the same face has the same texture coordinates
    base face: v0(0,0), v1(0,1), v2(1,1), v3(1,0)
    front face: v0(0,0), v1(1,0), v4(0.5,1)
    right face: v3(0,0), v2(1,0), v4(0.5,1)
    back face: v2(0,0), v1(1,0), v4(0.5,1)
    left face: v0(0,0), v3(1,0), v4(0.5,1)

6) Parameters:
    1] gl: WebGLRenderingContext
    2] options:
        1> color: array of 4 floats (default: [0.8, 0.8, 0.8, 1.0 ])
           in this case, all vertices have the same given color

7) Vertex shader: the location (0: position attrib (vec3), 1: normal attrib (vec3),
                            2: color attrib (vec4), and 3: texture coordinate attrib (vec2))
8) Fragment shader: should catch the vertex color from the vertex shader
-----------------------------------------------------------------------------*/

export class squarePyramid {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Initializing data
        this.vertices = new Float32Array([
            // base (v0,v1,v2,v3)
            0.5, 0.0, 0.5,    -0.5, 0.0, 0.5,    -0.5, 0.0, -0.5,    0.5, 0.0, -0.5,
            // front (v0,v1,v4)
            0.5, 0.0, 0.5,    -0.5, 0.0, 0.5,    0.0, 1.0, 0.0,
            // right (v3,v2,v4)
            0.5, 0.0, -0.5,   -0.5, 0.0, -0.5,   0.0, 1.0, 0.0,
            // back (v2,v1,v4)
            -0.5, 0.0, -0.5,  -0.5, 0.0, 0.5,    0.0, 1.0, 0.0,
            // left (v0,v3,v4)
            0.5, 0.0, 0.5,    0.5, 0.0, -0.5,    0.0, 1.0, 0.0
        ]);

        let nUnit = 0.4472; // 1/sqrt(5)

        // Approximate normal vectors for the triangular faces
        // These values ensure the normals are perpendicular to each face
        this.normals = new Float32Array([
            // base(v0,v1,v2,v3)
            0, -1, 0,   0, -1, 0,   0, -1, 0,   0, -1, 0,
            // front (v0,v1,v4)
            0, nUnit, 2*nUnit,   0, nUnit, 2*nUnit,   0, nUnit, 2*nUnit,
            // right (v3,v2,v4)
            2*nUnit, nUnit, 0,   2*nUnit, nUnit, 0,   2*nUnit, nUnit, 0,
            // back (v2,v1,v4)
            0, nUnit, -2*nUnit,   0, nUnit, -2*nUnit,   0, nUnit, -2*nUnit,
            // left (v0,v3,v4)
            -2*nUnit, nUnit, 0,   -2*nUnit, nUnit, 0,   -2*nUnit, nUnit, 0
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            this.colors = new Float32Array(16 * 4); // 16 vertices * 4 (RGBA)
            for (let i = 0; i < 16 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // base face - green
                0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,
                // front face - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // right face - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // back face - magenta
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
                // left face - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1
            ]);
        }

        this.texCoords = new Float32Array([
            // base face (v0,v1,v2,v3)
            0, 0,   0, 1,   1, 1,   1, 0,
            // front face (v0,v1,v4)
            0, 0,   1, 0,   0.5, 1,
            // right face (v3,v2,v4)
            0, 0,   1, 0,   0.5, 1,
            // back face (v2,v1,v4)
            0, 0,   1, 0,   0.5, 1,
            // left face (v0,v3,v4)
            0, 0,   1, 0,   0.5, 1
        ]);

        this.indices = new Uint16Array([
            // base face(square)
            0, 1, 2,   0, 2, 3,
            // front face
            4, 5, 6,
            // right face
            7, 8, 9,
            // back face
            10, 11, 12,
            // left face
            13, 14, 15
        ]);

        this.sameVertices = new Uint16Array([
            0, 4, 13,    // indices of the same vertices as v0
            1, 5, 11,    // indices of the same vertices as v1
            2, 8, 10,    // indices of the same vertices as v2
            3, 7, 14,    // indices of the same vertices as v3
            6, 9, 12, 15 // indices of the same vertices as v4
        ]);

        this.vertexNormals = new Float32Array(48);
        this.faceNormals = new Float32Array(48);
        this.faceNormals.set(this.normals);

        // compute vertex normals (averaging normals of faces that share the vertex)
        this.computeVertexNormals();

        this.initBuffers();
    }

    computeVertexNormals() {
        for (let i = 0; i < this.sameVertices.length; i += 3) {
            let count = 3;
            if (i >= this.sameVertices.length - 4) { 
                // square
                count = 4;
            }
            
            let vn_x = 0, vn_y = 0, vn_z = 0;
            
            // Sum the normal components
            for (let j = 0; j < count; j++) {
                if (i + j < this.sameVertices.length) {
                    let idx = this.sameVertices[i + j];
                    vn_x += this.normals[idx * 3];
                    vn_y += this.normals[idx * 3 + 1];
                    vn_z += this.normals[idx * 3 + 2];
                }
            }
            
            for (let j = 0; j < count; j++) {
                if (i + j < this.sameVertices.length) {
                    let idx = this.sameVertices[i + j];
                    this.vertexNormals[idx * 3] = vn_x;
                    this.vertexNormals[idx * 3 + 1] = vn_y;
                    this.vertexNormals[idx * 3 + 2] = vn_z;
                }
            }
        }
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
        this.updateNormals();
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
        this.updateNormals();
    }

    initBuffers() {
        const gl = this.gl;

        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        
        // normals 데이터만 업데이트
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}