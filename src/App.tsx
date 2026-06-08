import { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import "./App.css";
import Map from "./components/mapView";
import Gallery from "./pages/gallery";
import Contact from "./pages/contact";
import heroImage from "./assets/hero.png";

type MenuItem = {
  label: string;
  to?: string;
  previewTitle: string;
  previewImage: string;
  previewPosition: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Mapa",
    to: "/",
    previewTitle: "Mapa",
    previewImage: heroImage,
    previewPosition: "center center",
  },
  {
    label: "Galeria completa",
    to: "/gallery",
    previewTitle: "Galeria completa",
    previewImage: heroImage,
    previewPosition: "center 20%",
  },
  {
    label: "Sobre o Projeto",
    previewTitle: "Sobre o Projeto",
    previewImage: heroImage,
    previewPosition: "center 70%",
  },
  {
    label: "Contato",
    to: "/contact",
    previewTitle: "Contato",
    previewImage: heroImage,
    previewPosition: "right center",
  },
];



function App() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);

  const currentItem = menuItems.find(item => item.to === location.pathname) ?? null;
  const previewItem = hoveredItem ?? currentItem;

  useEffect(() => {
    setIsMenuOpen(false);
    setHoveredItem(null);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!isMenuOpen) {
      setHoveredItem(null);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
    <nav className="topNav">
      <Link to="/" className="logo" aria-label="Ir para o mapa">
        <img src="logo.svg" alt="Fatec Nature Gallery" />
      </Link>
      <button
        type="button"
        className={`hamburguer ${isMenuOpen ? "hamburguer--open" : ""}`}
        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={isMenuOpen}
        aria-controls="main-menu"
        onClick={() => setIsMenuOpen(prev => !prev)}
      >
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </nav>

    <div
      id="main-menu"
      className={`menuOverlay ${isMenuOpen ? "menuOverlay--open" : ""}`}
      aria-hidden={!isMenuOpen}
      onClick={() => setIsMenuOpen(false)}
    >
      <div className="menuPanel" onClick={e => e.stopPropagation()}>
        <nav className="menuList" aria-label="Navegacao principal">
          {menuItems.map(item => {
            const isActive = currentItem?.label === item.label;

            const content = (
              <>
                <span className="menuItem__label">{item.label}</span>
              </>
            );

            if (item.to) {
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`menuItem ${isActive ? "menuItem--active" : ""}`}
                  onMouseEnter={() => setHoveredItem(item)}
                  onFocus={() => setHoveredItem(item)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                className={`menuItem ${isActive ? "menuItem--active" : ""}`}
                onMouseEnter={() => setHoveredItem(item)}
                onFocus={() => setHoveredItem(item)}
                onClick={() => setIsMenuOpen(false)}
              >
                {content}
              </button>
            );
          })}
        </nav>

        <section className="menuPreview" aria-label={previewItem?.previewTitle ?? "Pre-visualizacao do menu"}>
          <div className="menuPreview__frame">
            {previewItem ? (
              <img
                src={previewItem.previewImage}
                alt=""
                style={{ objectPosition: previewItem.previewPosition }}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>

    <Routes>
      <Route path='/' element={<div className="viewport"><Map /></div>} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/gallery/:index" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  </>
  )
}

export default App;
