const LoadingLogo = () => {
  return (
    <div id="preloader">
      <svg
        id="logo"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 203.29 204.17"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00bc9b" />
            <stop offset="100%" stopColor="#5eaefd" />
          </linearGradient>
        </defs>
        <path
          className="st1"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          d="M190.42,253.13s1.76,24.46,36.1,24.55l34.34.1s71.44-2.21,70.73,69.92-1.08,79.37-1.08,79.37-2.84,30.61-37.56,30.22c.29-20.25,1.4-106.86,1.4-106.86s-18-10.17-36.65-10.95-38.09-12.13-41.09-15.13a22.3,22.3,0,0,0,8.59.39s-20.33-8-31-32c13.57,15.79,22.05,13.31,22.05,13.31s-26.14-15.74-25.8-32.32C190.66,261.77,190.42,253.13,190.42,253.13Z"
          transform="translate(-190.41 -253.13)"
        />
        <path
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          className="st0"
          d="M332.24,300.61a95.75,95.75,0,0,1,5.31,34.69h28.18s22.3-1.66,28-27.88v-6.81Z"
          transform="translate(-190.41 -253.13)"
        />
      </svg>
    </div>
  )
};

export default LoadingLogo;