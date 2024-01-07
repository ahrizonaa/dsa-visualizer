import { graphSVG } from './graph-svg';
import { linkedlistSVG } from './linkedlist-svg';
import { queueSVG } from './queue-svg';
import { stackSVG } from './stack-svg';
import { treeSVG } from './tree-svg';

let domParser = new DOMParser();

export let svgs: ChildNode[] = [
	domParser.parseFromString(graphSVG, 'text/html').body.firstChild,
	domParser.parseFromString(treeSVG, 'text/html').body.firstChild,
	domParser.parseFromString(stackSVG, 'text/html').body.firstChild,
	domParser.parseFromString(queueSVG, 'text/html').body.firstChild,
	domParser.parseFromString(linkedlistSVG, 'text/html').body.firstChild
];
