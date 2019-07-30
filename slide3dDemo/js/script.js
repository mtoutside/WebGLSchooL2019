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
		uniform float timeShown;
		uniform float timeInterval;
		uniform float durationShown;
		uniform float durationInterval;
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

		float stepShown = clamp(timeShown / durationShown, 0.0, 1.0);
		float stepShownEase = circularOut(stepShown);
		float stepInterval = clamp(timeInterval / durationInterval, 0.0, 1.0);
		float stepIntervalEase = circularOut(stepInterval);

		float phase = t < 0.5 ? t * 2.0 : (t - 0.5) * 2.0;

			// for Interval Images
			vec2 ratio = vec2(
					min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
					min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
				);

		vec2 uv1 = vec2(
				(vUv.x - (((vUv.x * 2.0) - 1.0) * 0.0333) - (((vUv.x * 2.0) - 1.0) * 0.0333)) * ratio.x + (1.0 - ratio.x) * 0.5,
				(vUv.y - (((vUv.y * 2.0) - 1.0) * 0.0333) - (((vUv.y * 2.0) - 1.0) * 0.0333)) * ratio.y + (1.0 - ratio.y) * 0.5
			);
		vec2 uv2 = vec2(
				(vUv.x - (((vUv.x * 2.0) - 1.0) * 0.0333)) * ratio.x + (1.0 - ratio.x) * 0.5,
				(vUv.y - (((vUv.y * 2.0) - 1.0) * 0.0333)) * ratio.y + (1.0 - ratio.y) * 0.5
			);
			vec4 texColor1 = texture2D(texture1, vUv);
			vec4 texColor2 = texture2D(texture2, vUv);

			// orb
			vec2 m = vec2(0.5, 0.5);
			vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
			float radius = 4.0 - length(m - p); // whiteout orb
			vec4 orb = vec4(vec3(radius), 1.0);


			// mixで混ぜる
			// vec4 c = t < 0.5 ? texColor1 : texColor2;
			// c = c + (t < 0.5 ? mix(0.0, 1.0, phase) : mix(1.0, 0.0, phase));

			vec4 c = t < 0.5 ? mix(texColor1, orb, phase) : mix(orb, texColor2, phase);
			gl_FragColor = c;
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
	let mesh, mesh2;
	let loader, texture1, texture2;
	let controls;
	let axesHelper;
	let time = 0.0;
	let images = ["img/slide1.jpg", "img/slide2.jpg", "img/slide3.jpg", "img/slide4.jpg"];
	let texes = [];
	const clock = new THREE.Clock();
	let durationShown = 4;
	let durationInterval = 4;
	let t = 0;
	let mouse = new THREE.Vector2(0, 0);
	let run = true;
	let index = 0;
	let index2 = 1;

	function mouseMoved(x, y) {
    mouse.x =  x - (width / 2);// 原点を中心に持ってくる
    mouse.y = -y + (height / 2);// 軸を反転して原点を中心に持ってくる
  }

	window.addEventListener('mousemove',  (e) => {
		mouseMoved(e.clientX, e.clientY);
	});
	window.addEventListener('keydown', (eve) => {
		run = eve.key !== 'Escape';
	}, false);
	// window.addEventListener('resize', () => {
	// 	renderer.setSize(window.innerWidth, window.innerHeight);
	// 	camera.updateProjectionMatrix();
	// }, false);

	window.addEventListener('load', () => {
		width = window.innerWidth;
		height = window.innerHeight;
		targetDOM = document.getElementById('webgl');
		loader = new THREE.TextureLoader();
		loader.crossOrigin = "";
		// テクスチャ読み込み
		texes = images.map(img => loader.load(img));
		init();
	}, false);

	function init() {
		const CAMERA_PARAM = {
			left: width / - 2,
			right: width / 2,
			top: height / 2,
			bottom: height / - 2,
			near: 5,
			far: 500,
			x: 0.0,
			y: 0.0,
			z: 10.0,
			lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
		};
		const RENDERER_PARAM = {
			clearColor: 0x333333,
			width: 512,
			height: 512
		};
		scene = new THREE.Scene();

		// camera
		camera = new THREE.OrthographicCamera(
			CAMERA_PARAM.left,
			CAMERA_PARAM.right,
			CAMERA_PARAM.top,
			CAMERA_PARAM.bottom,
			CAMERA_PARAM.near,
			CAMERA_PARAM.far
		);
		camera.position.x = CAMERA_PARAM.x;
		camera.position.y = CAMERA_PARAM.y;
		camera.position.z = CAMERA_PARAM.z;
		camera.lookAt(CAMERA_PARAM.lookAt);

		// render
		renderer = new THREE.WebGLRenderer({
			antialias: false
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
		renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
		targetDOM.appendChild(renderer.domElement);
		// controls = new THREE.OrbitControls(camera, renderer.domElement);

		// texture準備
		for(let texture of texes) {
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearFilter;
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		}

		// material
		material = new THREE.RawShaderMaterial({
			uniforms: {
				time: { type: "f", value: time },
				t: { type: "f", value: t },
				timeShown: { type: "f", value: -2 },
				timeInterval: { type: "f", value: 0 },
				durationShown: { type: "f", value: durationShown },
				durationInterval: { type: "f", value: durationInterval },
				uMouse: { value: mouse },
				resolution: { type: "v2", value: new THREE.Vector2(width, height) },
				imageResolution: { type: "v2", value: new THREE.Vector2(512, 512) },
				texture1: { type: "t", value: null },
				texture2: { type: "t", value: null }
			},
			vertexShader: vertex,
			fragmentShader: fragment,
			transparent: true,
			opacity: 1.0
		});

		geometry = new THREE.PlaneBufferGeometry(
			2,
			2,
			14,
			14
		);

		mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(0, 0, 0);
		scene.add(mesh);

		// axesHelper = new THREE.AxesHelper(405.0);
		// scene.add(axesHelper);

		animate();
	}
	function animate() {
		if(run) {requestAnimationFrame(animate);}

		time = clock.getElapsedTime();
		mesh.material.uniforms.time.value = time;

			// mesh.material.uniforms.t.value > 1.0 ? mesh.material.uniforms.t.value = 0.0 : mesh.material.uniforms.t.value += 0.005;

			if(mesh.material.uniforms.t.value > 1.0) {
				mesh.material.uniforms.t.value = 0.0;
				index++;
			} else {
				mesh.material.uniforms.t.value += 0.005
			}

			mesh.material.uniforms.texture1.value = texes[index];
			mesh.material.uniforms.texture2.value = texes[index + 1];

		if(index + 1 >= texes.length) {
			index = 0;
		}
		renderer.render(scene, camera);
	}

})();

