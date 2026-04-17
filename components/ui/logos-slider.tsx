'use client';

import Image from 'next/image';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';

const logos = [
  {
    id: "logo-1",
    description: "Figma",
    image: '/figma.svg',
    width: 96,
    height: 32,
    className: "h-8 w-auto object-contain", // Figma logosu için boyut
  },
  {
    id: "logo-2",
    description: "Next.js",
    image: "/next.svg",
    width: 96,
    height: 24,
    className: "h-6 w-auto object-contain", // Next.js logosu için boyut
  },
  {
    id: "logo-3",
    description: "Tailwind CSS",
    image: "/tailwindcss.svg",
    width: 120,
    height: 24,
    className: "h-6 w-auto object-contain", // Tailwind logosu için boyut
  },
  {
    id: "logo-4",
    description: "Vercel",
    image: "/vercel.svg",
    width: 96,
    height: 24,
    className: "h-6 w-auto object-contain", // Vercel logosu için boyut
  },
  {
    id: "logo-5",
    description: "Supabase",
    image: "/supabase.png",
    width: 120,
    height: 32,
    className: "h-8 w-auto object-contain", // Vercel logosu için boyut
  },
  {
    id: "logo-6",
    description: "Claude",
    image: "/claude.png",
    width: 120,
    height: 32,
    className: "h-8 w-auto object-contain", // Vercel logosu için boyut
  },
  {
    id: "logo-7",
    description: "Visual Studio Code",
    image: "/vscode.png",
    width: 160,
    height: 48,
    className: "h-12 w-auto object-contain", // Vercel logosu için boyut
  },
];

export function LogosSlider() {
  return (
    <div className='relative w-full overflow-hidden py-24'>
      <InfiniteSlider
        className='flex items-center'
        duration={45}
        gap={200}
        direction='horizontal'
        reverse={false}
      >
        {logos.map((logo) => (
          <div
            key={logo.id}
            className='flex shrink-0 items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300'
          >
            {logo.image ? (
              <Image
                src={logo.image}
                alt={logo.description}
                width={logo.width}
                height={logo.height}
                className={logo.className}
              />
            ) : null}
          </div>
        ))}
      </InfiniteSlider>
      <ProgressiveBlur
        className='pointer-events-none absolute top-0 left-0 h-full w-[200px]'
        direction='left'
        blurIntensity={1}
      />
      <ProgressiveBlur
        className='pointer-events-none absolute top-0 right-0 h-full w-[200px]'
        direction='right'
        blurIntensity={1}
      />
    </div>
  );
}
