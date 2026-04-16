'use client';
import React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';


const links = [
  { label: 'Fiyatlandırma', href: '/pricing' },
  { label: 'Blog', href: '#' },
  { label: 'Hakkımızda', href: '#' },
];

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 mx-auto w-full max-w-6xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-5xl md:shadow':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-14 w-full items-center justify-between px-6 md:h-12 md:transition-all md:ease-out',
					{
						'md:px-4': scrolled,
					},
				)}
			>
				{/* Logo */}
				<Link href="/" className="flex items-center">
					<img src="/do_logo.svg" alt="DesignOps Logo" className="h-7 w-auto" />
				</Link>

				{/* Desktop links */}
				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<Link key={i} className={buttonVariants({ variant: 'ghost', size: 'sm' })} href={link.href}>
							{link.label}
						</Link>
					))}
					<Link href="/login" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
						Giriş Yap
					</Link>
					<Link href="/signup" className={buttonVariants({ size: 'sm' })}>
						Ücretsiz Başla
					</Link>
				</div>

				{/* Mobile hamburger */}
				<button
					onClick={() => setOpen(!open)}
					className={cn(buttonVariants({ size: 'icon', variant: 'outline' }), 'md:hidden')}
					aria-label="Menüyü aç/kapat"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</button>
			</nav>

			{/* Mobile menu overlay */}
			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								onClick={() => setOpen(false)}
								className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-2">
						<Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}>
							Giriş Yap
						</Link>
						<Link href="/signup" className={cn(buttonVariants(), 'w-full justify-center')}>
							Ücretsiz Başla
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
