import "../styles/contact.css";
import { useState } from "react";
import type { FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { BsLinkedin, BsGithub, BsInstagram } from "react-icons/bs";

function Contact() {
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    setSending(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name,
          email,
          message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      alert("Mensagem enviada com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      alert(
        "Não foi possível enviar a mensagem. Tente novamente mais tarde.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="contactPage">
      <section className="contactStage">
        <div className="contactHeader">
          <h1>Vamos criar algo juntos?</h1>
          <p>
            Tem um projeto em mente? Adoraria ouvir sobre ele. Mande uma
            mensagem e retorno em breve.
          </p>
        </div>

        <div className="grid">
          <div className="contactForm">
            <form onSubmit={handleSubmit}>
              <h2>Entre em contato</h2>

              <div className="formGroup">
                <div className="field">
                  <label htmlFor="name">Nome</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="message">Mensagem</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Conte sobre seu projeto..."
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={sending}>
                {sending ? "Enviando..." : "Enviar mensagem"}
              </button>
            </form>
          </div>

          <div className="bentoGrid" role="list">
            <a
              href="https://www.linkedin.com/in/carlos-henrique-b46826340"
              target="_blank"
              rel="noopener noreferrer"
              className="bentoItem item-0"
              aria-label="LinkedIn"
            >
              <div className="IconContainer">
                <BsLinkedin aria-hidden="true" />
              </div>
              <h3>LinkedIn</h3>
            </a>

            <a
              href="https://github.com/CarlosMattei"
              target="_blank"
              rel="noopener noreferrer"
              className="bentoItem item-1"
              aria-label="GitHub"
            >
              <div className="IconContainer">
                <BsGithub aria-hidden="true" />
              </div>
              <h3>GitHub</h3>
            </a>

            <a
              href="https://www.instagram.com/carlosmattei.16?igsh=c2czZTZqOWg3aWM="
              target="_blank"
              rel="noopener noreferrer"
              className="bentoItem item-2"
              aria-label="Instagram"
            >
              <div className="IconContainer">
                <BsInstagram aria-hidden="true" />
              </div>
              <h3>Instagram</h3>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;