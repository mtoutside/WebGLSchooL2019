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

		uniform float time;
		uniform float timeShown;
		uniform float timeInterval;
		uniform float durationShown;
		uniform float durationInterval;
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
			// for Shown preload.
			float stepShown = clamp(timeShown / durationShown, 0.0, 1.0);
			float stepShownEase = circularOut(stepShown);
			float stepInterval = clamp(timeInterval / durationInterval, 0.0, 1.0);
			float stepIntervalEase = circularOut(stepInterval);

			// for Interval Images
			vec2 ratio = vec2(
					min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
					min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
				);
			vec2 uv1 = vec2(
					(vUv.x - (((vUv.x * 2.0) - 1.0) * stepShown * 0.0333) - (((vUv.x * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.x + (1.0 - ratio.x) * 0.5,
					(vUv.y - (((vUv.y * 2.0) - 1.0) * stepShown * 0.0333) - (((vUv.y * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.y + (1.0 - ratio.y) * 0.5
				);
			vec2 uv2 = vec2(
					(vUv.x - (((vUv.x * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.x + (1.0 - ratio.x) * 0.5,
					(vUv.y - (((vUv.y * 2.0) - 1.0) * stepInterval * 0.0333)) * ratio.y + (1.0 - ratio.y) * 0.5
				);
			vec4 texColor1 = texture2D(texture1, uv1);
			vec4 texColor2 = texture2D(texture2, uv2);

			// calcurate mask
			float maskBase =
				((
					sin(vPosition.y / 616.3) * 2.0
					+ cos(vPosition.x / 489.2 - 200.0) * 2.0
					+ sin(vPosition.x / 128.3) * 0.5
					+ cos(vPosition.y / 214.2) * 0.5
				) / 5.0 + 1.0) / 2.0;
			float maskShown = clamp(maskBase + (stepShownEase * 2.0 - 1.0), 0.0, 1.0);
			maskShown = smoothstep(0.2, 0.8, maskShown);
			float maskInterval = clamp(maskBase + (stepIntervalEase * 2.0 - 1.0), 0.0, 1.0);
			float maskInterval1 = 1.0 - smoothstep(0.4, 1.0, maskInterval);
			float maskInterval2 = smoothstep(0.0, 0.6, maskInterval);

			// add color
			vec4 color = vec4(vec3(1.0), 1.0) * (1.0 - maskShown) + texColor1 * maskShown * maskInterval1 + texColor2 * maskInterval2;

			gl_FragColor = color;
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



	window.addEventListener('load', () => {
		width = window.innerWidth;
		height = window.innerHeight;
		targetDOM = document.getElementById('webgl');
		loader = new THREE.TextureLoader();
		loader.crossOrigin = "";
		texture1 = loader.load("img/kv02.jpg");
		texture2 = loader.load("img/kv04.jpg");

		init();
	}, false);

	function init() {
		const CAMERA_PARAM = {
			fovy: 60,
			aspect: 1,
			near: 10,
			far: 100,
			x: 0.0,
			y: 0.0,
			z: 2.0,
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
				timeShown: { type: "f", value: -2.0 },
				timeInterval: { type: "f", value: 0 },
				time: { type: "f", value: time },
				durationShown: { type: "f", value: durationShown },
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
			512,
			512
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

		mesh.material.uniforms.timeShown.value < durationShown ?
			mesh.material.uniforms.timeShown.value = Math.min(mesh.material.uniforms.timeShown.value + width, durationShown) :
			(mesh.material.uniforms.timeInterval.value = Math.min(mesh.material.uniforms.timeInterval.value + width, durationInterval),

			// mesh.material.uniforms.timeInterval.value === durationInterval && (this.index1 = this.index1 + 1 === this.images.length ? 0 : this.index1 + 1,
			// this.index2 = this.index2 + 1 === this.images.length ? 0 : this.index2 + 1,
			// this.uniforms.texture1.value = this.textures[this.index1],
			// this.uniforms.texture2.value = this.textures[this.index2],
			mesh.material.uniforms.timeInterval.value = 0)

		time = clock.getElapsedTime();
		mesh.material.uniforms.time.value = time;
		renderer.render(scene, camera);
	}

})();

