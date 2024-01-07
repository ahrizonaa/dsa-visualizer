import {
	Aesthetics,
	DataStructureOptions,
	DataStructureRadioOption,
	DataStructureSelection,
	DSA,
	UserOptions,
	UserSelection
} from './utility/dsa-metadata';

import {
	Collapse,
	Popconfirm,
	Validation
} from 'tw-elements/dist/js/tw-elements.es.min';
import { svgs } from './animated-datastructure-icons/svg-icons';
import { RadioBtn } from './radio-buttons/radio-btn';
import { ListBtn } from './radio-buttons/list-btn';
import { PopDiv } from './radio-buttons/pop-div';

import { map, distinctUntilChanged, fromEvent, debounceTime, tap } from 'rxjs';
import { RadioGroup } from './radio-buttons/radio-group-div';
import { SwitchPanel } from './switch-panel/switch-panel';
import { DrawButton } from './draw-button/draw-button';
import { TextAreaClasses } from './textarea/textarea';
import { Parser } from './utility/parser';
import { Graph } from './datastructures/graph';
import { Stack } from './datastructures/stack';
import { Tree } from './datastructures/tree';
import { examples } from './utility/examples';
import { btnInactive } from './examples-pane/btn-inactive';
import { clearCanvas } from './popup';
import { Animate } from './utility/animation-controller';
import { Maths } from './utility/math-functions';

class UserInput {
	ds: Graph | Tree | Stack | any = null;
	textarea: HTMLTextAreaElement;
	controlsCollapse: Collapse;
	graphControls: HTMLDivElement;
	treeControls: HTMLDivElement;
	stackControls: HTMLDivElement;
	queueControls: HTMLDivElement;
	linkedlistControls: HTMLDivElement;
	weightedSwitch: HTMLInputElement;
	directedSwitch: HTMLInputElement;
	bstSwitch: HTMLInputElement;
	minHeapSwitch: HTMLInputElement;
	maxHeapSwitch: HTMLInputElement;
	doublySwitch: HTMLInputElement;
	textareaWrapper: HTMLDivElement;
	userOptions: DataStructureOptions;
	userSelection: DataStructureSelection;
	submitBtn: HTMLButtonElement;
	typeOptions: DataStructureRadioOption[];
	formValid: boolean = false;
	validator: Validation;
	form: HTMLFormElement;
	currFeedback: string | true;
	controlsTitle: HTMLHeadingElement;
	pushBtn: HTMLButtonElement;
	popBtn: HTMLButtonElement;
	enqueueBtn: HTMLButtonElement;
	dequeueBtn: HTMLButtonElement;
	examplesList: HTMLDivElement;
	examplePane: HTMLDivElement;
	colorPickerNode: HTMLInputElement;
	colorPickerEdge: HTMLInputElement;
	nodeLabel: HTMLLabelElement;
	edgeLabel: HTMLLabelElement;
	resetBtn: HTMLButtonElement;

	constructor() {
		this.setDefaultOptions();
		this.getForms();
		this.bindForms();
	}

	setDefaultOptions(): void {
		console.log(UserOptions);
		this.userSelection = UserSelection;
		this.userOptions = UserOptions;
		this.typeOptions = [
			{
				name: 'graph',
				formats: [
					{
						text: 'Adjacency List',
						value: 'adjacency_list'
					},
					{
						text: 'Adjacency Matrix',
						value: 'adjacency_matrix'
					}
				]
			},
			{ name: 'tree', formats: [{ text: 'Array', value: 'tree_array' }] },
			{ name: 'stack', formats: [{ text: 'Array', value: 'stack_array' }] },
			{ name: 'queue', formats: [{ text: 'Array', value: 'queue_array' }] },
			{
				name: 'linkedlist',
				formats: [{ text: 'Array', value: 'linkedlist_array' }]
			}
		];
	}

