emailjs.init("bbf8HtBpVoEuo7x_-");
const form = document.getElementById("contactForm");

if (form) {
  function setError(input, msg) {
    clearError(input);
    input.classList.add("campo-error");
    const err = document.createElement("span");
    err.className = "campo-error-msg";
    err.textContent = msg;
    input.parentNode.appendChild(err);
  }

  function clearError(input) {
    input.classList.remove("campo-error");
    const prev = input.parentNode.querySelector(".campo-error-msg");
    if (prev) prev.remove();
  }

  form.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => clearError(el));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valido = true;

    const nombre = document.getElementById("nombre");
    const email = document.getElementById("email");
    const mensaje = document.getElementById("mensaje");

    if (!nombre.value.trim()) {
      setError(nombre, "El nombre es obligatorio.");
      valido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      setError(email, "El email es obligatorio.");
      valido = false;
    } else if (!emailRegex.test(email.value.trim())) {
      setError(email, "Ingresá un email válido (ej: nombre@dominio.com).");
      valido = false;
    }

    if (!mensaje.value.trim()) {
      setError(mensaje, "El mensaje es obligatorio.");
      valido = false;
    } else if (mensaje.value.trim().length < 10) {
      setError(mensaje, "El mensaje debe tener al menos 10 caracteres.");
      valido = false;
    }

    if (!valido) return;

    const btnEnviar = form.querySelector(".btn-enviar");
    btnEnviar.textContent = "Enviando...";
    btnEnviar.disabled = true;

    const templateParams = {
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      mensaje: mensaje.value.trim()
    };

    emailjs.send("service_94mhq2q", "template_a952ilq", templateParams)
      .then(() => {
        form.reset();
        const ok = document.getElementById("formSuccess");
        if (ok) {
          ok.textContent = "¡Mensaje enviado con éxito real!";
          ok.style.color = "#8fa881";
          ok.style.display = "block";
          setTimeout(() => ok.style.display = "none", 5000);
        }
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        const ok = document.getElementById("formSuccess");
        if (ok) {
          ok.textContent = "Hubo un error al enviar el mail real. Intentá de nuevo.";
          ok.style.color = "#ff4d4d";
          ok.style.display = "block";
        }
      })
      .finally(() => {
        btnEnviar.textContent = "Enviar";
        btnEnviar.disabled = false;
      });
  });
}