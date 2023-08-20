'use strict';

const MAX_IMAGE_SIZE = 448;

let canvas;
let ctx;
let wrapperwidth = 0;

let isDrawing = false;
let isChanged = false;
let pos = {
	start: {
		x: 0,
		y: 0
	},
	end: {
		x: 0,
		y: 0
	}
}

// ページが読み込み終わったら初期化関数を実行
window.addEventListener("load", () => {
	connectedCallback();
});

// 初期化関数
const connectedCallback = () => {
	canvas = document.querySelector('.drawCvs');
	ctx = canvas.getContext('2d');
	wrapperwidth = document.querySelector('.drawcanvaswrapper').clientWidth - 24;

	if (wrapperwidth > MAX_IMAGE_SIZE) {
		canvas.width = MAX_IMAGE_SIZE;
		canvas.height = MAX_IMAGE_SIZE;
	} else {
		canvas.width = wrapperwidth;
		canvas.height = wrapperwidth;
	}

	ctx.fillStyle = 'rgb(255,255,255)'
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = 'black';
	ctx.lineWidth = 3;

	canvas.addEventListener('mousedown', handleMouseDown, false);
	canvas.addEventListener('mousemove', handleMouseMove, false);
	canvas.addEventListener('mouseup', handleMouseUp, false);
	canvas.addEventListener('mouseout', handleMouseUp, false);

	canvas.addEventListener('touchstart', handleMouseDown, false);
	canvas.addEventListener('touchmove', handleMouseMove, false);
	canvas.addEventListener('touchend', handleMouseUp, false);
};

const handleMouseDown = (evt) => {
	isDrawing = true;
	evt.preventDefault();

	const clickedX = (Math.floor(evt.clientX) || Math.floor(evt.touches[0].clientX)) - Math.floor(evt.target.getBoundingClientRect().left);
	const clickedY = (Math.floor(evt.clientY) || Math.floor(evt.touches[0].clientY)) - Math.floor(evt.target.getBoundingClientRect().top);

	pos['start']['x'] = clickedX;
	pos['start']['y'] = clickedY;
}

const handleMouseMove = (evt) => {
	if (!isDrawing) return;
	isChanged = true;

	const clickedX = (Math.floor(evt.clientX) || Math.floor(evt.touches[0].clientX)) - Math.floor(evt.target.getBoundingClientRect().left);
	const clickedY = (Math.floor(evt.clientY) || Math.floor(evt.touches[0].clientY)) - Math.floor(evt.target.getBoundingClientRect().top);

	pos['end']['x'] = clickedX;
	pos['end']['y'] = clickedY;

	ctx.beginPath();
	ctx.moveTo(pos['end']['x'], pos['end']['y']);
	ctx.lineTo(pos['start']['x'], pos['start']['y']);
	ctx.stroke();

	pos['start']['x'] = clickedX;
	pos['start']['y'] = clickedY;

}

const handleMouseUp = (evt) => {
	isDrawing = false;
}

// canvas をクリアする
const handleClickClear = () => {
	const ret = confirm('全部消して良いですか？')
	if (ret) {
		wrapperwidth = document.querySelector('.drawcanvaswrapper').clientWidth - 24;

		if (wrapperwidth > MAX_IMAGE_SIZE) {
			canvas.width = MAX_IMAGE_SIZE;
			canvas.height = MAX_IMAGE_SIZE;
		} else {
			canvas.width = wrapperwidth;
			canvas.height = wrapperwidth;
		}

		ctx.fillStyle = 'rgb(255,255,255)'
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 3;

	}
}

// ペンボタンを押した
const handleClickPen = () => {
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 3;
}

// 消しゴムボタンを押した
const handleClickEraser = () => {
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 9;
}

// ダウンロードボタンを押した
const handleClickDownloadImage = () => {
	if (!isChanged) {
		alert('画像が用意できていません');
		return;
	}

	// ファイル名を取得
	const fn = document.querySelector('.form-input-filename').value;	
	const filename = (fn) ? fn : 'イメージ';

	const result = confirm(`画像を ${filename}.png としてダウンロードします。よろしいですか？`);
	if (result) {
		let link = document.createElement('a');
		link.href = canvas.toDataURL();
		link.download = `${filename}.png`;
		link.click();
	}
}

const loadImage = async (evt) => {
	console.log('[LOG] loadImage');

	isChanged = true;

	const files = evt.target.files;
	const reader = new FileReader();

	reader.onload = () => {
		let img = new Image();
		img.onload = () => {

			let w = img.width;
			let h = img.height;

			if (img.width > img.height && img.width > MAX_IMAGE_SIZE) {
				w = MAX_IMAGE_SIZE;
				h = img.height * (MAX_IMAGE_SIZE / img.width);
			} else if (img.height > img.width && img.height > MAX_IMAGE_SIZE) {
				w = img.width * (MAX_IMAGE_SIZE / img.height)
				h = MAX_IMAGE_SIZE;
			}

			canvas.width = w;
			canvas.height = h;
			ctx.drawImage(img, 0, 0, w, h);
		}
		img.src = reader.result;
	}
	reader.readAsDataURL(files[0]);
};