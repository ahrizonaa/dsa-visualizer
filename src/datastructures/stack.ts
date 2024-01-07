import { Animate } from '../utility/animation-controller';
import { Aesthetics } from '../utility/dsa-metadata';
import { RelativePoint } from '../utility/math-functions';
import { DataStructure, Edge, EdgeSegment } from './data-structure';

class StackBox {
	points: RelativePoint[];
	curr: number = 0;
	val: string;
	push: boolean;
	constructor(
		points: RelativePoint[] = [],
		val: string = '',
		push: boolean = true
	) {
		this.points = points;
		this.val = val;
		this.push = push;
	}
}

class Stack extends DataStructure {
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	datasetCache: any[];
	dataset: any[];
	stackWidth: number = 100;
	stackHeight: number;
	boxWidth: number = 90;
	boxHeight: number = 40;
	beizerSpeed: number = 0.05;
	edges: any[] = [];
	current_edge: number = 0;
	maxHeight: number = 50;
	prev: RelativePoint = new RelativePoint(0, 0, 0, 0);
	animationQueue: StackBox[] = [];
	boxes: StackBox[] = [];

	constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		super();
		this.ctx = ctx;
		this.canvas = canvas;
	}

	Parse(input: number[]) {
		this.dataset = input.slice(0, 6);

		this.stackHeight = this.canvas.height - 100;
	}

	Plot() {
		this.ctx.fillStyle = this.canvasBgColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.Draw();
	}

	Draw() {
		this.DrawStack();
		this.DrawBoxes();
		this.AnimateStackPush();
	}

	DrawStack() {
		let x = this.canvas.width / 2 - 50;
		let y = 50;
		this.ctx.strokeStyle = '#CCC';

		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.ctx.lineTo(x, this.stackHeight + 50);
		this.ctx.moveTo(x, this.stackHeight + 50);
		this.ctx.lineTo(x + this.stackWidth, this.stackHeight + 50);
		this.ctx.moveTo(x + this.stackWidth, this.stackHeight + 50);
		this.ctx.lineTo(x + this.stackWidth, 50);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	DrawBoxes() {
		for (let i = 0; i < this.dataset.length; i++) {
			let x = this.canvas.width / 2 - 45;
			let y = this.canvas.height - (50 + (i + 1) * (this.boxHeight + 2));

			let p0 = { x: 10, y: 10 };
			let p1 = { x: this.canvas.width / 2 - 45, y: 10 + (y - 10) / 4 };
			let p2 = { x: this.canvas.width / 2 - 45, y: y - (y - 10) / 4 };
			let p3 = {
				x: this.canvas.width / 2 - 45,
				y: this.canvas.height - (50 + (i + 1) * (this.boxHeight + 4)) + 12
			};

			let points: RelativePoint[] = [];

			for (var j = 0; j < 1; j += this.beizerSpeed) {
				var p = this.Bezier(j, p0, p1, p2, p3);
				points.push(
					new RelativePoint(p.x, p.y, this.canvas.width, this.canvas.height)
				);
			}

			let box = new StackBox(points, this.dataset[i]);

			this.EnqueueAnimation(box);
		}
	}

	Push() {
		this.dataset.push('');

		let i = this.dataset.length - 1;

		let y = this.canvas.height - (50 + (i + 1) * (this.boxHeight + 2));

		let p0 = { x: 10, y: 10 };
		let p1 = { x: this.canvas.width / 2 - 45, y: 10 + (y - 10) / 4 };
		let p2 = { x: this.canvas.width / 2 - 45, y: y - (y - 10) / 4 };
		let p3 = {
			x: this.canvas.width / 2 - 45,
			y: this.canvas.height - (50 + (i + 1) * (this.boxHeight + 4)) + 12
		};

		let points: RelativePoint[] = [];

		for (var j = 0; j < 1; j += this.beizerSpeed) {
			var p = this.Bezier(j, p0, p1, p2, p3);
			points.push(
				new RelativePoint(p.x, p.y, this.canvas.width, this.canvas.height)
			);
		}

		let box = new StackBox(points);

		this.EnqueueAnimation(box);
	}

	Pop() {
		if (this.dataset.length == 0) {
			return;
		}
		let i = this.dataset.length - 1;
		let y = this.canvas.height - (50 + (i + 1) * (this.boxHeight + 2));

		let box = this.boxes.pop();

		let p0 = { x: this.canvas.width - 10, y: 10 };
		let p1 = { x: this.canvas.width / 2 + 45, y: 10 + (y - 10) / 4 };
		let p2 = { x: this.canvas.width / 2 + 45, y: y - (y - 10) / 4 };
		let p3 = {
			x: box.points[box.points.length - 1].x,
			y: box.points[box.points.length - 1].y
		};

		let points: RelativePoint[] = [];

		for (var j = 0; j < 1; j += this.beizerSpeed) {
			var p = this.Bezier(j, p3, p2, p1, p0);
			points.push(
				new RelativePoint(p.x, p.y, this.canvas.width, this.canvas.height)
			);
		}

		this.dataset.pop();

		box.points = points;
		box.curr = 0;
		box.push = false;

		this.EnqueueAnimation(box);
	}

	EnqueueAnimation(box: StackBox) {
		if (!Animate.enabled) {
			this.ctx.fillStyle = Aesthetics.NodeColor;
			this.ctx.fillRect(
				box.points[box.points.length - 1].x - 1,
				box.points[box.points.length - 1].y - 1,
				this.boxWidth + 2,
				this.boxHeight
			);

			this.ctx.fillStyle = this.nodeFontColor;
			this.ctx.font = `${this.nodeFontSize} ${this.nodeFontFamily}`;
			this.ctx.textAlign = 'center';
			this.ctx.fillText(
				box.val,
				box.points[box.points.length - 1].x + this.boxWidth / 2 - 2,
				box.points[box.points.length - 1].y + this.boxHeight / 2 + 3
			);

			return;
		}

		this.animationQueue.push(box);

		if (Animate.IsInactive()) {
			Animate.Request(
				this.AnimateStackPush.bind(this, this.animationQueue.shift())
			);
		}
	}
	AnimateStackPush(box: StackBox = null) {
		if (!box) {
			return;
		}
		if (box.curr < box.points.length) {
			this.ctx.beginPath();

			this.ctx.fillStyle = this.canvasBgColor;
			if (box.curr > 0) {
				this.ctx.fillRect(
					box.points[box.curr - 1].x - 1,
					box.points[box.curr - 1].y - 1,
					this.boxWidth + 2,
					this.boxHeight + 2
				);
			}

			let x = this.canvas.width / 2 - 50;
			let y = 50;
			this.ctx.strokeStyle = '#CCC';

			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
			this.ctx.lineTo(x, this.stackHeight + 50);
			this.ctx.moveTo(x + 100, y);
			this.ctx.lineTo(x + 100, this.stackHeight + 50);
			this.ctx.stroke();

			this.ctx.fillStyle = Aesthetics.NodeColor;
			this.ctx.fillRect(
				box.points[box.curr].x,
				box.points[box.curr].y,
				this.boxWidth,
				this.boxHeight
			);

			this.ctx.closePath();

			box.curr += 1;

			Animate.Request(this.AnimateStackPush.bind(this, box));
		} else {
			Animate.Cancel();
			if (box.push) this.boxes.push(box);

			if (box.push) {
				this.ctx.fillStyle = 'black';
				this.ctx.font = '10px monospace';
				this.ctx.textAlign = 'center';
				this.ctx.fillText(
					box.val,
					box.points[box.points.length - 1].x + this.boxWidth / 2 - 2,
					box.points[box.points.length - 1].y + this.boxHeight / 2 + 3
				);
			} else if (!box.push) {
				this.ctx.fillStyle = this.canvasBgColor;
				this.ctx.fillRect(
					box.points[box.curr - 1].x - 1,
					box.points[box.curr - 1].y - 1,
					this.boxWidth + 2,
					this.boxHeight + 2
				);
			}

			if (this.animationQueue.length) {
				let next = this.animationQueue.shift();
				Animate.Request(this.AnimateStackPush.bind(this, next));
			}
		}
	}

	Bezier(t, p0, p1, p2, p3) {
		var cX = 3 * (p1.x - p0.x),
			bX = 3 * (p2.x - p1.x) - cX,
			aX = p3.x - p0.x - cX - bX;

		var cY = 3 * (p1.y - p0.y),
			bY = 3 * (p2.y - p1.y) - cY,
			aY = p3.y - p0.y - cY - bY;

		var x = aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0.x;
		var y = aY * Math.pow(t, 3) + bY * Math.pow(t, 2) + cY * t + p0.y;

		return { x: x, y: y };
	}
}

export { Stack, StackBox };
