import { ImageResponse } from 'next/og';
import { siteConfig } from '~/lib/site';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background:
          'radial-gradient(circle at 20% 20%, #1e293b 0%, #0a0a0a 60%)',
        padding: '80px',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        {siteConfig.name}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 900,
            background: 'linear-gradient(90deg, #f8fafc 0%, #94a3b8 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {siteConfig.tagline}
        </div>
        <div style={{ fontSize: 30, color: '#94a3b8', maxWidth: 880 }}>
          Store enumeration, field data collection, and market analysis in one
          platform.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 26,
          color: '#64748b',
        }}
      >
        <span>{siteConfig.url.replace(/^https?:\/\//, '')}</span>
        <span>by {siteConfig.legalName}</span>
      </div>
    </div>,
    { ...size },
  );
}