	getForms(): void {
		this.form = document.getElementById('textarea-form') as HTMLFormElement;
		document.querySelector('switch-panel').innerHTML = SwitchPanel;

		document.querySelector('draw-button').innerHTML = DrawButton;
		this.submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

		this.textarea = document.getElementById('textarea') as HTMLTextAreaElement;
		this.textarea.setAttribute('class', TextAreaClasses);

		this.graphControls = document.getElementById(
			'graph-controls'
		) as HTMLDivElement;

		this.treeControls = document.getElementById(
			'tree-controls'
		) as HTMLDivElement;

		this.stackControls = document.getElementById(
			'stack-controls'
		) as HTMLDivElement;

		this.queueControls = document.getElementById(
			'queue-controls'
		) as HTMLDivElement;

		this.linkedlistControls = document.getElementById(
			'linkedlist-controls'
		) as HTMLDivElement;

		this.weightedSwitch = document.getElementById(
			'weighted_switch'
		) as HTMLInputElement;
		this.directedSwitch = document.getElementById(
			'directed-switch'
		) as HTMLInputElement;

		this.bstSwitch = document.getElementById('bst-switch') as HTMLInputElement;

		this.minHeapSwitch = document.getElementById(
			'min-heap-switch'
		) as HTMLInputElement;

		this.maxHeapSwitch = document.getElementById(
			'max-heap-switch'
		) as HTMLInputElement;

		this.doublySwitch = document.getElementById(
			'doubly-switch'
		) as HTMLInputElement;

		this.controlsTitle = document.getElementById(
			'controls-title'
		) as HTMLHeadingElement;

		this.pushBtn = document.getElementById('push-btn') as HTMLButtonElement;
		this.popBtn = document.getElementById('pop-btn') as HTMLButtonElement;
		this.enqueueBtn = document.getElementById(
			'enqueue-btn'
		) as HTMLButtonElement;
		this.dequeueBtn = document.getElementById(
			'dequeue-btn'
		) as HTMLButtonElement;

		this.examplesList = document.getElementById(
			'examples-list'
		) as HTMLDivElement;

		this.examplePane = document.getElementById(
			'example-pane'
		) as HTMLDivElement;

		this.colorPickerNode = document.getElementById(
			'color-picker-node'
		) as HTMLInputElement;

		this.colorPickerEdge = document.getElementById(
			'color-picker-edge'
		) as HTMLInputElement;

		this.nodeLabel = document.querySelector(
			'#color-picker-label[data-node]'
		) as HTMLLabelElement;

		this.edgeLabel = document.querySelector(
			'#color-picker-label[data-edge]'
		) as HTMLLabelElement;

		this.resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
	}

	cacheObj(val: any, key: string = 'user-options'): void {
		localStorage.setItem(key, JSON.stringify(val));
	}

	cache(val: string, key: string): void {
		localStorage.setItem(key, val);
	}

