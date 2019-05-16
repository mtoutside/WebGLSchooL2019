const AudioContext = window.AudioContext || window.webkitAudioContext;

const ctx = new AudioContext();
const input = new GainNode(ctx);
const buffer = LoadSample(ctx, './tink.wav');
console.log(buffer);

const audioSource = ctx.createBufferSource();
async function LoadSample(actx, url) {
	fetch(url)
		.then((response)=>{
			return response.arrayBuffer();
		})
		.then((arraybuf)=>{
			return actx.decodeAudioData(arraybuf);
		})
		.then((buf)=>{
			// resolv(buf);
			audioSource.buffer = buf;
			audioSource.connect(ctx.destination);
			console.log(audioSource.buffer);
			// audioSource.start();
		});
}

const body = document.querySelector('body');
body.addEventListener('click', () => {
	if(audioSource.state=="suspended") {
		audioSource.resume();
	}
	audioSource.start();
});
