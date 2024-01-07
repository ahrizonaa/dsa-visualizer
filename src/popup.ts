import { Graph } from './datastructures/graph';

import {
	Ripple,
	Collapse,
	Popconfirm,
	Input,
	Validation,
	initTE
} from 'tw-elements/dist/js/tw-elements.es.min';
initTE({ Input, Validation, Ripple, Collapse, Popconfirm });
import { Aesthetics } from './utility/dsa-metadata';
import { UI } from './ui.service';
import { IdleSvg } from './idle-animation/idle-svg';
import { Tree } from './datastructures/tree';
import { Stack } from './datastructures/stack';
import { Queue } from './datastructures/queue';
import { LinkedList } from './datastructures/linkedlist';
import { Animate } from './utility/animation-controller';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let canvasOverlay: HTMLImageElement;

let ds: Graph | Tree | Stack | Queue | LinkedList | any = null;

document.addEventListener('StackPush', (event: any) => {
	if (ds.dataset.length < 6) {
		ds.Push();
	}
});

document.addEventListener('StackPop', (event: any) => {
	if (ds.dataset.length > 0) {
		ds.Pop();
	}
});

document.addEventListener('QueueEnqueue', (event: any) => {
	if (ds.dataset.length < 6) {
		ds.Enqueue();
	}
});

document.addEventListener('QueueDequeue', (event: any) => {
	if (ds.dataset.length > 0) {
		ds.Dequeue();
	}
});

function goClicked(): void {
	if (UI.formValid === true) {
		visualize();
	}
}

function visualize() {
	Animate.Cancel();
	clearCanvas();
	let rawInput = UI.textarea.value;
	let input = JSON.parse(rawInput, function (k, v) {
		return typeof v === 'object' || isNaN(v) ? v : parseInt(v, 10);
	});
	localStorage.setItem('user-input', JSON.stringify(input));
	canvasOverlay.style.display = 'none';
	switch (UI.userSelection.dsaType) {
		case null:
			return;
		case 'graph':
			UI.edgeLabel.style.display = 'flex';
			ds = new Graph(ctx, canvas);
			break;
		case 'tree':
			UI.edgeLabel.style.display = 'flex';
			ds = new Tree(ctx, canvas);
			break;
		case 'stack':
			UI.edgeLabel.style.display = 'none';
			ds = new Stack(ctx, canvas);
			break;
		case 'queue':
			UI.edgeLabel.style.display = 'none';
			ds = new Queue(ctx, canvas);
			break;
		case 'linkedlist':
			UI.edgeLabel.style.display = 'flex';
			ds = new LinkedList(ctx, canvas);
			break;
		default:
			return;
	}

	ds.Parse(input);
	ds.Plot();
	Animate.enabled = true;
}

function clearCanvas() {
	ctx.fillStyle = Aesthetics.CanvasBgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setupCanvas() {
	let content = document.getElementById('content')!;
	let form = document.getElementById('form-wrapper')!;
	canvas = document.querySelector('canvas');
	canvas.width = content.clientWidth - form.clientWidth - 20;
	canvas.height = canvas.width;
	ctx = canvas.getContext('2d', { alpha: false });
	clearCanvas();

	document.getElementById('idle-overlay').appendChild(IdleSvg);
	canvasOverlay = document.querySelector(
		'#idle-overlay > svg'
	)! as HTMLImageElement;
}

function restoreCache() {
	let cachedInput = localStorage.getItem('user-input');
	let userSelection = localStorage.getItem('user-selection');
	let userOptions = localStorage.getItem('user-options');
	if (userSelection) {
		UI.userSelection = JSON.parse(userSelection);
	}
	if (userOptions && Object.keys(userOptions).length) {
		UI.userOptions = JSON.parse(userOptions);
	}

	if (cachedInput != null) {
		UI.textarea.value = cachedInput;
	}

	UI.toggleAll();
}

function init() {
	UI.submitBtn.addEventListener('click', goClicked.bind(this));

	setupCanvas();

	UI.createRadio();

	restoreCache();
}

init();

export { clearCanvas };
