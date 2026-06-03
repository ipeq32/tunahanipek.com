import { ImageResponse } from '@vercel/og';

type BrandImageOptions = {
  width: number;
  height: number;
  title?: string;
  subtitle?: string;
};

export function createBrandImageResponse({
  width,
  height,
  title = 'Tunahan İPEK',
  subtitle,
}: BrandImageOptions) {
  const isOg = width >= 600;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #164e63 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isOg ? 48 : 8,
            borderRadius: isOg ? 32 : Math.round(width * 0.22),
            background: 'rgba(255,255,255,0.12)',
          }}
        >
          <span
            style={{
              color: '#f0fdfa',
              fontSize: isOg ? 72 : Math.round(width * 0.38),
              fontWeight: 700,
            }}
          >
            TI
          </span>
          {isOg && (
            <>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: 48,
                  fontWeight: 600,
                  marginTop: 24,
                }}
              >
                {title}
              </span>
              {subtitle ? (
                <span style={{ color: '#99f6e4', fontSize: 28, marginTop: 12 }}>
                  {subtitle}
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>
    ),
    { width, height },
  );
}
