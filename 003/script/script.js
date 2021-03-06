(() => {
	// variables
	let run;        
	let startTime;  
	let nowTime;    
	let gl;         
	let mat4;       
	let qtn;
	let canvas;     
	let canvasSize; 
	let prg;        
	let position;   
	let color;      
	let index;      
	let VBO;        
	let IBO;        
	mat4 = gl3.Math.Mat4;
	qtn  = gl3.Math.Qtn;

	let mMatrix;    
	let vMatrix;    
	let pMatrix;    
	let vpMatrix;   
	let mvpMatrix;  
	let normalMatrix;

	window.addEventListener('load', () => {
		// glcubic の初期化
		canvas = document.getElementById('webgl_canvas');
		gl3.init(canvas);
		if(!gl3.ready){
			console.log('initialize error');
			return;
		}
		// 記述が冗長になるので WebGL のコンテキストを取得しておく
		gl = gl3.gl;
		// こちらも同様に、記述が冗長になるので変数にいったん格納
		mat4 = gl3.Math.Mat4;

		// サンプルの実行を止めることができるようにイベントを仕込む
		window.addEventListener('keydown', (eve) => {
			// Esc キーを押下したら run に false が入るようにする
			run = eve.key !== 'Escape';
		}, false);

		// キャンバスの大きさはウィンドウの短辺
		canvasSize = Math.min(window.innerWidth, window.innerHeight);
		canvas.width  = canvasSize;
		canvas.height = canvasSize;

		// イベントの登録
		canvas.addEventListener('mousedown', mouseInteractionStart, false);
		canvas.addEventListener('mousemove', mouseInteractionMove, false);
		canvas.addEventListener('mouseup', mouseInteractionEnd, false);
		canvas.addEventListener('wheel', wheelScroll, false);

		// シェーダロードへ移行
		loadShader();
	}, false);

	function loadShader(){
		// glcubic の機能を使ってプログラムを生成
		prg = gl3.createProgramFromFile(
			'./shader/main.vert',
			'./shader/main.frag',
			['position', 'color'],
			[3, 4],
			['mvpMatrix', 'globalColor'],
			['matrix4fv', '4fv'],
			initialize
		);
	}

	function initialize(){
		position = [];
		color = [];
		index = [];
		// ピラミッドの頂点定義に挑戦！
		let pWidth = 1.0;
		let pHeight = 1.5;
		generatePyramid(pWidth, pHeight);

		function generatePyramid(width, height){
			// ここでは底面だけが定義されているのでこれを改造してピラミッドにしよう
			position.push(
				width, 0.0,  width,
				-width, 0.0,  width,
				width, 0.0, -width,
				-width, 0.0, -width,
				0.0, height, 0.0
			);
			color.push(
				0.3, 0.0, 1.0, 1.0,
				0.3, 0.5, 1.0, 1.0,
				0.3, 0.5, 1.0, 1.0,
				0.3, 0.5, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0
			);
			index.push(
				0, 1, 2, 2, 1, 3, 3, 4, 2, 2, 4, 0, 0, 4, 1, 1, 4, 3
			);
		}

		// 座標データから頂点バッファを生成
		VBO = [
			gl3.createVbo(position),
			gl3.createVbo(color)
		];
		// インデックスバッファを生成
		IBO = gl3.createIbo(index);

		mMatrix   = mat4.identity(mat4.create()); // モデル座標変換行列
		vMatrix   = mat4.identity(mat4.create()); // ビュー座標変換行列
		pMatrix   = mat4.identity(mat4.create()); // プロジェクション座標変換行列
		vpMatrix  = mat4.identity(mat4.create()); // v と p を掛け合わせたもの
		mvpMatrix = mat4.identity(mat4.create()); // m と v と p の全てを掛け合わせたもの

		mat4.lookAt([0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
		mat4.perspective(45, 1.0, 0.1, 10.0, pMatrix);
		mat4.multiply(pMatrix, vMatrix, vpMatrix);

		// 深度テストとカリングを有効化する
		gl.enable(gl.DEPTH_TEST); // 深度テストを有効化
		gl.enable(gl.CULL_FACE);  // 今回はカリングは有効化しない
		gl.cullFace(gl.BACK);     // カリング面の設定

		// 汎用変数の初期化
		run = true;
		startTime = Date.now();
		nowTime = 0;

		// レンダリング関数を呼ぶ
		render();
	}

	function render(){
		// ビューを設定
		gl3.sceneView(0, 0, canvasSize, canvasSize);
		// シーンのクリア
		gl3.sceneClear([0.7, 0.7, 0.7, 1.0]);
		// どのプログラムオブジェクトを利用するか明示的に設定
		prg.useProgram();
		// プログラムに頂点バッファとインデックスバッファをアタッチ
		prg.setAttribute(VBO, IBO);

		cameraUpdate();
		mat4.lookAt(cameraPosition, centerPoint, cameraUpDirection, vMatrix);
		mat4.perspective(45, 1.0, 0.1, cameraDistance * 2.0, pMatrix);
		mat4.multiply(pMatrix, vMatrix, vpMatrix);

		// 時間の経過を得る（Date.now は現在時刻のタイムスタンプをミリ秒で返す）
		nowTime = (Date.now() - startTime) / 1000;
		mat4.identity(mMatrix);
		mat4.rotate(mMatrix, nowTime * 0.5, [1.0, 1.0, 1.0], mMatrix);
		mat4.multiply(vpMatrix, mMatrix, mvpMatrix);
		// uniform 変数をシェーダにプッシュ
		prg.pushShader([
			mvpMatrix,
			[1.0, 1.0, 1.0, 1.0]
		]);
		// ドローコール（描画命令）
		gl3.drawElements(gl3.gl.TRIANGLES, index.length);

		// 再帰呼び出し
		if(run){requestAnimationFrame(render);}
	}

	// カメラ関連 =========================================================
	let cameraDistance     = 5.0;
	let cameraPosition     = [0.0, 0.0, cameraDistance];
	let centerPoint        = [0.0, 0.0, 0.0];
	let cameraUpDirection  = [0.0, 1.0, 0.0];
	let dCameraPosition    = [0.0, 0.0, cameraDistance];
	let dCenterPoint       = [0.0, 0.0, 0.0];
	let dCameraUpDirection = [0.0, 1.0, 0.0];
	let cameraRotateX      = 0.0;
	let cameraRotateY      = 0.0;
	let cameraScale        = 0.0;
	let clickStart         = false;
	let prevPosition       = [0, 0];
	let offsetPosition     = [0, 0];
	let qt  = qtn.identity(qtn.create());
	let qtx = qtn.identity(qtn.create());
	let qty = qtn.identity(qtn.create());
	function mouseInteractionStart(eve){
		clickStart = true;
		prevPosition = [
			eve.pageX,
			eve.pageY
		];
		eve.preventDefault();
	}
	function mouseInteractionMove(eve){
		if(!clickStart){return;}
		let w = canvas.width;
		let h = canvas.height;
		let s = 1.0 / Math.min(w, h);
		offsetPosition = [
			eve.pageX - prevPosition[0],
			eve.pageY - prevPosition[1]
		];
		prevPosition = [eve.pageX, eve.pageY];
		switch(eve.buttons){
			case 1:
				cameraRotateX += offsetPosition[0] * s;
				cameraRotateY += offsetPosition[1] * s;
				cameraRotateX = cameraRotateX % 1.0;
				cameraRotateY = Math.min(Math.max(cameraRotateY % 1.0, -0.25), 0.25);
				break;
		}
	}
	function mouseInteractionEnd(eve){
		clickStart = false;
	}
	function wheelScroll(eve){
		let w = eve.wheelDelta;
		if(w > 0){
			cameraScale = 0.8;
		}else if(w < 0){
			cameraScale = -0.8;
		}
	}
	function cameraUpdate(){
		let v = [1.0, 0.0, 0.0];
		cameraScale *= 0.75;
		cameraDistance += cameraScale;
		cameraDistance = Math.min(Math.max(cameraDistance, 5.0), 20.0);
		dCameraPosition[2] = cameraDistance;
		qtn.identity(qt);
		qtn.identity(qtx);
		qtn.identity(qty);
		qtn.rotate(cameraRotateX * gl3.PI2, [0.0, 1.0, 0.0], qtx);
		qtn.toVecIII(v, qtx, v);
		qtn.rotate(cameraRotateY * gl3.PI2, v, qty);
		qtn.multiply(qtx, qty, qt)
		qtn.toVecIII(dCameraPosition, qt, cameraPosition);
		qtn.toVecIII(dCameraUpDirection, qt, cameraUpDirection);
	}
	// カメラ関連ここまで =================================================
})();