	bindForms(): void {
		this.controlsCollapse = new Collapse(
			document.getElementById('collapse-item'),
			{
				toggle: false
			}
		);

		this.validator = new Validation(this.form, {
			customRules: {
				postValidation: this.postValidation.bind(this)
			},
			customErrorMessages: {
				postValidation: ''
			}
		});

		fromEvent(this.textarea, 'input')
			.pipe(
				tap((val) => {
					this.submitBtn.classList.toggle('pointer-events-none', true);
					this.submitBtn.classList.toggle(
						'animate-[spin_0.75s_linear_infinite]',
						true
					);
					this.submitBtn.setAttribute('disabled', '');
				}),
				map((e: any) => {
					return e.target.value;
				}),
				distinctUntilChanged(),
				debounceTime(750)
			)
			.subscribe((input: string) => {
				this.submitBtn.classList.toggle(
					'animate-[spin_0.75s_linear_infinite]',
					false
				);
				this.validate();
			});

		this.weightedSwitch.addEventListener('change', (event: any) => {
			this.userOptions.graph.weighted = event.target.checked;
			this.switchChanged();
		});

		this.directedSwitch.addEventListener('change', (event: any) => {
			this.userOptions.graph.directed = event.target.checked;
			this.switchChanged();
		});
		this.bstSwitch.addEventListener('change', (event: any) => {
			if (!event.target.checked) {
				this.userOptions.tree.binary = false;
			} else {
				this.toggleTreeSwitches(event.target.id);
			}
			this.switchChanged();
		});

		this.minHeapSwitch.addEventListener('change', (event: any) => {
			if (!event.target.checked) {
				this.userOptions.tree.minHeap = false;
			} else {
				this.toggleTreeSwitches(event.target.id);
			}
			this.switchChanged();
		});

		this.maxHeapSwitch.addEventListener('change', (event: any) => {
			if (!event.target.checked) {
				this.userOptions.tree.maxHeap = false;
			} else {
				this.toggleTreeSwitches(event.target.id);
			}
			this.switchChanged();
		});

		this.pushBtn.addEventListener('click', (event: any) => {
			document.dispatchEvent(new Event('StackPush'));
		});

		this.popBtn.addEventListener('click', (event: any) => {
			document.dispatchEvent(new Event('StackPop'));
		});

		this.enqueueBtn.addEventListener('click', (event: any) => {
			document.dispatchEvent(new Event('QueueEnqueue'));
		});

		this.dequeueBtn.addEventListener('click', (event: any) => {
			document.dispatchEvent(new Event('QueueDequeue'));
		});

		this.doublySwitch.addEventListener('click', (event: any) => {
			this.userOptions.linkedlist.doubly = event.target.checked;
			this.switchChanged();
		});

		this.colorPickerNode.addEventListener('input', () => {
			Aesthetics.NodeColor = this.colorPickerNode.value;
			this.nodeLabel.style.backgroundColor = this.colorPickerNode.value;

			let rgb = Maths.HexToRgb(this.colorPickerNode.value);
			let greyscale = (rgb[0] + rgb[1] + rgb[2]) / 3;
			if (greyscale <= 128) {
				Aesthetics.NodeFontColor = '#DDDDDD';
				this.nodeLabel.style.color = '#DDDDDD';
			} else {
				Aesthetics.NodeFontColor = '#111111';
				this.nodeLabel.style.color = '#111111';
			}
			Animate.enabled = false;
			if (UI && UI.submitBtn) UI.submitBtn.dispatchEvent(new Event('click'));
		});

		this.colorPickerEdge.addEventListener('input', () => {
			Aesthetics.EdgeColor = this.colorPickerEdge.value;
			this.edgeLabel.style.backgroundColor = this.colorPickerEdge.value;
			let rgb = Maths.HexToRgb(this.colorPickerEdge.value);
			let greyscale = (rgb[0] + rgb[1] + rgb[2]) / 3;
			if (greyscale <= 128) {
				this.edgeLabel.style.color = '#DDDDDD';
			} else {
				this.edgeLabel.style.color = '#111111';
			}
			Animate.enabled = false;
			if (UI && UI.submitBtn) UI.submitBtn.dispatchEvent(new Event('click'));
		});

		this.resetBtn.addEventListener('click', (event: any) => {
			this.reset();
		});
	}

	toggleColorPickers() {
		if (
			this.userSelection.dsaType == 'stack' ||
			this.userSelection.dsaType == 'queue'
		) {
			this.edgeLabel.style.display = 'none';
		} else {
			this.edgeLabel.style.display = 'flex';
		}
	}

	resetColorPickers() {
		this.nodeLabel.style.backgroundColor = Aesthetics.NodeColor;
		this.nodeLabel.style.color = Aesthetics.NodeFontColor;
		this.edgeLabel.style.backgroundColor = Aesthetics.EdgeColor;
		this.edgeLabel.style.color = Aesthetics.NodeFontColor;
		this.toggleColorPickers();
	}

