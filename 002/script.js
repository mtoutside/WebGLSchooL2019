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
    let geometry;
    let material;
    let materialPoint;
    let box;
    let cirlcle;
    let secondHand;
    let minHand;
    let hourHand;
    let directionalLight;
    let ambientLight;
    let axesHelper;
    // constant variables
    const RENDERER_PARAM = {
        clearColor: 0x333333
    };
    const MATERIAL_PARAM = {
        color: 0xbada55,
        specular: 0xffffff
    };
    const MATERIAL_PARAM_POINT = {
        color: 0xbada55,
        size: 0.1
    };
    const DIRECTIONAL_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 1.0,
        x: 1.0,
        y: 1.0,
        z: 1.0
    };
    const AMBIENT_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 0.2
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
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(canvasWidth, canvasHeight);
        targetDOM.appendChild(renderer.domElement);
        controls = new THREE.OrbitControls(camera, renderer.domElement);

			// material
        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);
        // materialPoint = new THREE.PointsMaterial(MATERIAL_PARAM_POINT);

			// circle
			geometry = new THREE.CircleGeometry( 5, 32, 5.0 );
			circle = new THREE.Mesh( geometry, material );
			material.side = THREE.DoubleSide;
			circle.rotation.x = 90 * (Math.PI / 180);
			circle.position.y = -0.1;
			scene.add( circle );

        // seconds
        secondHand = new THREE.Group();
        geometry = new THREE.BoxGeometry(7.0, 0.1, 0.1);
        box = new THREE.Mesh(geometry, material);
        box.position.x = 3.5;
        box.position.y = 0.25;
        secondHand.add(box);
        scene.add(secondHand);

        // minuets
        minHand = new THREE.Group();
        geometry = new THREE.BoxGeometry(5.0, 0.1, 0.1);
        box = new THREE.Mesh(geometry, material);
        box.position.x = 2.5;
        box.position.y = 0.15;
        minHand.add(box);
        scene.add(minHand);

        // hour
        hourHand = new THREE.Group();
        geometry = new THREE.BoxGeometry(3.0, 0.1, 0.1);
        box = new THREE.Mesh(geometry, material);
        box.position.x = 1.5;
        box.position.y = 0.05;
        hourHand.add(box);
				hourHand.position.x = 0.0;
				hourHand.position.z = 0.0;
        scene.add(hourHand);

        // lights
        directionalLight = new THREE.DirectionalLight(
            DIRECTIONAL_LIGHT_PARAM.color,
            DIRECTIONAL_LIGHT_PARAM.intensity
        );
        directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
        directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
        directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;
        scene.add(directionalLight);
        ambientLight = new THREE.AmbientLight(
            AMBIENT_LIGHT_PARAM.color,
            AMBIENT_LIGHT_PARAM.intensity
        );
        scene.add(ambientLight);

        // helper
        axesHelper = new THREE.AxesHelper(5.0);
        scene.add(axesHelper);

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

        renderer.render(scene, camera);
			setDate();
    }
	function setDate() {
		const now = new Date();

		const seconds = now.getSeconds();
		const secondsAngle = -1 * seconds * 6 * (Math.PI / 180) + 90 * Math.PI / 180;
		secondHand.rotation.y = secondsAngle;

		const mins = now.getMinutes();
		const minsAngle = -1 * ((mins * 6 * (Math.PI / 180)) + ( seconds * (Math.PI / 1800))) + 90 * Math.PI / 180;
		minHand.rotation.y = minsAngle;

		const hour = now.getHours();
		const hourAngle = -1 * ( hour * (Math.PI / 6) + mins * (Math.PI / 360)) + 90 * Math.PI / 180;
		hourHand.rotation.y = hourAngle;

	}
})();
