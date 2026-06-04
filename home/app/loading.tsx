import SignatureLogo from "@/app/_ui/SignatureLogo";

export default function RouteLoading() {
  return (
    <div className="preloader-overlay" role="status" aria-label="Loading">
      <div className="preloader-content">
        <SignatureLogo
          gradientId="route-loader-signature-gradient"
          className="nav-logo-emphasis h-40 w-40 sm:h-48 sm:w-48"
        />
      </div>
    </div>
  );
}
