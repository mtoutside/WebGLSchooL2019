(() => {
	// variables
	let		canvasWidth  = window.innerWidth;
	let		canvasHeight = window.innerHeight;
	let		targetDOM    = document.getElementById('webgl');
	let run = true;
	let isDown = false;
	// three objects
	let scene;
	let camera;
	let controls;
	let renderer;
	let analyser;
	let box = [];
	let geometry;
	let material;
	let mesh;
	const fftSize = 32;
	let axesHelper;
	// constant variables
	const CAMERA_PARAM = {
		fovy: 90,
		aspect: canvasWidth / canvasHeight,
		near: 0.1,
		far: 50.0,
		x: 0.0,
		y: 2.0,
		z: 9.0,
		lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
	};

	const RENDERER_PARAM = {
			clearColor: 0x333333
	};


	// entry point
	window.addEventListener('load', () => {

		// scene and camera
		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(
			CAMERA_PARAM.fovy,
			CAMERA_PARAM.aspect,
			CAMERA_PARAM.near,
			CAMERA_PARAM.far
		);
		camera.position.x = CAMERA_PARAM.x;
		camera.position.y = CAMERA_PARAM.y;
		camera.position.z = CAMERA_PARAM.z;
		camera.lookAt(CAMERA_PARAM.lookAt);

		// renderer
		renderer = new THREE.WebGLRenderer();
		// renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
		renderer.setSize(canvasWidth, canvasHeight);
		targetDOM.appendChild(renderer.domElement);

		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( './3_880mm.MP3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});

		// create an AudioAnalyser, passing in the sound and desired fftSize
		analyser = new THREE.AudioAnalyser( sound, fftSize );


		uniforms = {
			tAudioData: { value: new THREE.DataTexture( analyser.data, fftSize / 2, 1, THREE.LuminanceFormat ) }
		};
		material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		} );
		geometry = new THREE.PlaneBufferGeometry( 1, 1 );
		mesh = new THREE.Mesh( geometry, material );
		// scene.add( mesh );

		const boxSize = 1;
		geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
		material = new THREE.MeshNormalMaterial();
		for(let i = 0; i < fftSize / 2; i++) {
			box[i] = new THREE.Mesh(geometry, material);
			box[i].position.set(0, 0, i + i * boxSize / 4);
			scene.add(box[i]);
		}
		axesHelper = new THREE.AxesHelper(5.0);
		scene.add(axesHelper);


		controls = new THREE.OrbitControls(camera, renderer.domElement);
		// events
		window.addEventListener('keydown', (eve) => {
			run = eve.key !== 'Escape';
			if(eve.key === ' '){
				isDown = true;
			}
		}, false);
		window.addEventListener('keyup', (eve) => {
			if(eve.key === ' '){
				isDown = false;
			}
		}, false);
		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}, false);

		// rendering
		render();
	}, false);

	// rendering
	function render(){
		if(run){requestAnimationFrame(render);}
		analyser.getFrequencyData();
		uniforms.tAudioData.value.needsUpdate = true;
		renderer.render(scene, camera);
		console.log(analyser.data[5]);
		for(let i = 0; i < fftSize / 2; i++) {
			box[i].position.y = analyser.data[i] * 0.01;
		}
}
})();

