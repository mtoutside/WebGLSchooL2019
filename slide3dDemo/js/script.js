(() => {
	// 汎用変数の宣言

	const vertex = `
		attribute vec3 position;
		attribute vec2 uv;

		uniform mat4 projectionMatrix;
		uniform mat4 viewMatrix;
		uniform mat4 modelMatrix;
		uniform vec2 resolution;

		varying vec3 vPosition;
		varying vec2 vUv;

		void main(void) {
			vec3 updatePosition = position * vec3(resolution / 2.0, 1.0);

			vPosition = updatePosition;
			vUv = uv;

			gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(updatePosition, 1.0);
		}
		`;
	const fragment = `
		precision highp float;

		uniform float t;
		uniform float time;
		uniform vec2 uMouse;
		uniform vec2 resolution;
		uniform vec2 imageResolution;
		uniform sampler2D texture1;
		uniform sampler2D texture2;

		varying vec3 vPosition;
		varying vec2 vUv;

		float circularOut(float t) {
			return sqrt((2.0 - t) * t);
		}

		void main(void) {
		vec2 nmouse = normalize(uMouse);
		float mouse = clamp(nmouse.x , 0.0, 1.0);

		float duration = clamp(sin(time), 0.0, 1.0);
		float duration2 = clamp(cos(time), 0.0, 1.0);

			// for Interval Images
			vec2 ratio = vec2(
					min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
					min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
				);
			vec4 texColor1 = texture2D(texture1, vUv);
			vec4 texColor2 = texture2D(texture2, vUv);

			// add color

			// mixで混ぜる
			vec4 color = mix(texColor1, texColor2, duration);
			gl_FragColor = mix(color, vec4(1.0), duration2);
		}
		`;

	let width;   
	let height; 
	let targetDOM;


	let scene;
	let camera;
	let renderer;
	let geometry;
	let material;
	let mesh;
	let loader, texture1, texture2;
	let controls;
	let axesHelper;

	let time = 0.0;
	let images = ["img/kv01.jpg", "img/kv02.jpg", "img/kv03.jpg", "img/kv04.jpg", "img/kv05.jpg", "img/kv06.jpg"];

	const clock = new THREE.Clock();

	let durationShown = 4;
	let durationInterval = 4;
	let t = 0;
	let mouse = new THREE.Vector2(0, 0);

	function mouseMoved(x, y) {
    mouse.x =  x - (width / 2);// 原点を中心に持ってくる
    mouse.y = -y + (height / 2);// 軸を反転して原点を中心に持ってくる
  }

	window.addEventListener('mousemove',  (e) => {
		mouseMoved(e.clientX, e.clientY);
	});

	window.addEventListener('load', () => {
		width = window.innerWidth;
		height = window.innerHeight;
		targetDOM = document.getElementById('webgl');
		loader = new THREE.TextureLoader();
		loader.crossOrigin = "";
		texture1 = loader.load("img/kv01.jpg");
		texture2 = loader.load("img/kv04.jpg");

		init();
	}, false);

	function init() {
		const CAMERA_PARAM = {
			fovy: 60,
			aspect: width / height,
			near: 0,
			far: 5,
			x: 0.0,
			y: 0.0,
			z: 0.0,
			lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
		};
		const RENDERER_PARAM = {
			clearColor: 0x333333,
			width: width,
			height: height
		};
		const MATERIAL_PARAM = {
			color: 0xff9933
		};
		scene = new THREE.Scene();

		camera = new THREE.OrthographicCamera(
			CAMERA_PARAM.fovy,
			CAMERA_PARAM.aspect,
			CAMERA_PARAM.near,
			CAMERA_PARAM.far
		);
		camera.position.x = CAMERA_PARAM.x;
		camera.position.y = CAMERA_PARAM.y;
		camera.position.z = CAMERA_PARAM.z;
		camera.lookAt(CAMERA_PARAM.lookAt);

		renderer = new THREE.WebGLRenderer({
			antialias: false
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
		renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
		targetDOM.appendChild(renderer.domElement);
		controls = new THREE.OrbitControls(camera, renderer.domElement);


		texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
		texture1.minFilter = texture2.minFilter = THREE.LinearFilter;

		texture1.anisotropy = renderer.capabilities.getMaxAnisotropy();
		texture2.anisotropy = renderer.capabilities.getMaxAnisotropy();
		material = new THREE.RawShaderMaterial({
			uniforms: {
				time: { type: "f", value: time },
				t: { type: "f", value: t },
				uMouse: { value: mouse },
				resolution: { type: "v2", value: new THREE.Vector2(width, height) },
				imageResolution: { type: "v2", value: new THREE.Vector2(1800, 1200) },
				texture1: { type: "t", value: texture1 },
				texture2: { type: "t", value: texture2 },
			},

			vertexShader: vertex,
			fragmentShader: fragment,
			transparent: true,
			opacity: 1.0
		});

		geometry = new THREE.PlaneBufferGeometry(
			width,
			height
		);

		mesh = new THREE.Mesh(geometry, material);

		mesh.position.set(0, 0, -10);

		scene.add(mesh);

		axesHelper = new THREE.AxesHelper(105.0);
		scene.add(axesHelper);
		animate();
	}
	function animate() {
		requestAnimationFrame(animate);

		time = clock.getElapsedTime();
		mesh.material.uniforms.time.value = time;
		mesh.material.uniforms.t.value += 0.01;
		renderer.render(scene, camera);
	}

})();

