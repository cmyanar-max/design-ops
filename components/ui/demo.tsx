// Dot pattern background
export const DotBackground = () => {
  return (
    <div
      className="absolute inset-0 -z-10 h-full w-full"
      style={{
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        backgroundColor: '#ffffff',
      }}
    />
  );
};

export default DotBackground;
