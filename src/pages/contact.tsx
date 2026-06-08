import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { IoArrowForwardOutline, IoMailOutline } from "react-icons/io5";

const contactEmail = "contato@fatec-nature-gallery.com";

const socialLinks = [
  {
    label: "GitHub",
    description: "Código e projetos",
    href: "https://github.com",
    Icon: FaGithub,
  },
  {
    label: "LinkedIn",
    description: "Rede profissional",
    href: "https://www.linkedin.com",
    Icon: FaLinkedinIn,
  },
  {
    label: "Instagram",
    description: "Bastidores e updates",
    href: "https://www.instagram.com",
    Icon: FaInstagram,
  },
];

export default function Contact() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent("Contato via Fatec Nature Gallery");
    const body = encodeURIComponent(
      `Meu e-mail para retorno: ${email || "preencha o campo acima"}\n\nMensagem:\n`,
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="contactPage">
      <section className="contactStage">
        <div className="contactHeader">
          <h1>Vamos Criar algo juntos?</h1>
        </div>

        <div className="contactGrid">
          <form
            className="contactCard contactCard--email"
            onSubmit={handleSubmit}
          >
            <div className="contactCard__top">
              <span className="contactCard__eyebrow">Email</span>
              <h2>Escreva seu contato.</h2>
              <p>
                Informe seu endereço para abrir a sua aplicação de e-mail com a
                mensagem pronta.
              </p>
            </div>

            <label className="contactField" htmlFor="contact-email">
              <span className="contactField__icon" aria-hidden="true">
                <IoMailOutline size={22} />
              </span>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@dominio.com"
                aria-label="Seu e-mail"
                autoComplete="email"
              />
            </label>

            <button type="submit" className="contactPrimary">
              Abrir e-mail
              <IoArrowForwardOutline size={20} stroke="#fff" />
            </button>
          </form>

          <aside className="contactCard contactCard--social">
            <div className="contactCard__top">
              <span className="contactCard__eyebrow">Redes sociais</span>
              <h2>Atalhos rápidos.</h2>
              <p>
                Os botões abaixo seguem uma interação sutil, com hover em
                camadas para destacar cada rede.
              </p>
            </div>

            <div
              className="contactSocialList"
              aria-label="Links para redes sociais"
            >
              {socialLinks.map(({ label, description, href, Icon }) => (
                <a
                  key={label}
                  className="contactSocial"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Abrir ${label}`}
                >
                  <span className="contactSocial__icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>

                  <span className="contactSocial__text">
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>

                  <IoArrowForwardOutline
                    className="contactSocial__arrow"
                    size={18}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
