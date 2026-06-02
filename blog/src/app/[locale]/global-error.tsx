'use client';

import Error from 'next/error';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body className="mesh-background">
        <Error statusCode={500} />
        {/* bu error.digesti silebilirsin sonradan ekledim ne döndüğünü bilmiyorum */}
        <p>{error.digest}</p>
      </body>
    </html>
  );
}
