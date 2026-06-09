import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import icon1 from "../assets/icon_1.svg"
import icon2 from "../assets/icon_2.svg"
import icon3 from "../assets/icon_3.svg"
import { FaAngleRight } from "react-icons/fa";
import "../styles/intro.css";

const assetUrls = Object.values(
  import.meta.glob("../fotos/**/*.jpg", {
    eager: true,
    import: "default",
  }),
) as string[];

const introAssets = [
  "/logo.svg",
  new URL("../Fatec.svg", import.meta.url).href,
  ...assetUrls,
];

function preloadAsset(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    image.decoding = "async";
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

export default function Intro() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const preload = async () => {
      await Promise.allSettled(
        introAssets.map(async (src) => {
          await preloadAsset(src);
          if (!cancelled) {
            setLoadedCount((current) => Math.min(current + 1, introAssets.length));
          }
        }),
      );

      if (cancelled) return;

      window.setTimeout(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      }, 3080);
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) {
    const progress = introAssets.length
      ? Math.round((loadedCount / introAssets.length) * 100)
      : 100;

    return (
      <main className="introPage introPage--loading" aria-busy="true">
        <section className="introSplash" aria-label="Carregando recursos">
          <img src="/logo.svg" alt="Fatec Nature Gallery" className="introSplash__logo" />
          <div className="introSplash__progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="introSplash__text">
            {progress < 100 ? "Carregando imagens e SVG" : "Preparando a entrada"}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="introPage">
      <section className="introCard" aria-labelledby="intro-title">
        <div className="introCard__header">
          <h1 id="intro-title">Como isto funciona?</h1>
          <p>
            O Fatec Nature Gallery é um projeto que visa criar uma galeria interativa com fotografias da fauna, flora e paisagens da Fatec Dom Amaury Castanho, promovendo a valorização do patrimônio natural da instituição e apoiando as ações do Dia Mundial do Meio Ambiente.
          </p>
        </div>

        <div className="introSteps" role="list" aria-label="Etapas para usar o mapa">
          <article className="introStep" role="listitem">
              <img src={icon1} alt="Ícone 1" className="introStep__icon__image" />
            <h2>Encontre uma zona de foto</h2>
            <p>Abra o mapa e localize o ponto que deseja explorar.</p>
          </article>

          <FaAngleRight className="introArrow" />

          <article className="introStep" role="listitem">
              <img src={icon2} alt="Ícone 2" className="introStep__icon__image" />
            <h2>Clique na etiqueta</h2>
            <p>As marcações mostram onde existe conteúdo disponível.</p>
          </article>

          <FaAngleRight className="introArrow" />

          <article className="introStep" role="listitem">
              <img src={icon3} alt="Ícone 3" className="introStep__icon__image" />
            <h2>Acesse e descubra os álbuns</h2>
            <p>Veja as fotos em tela cheia e navegue pelos registros.</p>
          </article>
        </div>

        <button type="button" className="introCta" onClick={() => navigate("/map")}>
          Ok, vamos lá
        </button>
      </section>
    </main>
  );
}
