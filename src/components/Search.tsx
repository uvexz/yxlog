import { Button } from '@cloudflare/kumo/components/button';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SearchItem } from '../lib/posts';

interface Props {
	items: SearchItem[];
}

export default function Search({ items }: Props) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	useEffect(() => {
		if (!open) return;

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpen(false);
		}

		function handlePointerDown(event: PointerEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('pointerdown', handlePointerDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}, [open]);

	const results = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return [];
		return items
			.filter(
				(item) =>
					item.title.toLowerCase().includes(normalized) ||
					item.tags.some((tag) => tag.toLowerCase().includes(normalized))
			)
			.slice(0, 8);
	}, [items, query]);

	const showResults = query.trim().length > 0;

	return (
		<div ref={containerRef} className="flex items-center">
			<Button
				variant="ghost"
				shape="square"
				size="sm"
				icon={MagnifyingGlassIcon}
				aria-label="搜索文章"
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
			/>
			{open && (
				<div className="absolute inset-x-6 top-full z-30 mt-4 sm:inset-x-8">
					<div className="rounded-xl border border-gray-200 bg-white p-4">
						<input
							ref={inputRef}
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="搜索文章…"
							aria-label="搜索文章"
							className="w-full border-b border-gray-200 bg-transparent px-0 py-2 text-sm text-gray-800 outline-none placeholder:text-slate-400 focus:border-slate-400"
						/>
						{showResults &&
							(results.length > 0 ? (
								<ul className="mt-2 divide-y divide-gray-100">
									{results.map((item) => (
										<li key={item.href}>
											<a
												href={item.href}
												className="flex items-center justify-between gap-4 py-2.5 text-sm transition-colors hover:text-gray-950"
											>
												<span className="text-gray-800">{item.title}</span>
												<span className="shrink-0 text-[11px] tabular-nums text-slate-400">
													{item.date}
												</span>
											</a>
										</li>
									))}
								</ul>
							) : (
								<p className="mt-3 text-xs text-slate-400">未找到相关文章。</p>
							))}
					</div>
				</div>
			)}
		</div>
	);
}
