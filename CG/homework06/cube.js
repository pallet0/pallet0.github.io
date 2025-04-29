export class Octahedron {
    constructor(gl, options = {}) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // hardcoded vertices for a regular octahedron (edge length = 1)
        this.vertices = new Float32Array([
            // top pyramid (4 faces)
            0, 0.7, 0,    0.7, 0, 0,    0, 0, 0.7,
            0, 0.7, 0,    0, 0, 0.7,   -0.7, 0, 0,
            0, 0.7, 0,   -0.7, 0, 0,    0, 0, -0.7,
            0, 0.7, 0,    0, 0, -0.7,  0.7, 0, 0,
            // bottom pyramid (4 faces)
            0, -0.7, 0,   0, 0, 0.7,    0.7, 0, 0,
            0, -0.7, 0,   -0.7, 0, 0,   0, 0, 0.7,
            0, -0.7, 0,   0, 0, -0.7,   -0.7, 0, 0,
            0, -0.7, 0,   0.7, 0, 0,    0, 0, -0.7
        ]);

        // compute normals per face, flat shading
        const norms = [];
        for (let i = 0; i < this.vertices.length; i += 9) {
            const v0 = [this.vertices[i], this.vertices[i+1], this.vertices[i+2]];
            const v1 = [this.vertices[i+3], this.vertices[i+4], this.vertices[i+5]];
            const v2 = [this.vertices[i+6], this.vertices[i+7], this.vertices[i+8]];
            const e1 = [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]];
            const e2 = [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]];
            let nx = e1[1]*e2[2] - e1[2]*e2[1];
            let ny = e1[2]*e2[0] - e1[0]*e2[2];
            let nz = e1[0]*e2[1] - e1[1]*e2[0];
            const len = Math.hypot(nx, ny, nz);
            nx /= len; ny /= len; nz /= len;
            // each face has 3 identical normals
            for (let k = 0; k < 3; k++) norms.push(nx, ny, nz);
        }
        this.normals = new Float32Array(norms);

        // default flat color or provided
        const nVerts = this.vertices.length / 3;
        this.colors = new Float32Array(nVerts * 4);
        const c = options.color || [0.8, 0.8, 0.8, 1.0];
        for (let i = 0; i < nVerts; i++) {
            this.colors.set(c, i*4);
        }

        // hardcoded UVs for a single 1920x640 image wrapped across all 8 faces continuously
        this.texCoords = new Float32Array([
            // top faces
            0.5,1.0,   0.5,0.5,   0.75,0.5,
            0.5,1.0,   0.75,0.5,  1.0,0.5,
            0.5,1.0,   1.0,0.5,   0.25,0.5,
            0.5,1.0,   0.25,0.5,  0.5,0.5,
            // bottom faces
            0.5,0.0,   0.75,0.5,  0.5,0.5,
            0.5,0.0,   1.0,0.5,   0.75,0.5,
            0.5,0.0,   0.25,0.5,  1.0,0.5,
            0.5,0.0,   0.5,0.5,   0.25,0.5
        ]);

        // indices 0..23
        this.indices = new Uint16Array([...Array(nVerts).keys()]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        gl.bufferData(gl.ARRAY_BUFFER, vSize + nSize + cSize + tSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindVertexArray(null);
    }

    draw(shader) {
        shader.use();
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
