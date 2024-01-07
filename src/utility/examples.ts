interface Example {
	title: string;
	dataset: any[];
	options: {};
	format: string;
}

interface Examples {
	graph: Example[];
	tree: Example[];
	stack: Example[];
	queue: Example[];
	linkedlist: Example[];
}

const examples: Examples = {
	stack: [],
	queue: [],
	linkedlist: [
		{
			title: 'Reverse Linked List',
			dataset: [1, 2, 3, 4, 5],
			options: {
				doubly: false
			},
			format: 'linkedlist_array'
		},
		{
			title: 'Middle of Linked List',
			dataset: [1, 2, 3, 4, 5, 6],
			options: {
				doubly: false
			},
			format: 'linkedlist_array'
		},
		{
			title: 'Delete Middle Node of Linked List',
			dataset: [1, 3, 4, 7, 1, 2, 6],
			options: {
				doubly: false
			},
			format: 'linkedlist_array'
		}
	]
};

export { examples };
