let RadioBtn: HTMLButtonElement = document.createElement('button');
RadioBtn.type = 'button';
RadioBtn.dataset.teRippleInit = '';
RadioBtn.dataset.teRippleColor = 'light';
RadioBtn.setAttribute(
	'class',
	`relative flex-grow px-6 pb-1.5 pt-1.5 text-xs uppercase leading-normal text-white transition duration-150 ease-in-out hover:bg-neutral-800`
);
RadioBtn.setAttribute('dsa-option', '');

export { RadioBtn };
