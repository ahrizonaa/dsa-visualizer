import { Animate } from '../utility/animation-controller';
import { Aesthetics } from '../utility/dsa-metadata';
import { Maths, RelativePoint } from '../utility/math-functions';
import { DataStructure } from './data-structure';

class QueueBox {
	points: RelativePoint[];
	curr: number = 0;
	val: string;
	enqueue: boolean;
	dequeue: boolean;
	shift: boolean;
	constructor(
		points: RelativePoint[] = [],
		val: string = '',
		enqueue: boolean = true,
		dequeue: boolean = false,
		shift: boolean = false
	) {
		this.points = points;
		this.val = val;
		this.enqueue = enqueue;
		this.dequeue = dequeue;
		this.shift = shift;
	}

	set(op: string) {
		this.enqueue = op == 'enqueue';
		this.dequeue = op == 'dequeue';
		this.shift = op == 'shift';
	}
}

class Queue extends DataStructure {
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	datasetCache: any[];
	dataset: any[];
	queueWidth: number = 100;
	queueHeight: number;
	boxWidth: number = 40;
	boxHeight: number = 90;
	beizerSpeed: number = 0.05;
	edges: any[] = [];
	current_edge: number = 0;
	maxHeight: number = 50;
	prev: RelativePoint = new RelativePoint(0, 0, 0, 0);
	animationQueue: QueueBox[] = [];
	boxes: QueueBox[] = [];

	constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		super();
		this.ctx = ctx;
		this.canvas = canvas;
	}

	Parse(input: number[]) {
		this.dataset = input.slice(0, 6);

		this.queueWidth = this.canvas.width - 100;
		this.queueHeight = 100;
	}

	Plot() {
		this.ctx.fillStyle = this.canvasBgColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.Draw();
	}

	Draw() {
		this.DrawQueue();
		this.DrawBoxes();
		this.AnimateStackPush.bind(this);
		this.AnimateStackPush();
	}

	DrawQueue() {
		let x = this.canvas.width - this.queueWidth - 50;
		let y = this.canvas.height / 2 - this.queueHeight / 2;
		this.ctx.strokeStyle = '#CCC';

		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.ctx.lineTo(x + this.queueWidth, y);
		this.ctx.moveTo(x, y + 100);
		this.ctx.lineTo(x + this.queueWidth, y + 100);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	DrawBoxes() {
		for (let i = 0; i < this.dataset.length; i++) {
			let x = 52.5 + i * (this.boxWidth + 2.5);
			let y = this.canvas.height / 2 - 45;

			let p0 = new RelativePoint(
				this.canvas.width - 5 - this.boxWidth,
				y,
				this.canvas.width,
				this.canvas.height
			);
			let p1 = new RelativePoint(x, y, this.canvas.width, this.canvas.height);

			let points: RelativePoint[] = Maths.SegmentLine(p0, p1, 25);

			let box = new QueueBox(points, this.dataset[i]);

			this.EnqueueAnimation(box);
		}
	}

	Enqueue() {
		if (this.dataset.length >= 6) {
			return;
		}
		if (Animate.IsActive()) {
			return;
		}
		this.dataset.push('');

		let i = this.dataset.length - 1;

		let x = 52.5 + i * (this.boxWidth + 2.5);
		let y = this.canvas.height / 2 - 45;

		let p0 = new RelativePoint(
			this.canvas.width - 5 - this.boxWidth,
			y,
			this.canvas.width,
			this.canvas.height
		);

		let p1 = new RelativePoint(x, y, this.canvas.width, this.canvas.height);

		let points: RelativePoint[] = Maths.SegmentLine(p0, p1, 25);

		let box = new QueueBox(points, this.dataset[i]);

		this.EnqueueAnimation(box);
	}

	Dequeue() {
		if (this.dataset.length == 0) {
			return;
		}
		if (Animate.IsActive()) {
			return;
		}
		let y = this.canvas.height / 2 - 45;
		let box = this.boxes.shift();

		let p0 = new RelativePoint(10, y, this.canvas.width, this.canvas.height);
		let p1 = new RelativePoint(
			box.points[box.points.length - 1].x,
			box.points[box.points.length - 1].y,
			this.canvas.width,
			this.canvas.height
		);

		let points: RelativePoint[] = Maths.SegmentLine(p1, p0, 25);

		this.dataset.shift();

		box.points = points;
		box.curr = 0;
		box.set('dequeue');

		this.EnqueueAnimation(box);

		this.QueueShift();
	}

	QueueShift(): void {
		for (let i = 0; i < this.dataset.length; i++) {
			let x0 = 2.5 + i * (this.boxWidth + 2.5) + 50;
			let y = this.canvas.height / 2 - 45;
			let p0 = new RelativePoint(x0, y, this.canvas.width, this.canvas.height);

			let p1 = this.boxes[i].points[this.boxes[i].points.length - 1];

			let points = Maths.SegmentLine(p1, p0, (i + 1) * 5);

			this.boxes[i].points = points;
			this.boxes[i].curr = 0;
			this.boxes[i].set('shift');
			this.EnqueueAnimation(this.boxes[i]);
		}
	}

	EnqueueAnimation(box: QueueBox) {
		if (!Animate.enabled) {
			this.ctx.fillStyle = Aesthetics.NodeColor;
			this.ctx.fillRect(
				box.points[box.points.length - 1].x - 1,
				box.points[box.points.length - 1].y - 1,
				this.boxWidth,
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

	AnimateStackPush(box: QueueBox = null) {
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
			if (box.enqueue) {
				this.boxes.push(box);
			}

			if (box.enqueue || box.shift) {
				this.ctx.beginPath();
				this.ctx.fillStyle = this.nodeFontColor;
				this.ctx.font = `${this.nodeFontSize} ${this.nodeFontFamily}`;
				this.ctx.textAlign = 'center';
				this.ctx.fillText(
					box.val,
					box.points[box.points.length - 1].x + this.boxWidth / 2 - 2,
					box.points[box.points.length - 1].y + this.boxHeight / 2 + 3
				);
				this.ctx.closePath();
			} else if (box.dequeue) {
				this.ctx.fillStyle = this.canvasBgColor;
				this.ctx.fillRect(
					box.points[box.curr - 1].x - 1,
					box.points[box.curr - 1].y - 1,
					this.boxWidth + 2,
					this.boxHeight + 2
				);
			} else if (box.shift) {
			}

			if (this.animationQueue.length) {
				let next = this.animationQueue.shift();
				Animate.Request(this.AnimateStackPush.bind(this, next));
			}
		}
	}
}

export { Queue, QueueBox };
