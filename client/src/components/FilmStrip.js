import React from 'react';
import { motion } from 'framer-motion';

const FILM_STILLS = [
  'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg', // Inception
  'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', // Interstellar
  'https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg', // Joker
  'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NiYyLTg3MzMtYTJmNjg3Nzk5MzRiXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg', // Shawshank
  'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg', // Dark Knight
  'https://m.media-amazon.com/images/M/MV5BNTIwMDYxNTc5NF5BMl5BanBnXkFtZTcwNjY2NjU3MQ@@._V1_SX300.jpg', // 3 Idiots
  'https://m.media-amazon.com/images/M/MV5BNzIwMTYxMjItZGZlMy00YzJiLTgxZWEtZmI4ZWNmMWJlZTZiXkEyXkFqcGdeQXVyNjQ2MjQ5NM@@._V1_SX300.jpg', // Dangal
  'https://m.media-amazon.com/images/M/MV5BZTNlNjZmNjMtYzU2ZS00ZDkxLWI1NDMtZDg5ZjkzMGM3ZTVmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', // DDLJ
  'https://m.media-amazon.com/images/M/MV5BODQ1MjYyMDMtNDY2MC00ZjE5LWFhNTMtNDQ2YjgxNGIzMGY4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', // Sholay
  'https://m.media-amazon.com/images/M/MV5BZjI2ZDI5YzQtNTdlZS00NWQ4LWI1ZjEtMmJlZjU3Zjk5MzE3XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg', // Gully Boy
  'https://m.media-amazon.com/images/M/MV5BMjA5NTE4NTE5NV5BMl5BanBnXkFtZTYwNzY3MDg2._V1_SX300.jpg', // Lagaan
  'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVlLTM5YTgtZWNmNWMzMjZlMzFiXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', // The Matrix
  'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', // Godfather
  'https://m.media-amazon.com/images/M/MV5BNzA5ZDJhZWMtODU5NS00NDkyLWI4NTAtN2Y4NDI2NzI4MTEyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', // Pulp Fiction
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
