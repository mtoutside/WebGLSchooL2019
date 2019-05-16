(() => {
	// variables
	let canvasWidth  = null;
	let canvasHeight = null;
	let targetDOM    = null;
	let run = true;
	let isDown = false;
	// three objects
	let scene;
	let camera;
	let controls;
	let renderer;
	let analyser;
	let geometry;
	let material;
	let mesh;
	const fftSize = 1024;

	let axesHelper;
	// constant variables
	const RENDERER_PARAM = {
			clearColor: 0x336633
	};


	// entry point
	window.addEventListener('load', () => {
			// canvas
			canvasWidth  = window.innerWidth;
			canvasHeight = window.innerHeight;
			targetDOM    = document.getElementById('webgl');

			// scene and camera
			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(60, canvasWidth / canvasHeight, 0.1, 50.0);
			camera.position.x = 0.0;
			camera.position.y = 10.0;
			camera.position.z = 5.0;
			camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

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
scene.add( mesh );

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
			console.log(analyser);
	}
})();

