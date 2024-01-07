type CartesianCoordinate = number;
type RelativeCoordinate = number;

type RelativeSlope = number;
type CartesianSlope = number;

class Point {
	x: number;
	y: number;
}

class RelativePoint implements Point {
	x: RelativeCoordinate;
	y: RelativeCoordinate;
	w: number;
	h: number;
	constructor(
		x: RelativeCoordinate,
		y: RelativeCoordinate,
		w: number,
		h: number
	) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	static FromCartesian(
		x: CartesianCoordinate,
		y: CartesianCoordinate,
		w: number,
		h: number
	): RelativePoint {
		if (!w || !h) {
			console.error(
				'Cannot convert Euclidian coordiante to Relative coordiate without plane dimensions'
			);
		}
		let xr = w / 2 + x;
		let yr = h / 2 - y;
		return new RelativePoint(xr, yr, w, h);
	}
	static FromCartesianPoint(p: CartesianPoint): RelativePoint {
		let xr = p.w / 2 + p.x;
		let yr = p.h / 2 - p.y;
		return new RelativePoint(xr, yr, p.w, p.h);
	}

	ToCartesian(): CartesianPoint {
		if (!this.w || !this.h) {
			console.error(
				'Cannot convert Relative coordiante to Euclidian coordinate without plane dimensions'
			);
			return;
		}
		let xe = (this.w / 2 - this.x) * -1;
		let ye = this.h / 2 - this.y;
		return new CartesianPoint(xe, ye, this.w, this.h);
	}
}

class CartesianPoint implements Point {
	x: CartesianCoordinate;
	y: CartesianCoordinate;
	w: number;
	h: number;
	constructor(
		x: CartesianCoordinate,
		y: CartesianCoordinate,
		w: number,
		h: number
	) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	static FromRelative(
		x: RelativeCoordinate,
		y: RelativeCoordinate,
		w: number,
		h: number
	): CartesianPoint {
		if (!w || !h) {
			console.error(
				'Cannot convert Relative coordinate to Cartesian coordinate without plane dimensions'
			);
			return;
		}
		let xe = (w / 2 - x) * -1;
		let ye = h / 2 - y;
		return new CartesianPoint(xe, ye, w, h);
	}
	static FromRelativePoint(p: RelativePoint): CartesianPoint {
		let xe = p.w / 2 + p.x;
		let ye = p.h / 2 - p.y;
		return new CartesianPoint(xe, ye, p.w, p.h);
	}

	ToRelative(): RelativePoint {
		if (!this.w || !this.h) {
			console.error(
				'Cannot convert Cartesian coordinate to Relative coordinate without plane dimensions'
			);
			return;
		}
		let xr = this.w / 2 + this.x;
		let yr = this.h / 2 - this.y;
		return new RelativePoint(xr, yr, this.w, this.h);
	}
}

class Maths {
	static SegmentLine = (
		from: RelativePoint,
		to: RelativePoint,
		segments: number
	): RelativePoint[] => {
		let vertices: RelativePoint[] = [];
		let dx: RelativeCoordinate = to.x - from.x;
		let dy: RelativeCoordinate = to.y - from.y;
		for (let step = 0; step < segments + 1; step++) {
			vertices.push(
				new RelativePoint(
					from.x + (dx * step) / segments,
					from.y + (dy * step) / segments,
					from.w,
					from.h
				)
			);
		}
		return vertices;
	};
	static RelativeSlope = (
		p1: RelativePoint,
		p2: RelativePoint
	): RelativeSlope => {
		return Math.abs((p2.x - p1.x) / (p2.y - p1.y));
	};

	static CartesianSlope = (
		p1: CartesianPoint,
		p2: CartesianPoint
	): CartesianSlope => {
		return (p2.y - p1.y) / (p2.x - p1.x);
	};

	static DistanceRatio = (distance: number, p1: Point, p2: Point): number => {
		return (
			distance / Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
		);
	};

	static FindPointOnLine = (
		from: RelativePoint,
		to: RelativePoint,
		dist_ratio: number
	): RelativePoint => {
		let x = (1 - dist_ratio) * from.x + dist_ratio * to.x;
		let y = (1 - dist_ratio) * from.y + dist_ratio * to.y;
		return new RelativePoint(x, y, from.w, from.h);
	};

	static Midpoint = (p1: RelativePoint, p2: RelativePoint): RelativePoint => {
		return new RelativePoint((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, p1.w, p1.h);
	};

	static RelativeDirection = (slope: RelativeSlope) => {
		if (slope < 0.5) {
			// vertical
			return 'vertical';
		} else if (slope > 0.5 && slope < 1.5) {
			// diagonal
			return 'diagonal';
		} else if (slope > 3) {
			// horizontal
			return 'horizontal';
		}
	};

	static HexToRgb = (hex: string): number[] => {
		const r = parseInt(hex.substring(1, 3), 16);
		const g = parseInt(hex.substring(3, 5), 16);
		const b = parseInt(hex.substring(5, 7), 16);
		return [r, g, b];
	};
}

export {
	RelativeCoordinate,
	CartesianCoordinate,
	RelativePoint,
	CartesianPoint,
	RelativeSlope,
	CartesianSlope,
	Maths
};
