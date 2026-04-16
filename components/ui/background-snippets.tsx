// Grid pattern with gradient blur
export const GridBackground = () => {
  return (
    <div
      className="fixed inset-0 z-0 h-full w-full"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
          radial-gradient(circle 800px at 100% 200px, rgba(38, 97, 156, 0.3), transparent)
        `,
        backgroundSize: '6rem 4rem, 6rem 4rem, cover',
      }}
    />
  );
};

export const Component = GridBackground;
