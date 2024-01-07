import { Aesthetics } from '../utility/dsa-metadata';
import { RelativePoint } from '../utility/math-functions';

class TreeNode {
	val: number;
	point: RelativePoint;
	r: number;
	neighbors: any[];

	constructor(val: number) {
		this.val = val;
		this.point = null;
		this.r = NaN;
		this.neighbors = [];
	}
}

class BTreeNode {
	val: number | null;
	point: RelativePoint;
	r: number;
	left: BTreeNode | null;
	right: BTreeNode | null;
	leftnodes: number = 0;
	rightnodes: number = 0;

	constructor(val: number | null = null) {
		this.val = val;
	}
}

class EdgeSegment {
	curr: RelativePoint;
	next: RelativePoint;
	first?: RelativePoint;
	last?: RelativePoint;
	done?: boolean;
}

function* Edge(arr: RelativePoint[]): Generator<EdgeSegment> {
	let edge: RelativePoint[] = arr;
	let first: RelativePoint = arr[0];
	let last: RelativePoint = arr[arr.length - 1];

	for (let curr = 0; curr < edge.length - 1; curr++) {
		let data: EdgeSegment = {
			curr: edge[curr],
			next: edge[curr + 1]
		};
		yield data;
	}

	let end: EdgeSegment = {
		first: first,
		last: last,
		done: true
	} as EdgeSegment;

	return end;
}

class DataStructure {
	canvasBgColor = Aesthetics.CanvasBgColor;
	maxCellSize = 50;
	maxRadius = 50;
	minRadius = 11;
	edgeColor = Aesthetics.EdgeColor;
	nodeColor = Aesthetics.NodeColor;
	nodeFontSize = Aesthetics.NodeFontSize;
	nodeFontFamily = Aesthetics.NodeFontFamily;
	nodeFontColor = Aesthetics.NodeFontColor;
}

export { TreeNode, BTreeNode, Edge, DataStructure, EdgeSegment };
