let ListBtn: HTMLButtonElement = document.createElement('button');
ListBtn.setAttribute('aria-current', 'true');
ListBtn.type = 'button';
ListBtn.setAttribute(
	'class',
	'block w-full cursor-pointer rounded text-xs px-4 pb-[5px] pt-[6px] text-left transition duration-200 hover:bg-neutral-700 hover:text-neutral-500 focus:ring-0 dark:hover:bg-neutral-700 dark:hover:text-neutral-200'
);

export { ListBtn };