	switchChanged() {
		this.cacheObj(this.userOptions);
		this.validate();
	}

	reset(): void {
		console.log('reset');
		this.clearForm();
		localStorage.clear();
		Aesthetics.reset();
		this.userOptions.reset();
		console.log(this.userSelection);
		this.userSelection.reset();
		this.formValid = false;
		this.toggleAll();
		this.resetColorPickers();
		this.validate();
	}

	toggleTreeSwitches(id: string) {
		this.userOptions.tree.binary = id == 'bst-switch';
		this.userOptions.tree.minHeap = id == 'min-heap-switch';
		this.userOptions.tree.maxHeap = id == 'max-heap-switch';
		this.bstSwitch.checked = id == 'bst-switch';
		this.minHeapSwitch.checked = id == 'min-heap-switch';
		this.maxHeapSwitch.checked = id == 'max-heap-switch';
	}

	toggleAll() {
		console.log('toggle all');
		console.log(this);
		if (Object.keys(this.userOptions).length == 0) return;
		if (!this.userOptions || !this.userSelection) return;
		this.toggleSwitches();
		this.toggleTreeSwitches('reset');

		if (this.userSelection.dsaType) {
			this.toggleTypeRadio();
		}
		this.toggleSwitchVisibility();
		this.toggleExamples();
		if (this.userSelection.dsaFormat) {
			this.toggleFormatSelection();
		}

		if (this.textarea.value) {
			this.validate();
		}
	}

	validated(): void {
		this.submitBtn.removeAttribute('disabled');
		this.submitBtn.classList.toggle('pointer-events-none', false);
		this.cache(this.textarea.value, 'user-input');
	}

	invalidated(): void {
		this.submitBtn.setAttribute('disabled', '');
		this.submitBtn.classList.toggle('pointer-events-none', true);
	}

	postValidation(): true | string {
		if (this.formValid == false) {
			return this.currFeedback;
		}
		return this.formValid;
	}

	validate() {
		this.textarea.value = this.textarea.value.replace(/null/gi, 'null');
		if (!this.textarea.value) return;
		if (!this.userOptions || !this.userSelection) return;
		this.currFeedback = Parser.isValid(this.textarea.value, '', '');
		if (this.currFeedback === true) {
			this.formValid = true;
			this.validated();
			this.submitBtn.dispatchEvent(new Event('click'));
			return;
		}
		this.formValid = false;
		this.invalidated();
	}

	toggleSwitches(): void {
		this.directedSwitch.checked = this.userOptions.graph.directed;
		this.weightedSwitch.checked = this.userOptions.graph.weighted;
		this.bstSwitch.checked = this.userOptions.tree.binary;
		this.minHeapSwitch.checked = this.userOptions.tree.minHeap;
		this.maxHeapSwitch.checked = this.userOptions.tree.maxHeap;
		this.doublySwitch.checked = this.userOptions.linkedlist.doubly;
	}

	toggleExamples(): void {
		let btns = [];
		if (!this.userSelection || !this.userSelection.dsaType) {
			this.examplePane.style.display = 'none';
			return;
		}
		this.examplePane.style.display = 'block';
		for (let example of examples[this.userSelection.dsaType]) {
			let btn = document.createElement('button');
			btn.id = example.title.toLowerCase().replace(' ', '_');
			btn.innerText = example.title;
			btn.setAttribute('class', btnInactive);
			btn.type = 'button';
			btn.addEventListener('click', (event: any) => {
				this.textarea.value = JSON.stringify(example.dataset);
				this.userOptions[this.userSelection.dsaType] = example.options;
				this.userSelection.dsaFormat = example.format;
				this.toggleFormatSelection();
				console.log('toggle example');
				this.toggleSwitches();
				this.validate();
			});

			btns.push(btn);
		}
		if (btns.length == 0) {
			let emptyMsg = document.createElement('span');
			emptyMsg.innerText = 'none';
			emptyMsg.setAttribute(
				'class',
				'absolute w-fit h-fit top-0 bottom-0 left-0 right-0 m-auto'
			);
			this.examplesList.replaceChildren(emptyMsg);
		} else {
			this.examplesList.replaceChildren(...btns);
		}
	}

