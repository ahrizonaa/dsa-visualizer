import { TreeNode, Edge, DataStructure, EdgeSegment } from './data-structure';
import {
	CartesianCoordinate,
	CartesianPoint,
	CartesianSlope,
	Maths,
	RelativePoint
} from '../utility/math-functions.js';
import { DSA, Aesthetics } from '../utility/dsa-metadata';
import { UI } from '../ui.service';

import { Animate } from '../utility/animation-controller';

class Graph extends DataStructure {
	ctx: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	dataset: any[] = [];
	matrix: any[] = [];
	graph: any = {};
	weights: any[] = [];
	edgelist: any[] = [];
	unique_nodes: Set<number> = new Set();
	node_list: number[] = [];
	edges: any[] = [];
	radius: number = NaN;
	cell_size: number = NaN;
	grid_size: number = NaN;
	steps: number = 20;
	current_edge: number = 0;
	animation_frame_id: number = NaN;

	constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
		super();
		this.ctx = ctx;
		this.canvas = canvas;
	}

	Parse(input_dataset) {
		this.dataset = input_dataset;
		switch (UI.userSelection.dsaFormat) {
			case DSA.graph.adjacency_list.name:
				this.AdjacencyList();
				break;
			case DSA.graph.adjacency_matrix.name:
				this.AdjacencyMatrix();
				break;
			default:
				break;
		}

		this.cell_size = this.canvas.width / this.grid_size;
		this.radius = Math.min(this.maxRadius, this.cell_size * 0.25);
	}

	AdjacencyList() {
		this.edgelist = this.dataset.map((edge: number[]) =>
			edge.slice(edge.length - 2)
		);
		this.unique_nodes = new Set(this.edgelist.flat());
		this.node_list = Array.from(this.unique_nodes.values()).sort(
			(a, b) => a - b
		);
		this.grid_size = Math.ceil(Math.sqrt(this.unique_nodes.size));

		for (let i = 0; i < this.grid_size; i++) {
			this.matrix.push(
				this.node_list
					.slice(i * this.grid_size, i * this.grid_size + this.grid_size)
					.map((node) => new TreeNode(node))
			);
		}

		if (UI.userOptions.graph.weighted) {
			for (let edge of this.dataset) {
				let key = edge[1] + '_' + edge[2];
				let key_reverse = edge[2] + '_' + edge[1];
				if (key in this.weights) {
					this.weights[key].push(edge[0]);
				} else if (key_reverse in this.weights) {
					this.weights[key_reverse].push(edge[0]);
				} else {
					this.weights[key] = [edge[0]];
				}
			}
		}
	}

	AdjacencyMatrix() {
		this.node_list = Array.from(Array(this.dataset.length).keys()).map(
			(n) => n + 1
		);
		this.unique_nodes = new Set(this.node_list);

		this.grid_size = Math.ceil(Math.sqrt(this.unique_nodes.size));

		for (let row = 0; row < this.dataset.length; row++) {
			for (let col = row + 1; col < this.dataset.length; col++) {
				if (this.dataset[row][col] != 0) {
					let edge = [row + 1, col + 1];
					this.edgelist.push(edge);
					if (UI.userOptions.graph.weighted) {
						let key = edge[0] + '_' + edge[1];
						let key_reverse = edge[1] + '_' + edge[0];
						if (key in this.weights) {
							this.weights[key].push(this.dataset[row][col]);
						} else if (key_reverse in this.weights) {
							this.weights[key_reverse].push(this.dataset[row][col]);
						} else {
							this.weights[key] = [this.dataset[row][col]];
						}
					}
				}
			}
		}

		for (let i = 0; i < this.grid_size; i++) {
			this.matrix.push(
				this.node_list
					.slice(i * this.grid_size, i * this.grid_size + this.grid_size)
					.map((node) => new TreeNode(node))
			);
		}
	}

	Plot() {
		this.ctx.fillStyle = this.canvasBgColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.Draw();
	}

	Draw() {
		this.DrawNodes();
		this.DrawEdges();
		this.AnimateEdges();
	}

	DrawNodes(): void {
		for (let row = 0; row < this.matrix.length; row++) {
			for (let col = 0; col < this.matrix[row].length; col++) {
				let offset_x = Math.floor(Math.random() * (10 - -10 + 1) + -10);
				let offset_y = Math.floor(Math.random() * (10 - -10 + 1) + -10);
				let xr = this.cell_size * row + this.cell_size / 2 + offset_x;
				let yr = this.cell_size * col + this.cell_size / 2 + offset_y;

				if (yr - this.radius <= 0) {
					yr = this.radius;
				}

				this.matrix[row][col].point = new RelativePoint(
					xr,
					yr,
					this.canvas.width,
					this.canvas.height
				);
				this.matrix[row][col].r = this.radius;
				this.graph[this.matrix[row][col].val] = this.matrix[row][col];

				this.ctx.beginPath();
				this.ctx.fillStyle = this.nodeColor;
				this.ctx.arc(xr, yr, this.radius, 0, 2 * Math.PI);
				this.ctx.fill();
				this.ctx.closePath();

				this.ctx.beginPath();
				this.ctx.fillStyle = this.nodeFontColor;
				this.ctx.font = `${this.nodeFontSize} ${this.nodeFontFamily}`;
				this.ctx.textAlign = 'center';
				this.ctx.fillText(String(this.matrix[row][col].val), xr, yr + 3);
				this.ctx.closePath();
			}
		}
	}

	DrawEdges() {
		for (let [from, to] of this.edgelist) {
			let node1 = this.graph[from];
			let node2 = this.graph[to];
			let key_to = from + '_' + to;
			let key_from = to + '_' + from;

			if (
				UI.userOptions.graph.weighted &&
				this.weights[key_to].length == 0 &&
				this.weights[key_from].length == 0
			) {
				continue;
			}

			let dist_ratio = Maths.DistanceRatio(
				this.radius,
				node1.point,
				node2.point
			);

			let pr1_edge = Maths.FindPointOnLine(
				node1.point,
				node2.point,
				dist_ratio
			);
			let pr2_edge = Maths.FindPointOnLine(
				node2.point,
				node1.point,
				dist_ratio
			);

			if (Animate.enabled) {
				this.edges.push(
					Edge.bind(this)(Maths.SegmentLine(pr1_edge, pr2_edge, this.steps))
				);
			} else {
				this.ctx.beginPath();
				this.ctx.strokeStyle = this.edgeColor;
				this.ctx.moveTo(pr1_edge.x, pr1_edge.y);
				this.ctx.lineTo(pr2_edge.x, pr2_edge.y);
				this.ctx.stroke();
				if (UI.userOptions.graph.directed) {
					this.PlotArrowHead(pr2_edge, pr1_edge);
				}
			}

			if (UI.userOptions.graph.weighted) {
				this.PlotEdgeLabel(node1, node2, key_from, key_to);
			}
		}
	}

	PlotEdgeLabel(
		node1: TreeNode,
		node2: TreeNode,
		key_from: string,
		key_to: string
	): void {
		let mid_point = Maths.Midpoint(node1.point, node2.point);

		let edge_label = this.FormatEdgeLabel(key_to, key_from);

		let slope = Maths.RelativeSlope(node1.point, node2.point);

		let [label_x_offset, label_y_offset] = this.CalculateLabelOffsets(
			slope,
			edge_label
		);

		this.ctx.beginPath();
		this.ctx.fillStyle = '#CCCCCC';
		this.ctx.font = '10px monospace';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(
			edge_label,
			mid_point.x + label_x_offset,
			mid_point.y + label_y_offset
		);
		this.ctx.closePath();
	}

	FormatEdgeLabel(key_to, key_from) {
		let text = '';
		if (this.weights[key_to] || this.weights[key_from]) {
			if (this.weights[key_to].length) {
				text = this.weights[key_to].sort((a, b) => a - b).join(', ');
			} else if (this.weights[key_from].length) {
				text = this.weights[key_from].sort((a, b) => b - a).join(',');
			}
			this.weights[key_to] = [];
			this.weights[key_from] = [];
		}
		return text;
	}

	CalculateLabelOffsets(slope, edge_label) {
		let text_x_offset = 0;
		let text_y_offset = 0;
		if (slope < 0.5) {
			// vertical
			text_x_offset = edge_label.length > 1 ? -(edge_label.length + 10) : -6;
		} else if (slope > 0.5 && slope < 1.5) {
			// diagonal
			text_x_offset = edge_label.length > 1 ? -(edge_label.length + 10) : -6;
		} else if (slope > 3) {
			// horizontal
			text_y_offset = -3;
		}

		return [text_x_offset, text_y_offset];
	}

	AnimateEdges() {
		if (!Animate.enabled) return;
		let res: { done: boolean; value: EdgeSegment } =
			this.edges[this.current_edge].next();

		if (res.done == false) {
			let { curr, next } = res.value;
			Animate.Request(this.AnimateEdges.bind(this));

			this.ctx.beginPath();
			this.ctx.strokeStyle = this.edgeColor;
			this.ctx.moveTo(curr.x, curr.y);
			this.ctx.lineTo(next.x, next.y);
			this.ctx.stroke();
		} else if (res.done == true) {
			let { first, last } = res.value;
			Animate.Cancel();
			this.ctx.closePath();
			this.current_edge += 1;

			if (UI.userOptions.graph.directed) {
				this.PlotArrowHead(last, first);
			}

			if (this.current_edge < this.edges.length) {
				Animate.Request(this.AnimateEdges.bind(this));
			}
			return;
		}
	}

	PlotArrowHead(last: RelativePoint, first: RelativePoint) {
		let centerPoint: CartesianPoint = last.ToCartesian();

		let a = 30;

		let slope: CartesianSlope = Maths.CartesianSlope(
			first.ToCartesian(),
			last.ToCartesian()
		);

		let xt1: CartesianCoordinate =
			centerPoint.x +
			Aesthetics.ArrowheadSize *
				Math.cos(Math.atan(slope) - a * (Math.PI / 180));
		let yt1: CartesianCoordinate =
			centerPoint.y +
			Aesthetics.ArrowheadSize *
				Math.sin(Math.atan(slope) - a * (Math.PI / 180));

		let targetPoint1: RelativePoint = RelativePoint.FromCartesian(
			xt1,
			yt1,
			last.w,
			last.h
		);

		let xt2: CartesianCoordinate =
			centerPoint.x +
			Aesthetics.ArrowheadSize *
				Math.cos(Math.atan(slope) + a * (Math.PI / 180));
		let yt2: CartesianCoordinate =
			centerPoint.y +
			Aesthetics.ArrowheadSize *
				Math.sin(Math.atan(slope) + a * (Math.PI / 180));

		let targetPoint2: RelativePoint = RelativePoint.FromCartesian(
			xt2,
			yt2,
			last.w,
			last.h
		);

		let distRatio: number = Maths.DistanceRatio(
			Aesthetics.ArrowheadSize,
			last,
			targetPoint1
		);

		let pr1_edge: RelativePoint = Maths.FindPointOnLine(
			last,
			targetPoint1,
			distRatio
		);

		let pr2_edge: RelativePoint = Maths.FindPointOnLine(
			last,
			targetPoint2,
			distRatio
		);

		let vx = centerPoint.x - pr1_edge.ToCartesian().x;
		let vy = centerPoint.y - pr1_edge.ToCartesian().y;
		let len = Math.sqrt(vx * vx + vy * vy);
		let cx = (vx / len) * Aesthetics.ArrowheadSize + centerPoint.x;
		let cy = (vy / len) * Aesthetics.ArrowheadSize + centerPoint.y;

		let vx2 = centerPoint.x - pr2_edge.ToCartesian().x;
		let vy2 = centerPoint.y - pr2_edge.ToCartesian().y;
		let len2 = Math.sqrt(vx2 * vx2 + vy2 * vy2);
		let cx2 = (vx2 / len2) * Aesthetics.ArrowheadSize + centerPoint.x;
		let cy2 = (vy2 / len2) * Aesthetics.ArrowheadSize + centerPoint.y;
		let cr1 = RelativePoint.FromCartesian(
			cx,
			cy,
			this.canvas.width,
			this.canvas.height
		);
		let cr2 = RelativePoint.FromCartesian(
			cx2,
			cy2,
			this.canvas.width,
			this.canvas.height
		);

		let dp1 = null,
			dp2 = null;

		if (last.y - first.y > 0) {
			//downwards
			if (Math.min(cr1.y, cr2.y) < Math.min(pr1_edge.y, pr2_edge.y)) {
				dp1 = cr1;
				dp2 = cr2;
			} else {
				dp1 = pr1_edge;
				dp2 = pr2_edge;
			}
		} else if (last.y - first.y < 0) {
			// upwards
			if (Math.max(cr1.y, cr2.y) > Math.max(pr1_edge.y, pr2_edge.y)) {
				dp1 = cr1;
				dp2 = cr2;
			} else {
				dp1 = pr1_edge;
				dp2 = pr2_edge;
			}
		}

		this.ctx.beginPath();
		this.ctx.strokeStyle = this.edgeColor;
		this.ctx.moveTo(last.x, last.y);
		this.ctx.lineTo(dp1.x, dp1.y);
		this.ctx.stroke();
		this.ctx.closePath();

		this.ctx.beginPath();
		this.ctx.strokeStyle = this.edgeColor;
		this.ctx.moveTo(last.x, last.y);
		this.ctx.lineTo(dp2.x, dp2.y);
		this.ctx.stroke();
	}

	Recolor() {}
}

export { Graph };
