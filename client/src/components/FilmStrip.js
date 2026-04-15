import React from 'react';
import { motion } from 'framer-motion';

const FILM_STILLS = [
  '/posters/xlaY2zyzMfkhk0HSC5VUwzoZPU1.webp',
  '/posters/Interstellar_film_poster.jpg',
  '/posters/5151N2hUPiL._AC_UF894,1000_QL80_.jpg',
  '/posters/61NSZeiNF3L._AC_UF894,1000_QL80_.jpg',
  '/posters/61NhAcNBC+L._AC_UF894,1000_QL80_.jpg',
  '/posters/71CcdFCKHwL.jpg',
  '/posters/Joker_-_Put_On_A_Happy_Face_-_Joaquin_Phoenix_-_Hollywood_English_Movie_Poster_3_0e557717-f9ae-4d45-82c3-27e08c2a9eeb.jpg',
  '/posters/Dv4RO5OVYAUdsH0.jpg',
  '/posters/345fecf5e269212d9a287508648ec173.jpg',
  '/posters/OmShantiOm-ShahRukhKhanandDeepikaPadukone-BollywoodHindiMoviePoster_fcc8cd85-618b-4800-89f8-03bc7f507be7.jpg',
  '/posters/images.jpg',
];

const Hole = () => (
  <div style={{ width: 16, height: 11, background: '#000', border: '2px solid #666', borderRadius: 3, flexShrink: 0, margin: '0 8px' }} />
);

const HoleStrip = () => (
  <div style={{ display: 'flex', alignItems: 'center', background: '#1c1c1c', height: 20, overflow: 'hidden' }}>
    {Array.from({ length: 80 }).map((_, i) => <Hole key={i} />)}
  </div>
);

const FilmStrip = () => {
  const stills = [...FILM_STILLS, ...FILM_STILLS, ...FILM_STILLS];
  return (
    <div style={{ width: '100%', overflow: 'hidden', background: '#111', border: '2px solid #333' }}>
      <HoleStrip />
      <motion.div
        style={{ display: 'flex', height: 150 }}
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {stills.map((src, i) => (
          <div key={i} style={{ width: 115, height: 150, flexShrink: 0, borderRight: '3px solid #333', overflow: 'hidden', background: '#222', position: 'relative' }}>
            <img
              src={src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) contrast(1.1)' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        ))}
      </motion.div>
      <HoleStrip />
    </div>
  );
};

export default FilmStrip;
