import SignatureLogo from "@/app/_ui/SignatureLogo";

const Loading = () => {
  return (
    <div id="preloader" role="status" aria-label="Yükleniyor">
      <SignatureLogo
        gradientId="loader-signature-gradient"
        className="h-24 w-24 sm:h-28 sm:w-28"
      />
    </div>
  );
};

export default Loading;
