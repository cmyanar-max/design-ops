"use client";

import React from 'react';
import { Grid2x2PlusIcon, MenuIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function FloatingHeader() {
	const [open, setOpen] = React.useState(false);

	const links = [
		{
			label: 'Özellikler',
			href: '#',
		},
		{
			label: 'Fiyatlandırma',
			href: '/pricing',
		},
		{
			label: 'Hakkımızda',
			href: '/about',
		},
	];

	return (
		<header
			className={cn(
				'fixed top-5 left-1/2 -translate-x-1/2 z-50',
				'w-[calc(100%-2rem)] max-w-3xl rounded-full border shadow-sm',
				'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg',
			)}
		>
			<nav className="mx-auto flex items-center justify-between p-2">
				<Link href="/" className="hover:bg-accent hover:text-accent-foreground text-foreground flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 duration-100 transition-colors">
					<Grid2x2PlusIcon className="size-5 text-primary" />
					<p className="font-heading text-lg font-bold">DesignOps</p>
				</Link>
				<div className="hidden items-center gap-1 lg:flex">
					{links.map((link) => (
						<Link
							key={link.label}
							className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'rounded-full' })}
							href={link.href}
						>
							{link.label}
						</Link>
					))}
				</div>
				<div className="flex items-center gap-2 pr-1">
					<Link className={buttonVariants({ size: 'sm', className: 'rounded-full' })} href="/login">Giriş Yap</Link>
					<Sheet open={open} onOpenChange={setOpen}>
						<Button
							size="icon"
							variant="outline"
							onClick={() => setOpen(!open)}
							className="lg:hidden rounded-full"
						>
							<MenuIcon className="size-4" />
						</Button>
						<SheetContent
							className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
							showCloseButton={false}
							side="left"
						>
							<div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
								{links.map((link) => (
									<Link
                    key={link.label}
										className={buttonVariants({
											variant: 'ghost',
											className: 'justify-start rounded-md',
										})}
										href={link.href}
                    onClick={() => setOpen(false)}
									>
										{link.label}
									</Link>
								))}
							</div>
							<SheetFooter className="mt-auto px-4 pb-4 bg-transparent border-t-0 p-0 flex flex-col gap-2">
								<Link className={buttonVariants({ variant: 'outline', className: 'w-full rounded-full' })} href="/login">Giriş Yap</Link>
								<Link className={buttonVariants({ className: 'w-full rounded-full' })} href="/signup">Ücretsiz Başla</Link>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>
			</nav>
		</header>
	);
}
