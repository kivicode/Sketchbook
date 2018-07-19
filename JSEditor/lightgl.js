/*
 * lightgl.js
 * http://github.com/evanw/lightgl.js/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */
var GL = function() {
    function F(b) {
        return {
            8: "BACKSPACE",
            9: "TAB",
            13: "ENTER",
            16: "SHIFT",
            27: "ESCAPE",
            32: "SPACE",
            37: "LEFT",
            38: "UP",
            39: "RIGHT",
            40: "DOWN"
        }[b] || (65 <= b && 90 >= b ? String.fromCharCode(b) : null)
    }

    function k() {
        var b = Array.prototype.concat.apply([], arguments);
        b.length || (b = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.m = G ? new Float32Array(b) : b
    }

    function t() {
        this.unique = [];
        this.indices = [];
        this.map = {}
    }

    function v(b, c) {
        this.buffer = null;
        this.target = b;
        this.type = c;
        this.data = []
    }

    function o(b) {
        b = b || {};
        this.vertexBuffers = {};
        this.indexBuffers = {};
        this.addVertexBuffer("vertices", "gl_Vertex");
        b.coords && this.addVertexBuffer("coords", "gl_TexCoord");
        b.normals && this.addVertexBuffer("normals", "gl_Normal");
        b.colors && this.addVertexBuffer("colors", "gl_Color");
        (!("triangles" in b) || b.triangles) && this.addIndexBuffer("triangles");
        b.lines && this.addIndexBuffer("lines")
    }

    function H(b) {
        return new j(2 * (b & 1) - 1, (b & 2) - 1, (b & 4) / 2 - 1)
    }

    function u(b, c, a) {
        this.t = arguments.length ? b : Number.MAX_VALUE;
        this.hit = c;
        this.normal = a
    }

    function r() {
        var b = d.getParameter(d.VIEWPORT),
            c = d.modelviewMatrix.m,
            a = new j(c[0], c[4], c[8]),
            e = new j(c[1], c[5], c[9]),
            f = new j(c[2], c[6], c[10]),
            c = new j(c[3], c[7], c[11]);
        this.eye = new j(-c.dot(a), -c.dot(e), -c.dot(f));
        a = b[0];
        e = a + b[2];
        f = b[1];
        c = f + b[3];
        this.ray00 = d.unProject(a, f, 1).subtract(this.eye);
        this.ray10 = d.unProject(e, f, 1).subtract(this.eye);
        this.ray01 = d.unProject(a, c, 1).subtract(this.eye);
        this.ray11 = d.unProject(e, c, 1).subtract(this.eye);
        this.viewport = b
    }

    function w(b, c, a) {
        for (; null != (result = b.exec(c));) a(result)
    }

    function E(b, c) {
        function a(a) {
            var b =
                document.getElementById(a);
            return b ? b.text : a
        }

        function e(a, b) {
            var c = {},
                d = /^((\s*\/\/.*\n|\s*#extension.*\n)+)[^]*$/.exec(b),
                b = d ? d[1] + a + b.substr(d[1].length) : a + b;
            w(/\bgl_\w+\b/g, a, function(a) {
                a in c || (b = b.replace(RegExp("\\b" + a + "\\b", "g"), "_" + a), c[a] = !0)
            });
            return b
        }

        function f(a, b) {
            var c = d.createShader(a);
            d.shaderSource(c, b);
            d.compileShader(c);
            if (!d.getShaderParameter(c, d.COMPILE_STATUS)) throw "compile error: " + d.getShaderInfoLog(c);
            return c
        }
        var b = a(b),
            c = a(c),
            i = b + c,
            h = {};
        w(/\b(gl_[^;]*)\b;/g, "uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;",
            function(a) {
                a = a[1];
                if (-1 != i.indexOf(a)) {
                    var b = a.replace(/[a-z_]/g, "");
                    h[b] = "_" + a
                }
            }); - 1 != i.indexOf("ftransform") && (h.MVPM = "_gl_ModelViewProjectionMatrix");
        this.usedMatrices = h;
        b = e("uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;attribute vec4 gl_Vertex;attribute vec4 gl_TexCoord;attribute vec3 gl_Normal;attribute vec4 gl_Color;vec4 ftransform(){return gl_ModelViewProjectionMatrix*gl_Vertex;}",
            b);
        c = e("precision highp float;uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;", c);
        this.program = d.createProgram();
        d.attachShader(this.program, f(d.VERTEX_SHADER, b));
        d.attachShader(this.program, f(d.FRAGMENT_SHADER, c));
        d.linkProgram(this.program);
        if (!d.getProgramParameter(this.program,
                d.LINK_STATUS)) throw "link error: " + d.getProgramInfoLog(this.program);
        this.attributes = {};
        this.uniformLocations = {};
        var g = {};
        w(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, b + c, function(a) {
            g[a[2]] = 1
        });
        this.isSampler = g
    }

    function q(b, c, a) {
        a = a || {};
        this.id = d.createTexture();
        this.width = b;
        this.height = c;
        this.format = a.format || d.RGBA;
        this.type = a.type || d.UNSIGNED_BYTE;
        d.bindTexture(d.TEXTURE_2D, this.id);
        d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL, 1);
        d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, a.filter || a.magFilter ||
            d.LINEAR);
        d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, a.filter || a.minFilter || d.LINEAR);
        d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_S, a.wrap || a.wrapS || d.CLAMP_TO_EDGE);
        d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_T, a.wrap || a.wrapT || d.CLAMP_TO_EDGE);
        d.texImage2D(d.TEXTURE_2D, 0, this.format, b, c, 0, this.format, this.type, null)
    }

    function j(b, c, a) {
        this.x = b || 0;
        this.y = c || 0;
        this.z = a || 0
    }
    var d, s = {
        create: function(b) {
            var b = b || {},
                c = document.createElement("canvas");
            c.width = 800;
            c.height = 600;
            "alpha" in b || (b.alpha = !1);
            try {
                d = c.getContext("webgl", b)
            } catch (a) {}
            try {
                d = d || c.getContext("experimental-webgl", b)
            } catch (e) {}
            if (!d) throw "WebGL not supported";
            d.MODELVIEW = I | 1;
            d.PROJECTION = I | 2;
            var f = new k,
                i = new k;
            d.modelviewMatrix = new k;
            d.projectionMatrix = new k;
            var h = [],
                g = [],
                n, m;
            d.matrixMode = function(a) {
                switch (a) {
                    case d.MODELVIEW:
                        n = "modelviewMatrix";
                        m = h;
                        break;
                    case d.PROJECTION:
                        n = "projectionMatrix";
                        m = g;
                        break;
                    default:
                        throw "invalid matrix mode " + a;
                }
            };
            d.loadIdentity = function() {
                k.identity(d[n])
            };
            d.loadMatrix = function(a) {
                for (var a =
                        a.m, b = d[n].m, c = 0; c < 16; c++) b[c] = a[c]
            };
            d.multMatrix = function(a) {
                d.loadMatrix(k.multiply(d[n], a, i))
            };
            d.perspective = function(a, b, c, e) {
                d.multMatrix(k.perspective(a, b, c, e, f))
            };
            d.frustum = function(a, b, c, e, g, i) {
                d.multMatrix(k.frustum(a, b, c, e, g, i, f))
            };
            d.ortho = function(a, b, c, e, g, i) {
                d.multMatrix(k.ortho(a, b, c, e, g, i, f))
            };
            d.scale = function(a, b, c) {
                d.multMatrix(k.scale(a, b, c, f))
            };
            d.translate = function(a, b, c) {
                d.multMatrix(k.translate(a, b, c, f))
            };
            d.rotate = function(a, b, c, e) {
                d.multMatrix(k.rotate(a, b, c, e, f))
            };
            d.lookAt =
                function(a, b, c, e, g, i, h, j, l) {
                    d.multMatrix(k.lookAt(a, b, c, e, g, i, h, j, l, f))
                };
            d.pushMatrix = function() {
                m.push(Array.prototype.slice.call(d[n].m))
            };
            d.popMatrix = function() {
                var a = m.pop();
                d[n].m = G ? new Float32Array(a) : a
            };
            d.project = function(a, b, c, e, f, g) {
                e = e || d.modelviewMatrix;
                f = f || d.projectionMatrix;
                g = g || d.getParameter(d.VIEWPORT);
                a = f.transformPoint(e.transformPoint(new j(a, b, c)));
                return new j(g[0] + g[2] * (a.x * 0.5 + 0.5), g[1] + g[3] * (a.y * 0.5 + 0.5), a.z * 0.5 + 0.5)
            };
            d.unProject = function(a, b, c, e, g, h) {
                e = e || d.modelviewMatrix;
                g = g || d.projectionMatrix;
                h = h || d.getParameter(d.VIEWPORT);
                a = new j((a - h[0]) / h[2] * 2 - 1, (b - h[1]) / h[3] * 2 - 1, c * 2 - 1);
                return k.inverse(k.multiply(g, e, f), i).transformPoint(a)
            };
            d.matrixMode(d.MODELVIEW);
            var l = new o({
                    coords: !0,
                    colors: !0,
                    triangles: !1
                }),
                y = -1,
                p = [0, 0, 0, 0],
                q = [1, 1, 1, 1],
                u = new E("uniform float pointSize;varying vec4 color;varying vec4 coord;void main(){color=gl_Color;coord=gl_TexCoord;gl_Position=gl_ModelViewProjectionMatrix*gl_Vertex;gl_PointSize=pointSize;}",
                    "uniform sampler2D texture;uniform float pointSize;uniform bool useTexture;varying vec4 color;varying vec4 coord;void main(){gl_FragColor=color;if(useTexture)gl_FragColor*=texture2D(texture,coord.xy);}");
            d.pointSize = function(a) {
                u.uniforms({
                    pointSize: a
                })
            };
            d.begin = function(a) {
                if (y != -1) throw "mismatched gl.begin() and gl.end() calls";
                y = a;
                l.colors = [];
                l.coords = [];
                l.vertices = []
            };
            d.color = function(a, b, c, e) {
                q = arguments.length == 1 ? a.toArray().concat(1) : [a, b, c, e || 1]
            };
            d.texCoord = function(a, b) {
                p = arguments.length == 1 ? a.toArray(2) : [a, b]
            };
            d.vertex = function(a, b, c) {
                l.colors.push(q);
                l.coords.push(p);
                l.vertices.push(arguments.length == 1 ? a.toArray() : [a, b, c])
            };
            d.end = function() {
                if (y == -1) throw "mismatched gl.begin() and gl.end() calls";
                l.compile();
                u.uniforms({
                    useTexture: !!d.getParameter(d.TEXTURE_BINDING_2D)
                }).draw(l, y);
                y = -1
            };
            var r = function() {
                    for (var a in x)
                        if (B.call(x, a) && x[a]) return true;
                    return false
                },
                s = function(a) {
                    var b = {},
                        c;
                    for (c in a) b[c] = typeof a[c] == "function" ?
                        function(b) {
                            return function() {
                                b.apply(a, arguments)
                            }
                        }(a[c]) : a[c];
                    b.original = a;
                    b.x = b.pageX;
                    b.y = b.pageY;
                    for (c = d.canvas; c; c = c.offsetParent) {
                        b.x = b.x - c.offsetLeft;
                        b.y = b.y - c.offsetTop
                    }
                    if (D) {
                        b.deltaX = b.x - v;
                        b.deltaY = b.y - w
                    } else {
                        b.deltaX = 0;
                        b.deltaY = 0;
                        D = true
                    }
                    v = b.x;
                    w = b.y;
                    b.dragging = r();
                    b.preventDefault = function() {
                        b.original.preventDefault()
                    };
                    b.stopPropagation = function() {
                        b.original.stopPropagation()
                    };
                    return b
                },
                z = function(a) {
                    d = t;
                    a = s(a);
                    if (d.onmousemove) d.onmousemove(a);
                    a.preventDefault()
                },
                za = function(a) {
                    d = t;
                    a = s(a);
                    d.onwheel(a);
                    a.preventDefault()
                },
                A = function(a) {
                    d = t;
                    x[a.which] =
                        false;
                    if (!r()) {
                        document.removeEventListener("mousemove", z);
                        document.removeEventListener("mouseup", A);
                        document.removeEventListener("wheel", za);
                        d.canvas.addEventListener("mousemove", z);
                        d.canvas.addEventListener("wheel", za);
                        d.canvas.addEventListener("mouseup", A)
                    }
                    a = s(a);
                    if (d.onmouseup) d.onmouseup(a);
                    a.preventDefault()
                },
                b = function() {
                    D = false
                },
                t = d,
                v = 0,
                w = 0,
                x = {},
                D = !1,
                B = Object.prototype.hasOwnProperty;
            d.canvas.addEventListener("mousedown", function(a) {
                d = t;
                if (!r()) {
                    document.addEventListener("mousemove", z);
                    document.addEventListener("mouseup", A);
                    d.canvas.removeEventListener("mousemove", z);
                    d.canvas.removeEventListener("mouseup", A)
                }
                x[a.which] = true;
                a = s(a);
                if (d.onmousedown) d.onmousedown(a);
                a.preventDefault()
            });
            d.canvas.addEventListener("mousemove", z);
            d.canvas.addEventListener("mouseup", A);
            d.canvas.addEventListener("mouseover", b);
            d.canvas.addEventListener("mouseout", b);
            d.canvas.addEventListener("wheel", za);
            document.addEventListener("contextmenu", function() {
                x = {};
                D = false
            });
            var C = d;
            d.makeCurrent = function() {
                d = C
            };
            d.animate = function() {
                function a() {
                    d = e;
                    var f = (new Date).getTime();
                    if (d.onupdate) d.onupdate((f - c) / 1E3);
                    if (d.ondraw) d.ondraw();
                    b(a);
                    c = f
                }
                var b = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(a) {
                        setTimeout(a, 1E3 / 60)
                    },
                    c = (new Date).getTime(),
                    e = d;
                a()
            };
            d.fullscreen = function(a) {
                function b() {
                    d.canvas.width = window.innerWidth - e - f;
                    d.canvas.height = window.innerHeight - c - g;
                    d.viewport(0, 0, d.canvas.width, d.canvas.height);
                    if (a.camera || !("camera" in a)) {
                        d.matrixMode(d.PROJECTION);
                        d.loadIdentity();
                        d.perspective(a.fov || 45, d.canvas.width / d.canvas.height, a.near || 0.1, a.far || 1E3);
                        d.matrixMode(d.MODELVIEW)
                    }
                    if (d.ondraw) d.ondraw()
                }
                var a = a || {},
                    c = a.paddingTop || 0,
                    e = a.paddingLeft || 0,
                    f = a.paddingRight || 0,
                    g = a.paddingBottom || 0;
                if (!document.body) throw "document.body doesn't exist yet (call gl.fullscreen() from window.onload() or from inside the <body> tag)";
                document.body.appendChild(d.canvas);
                document.body.style.overflow = "hidden";
                d.canvas.style.position = "absolute";
                d.canvas.style.left = e + "px";
                d.canvas.style.top = c + "px";
                window.addEventListener("resize", b);
                b()
            };
            return d
        },
        keys: {},
        Matrix: k,
        Indexer: t,
        Buffer: v,
        Mesh: o,
        HitTest: u,
        Raytracer: r,
        Shader: E,
        Texture: q,
        Vector: j
    };
    document.addEventListener("keydown", function(b) {
        if (!b.altKey && !b.ctrlKey && !b.metaKey) {
            var c = F(b.keyCode);
            c && (s.keys[c] = !0);
            s.keys[b.keyCode] = !0
        }
    });

    // document.addEventListener("wheel", function(b) {
    //    alert(b)
    // });

    document.addEventListener("keyup", function(b) {
        if (!b.altKey && !b.ctrlKey && !b.metaKey) {
            var c = F(b.keyCode);
            c && (s.keys[c] = !1);
            s.keys[b.keyCode] = !1
        }
    });
    var I = 305397760,
        G = "undefined" != typeof Float32Array;
    k.prototype = {
        inverse: function() {
            return k.inverse(this, new k)
        },
        transpose: function() {
            return k.transpose(this, new k)
        },
        multiply: function(b) {
            return k.multiply(this,
                b, new k)
        },
        transformPoint: function(b) {
            var c = this.m;
            return (new j(c[0] * b.x + c[1] * b.y + c[2] * b.z + c[3], c[4] * b.x + c[5] * b.y + c[6] * b.z + c[7], c[8] * b.x + c[9] * b.y + c[10] * b.z + c[11])).divide(c[12] * b.x + c[13] * b.y + c[14] * b.z + c[15])
        },
        transformVector: function(b) {
            var c = this.m;
            return new j(c[0] * b.x + c[1] * b.y + c[2] * b.z, c[4] * b.x + c[5] * b.y + c[6] * b.z, c[8] * b.x + c[9] * b.y + c[10] * b.z)
        }
    };
    k.inverse = function(b, c) {
        var c = c || new k,
            a = b.m,
            e = c.m;
        e[0] = a[5] * a[10] * a[15] - a[5] * a[14] * a[11] - a[6] * a[9] * a[15] + a[6] * a[13] * a[11] + a[7] * a[9] * a[14] - a[7] * a[13] * a[10];
        e[1] = -a[1] * a[10] * a[15] + a[1] * a[14] * a[11] + a[2] * a[9] * a[15] - a[2] * a[13] * a[11] - a[3] * a[9] * a[14] + a[3] * a[13] * a[10];
        e[2] = a[1] * a[6] * a[15] - a[1] * a[14] * a[7] - a[2] * a[5] * a[15] + a[2] * a[13] * a[7] + a[3] * a[5] * a[14] - a[3] * a[13] * a[6];
        e[3] = -a[1] * a[6] * a[11] + a[1] * a[10] * a[7] + a[2] * a[5] * a[11] - a[2] * a[9] * a[7] - a[3] * a[5] * a[10] + a[3] * a[9] * a[6];
        e[4] = -a[4] * a[10] * a[15] + a[4] * a[14] * a[11] + a[6] * a[8] * a[15] - a[6] * a[12] * a[11] - a[7] * a[8] * a[14] + a[7] * a[12] * a[10];
        e[5] = a[0] * a[10] * a[15] - a[0] * a[14] * a[11] - a[2] * a[8] * a[15] + a[2] * a[12] * a[11] + a[3] * a[8] * a[14] -
            a[3] * a[12] * a[10];
        e[6] = -a[0] * a[6] * a[15] + a[0] * a[14] * a[7] + a[2] * a[4] * a[15] - a[2] * a[12] * a[7] - a[3] * a[4] * a[14] + a[3] * a[12] * a[6];
        e[7] = a[0] * a[6] * a[11] - a[0] * a[10] * a[7] - a[2] * a[4] * a[11] + a[2] * a[8] * a[7] + a[3] * a[4] * a[10] - a[3] * a[8] * a[6];
        e[8] = a[4] * a[9] * a[15] - a[4] * a[13] * a[11] - a[5] * a[8] * a[15] + a[5] * a[12] * a[11] + a[7] * a[8] * a[13] - a[7] * a[12] * a[9];
        e[9] = -a[0] * a[9] * a[15] + a[0] * a[13] * a[11] + a[1] * a[8] * a[15] - a[1] * a[12] * a[11] - a[3] * a[8] * a[13] + a[3] * a[12] * a[9];
        e[10] = a[0] * a[5] * a[15] - a[0] * a[13] * a[7] - a[1] * a[4] * a[15] + a[1] * a[12] * a[7] + a[3] * a[4] *
            a[13] - a[3] * a[12] * a[5];
        e[11] = -a[0] * a[5] * a[11] + a[0] * a[9] * a[7] + a[1] * a[4] * a[11] - a[1] * a[8] * a[7] - a[3] * a[4] * a[9] + a[3] * a[8] * a[5];
        e[12] = -a[4] * a[9] * a[14] + a[4] * a[13] * a[10] + a[5] * a[8] * a[14] - a[5] * a[12] * a[10] - a[6] * a[8] * a[13] + a[6] * a[12] * a[9];
        e[13] = a[0] * a[9] * a[14] - a[0] * a[13] * a[10] - a[1] * a[8] * a[14] + a[1] * a[12] * a[10] + a[2] * a[8] * a[13] - a[2] * a[12] * a[9];
        e[14] = -a[0] * a[5] * a[14] + a[0] * a[13] * a[6] + a[1] * a[4] * a[14] - a[1] * a[12] * a[6] - a[2] * a[4] * a[13] + a[2] * a[12] * a[5];
        e[15] = a[0] * a[5] * a[10] - a[0] * a[9] * a[6] - a[1] * a[4] * a[10] + a[1] * a[8] * a[6] +
            a[2] * a[4] * a[9] - a[2] * a[8] * a[5];
        for (var a = a[0] * e[0] + a[1] * e[4] + a[2] * e[8] + a[3] * e[12], d = 0; 16 > d; d++) e[d] /= a;
        return c
    };
    k.transpose = function(b, c) {
        var c = c || new k,
            a = b.m,
            e = c.m;
        e[0] = a[0];
        e[1] = a[4];
        e[2] = a[8];
        e[3] = a[12];
        e[4] = a[1];
        e[5] = a[5];
        e[6] = a[9];
        e[7] = a[13];
        e[8] = a[2];
        e[9] = a[6];
        e[10] = a[10];
        e[11] = a[14];
        e[12] = a[3];
        e[13] = a[7];
        e[14] = a[11];
        e[15] = a[15];
        return c
    };
    k.multiply = function(b, c, a) {
        var a = a || new k,
            b = b.m,
            c = c.m,
            e = a.m;
        e[0] = b[0] * c[0] + b[1] * c[4] + b[2] * c[8] + b[3] * c[12];
        e[1] = b[0] * c[1] + b[1] * c[5] + b[2] * c[9] + b[3] * c[13];
        e[2] =
            b[0] * c[2] + b[1] * c[6] + b[2] * c[10] + b[3] * c[14];
        e[3] = b[0] * c[3] + b[1] * c[7] + b[2] * c[11] + b[3] * c[15];
        e[4] = b[4] * c[0] + b[5] * c[4] + b[6] * c[8] + b[7] * c[12];
        e[5] = b[4] * c[1] + b[5] * c[5] + b[6] * c[9] + b[7] * c[13];
        e[6] = b[4] * c[2] + b[5] * c[6] + b[6] * c[10] + b[7] * c[14];
        e[7] = b[4] * c[3] + b[5] * c[7] + b[6] * c[11] + b[7] * c[15];
        e[8] = b[8] * c[0] + b[9] * c[4] + b[10] * c[8] + b[11] * c[12];
        e[9] = b[8] * c[1] + b[9] * c[5] + b[10] * c[9] + b[11] * c[13];
        e[10] = b[8] * c[2] + b[9] * c[6] + b[10] * c[10] + b[11] * c[14];
        e[11] = b[8] * c[3] + b[9] * c[7] + b[10] * c[11] + b[11] * c[15];
        e[12] = b[12] * c[0] + b[13] * c[4] + b[14] *
            c[8] + b[15] * c[12];
        e[13] = b[12] * c[1] + b[13] * c[5] + b[14] * c[9] + b[15] * c[13];
        e[14] = b[12] * c[2] + b[13] * c[6] + b[14] * c[10] + b[15] * c[14];
        e[15] = b[12] * c[3] + b[13] * c[7] + b[14] * c[11] + b[15] * c[15];
        return a
    };
    k.identity = function(b) {
        var b = b || new k,
            c = b.m;
        c[0] = c[5] = c[10] = c[15] = 1;
        c[1] = c[2] = c[3] = c[4] = c[6] = c[7] = c[8] = c[9] = c[11] = c[12] = c[13] = c[14] = 0;
        return b
    };
    k.perspective = function(b, c, a, e, d) {
        b = Math.tan(b * Math.PI / 360) * a;
        c *= b;
        return k.frustum(-c, c, -b, b, a, e, d)
    };
    k.frustum = function(b, c, a, e, d, i, h) {
        var h = h || new k,
            g = h.m;
        g[0] = 2 * d / (c - b);
        g[1] =
            0;
        g[2] = (c + b) / (c - b);
        g[3] = 0;
        g[4] = 0;
        g[5] = 2 * d / (e - a);
        g[6] = (e + a) / (e - a);
        g[7] = 0;
        g[8] = 0;
        g[9] = 0;
        g[10] = -(i + d) / (i - d);
        g[11] = -2 * i * d / (i - d);
        g[12] = 0;
        g[13] = 0;
        g[14] = -1;
        g[15] = 0;
        return h
    };
    k.ortho = function(b, c, a, e, d, i, h) {
        var h = h || new k,
            g = h.m;
        g[0] = 2 / (c - b);
        g[1] = 0;
        g[2] = 0;
        g[3] = -(c + b) / (c - b);
        g[4] = 0;
        g[5] = 2 / (e - a);
        g[6] = 0;
        g[7] = -(e + a) / (e - a);
        g[8] = 0;
        g[9] = 0;
        g[10] = -2 / (i - d);
        g[11] = -(i + d) / (i - d);
        g[12] = 0;
        g[13] = 0;
        g[14] = 0;
        g[15] = 1;
        return h
    };
    k.scale = function(b, c, a, d) {
        var d = d || new k,
            f = d.m;
        f[0] = b;
        f[1] = 0;
        f[2] = 0;
        f[3] = 0;
        f[4] = 0;
        f[5] = c;
        f[6] = 0;
        f[7] =
            0;
        f[8] = 0;
        f[9] = 0;
        f[10] = a;
        f[11] = 0;
        f[12] = 0;
        f[13] = 0;
        f[14] = 0;
        f[15] = 1;
        return d
    };
    k.translate = function(b, c, a, d) {
        var d = d || new k,
            f = d.m;
        f[0] = 1;
        f[1] = 0;
        f[2] = 0;
        f[3] = b;
        f[4] = 0;
        f[5] = 1;
        f[6] = 0;
        f[7] = c;
        f[8] = 0;
        f[9] = 0;
        f[10] = 1;
        f[11] = a;
        f[12] = 0;
        f[13] = 0;
        f[14] = 0;
        f[15] = 1;
        return d
    };
    k.rotate = function(b, c, a, d, f) {
        if (!b || !c && !a && !d) return k.identity(f);
        var f = f || new k,
            i = f.m,
            h = Math.sqrt(c * c + a * a + d * d),
            b = b * (Math.PI / 180),
            c = c / h,
            a = a / h,
            d = d / h,
            h = Math.cos(b),
            b = Math.sin(b),
            g = 1 - h;
        i[0] = c * c * g + h;
        i[1] = c * a * g - d * b;
        i[2] = c * d * g + a * b;
        i[3] = 0;
        i[4] = a * c * g + d * b;
        i[5] = a * a * g + h;
        i[6] = a * d * g - c * b;
        i[7] = 0;
        i[8] = d * c * g - a * b;
        i[9] = d * a * g + c * b;
        i[10] = d * d * g + h;
        i[11] = 0;
        i[12] = 0;
        i[13] = 0;
        i[14] = 0;
        i[15] = 1;
        return f
    };
    k.lookAt = function(b, c, a, d, f, i, h, g, n, m) {
        var m = m || new k,
            l = m.m,
            b = new j(b, c, a),
            d = new j(d, f, i),
            g = new j(h, g, n),
            h = b.subtract(d).unit(),
            g = g.cross(h).unit(),
            n = h.cross(g).unit();
        l[0] = g.x;
        l[1] = g.y;
        l[2] = g.z;
        l[3] = -g.dot(b);
        l[4] = n.x;
        l[5] = n.y;
        l[6] = n.z;
        l[7] = -n.dot(b);
        l[8] = h.x;
        l[9] = h.y;
        l[10] = h.z;
        l[11] = -h.dot(b);
        l[12] = 0;
        l[13] = 0;
        l[14] = 0;
        l[15] = 1;
        return m
    };
    t.prototype = {
        add: function(b) {
            var c =
                JSON.stringify(b);
            c in this.map || (this.map[c] = this.unique.length, this.unique.push(b));
            return this.map[c]
        }
    };
    v.prototype = {
        compile: function(b) {
            for (var c = [], a = 0; a < this.data.length; a += 1E4) c = Array.prototype.concat.apply(c, this.data.slice(a, a + 1E4));
            a = this.data.length ? c.length / this.data.length : 0;
            if (a != Math.round(a)) throw "buffer elements not of consistent size, average size is " + a;
            this.buffer = this.buffer || d.createBuffer();
            this.buffer.length = c.length;
            this.buffer.spacing = a;
            d.bindBuffer(this.target, this.buffer);
            d.bufferData(this.target, new this.type(c), b || d.STATIC_DRAW)
        }
    };
    o.prototype = {
        addVertexBuffer: function(b, c) {
            (this.vertexBuffers[c] = new v(d.ARRAY_BUFFER, Float32Array)).name = b;
            this[b] = []
        },
        addIndexBuffer: function(b) {
            this.indexBuffers[b] = new v(d.ELEMENT_ARRAY_BUFFER, Uint16Array);
            this[b] = []
        },
        compile: function() {
            for (var b in this.vertexBuffers) {
                var c = this.vertexBuffers[b];
                c.data = this[c.name];
                c.compile()
            }
            for (var a in this.indexBuffers) c = this.indexBuffers[a], c.data = this[a], c.compile()
        },
        transform: function(b) {
            this.vertices =
                this.vertices.map(function(a) {
                    return b.transformPoint(j.fromArray(a)).toArray()
                });
            if (this.normals) {
                var c = b.inverse().transpose();
                this.normals = this.normals.map(function(a) {
                    return c.transformVector(j.fromArray(a)).unit().toArray()
                })
            }
            this.compile();
            return this
        },
        computeNormals: function() {
            this.normals || this.addVertexBuffer("normals", "gl_Normal");
            for (var b = 0; b < this.vertices.length; b++) this.normals[b] = new j;
            for (b = 0; b < this.triangles.length; b++) {
                var c = this.triangles[b],
                    a = j.fromArray(this.vertices[c[0]]),
                    d =
                    j.fromArray(this.vertices[c[1]]),
                    f = j.fromArray(this.vertices[c[2]]),
                    a = d.subtract(a).cross(f.subtract(a)).unit();
                this.normals[c[0]] = this.normals[c[0]].add(a);
                this.normals[c[1]] = this.normals[c[1]].add(a);
                this.normals[c[2]] = this.normals[c[2]].add(a)
            }
            for (b = 0; b < this.vertices.length; b++) this.normals[b] = this.normals[b].unit().toArray();
            this.compile();
            return this
        },
        computeWireframe: function() {
            for (var b = new t, c = 0; c < this.triangles.length; c++)
                for (var a = this.triangles[c], d = 0; d < a.length; d++) {
                    var f = a[d],
                        i = a[(d +
                            1) % a.length];
                    b.add([Math.min(f, i), Math.max(f, i)])
                }
            this.lines || this.addIndexBuffer("lines");
            this.lines = b.unique;
            this.compile();
            return this
        },
        getAABB: function() {
            var b = {
                min: new j(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE)
            };
            b.max = b.min.negative();
            for (var c = 0; c < this.vertices.length; c++) {
                var a = j.fromArray(this.vertices[c]);
                b.min = j.min(b.min, a);
                b.max = j.max(b.max, a)
            }
            return b
        },
        getBoundingSphere: function() {
            for (var b = this.getAABB(), b = {
                    center: b.min.add(b.max).divide(2),
                    radius: 0
                }, c = 0; c < this.vertices.length; c++) b.radius =
                Math.max(b.radius, j.fromArray(this.vertices[c]).subtract(b.center).length());
            return b
        }
    };
    o.plane = function(b) {
        var b = b || {},
            c = new o(b);
        detailX = b.detailX || b.detail || 1;
        detailY = b.detailY || b.detail || 1;
        for (b = 0; b <= detailY; b++)
            for (var a = b / detailY, d = 0; d <= detailX; d++) {
                var f = d / detailX;
                c.vertices.push([2 * f - 1, 2 * a - 1, 0]);
                c.coords && c.coords.push([f, a]);
                c.normals && c.normals.push([0, 0, 1]);
                d < detailX && b < detailY && (f = d + b * (detailX + 1), c.triangles.push([f, f + 1, f + detailX + 1]), c.triangles.push([f + detailX + 1, f + 1, f + detailX + 2]))
            }
        c.compile();
        return c
    };
    var J = [
        [0, 4, 2, 6, -1, 0, 0],
        [1, 3, 5, 7, 1, 0, 0],
        [0, 1, 4, 5, 0, -1, 0],
        [2, 6, 3, 7, 0, 1, 0],
        [0, 2, 1, 3, 0, 0, -1],
        [4, 5, 6, 7, 0, 0, 1]
    ];
    o.cube = function(b) {
        for (var b = new o(b), c = 0; c < J.length; c++) {
            for (var a = J[c], d = 4 * c, f = 0; 4 > f; f++) b.vertices.push(H(a[f]).toArray()), b.coords && b.coords.push([f & 1, (f & 2) / 2]), b.normals && b.normals.push(a.slice(4, 7));
            b.triangles.push([d, d + 1, d + 2]);
            b.triangles.push([d + 2, d + 1, d + 3])
        }
        b.compile();
        return b
    };
    o.sphere = function(b) {
        var b = b || {},
            c = new o(b),
            a = new t;
        detail = b.detail || 6;
        for (b = 0; 8 > b; b++)
            for (var d =
                    H(b), f = 0 < d.x * d.y * d.z, i = [], h = 0; h <= detail; h++) {
                for (var g = 0; h + g <= detail; g++) {
                    var k = h / detail,
                        m = g / detail,
                        l = (detail - h - g) / detail,
                        m = {
                            vertex: (new j(k + (k - k * k) / 2, m + (m - m * m) / 2, l + (l - l * l) / 2)).unit().multiply(d).toArray()
                        };
                    c.coords && (m.coord = 0 < d.y ? [1 - k, l] : [l, 1 - k]);
                    i.push(a.add(m))
                }
                if (0 < h)
                    for (g = 0; h + g <= detail; g++) k = (h - 1) * (detail + 1) + (h - 1 - (h - 1) * (h - 1)) / 2 + g, m = h * (detail + 1) + (h - h * h) / 2 + g, c.triangles.push(f ? [i[k], i[m], i[k + 1]] : [i[k], i[k + 1], i[m]]), h + g < detail && c.triangles.push(f ? [i[m], i[m + 1], i[k + 1]] : [i[m], i[k + 1], i[m + 1]])
            }
        c.vertices =
            a.unique.map(function(a) {
                return a.vertex
            });
        c.coords && (c.coords = a.unique.map(function(a) {
            return a.coord
        }));
        c.normals && (c.normals = c.vertices);
        c.compile();
        return c
    };
    o.load = function(b, c) {
        c = c || {};
        "coords" in c || (c.coords = !!b.coords);
        "normals" in c || (c.normals = !!b.normals);
        "colors" in c || (c.colors = !!b.colors);
        "triangles" in c || (c.triangles = !!b.triangles);
        "lines" in c || (c.lines = !!b.lines);
        var a = new o(c);
        a.vertices = b.vertices;
        a.coords && (a.coords = b.coords);
        a.normals && (a.normals = b.normals);
        a.colors && (a.colors = b.colors);
        a.triangles && (a.triangles = b.triangles);
        a.lines && (a.lines = b.lines);
        a.compile();
        return a
    };
    u.prototype = {
        mergeWith: function(b) {
            0 < b.t && b.t < this.t && (this.t = b.t, this.hit = b.hit, this.normal = b.normal)
        }
    };
    r.prototype = {
        getRayForPixel: function(b, c) {
            var b = (b - this.viewport[0]) / this.viewport[2],
                c = 1 - (c - this.viewport[1]) / this.viewport[3],
                a = j.lerp(this.ray00, this.ray10, b),
                d = j.lerp(this.ray01, this.ray11, b);
            return j.lerp(a, d, c).unit()
        }
    };
    r.hitTestBox = function(b, c, a, d) {
        var f = a.subtract(b).divide(c),
            i = d.subtract(b).divide(c),
            h = j.min(f, i),
            f = j.max(f, i),
            h = h.max(),
            f = f.min();
        return 0 < h && h < f ? (b = b.add(c.multiply(h)), a = a.add(1E-6), d = d.subtract(1E-6), new u(h, b, new j((b.x > d.x) - (b.x < a.x), (b.y > d.y) - (b.y < a.y), (b.z > d.z) - (b.z < a.z)))) : null
    };
    r.hitTestSphere = function(b, c, a, d) {
        var f = b.subtract(a),
            i = c.dot(c),
            h = 2 * c.dot(f),
            f = f.dot(f) - d * d,
            f = h * h - 4 * i * f;
        return 0 < f ? (i = (-h - Math.sqrt(f)) / (2 * i), b = b.add(c.multiply(i)), new u(i, b, b.subtract(a).divide(d))) : null
    };
    r.hitTestTriangle = function(b, c, a, d, f) {
        var i = d.subtract(a),
            h = f.subtract(a),
            f = i.cross(h).unit(),
            d = f.dot(a.subtract(b)) / f.dot(c);
        if (0 < d) {
            var b = b.add(c.multiply(d)),
                g = b.subtract(a),
                a = h.dot(h),
                c = h.dot(i),
                h = h.dot(g),
                j = i.dot(i),
                i = i.dot(g),
                g = a * j - c * c,
                j = (j * h - c * i) / g,
                i = (a * i - c * h) / g;
            if (0 <= j && 0 <= i && 1 >= j + i) return new u(d, b, f)
        }
        return null
    };
    new k;
    new k;
    E.prototype = {
        uniforms: function(b) {
            d.useProgram(this.program);
            for (var c in b) {
                var a = this.uniformLocations[c] || d.getUniformLocation(this.program, c);
                if (a) {
                    this.uniformLocations[c] = a;
                    var e = b[c];
                    e instanceof j ? e = [e.x, e.y, e.z] : e instanceof k && (e = e.m);
                    var f = Object.prototype.toString.call(e);
                    if ("[object Array]" == f || "[object Float32Array]" == f) switch (e.length) {
                            case 1:
                                d.uniform1fv(a, new Float32Array(e));
                                break;
                            case 2:
                                d.uniform2fv(a, new Float32Array(e));
                                break;
                            case 3:
                                d.uniform3fv(a, new Float32Array(e));
                                break;
                            case 4:
                                d.uniform4fv(a, new Float32Array(e));
                                break;
                            case 9:
                                d.uniformMatrix3fv(a, !1, new Float32Array([e[0], e[3], e[6], e[1], e[4], e[7], e[2], e[5], e[8]]));
                                break;
                            case 16:
                                d.uniformMatrix4fv(a, !1, new Float32Array([e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]]));
                                break;
                            default:
                                throw "don't know how to load uniform \"" + c + '" of length ' + e.length;
                        } else if (f = Object.prototype.toString.call(e), "[object Number]" == f || "[object Boolean]" == f)(this.isSampler[c] ? d.uniform1i : d.uniform1f).call(d, a, e);
                        else throw 'attempted to set uniform "' + c + '" to invalid value ' + e;
                }
            }
            return this
        },
        draw: function(b, c) {
            this.drawBuffers(b.vertexBuffers, b.indexBuffers[c == d.LINES ? "lines" : "triangles"], 2 > arguments.length ? d.TRIANGLES : c)
        },
        drawBuffers: function(b, c, a) {
            var e = this.usedMatrices,
                f = d.modelviewMatrix,
                i = d.projectionMatrix,
                h = e.MVMI || e.NM ? f.inverse() : null,
                g = e.PMI ? i.inverse() : null,
                j = e.MVPM || e.MVPMI ? i.multiply(f) : null,
                k = {};
            e.MVM && (k[e.MVM] = f);
            e.MVMI && (k[e.MVMI] = h);
            e.PM && (k[e.PM] = i);
            e.PMI && (k[e.PMI] = g);
            e.MVPM && (k[e.MVPM] = j);
            e.MVPMI && (k[e.MVPMI] = j.inverse());
            e.NM && (f = h.m, k[e.NM] = [f[0], f[4], f[8], f[1], f[5], f[9], f[2], f[6], f[10]]);
            this.uniforms(k);
            var e = 0,
                l;
            for (l in b) k = b[l], f = this.attributes[l] || d.getAttribLocation(this.program, l.replace(/^gl_/, "_gl_")), -1 != f && k.buffer && (this.attributes[l] = f, d.bindBuffer(d.ARRAY_BUFFER,
                k.buffer), d.enableVertexAttribArray(f), d.vertexAttribPointer(f, k.buffer.spacing, d.FLOAT, !1, 0, 0), e = k.buffer.length / k.buffer.spacing);
            for (l in this.attributes) l in b || d.disableVertexAttribArray(this.attributes[l]);
            if (e && (!c || c.buffer)) c ? (d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, c.buffer), d.drawElements(a, c.buffer.length, d.UNSIGNED_SHORT, 0)) : d.drawArrays(a, 0, e);
            return this
        }
    };
    var B, p, C;
    q.prototype = {
        bind: function(b) {
            d.activeTexture(d.TEXTURE0 + (b || 0));
            d.bindTexture(d.TEXTURE_2D, this.id)
        },
        unbind: function(b) {
            d.activeTexture(d.TEXTURE0 +
                (b || 0));
            d.bindTexture(d.TEXTURE_2D, null)
        },
        drawTo: function(b) {
            var c = d.getParameter(d.VIEWPORT);
            B = B || d.createFramebuffer();
            p = p || d.createRenderbuffer();
            d.bindFramebuffer(d.FRAMEBUFFER, B);
            d.bindRenderbuffer(d.RENDERBUFFER, p);
            if (this.width != p.width || this.height != p.height) p.width = this.width, p.height = this.height, d.renderbufferStorage(d.RENDERBUFFER, d.DEPTH_COMPONENT16, this.width, this.height);
            d.framebufferTexture2D(d.FRAMEBUFFER, d.COLOR_ATTACHMENT0, d.TEXTURE_2D, this.id, 0);
            d.framebufferRenderbuffer(d.FRAMEBUFFER,
                d.DEPTH_ATTACHMENT, d.RENDERBUFFER, p);
            d.viewport(0, 0, this.width, this.height);
            b();
            d.bindFramebuffer(d.FRAMEBUFFER, null);
            d.bindRenderbuffer(d.RENDERBUFFER, null);
            d.viewport(c[0], c[1], c[2], c[3])
        },
        swapWith: function(b) {
            var c;
            c = b.id;
            b.id = this.id;
            this.id = c;
            c = b.width;
            b.width = this.width;
            this.width = c;
            c = b.height;
            b.height = this.height;
            this.height = c
        }
    };
    q.fromImage = function(b, c) {
        var c = c || {},
            a = new q(b.width, b.height, c);
        try {
            d.texImage2D(d.TEXTURE_2D, 0, a.format, a.format, a.type, b)
        } catch (e) {
            if ("file:" == location.protocol) throw 'image not loaded for security reasons (serve this page over "http://" instead)';
            throw "image not loaded for security reasons (image must originate from the same domain as this page or use Cross-Origin Resource Sharing)";
        }
        c.minFilter && (c.minFilter != d.NEAREST && c.minFilter != d.LINEAR) && d.generateMipmap(d.TEXTURE_2D);
        return a
    };
    q.fromURL = function(b, c) {
        var a;
        if (!(a = C)) {
            a = document.createElement("canvas").getContext("2d");
            a.canvas.width = a.canvas.height = 128;
            for (var e = 0; e < a.canvas.height; e += 16)
                for (var f = 0; f < a.canvas.width; f += 16) a.fillStyle = (f ^ e) & 16 ? "#FFF" : "#DDD", a.fillRect(f, e, 16, 16);
            a =
                a.canvas
        }
        C = a;
        var i = q.fromImage(C, c),
            h = new Image,
            g = d;
        h.onload = function() {
            g.makeCurrent();
            q.fromImage(h, c).swapWith(i)
        };
        h.src = b;
        return i
    };
    j.prototype = {
        negative: function() {
            return new j(-this.x, -this.y, -this.z)
        },
        add: function(b) {
            return b instanceof j ? new j(this.x + b.x, this.y + b.y, this.z + b.z) : new j(this.x + b, this.y + b, this.z + b)
        },
        subtract: function(b) {
            return b instanceof j ? new j(this.x - b.x, this.y - b.y, this.z - b.z) : new j(this.x - b, this.y - b, this.z - b)
        },
        multiply: function(b) {
            return b instanceof j ? new j(this.x * b.x, this.y *
                b.y, this.z * b.z) : new j(this.x * b, this.y * b, this.z * b)
        },
        divide: function(b) {
            return b instanceof j ? new j(this.x / b.x, this.y / b.y, this.z / b.z) : new j(this.x / b, this.y / b, this.z / b)
        },
        equals: function(b) {
            return this.x == b.x && this.y == b.y && this.z == b.z
        },
        dot: function(b) {
            return this.x * b.x + this.y * b.y + this.z * b.z
        },
        cross: function(b) {
            return new j(this.y * b.z - this.z * b.y, this.z * b.x - this.x * b.z, this.x * b.y - this.y * b.x)
        },
        length: function() {
            return Math.sqrt(this.dot(this))
        },
        unit: function() {
            return this.divide(this.length())
        },
        min: function() {
            return Math.min(Math.min(this.x,
                this.y), this.z)
        },
        max: function() {
            return Math.max(Math.max(this.x, this.y), this.z)
        },
        toAngles: function() {
            return {
                theta: Math.atan2(this.z, this.x),
                phi: Math.asin(this.y / this.length())
            }
        },
        toArray: function(b) {
            return [this.x, this.y, this.z].slice(0, b || 3)
        },
        clone: function() {
            return new j(this.x, this.y, this.z)
        },
        init: function(b, c, a) {
            this.x = b;
            this.y = c;
            this.z = a;
            return this
        }
    };
    j.negative = function(b, c) {
        c.x = -b.x;
        c.y = -b.y;
        c.z = -b.z;
        return c
    };
    j.add = function(b, c, a) {
        c instanceof j ? (a.x = b.x + c.x, a.y = b.y + c.y, a.z = b.z + c.z) : (a.x = b.x +
            c, a.y = b.y + c, a.z = b.z + c);
        return a
    };
    j.subtract = function(b, c, a) {
        c instanceof j ? (a.x = b.x - c.x, a.y = b.y - c.y, a.z = b.z - c.z) : (a.x = b.x - c, a.y = b.y - c, a.z = b.z - c);
        return a
    };
    j.multiply = function(b, c, a) {
        c instanceof j ? (a.x = b.x * c.x, a.y = b.y * c.y, a.z = b.z * c.z) : (a.x = b.x * c, a.y = b.y * c, a.z = b.z * c);
        return a
    };
    j.divide = function(b, c, a) {
        c instanceof j ? (a.x = b.x / c.x, a.y = b.y / c.y, a.z = b.z / c.z) : (a.x = b.x / c, a.y = b.y / c, a.z = b.z / c);
        return a
    };
    j.cross = function(b, c, a) {
        a.x = b.y * c.z - b.z * c.y;
        a.y = b.z * c.x - b.x * c.z;
        a.z = b.x * c.y - b.y * c.x;
        return a
    };
    j.unit = function(b,
        c) {
        var a = b.length();
        c.x = b.x / a;
        c.y = b.y / a;
        c.z = b.z / a;
        return c
    };
    j.fromAngles = function(b, c) {
        return new j(Math.cos(b) * Math.cos(c), Math.sin(c), Math.sin(b) * Math.cos(c))
    };
    j.randomDirection = function() {
        return j.fromAngles(2 * Math.random() * Math.PI, Math.asin(2 * Math.random() - 1))
    };
    j.min = function(b, c) {
        return new j(Math.min(b.x, c.x), Math.min(b.y, c.y), Math.min(b.z, c.z))
    };
    j.max = function(b, c) {
        return new j(Math.max(b.x, c.x), Math.max(b.y, c.y), Math.max(b.z, c.z))
    };
    j.lerp = function(b, c, a) {
        return c.subtract(b).multiply(a).add(b)
    };
    j.fromArray = function(b) {
        return new j(b[0], b[1], b[2])
    };
    return s
}();