	toggleSwitchVisibility() {
		let hideGraph = this.userSelection.dsaType != 'graph';
		let hideLL = this.userSelection.dsaType != 'linkedlist';
		let hideTree = this.userSelection.dsaType != 'tree';
		let hideStack = this.userSelection.dsaType != 'stack';
		let hideQueue = this.userSelection.dsaType != 'queue';
		if (!hideGraph || !hideLL || !hideTree || !hideStack || !hideQueue) {
			this.graphControls.classList.toggle('hide-switch-panel', hideGraph);
			this.linkedlistControls.classList.toggle('hide-switch-panel', hideLL);
			this.treeControls.classList.toggle('hide-switch-panel', hideTree);
			this.stackControls.classList.toggle('hide-switch-panel', hideStack);
			this.queueControls.classList.toggle('hide-switch-panel', hideQueue);

			if (!hideStack || !hideQueue) {
				this.controlsTitle.innerText = 'Operations';
			} else {
				this.controlsTitle.innerText = 'Variants';
			}
			this.controlsCollapse.show();
		} else if (hideGraph && hideLL && hideTree && hideStack && hideQueue) {
			this.controlsCollapse.hide();
		}
	}

	toggleTypeRadio(dsaType = this.userSelection.dsaType): void {
		this.typeOptions.forEach((option: any) => {
			if (option.name == dsaType) {
				this.userSelection.dsaType = dsaType;
				option.node.classList.add('!bg-neutral-800');
				option.node.classList.add('!outline');
				option.node.classList.add('!ring-0');
			} else {
				option.node.classList.remove('!bg-neutral-800');
				option.node.classList.remove('!outline');
				option.node.classList.remove('!ring-0');
			}
		});
	}
	toggleFormatSelection(): void {
		let opt = this.typeOptions
			.filter((o) => o.name == this.userSelection.dsaType)
			.pop();

		setTimeout(() => {
			try {
				[...opt.popconfirm.popconfirmBody.firstChild.childNodes]
					.filter((el: HTMLElement) => el.tagName == 'BUTTON')
					.forEach((btn: HTMLButtonElement) => {
						btn.classList.toggle(
							'bg-neutral-700',
							btn.dataset.dsaFormat == this.userSelection.dsaFormat
						);
					});
			} catch (ex) {}
			this.togglePlaceholder();
		}, 0);

		let format = opt.formats
			.filter((f) => f.value == this.userSelection.dsaFormat)
			.pop();

		(opt.notch.children[0] as HTMLSpanElement).innerText = format.text;
		for (let op of this.typeOptions) {
			op.notch.classList.toggle('hidden', op.name != opt.name);
		}
	}

	togglePlaceholder(): void {
		this.textarea.placeholder = DSA.findPlaceholder(
			this.userSelection.dsaType,
			this.userSelection.dsaFormat,
			{
				weighted: this.userOptions.graph.weighted
			}
		);
	}

	clearForm() {
		this.textarea.value = '';
		clearCanvas();
	}

