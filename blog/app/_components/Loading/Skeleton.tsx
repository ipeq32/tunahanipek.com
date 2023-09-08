type Props = {
  width?: number;
  height?: number;
};

const LoadingSkeleton = ({ height, width }: Props) => {
  return (
    <div className={`inline-block relative overflow-hidden bg-black/30 after:absolute after:content-[''] after:inset-0 after:-translate-x-[100%] after:bg-gradient-to-r after:from-transparent after:via-blue-100/5 after:to-blue-100/5 after:animate-shimmer`} style={{ width, height }} />
  )
};

export default LoadingSkeleton;