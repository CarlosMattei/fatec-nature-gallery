import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import { IoChevronBackOutline, IoChevronForwardOutline, IoHeartOutline, IoHeart } from 'react-icons/io5'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'
import photosData from '../fotos/data.json'

// Dynamically import all images from the fotos directory
const images = import.meta.glob<string>('../fotos/**/*.jpg', { eager: true, import: 'default' });

const getImageUrl = (arquivo: string) => {
  const normalized = '../fotos/' + arquivo.toLowerCase().replace(/ /g, '_');
  const matchingKey = Object.keys(images).find(key => key.toLowerCase() === normalized);
  return matchingKey ? images[matchingKey] : '';
};

export default function Gallery() {
  const { index } = useParams();
  const navigate = useNavigate();

  const photoIndex = index ? parseInt(index, 10) : 0;
  const validIndex = isNaN(photoIndex) || photoIndex < 0 || photoIndex >= photosData.length ? 0 : photoIndex;

  const photo = photosData[validIndex];
  const imageUrl = getImageUrl(photo.arquivo);

  const prevIndex = (validIndex - 1 + photosData.length) % photosData.length;
  const nextIndex = (validIndex + 1) % photosData.length;

  const [isLiked, setIsLiked] = useState(false);
  const [secondaryImage, setSecondaryImage] = useState('');
  const [newBackgroundImage, setNewBackgroundImage] = useState('');

  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const newBackgroundRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // Preload secondary and background images
  useEffect(() => {
    setSecondaryImage(getImageUrl(photosData[nextIndex].arquivo));
    setNewBackgroundImage(getImageUrl(photosData[(nextIndex + 1) % photosData.length].arquivo));
  }, [validIndex, nextIndex]);

  // Load liked state
  useEffect(() => {
    const likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
    setIsLiked(!!likedPhotos[photo.arquivo]);
  }, [photo.arquivo]);

  const toggleLike = (e: React.MouseEvent) => {
    const likedPhotos = JSON.parse(localStorage.getItem('likedPhotos') || '{}');
    const newState = !isLiked;
    if (newState) {
      likedPhotos[photo.arquivo] = true;
      
      // Fire heart confetti from the button's position
      const scalar = 2;
      const heart = confetti.shapeFromText({ text: '❤️', scalar });
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        spread: 360,
        ticks: 60,
        gravity: 0,
        decay: 0.96,
        startVelocity: 20,
        shapes: [heart],
        origin: { x, y },
        scalar,
        particleCount: 30,
      });
    } else {
      delete likedPhotos[photo.arquivo];
    }
    localStorage.setItem('likedPhotos', JSON.stringify(likedPhotos));
    setIsLiked(newState);
  };

  const handleNavigate = useCallback((targetIndex: number, direction: 'next' | 'prev') => {
    if (isAnimating.current) return;
    if (!primaryRef.current || !secondaryRef.current || !newBackgroundRef.current || !infoRef.current) return;
    isAnimating.current = true;

    // Preload images for the transition
    setSecondaryImage(getImageUrl(photosData[targetIndex].arquivo));
    const afterTarget = direction === 'next'
      ? (targetIndex + 1) % photosData.length
      : (targetIndex - 1 + photosData.length) % photosData.length;
    setNewBackgroundImage(getImageUrl(photosData[afterTarget].arquivo));

    // FLIP: measure current positions before animating
    const primaryRect = primaryRef.current.getBoundingClientRect();
    const secondaryRect = secondaryRef.current.getBoundingClientRect();
    const scaleRatio = primaryRect.width / secondaryRect.width;

    const tl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        navigate(`/gallery/${targetIndex}`);
        isAnimating.current = false;
        // Clear all inline styles so CSS classes take over cleanly
        [primaryRef, secondaryRef, newBackgroundRef, infoRef].forEach(ref => {
          if (ref.current) gsap.set(ref.current, { clearProps: 'all' });
        });
      }
    });

    const xDrift = direction === 'next' ? -40 : 40;
    const exitRotation = direction === 'next' ? -14 : 14;

    // ── Phase 1: Primary card lifts off with a natural arc ──
    tl.to(primaryRef.current, {
      y: -primaryRect.height * 1.6,
      x: xDrift,
      rotation: exitRotation,
      scale: 0.55,
      opacity: 0,
      boxShadow: '0 40px 60px rgba(108, 96, 75, 0)',
      duration: 0.55,
      ease: 'power2.in'
    }, 0);

    // ── Phase 2: Secondary card promotes to primary position ──
    tl.fromTo(secondaryRef.current,
      {
        x: 0, y: 0, scale: 1, rotation: 0.5,
        opacity: 0.27,
        filter: 'blur(2px)',
        zIndex: 1,
        boxShadow: '0 16px 20px rgba(108, 96, 75, 0.12)'
      },
      {
        x: 50,
        y: -130,
        scale: scaleRatio,
        rotation: -4,
        opacity: 1,
        filter: 'blur(0px)',
        zIndex: 2,
        boxShadow: '0 20px 35px rgba(108, 96, 75, 0.32)',
        duration: 0.6,
        ease: 'power2.inOut'
      }, 0.08
    );

    // ── Phase 3: New background card materializes from depth ──
    tl.fromTo(newBackgroundRef.current,
      {
        opacity: 0,
        scale: 0.6,
        y: 40,
        filter: 'blur(6px)',
        zIndex: 0,
        boxShadow: '0 8px 16px rgba(108, 96, 75, 0)'
      },
      {
        opacity: 0.27,
        scale: 1,
        y: 0,
        filter: 'blur(2px)',
        zIndex: 1,
        boxShadow: '0 16px 20px rgba(108, 96, 75, 0.12)',
        duration: 0.5,
        ease: 'power2.out'
      }, 0.15
    );

    // ── Phase 4: Info card — slide down, then back up with fresh content ──
    tl.to(infoRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.97,
      duration: 0.22,
      ease: 'power2.in'
    }, 0);

    tl.to(infoRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.4)'
    }, 0.45);
  }, [navigate]);

  return (
    <main className="galleryPage">
      <section className="galleryStage" aria-label="Galeria de imagem">
        <div className="galleryContent">
          <div className="galleryPhotoColumn">
            <figure ref={primaryRef} className="photoFrame photoFrame--primary">
              <img src={imageUrl} alt={photo.titulo} />
            </figure>

            <figure ref={secondaryRef} className="photoFrame photoFrame--secondary" aria-hidden="true">
              <img src={secondaryImage} alt="" />
            </figure>

            <figure ref={newBackgroundRef} className="photoFrame photoFrame--secondary" style={{ opacity: 0, zIndex: 0 }} aria-hidden="true">
              <img src={newBackgroundImage} alt="" />
            </figure>
          </div>

          <div className="galleryAside">
            <Link to="/" className="backLink">
              <span aria-hidden="true">
                <IoChevronBackOutline size={24} stroke="var(--primary)" />
              </span>
              Retornar ao mapa
            </Link>

            <article ref={infoRef} className="infoCard">
              <span className="locationTag">{photo.local}</span>
              <h1>{photo.titulo}</h1>
              <p>{photo.descricao}</p>
              <button
                type="button"
                className={`likeButton ${isLiked ? 'likeButton--liked' : ''}`}
                onClick={toggleLike}
              >
                <span aria-hidden="true">
                  {isLiked ? (
                    <IoHeart style={{ fill: 'white' }} size={24} />
                  ) : (
                    <IoHeartOutline style={{ stroke: 'white' }} size={24} />
                  )}
                </span>
                {isLiked ? 'Curtido' : 'Curtir'}
              </button>
            </article>
            <div className="buttonContainer">
                <button className="previous" onClick={() => handleNavigate(prevIndex, 'prev')}>
                    <span aria-hidden="true">
                        <IoChevronBackOutline size={24} stroke="var(--primary)" />
                    </span>
                    Anterior
                </button>
                <button className="next" onClick={() => handleNavigate(nextIndex, 'next')}>
                    Próxima
                    <span aria-hidden="true">
                        <IoChevronForwardOutline size={24} stroke="var(--primary)" />
                    </span>
                </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