	createRadio(): void {
		let btnGroup = document.querySelector('radio-group');

		btnGroup.innerHTML = RadioGroup;
		btnGroup = document.querySelector('div#radio-group');

		this.typeOptions.forEach((option: DataStructureRadioOption, i: number) => {
			let radioBtn = RadioBtn.cloneNode() as HTMLButtonElement;
			radioBtn.textContent = option.name;
			radioBtn.dataset.dsaType = option.name;
			let opts: any = {};
			if (i == 0) {
				radioBtn.classList.add('rounded-l');
				opts.position = 'bottom right';
			} else if (i == this.typeOptions.length - 1) {
				radioBtn.classList.add('rounded-r');
				opts.position = 'bottom left';
			}

			option.popconfirm = new Popconfirm(radioBtn, opts, {
				body: 'backdrop-blur-md p-[1rem] bg-white/20 rounded-[0.5rem] opacity-0 dark:bg-neutral-700/20'
			});

			let pop = PopDiv.cloneNode() as HTMLDivElement;

			option.formats.forEach((format: any, index: number) => {
				let listBtn = ListBtn.cloneNode() as HTMLButtonElement;
				listBtn.dataset.dsaType = option.name;
				listBtn.dataset.dsaFormat = format.value;
				listBtn.innerText = format.text;
				listBtn.addEventListener('click', (event: any) => {
					Animate.Cancel();
					clearCanvas();
					this.toggleColorPickers();
					let evtBtn = event.target as HTMLButtonElement;
					if (
						this.userSelection.dsaType != evtBtn.dataset.dsaType ||
						this.userSelection.dsaFormat != evtBtn.dataset.dsaFormat
					) {
						this.clearForm();
					}
					this.userSelection.dsaFormat = evtBtn.dataset.dsaFormat;
					this.cacheObj(this.userSelection, 'user-selection');
					[...(evtBtn.parentElement.childNodes as any)]
						.filter((e) => e.tagName == 'BUTTON')
						.forEach((lstBtn: HTMLButtonElement) => {
							lstBtn.classList.toggle(
								'bg-neutral-700',
								lstBtn.dataset.dsaFormat == this.userSelection.dsaFormat
							);
						});
					let pop = this.typeOptions
						.filter((opt) => opt.name == this.userSelection.dsaType)
						.pop();
					pop.popconfirm._confirmButton.click();
					this.toggleFormatSelection();
					this.togglePlaceholder();
					this.validate();
				});
				pop.appendChild(listBtn);
				if (index < option.formats.length - 1) {
					let div = document.createElement('div');
					div.style.height = '10px';
					pop.appendChild(div);
				}
			});

			radioBtn.addEventListener('click', (event: any) => {
				this.userSelection.dsaType = event.target.dataset.dsaType;

				let btnOption = this.typeOptions
					.filter((e) => e.name == event.target.dataset.dsaType)
					.pop();

				this.toggleTypeRadio();

				if (
					this.userSelection.dsaFormat &&
					btnOption.formats.filter(
						(f) => f.value == this.userSelection.dsaFormat
					).length
				) {
					this.toggleFormatSelection();
					this.togglePlaceholder();
				}

				this.toggleSwitchVisibility();
				this.toggleExamples();
				btnOption.popconfirm.popconfirmBody.replaceChildren(pop);
			});

			radioBtn.appendChild(svgs[i]);
			option.node = radioBtn;

			let notch = document.createElement('div');
			notch.setAttribute(
				'class',
				'hidden pointer-events-none absolute flex justify-center items-center normal-case right-0 bottom-0 w-full h-[15px] text-[10px]'
			);
			let notchText = document.createElement('span');
			notchText.id = `format-btn-text-${option.name}`;
			notchText.setAttribute(
				'class',
				'font-light subpixel-antialiased normal-case text-ellipsis text-slate-400'
			);
			let notchIcon = document.createElement('div');
			notchIcon.setAttribute(
				'class',
				'text-primary absolute bottom-0 right-0 w-[15px] h-[15px]'
			);
			notchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="!w-[15px] !h-[15px]pr-[5px] box-content">
						<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path>
					</svg>`;

			notch.appendChild(notchText);
			notch.appendChild(notchIcon);
			option.notch = notch;

			radioBtn.appendChild(notch);

			btnGroup.appendChild(radioBtn);
		});
	}
}

const UI: UserInput = new UserInput();

export { UI };
