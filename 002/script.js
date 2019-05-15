
// = 012 ======================================================================
// three.js を使っているかどうかにかかわらず、3D プログラミングとはそもそもかな
// り難易度の高いジャンルです。
// その中でも、特に最初のころに引っかかりやすいのが「回転や位置」の扱いです。
// ここではそれを体験する意味も含め、グループの使い方を知っておきましょう。この
// グループという概念を用いることで、three.js ではオブジェクトの制御をかなり簡単
// に行うことができるようになっています。
// ============================================================================

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
    let plane;
    let box;
    let sphere;
    let cone;
    let torus;
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
        // controls = new THREE.OrbitControls(camera, renderer.domElement);

        // - グループを使う ---------------------------------------------------
        // three.js のオブジェクトは、グループにひとまとめにすることができます。
        // グループを使わないと実現できない挙動、というのも一部にはありますので、
        // ここで使い方だけでもしっかり覚えておきましょう。
        // 特に、グループに追加したことによって「回転や平行移動の概念が変わる」
        // ということが非常に重要です。
        // --------------------------------------------------------------------

        // seconds
        secondHand = new THREE.Group();

        // material and geometory
        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);
        materialPoint = new THREE.PointsMaterial(MATERIAL_PARAM_POINT);

        // box
        geometry = new THREE.BoxGeometry(7.0, 1.0, 0.1);
        box = new THREE.Mesh(geometry, material);
        box.position.x = 3.5;
        box.position.y = -6.0;
        secondHand.add(box); // group に add する @@@
				secondHand.position.y = 7.0;

        // group をシーンに加える @@@
        scene.add(secondHand);

        // minuets
        minHand = new THREE.Group();

        // material and geometory
        material = new THREE.MeshPhongMaterial(0xc0ffee);
        materialPoint = new THREE.PointsMaterial(MATERIAL_PARAM_POINT);

        // box
        geometry = new THREE.BoxGeometry(5.0, 1.0, 0.1);
        box = new THREE.Mesh(geometry, material);
        box.position.x = 2.5;
        box.position.y = 1.0;
        minHand.add(box); // group に add する @@@

        // group をシーンに加える @@@
        scene.add(minHand);

        // hour
        hourHand = new THREE.Group();

        // material and geometory
        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);
        materialPoint = new THREE.PointsMaterial(MATERIAL_PARAM_POINT);

        // box
        geometry = new THREE.BoxGeometry(3.0, 1.0, 0.1);
        box = new THREE.Mesh(geometry, material);
        box.position.x = 1.5;
        box.position.y = 2.0;
        hourHand.add(box); // group に add する @@@
				hourHand.position.x = 0.0;
				hourHand.position.z = 0.0;

        // group をシーンに加える @@@
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

