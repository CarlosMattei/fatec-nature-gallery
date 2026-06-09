import { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Map from "./components/mapView";
import Gallery from "./pages/gallery";
import Contact from "./pages/contact";
import Intro from "./pages/intro";
import mail from "./assets/mail.jpg";
import map from "./assets/map.jpg";
import photos from "./assets/photos.jpg";
import "./styles/navigation.css";

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
    to: "/map",
    previewTitle: "Mapa",
    previewImage: map,
    previewPosition: "center center",
  },
  {
    label: "Galeria completa",
    to: "/gallery",
    previewTitle: "Galeria completa",
    previewImage: photos,
    previewPosition: "center 20%",
  },    
  {
    label: "Contato",
    to: "/contact",
    previewTitle: "Contato",
    previewImage: mail,
    previewPosition: "right center",
  },
];



function App() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);

  const currentItem = menuItems.find(item => item.to === location.pathname) ?? null;
  const previewItem = hoveredItem ?? currentItem;
  const showTopNav = location.pathname !== "/";

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
    {showTopNav ? (
      <>
        <nav className="topNav">
          <Link to="/map" className="logo" aria-label="Ir para o mapa">
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
      </>
    ) : null}

    <Routes>
      <Route path='/' element={<Intro />} />
      <Route path="/map" element={<div className="viewport"><Map /></div>} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/gallery/:index" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  </>
  )
}

export default App;
