(() => {
    window.addEventListener('load', () => {
        // 汎用変数の宣言
        let width = window.innerWidth;
        let height = window.innerHeight;
        let targetDOM = document.getElementById('webgl');

        let run = true;       // 実行フラグ
        let scene;            // シーン
        let camera;           // カメラ
        let controls;         // カメラコントロール
        let renderer;         // レンダラ
        let geometry;         // ジオメトリ
        let material;         // マテリアル
        let box;              // ボックスメッシュ
        let directionalLight; // ディレクショナルライト（平行光源）
        let ambientLight;     // アンビエントライト（環境光）
        let axesHelper;       // 軸ヘルパーメッシュ
        let isDown = false;   // スペースキーが押されているかどうか

        const CAMERA_PARAM = {
            fovy: 90,
            aspect: width / height,
            near: 0.1,
            far: 50.0,
            x: 0.0,
            y: 2.0,
            z: 9.0,
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0)
        };
        const RENDERER_PARAM = {
            clearColor: 0x333333,
            width: width,
            height: height
        };
        const MATERIAL_PARAM = {
            color: 0xbada55,
            specular: 0xffffff
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

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
        targetDOM.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);

				// BOX100個
				let BOX = [];
				let count = 0;
				const boxSize = 1.0;
        geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);
				for(let i = 0; i < 10; i++) {
					for(let j = 0; j < 10; j++) {
						BOX[count] = new THREE.Mesh(geometry, material);
						BOX[count].position.set(i - (boxSize * 5) + boxSize / 2 , j - (boxSize * 5) + boxSize / 2, 0.5);
						scene.add(BOX[count]);
						count++;
					}
				}

        // box = new THREE.Mesh(geometry, material);
        // scene.add(box);

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

        axesHelper = new THREE.AxesHelper(5.0);
        scene.add(axesHelper);

        window.addEventListener('keydown', (eve) => {
            run = eve.key !== 'Escape';
            if(eve.key === ' '){isDown = true;}
        }, false);
        window.addEventListener('keyup', (eve) => {
            if(eve.key === ' '){isDown = false;}
        }, false);
        window.addEventListener('mousemove', (eve) => {
            let horizontal = (eve.clientX / width - 0.5) * 2.0;
            let vertical   = -(eve.clientY / height - 0.5) * 2.0;
            // box.position.x = horizontal;
            // box.position.y = vertical;
        }, false);

        render();
        function render(){
            if(run){requestAnimationFrame(render);}

							for(let i in BOX) {
								BOX[i].rotation.y += 0.01;
							}
            if(isDown === true){
							for(let i in BOX) {
                BOX[i].rotation.x += Math.random() * 0.05;
                BOX[i].rotation.y += Math.random() * 0.05;
							}
            }

            renderer.render(scene, camera);
        }
    }, false);
})();

