import SignatureLogo from "@/app/_ui/SignatureLogo";

const Loading = () => {
  return (
    <div id="preloader" role="status" aria-label="Yükleniyor">
      <SignatureLogo
        gradientId="loader-signature-gradient"
        className="h-40 w-40 sm:h-48 sm:w-48"
      />
    </div>
  );
};

export default Loading;
