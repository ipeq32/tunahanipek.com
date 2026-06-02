import LoadingLogo from '@/components/loading-logo';

const Loading = () => {
  return (
    <main className="absolute inset-0 z-[9999] flex flex-col items-center justify-center w-full h-dvh backdrop-blur-md mesh-background">
      <LoadingLogo />
    </main>
  );
};

export default Loading;
