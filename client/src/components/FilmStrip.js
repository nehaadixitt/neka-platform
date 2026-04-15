import React from 'react';
import { motion } from 'framer-motion';

const FILM_STILLS = [
  'https://upload.wikimedia.org/wikipedia/en/8/8a/Inception_ver3.jpg',
  'https://upload.wikimedia.org/wikipedia/en/f/fb/Interstellar_film_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/1/1e/Joker_%282019_film%29_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/4/4d/Shawshank_redemption.jpg',
  'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Knight_Rises_Poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/b/b9/3_Idiots_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/1/1c/Lagaan_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/d/d3/Dangal_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/9/99/Dilwale_Dulhania_Le_Jayenge_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/5/5e/Sholay_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/6/6e/Gully_Boy_poster.jpg',
  'https://upload.wikimedia.org/wikipedia/en/0/09/Mughal-e-azam.jpg',
  'https://upload.wikimedia.org/wikipedia/en/0/0d/Blade_runner_2049_poster.png',
];

const Hole = () => (
  <div style={{ width: 18, height: 12, background: '#000', border: '2px solid #555', borderRadius: 3, flexShrink: 0, margin: '0 6px' }} />
);

const HoleStrip = () => (
  <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', height: 22, overflow: 'hidden', flexShrink: 0 }}>
    {Array.from({ length: 60 }).map((_, i) => <Hole key={i} />)}
  </div>
);

const FilmStrip = () => {
  const stills = [...FILM_STILLS, ...FILM_STILLS, ...FILM_STILLS];
  return (
    <div style={{ width: '100%', overflow: 'hidden', background: '#111', borderTop: '2px solid #333', borderBottom: '2px solid #333' }}>
      <HoleStrip />
      {/* Row 1 - scrolls left */}
      <motion.div
        style={{ display: 'flex', height: 140 }}
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      >
        {stills.map((src, i) => (
          <div key={i} style={{ width: 110, height: 140, flexShrink: 0, borderRight: '3px solid #333', overflow: 'hidden', position: 'relative' }}>
            <img
              src={src} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85) contrast(1.1)' }}
              onError={e => { e.target.parentElement.style.background = '#222'; e.target.style.display = 'none'; }}
            />
            {/* Red tint overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(180,0,0,0.08)' }} />
          </div>
        ))}
      </motion.div>
      <HoleStrip />
    </div>
  );
};

export default FilmStrip;
