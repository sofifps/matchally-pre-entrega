let carrito = JSON.parse(localStorage.getItem("carrito_matchally")) || [];
let descuentoPorcentaje = parseFloat(localStorage.getItem("descuento_matchally")) || 0;

const carritoPanel = document.getElementById("carritoPanel");
const carritoCerrar = document.getElementById("carritoCerrar");
const carritoLista = document.getElementById("carritoLista");
const carritoTotal = document.getElementById("carritoTotal");
const seguirComprandoBtn = document.getElementById("seguirComprando");
const envioGratisBar = document.getElementById("envioGratisBar");
const envioFaltante = document.getElementById("envioFaltante");

const ENVIO_GRATIS_UMBRAL = 40000;

function agregarAlCarrito(id, nombre, precio, imagen) {
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }

    actualizarCarrito();
    abrirPanel();
}

function cambiarCantidad(idProducto, incremento) {
    const item = carrito.find(item => item.id === idProducto);
    if (item) {
        item.cantidad += incremento;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(idProducto);
            return;
        }
    }
    actualizarCarrito();
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id !== idProducto);
    actualizarCarrito();
}

window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;

function actualizarCarrito() {
    localStorage.setItem("carrito_matchally", JSON.stringify(carrito));
    renderizarListaCarrito();
    actualizarContadorIcono();
}

function renderizarListaCarrito() {
    if (!carritoLista) return;
    carritoLista.innerHTML = "";
    let totalProductos = 0;

    if (carrito.length === 0) {
        carritoLista.innerHTML = `<li style="text-align: center; color: #7b8185; padding: 40px 0; font-family: 'Lato', sans-serif;">Tu carrito está vacío.</li>`;
        if (carritoTotal) carritoTotal.innerText = "$0";
        if (envioGratisBar) {
            envioGratisBar.style.display = "none";
        }

        descuentoPorcentaje = 0;
        localStorage.setItem("descuento_matchally", 0);
        
        // botón de cupones para compras futuras //
        const cuponInput = document.getElementById("cuponInput");
        const aplicarCuponBtn = document.getElementById("aplicarCuponBtn");
        if (aplicarCuponBtn && cuponInput) {
            aplicarCuponBtn.innerText = "APLICAR";
            aplicarCuponBtn.classList.remove("aplicado");
            aplicarCuponBtn.disabled = false;
            cuponInput.disabled = false;
            cuponInput.value = "";
        }
        return;
    }

    const esSubcarpeta = 
    window.location.pathname.includes("/contacto/") || 
    window.location.pathname.includes("/recetas/") || 
    window.location.pathname.includes("/productos/") ||
    window.location.pathname.includes("/accesorios/");

    carrito.forEach(item => {
        totalProductos += item.precio * item.cantidad;

        let rutaImagen = item.imagen;
        if (esSubcarpeta && !rutaImagen.startsWith("../")) {
            rutaImagen = "../" + rutaImagen;
        }

        const li = document.createElement("li");
        li.classList.add("carrito-item");
        li.innerHTML = `
            <img src="${rutaImagen}" class="carrito-item-img" alt="${item.nombre}">
            <div class="carrito-item-detalles">
                <div class="carrito-item-fila-superior">
                    <span class="carrito-item-titulo">${item.nombre}</span>
                    <button type="button" class="btn-eliminar-texto" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
                </div>
                <div class="carrito-item-fila-inferior">
                    <div class="carrito-item-selector">
                        <button type="button" onclick="cambiarCantidad('${item.id}', -1)">−</button>
                        <span>${item.cantidad}</span>
                        <button type="button" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                    </div>
                    <span class="carrito-item-precio">$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                </div>
            </div>
        `;
        carritoLista.appendChild(li);
    });

    let totalFinal = totalProductos;
    if (descuentoPorcentaje > 0) {
        const descuentoCalculado = totalProductos * descuentoPorcentaje;
        totalFinal = totalProductos - descuentoCalculado;
    }

    if (carritoTotal) {
        if (descuentoPorcentaje > 0) {
            carritoTotal.innerHTML = `<span style="text-decoration: line-through; color: #7b8185; font-size: 12px; margin-right: 8px;">$${totalProductos.toLocaleString('es-AR')}</span> $${totalFinal.toLocaleString('es-AR')} <span style="color: #69854b; font-size: 11px;">(10% OFF)</span>`;
        } else {
            carritoTotal.innerText = `$${totalFinal.toLocaleString('es-AR')}`;
        }
    }

    if (envioGratisBar) {
        envioGratisBar.style.display = "block";
        if (totalFinal >= ENVIO_GRATIS_UMBRAL) {
            envioGratisBar.innerHTML = "¡TENÉS ENVÍO GRATIS!";
        } else {
            const faltante = ENVIO_GRATIS_UMBRAL - totalFinal;
            envioGratisBar.innerHTML = `TE FALTAN <span id="envioFaltante">$${faltante.toLocaleString('es-AR')}</span> PARA EL ENVÍO GRATIS`;
        }
    }
}

function abrirPanel() {
    if (carritoPanel) carritoPanel.classList.add("activo");
}

function cerrarPanel() {
    if (carritoPanel) {
        carritoPanel.classList.remove("activo");
    }
}

function actualizarContadorIcono() {
    const totalItems = carrito.reduce((acum, item) => acum + item.cantidad, 0);
    const iconoCarrito = document.querySelector(".fa-shopping-bag");
    
    if (iconoCarrito) {
        let badge = document.getElementById("carrito-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.id = "carrito-badge";
            badge.style.background = "#69854b";
            badge.style.color = "white";
            badge.style.borderRadius = "50%";
            badge.style.padding = "2px 6px";
            badge.style.fontSize = "11px";
            badge.style.marginLeft = "5px";
            badge.style.position = "absolute";
            iconoCarrito.parentElement.style.position = "relative";
            iconoCarrito.parentElement.appendChild(badge);
        }
        badge.innerText = totalItems;
        if (totalItems === 0) badge.remove();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarCarrito();

    if (carritoCerrar) {
        carritoCerrar.addEventListener("click", cerrarPanel);
    }

    if (seguirComprandoBtn) {
        seguirComprandoBtn.addEventListener("click", cerrarPanel);
    }

    const linkCarritoNavbar = document.getElementById("abrirCarritoLink");
    if (linkCarritoNavbar) {
        linkCarritoNavbar.addEventListener("click", (e) => {
            e.preventDefault();
            abrirPanel();
        });
    }

    /* gestion del boton para el cupon */
    const cuponInput = document.getElementById("cuponInput");
    const aplicarCuponBtn = document.getElementById("aplicarCuponBtn");

    function marcarCuponComoAplicado() {
        if (aplicarCuponBtn && cuponInput) {
            aplicarCuponBtn.innerText = "APLICADO";
            aplicarCuponBtn.classList.add("aplicado");
            aplicarCuponBtn.disabled = true;
            cuponInput.disabled = true;
            cuponInput.value = "MATCHALLY10";
        }
    }

    if (descuentoPorcentaje > 0) {
        marcarCuponComoAplicado();
    }

    if (aplicarCuponBtn && cuponInput) {
        aplicarCuponBtn.addEventListener("click", () => {
            const codigoIntroducido = cuponInput.value.trim().toUpperCase();

            if (codigoIntroducido === "MATCHALLY10") {
                if (descuentoPorcentaje > 0) {
                    alert("¡El cupón ya fue aplicado en este carrito!");
                    return;
                }
                descuentoPorcentaje = 0.10;
                localStorage.setItem("descuento_matchally", descuentoPorcentaje);
                
                marcarCuponComoAplicado();
                actualizarCarrito();
                alert("¡Cupón MATCHALLY10 aplicado! Disfrutá de tu 10% de descuento.");
            } else if (codigoIntroducido === "") {
                alert("Por favor, ingresá un cupón antes de aplicar.");
            } else {
                alert("El cupón ingresado no es válido.");
            }
        });
    }
});

/* CUPON DE BIENVENIDA */
const popup = document.getElementById("popupDescuento");
const closePopupBtn = document.getElementById("closePopupBtn");
const noGraciasBtn = document.getElementById("noGraciasBtn");
const popupForm = document.getElementById("popupForm");

function cerrarPopup() {
    if (popup) {
        popup.classList.remove("mostrar");
    }
}

if (popup) {
    const yaVisto = sessionStorage.getItem("popup_descuento_visto");

    if (!yaVisto) {
        setTimeout(() => {
            popup.classList.add("mostrar");
            sessionStorage.setItem("popup_descuento_visto", "true");
        }, 2500);
    }

    closePopupBtn.addEventListener("click", cerrarPopup);
    noGraciasBtn.addEventListener("click", cerrarPopup);

    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            cerrarPopup();
        }
    });

    popupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const inputNombre = popupForm.querySelector("input[type='text']");
        const inputEmail = popupForm.querySelector("input[type='email']");
        const nombreVal = inputNombre.value.trim();
        const emailVal = inputEmail.value.trim();

        if (nombreVal === "") {
            alert("Por favor, ingresá tu nombre.");
            inputNombre.focus();
            return;
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailVal === "") {
            alert("Por favor, ingresá tu correo electrónico.");
            inputEmail.focus();
            return;
        } else if (!emailVal.includes("@")) {
            alert("Falta el símbolo '@' en tu correo. Ejemplo: usuario@gmail.com");
            inputEmail.focus();
            return;
        } else if (!regexEmail.test(emailVal)) {
            alert("Formato de correo no válido. Revisá si escribiste bien el dominio (.com, .com.ar, etc).");
            inputEmail.focus();
            return;
        }

        alert(`¡Felicidades ${nombreVal}! Tu cupón es: MATCHALLY10. Ingresalo en el carrito para obtener un 10% de descuento.`);
        popupForm.reset();
        cerrarPopup();
    });
}

//** WSP **//
document.addEventListener("DOMContentLoaded", () => {
    const btnFinalizarPedido = document.getElementById("finalizarPedido");

    if (btnFinalizarPedido) {
        btnFinalizarPedido.addEventListener("click", () => {
            if (carrito.length === 0) {
                alert("¡Tu carrito está vacío!");
                return;
            }

            let mensaje = "¡Hola Matchally≽(•⩊ •マ≼! Quería finalizar mi pedido con los siguientes productos:\n\n";
            let subtotal = 0;

            carrito.forEach(item => {
                const itemSubtotal = item.precio * item.cantidad;
                subtotal += itemSubtotal;
                mensaje += `• *${item.nombre}* (Cant: ${item.cantidad}) - $${itemSubtotal.toLocaleString('es-AR')}\n`;
            });

            mensaje += `\n-----------------------------------\n`;

            let totalFinal = subtotal;
            if (descuentoPorcentaje > 0) {
                const descuentoCalculado = subtotal * descuentoPorcentaje;
                totalFinal = subtotal - descuentoCalculado;
                mensaje += `*Subtotal:* $${subtotal.toLocaleString('es-AR')}\n`;
                mensaje += `*Descuento (10% OFF):* -$${descuentoCalculado.toLocaleString('es-AR')}\n`;
            }

            mensaje += `*Total final a pagar: $${totalFinal.toLocaleString('es-AR')}*\n`;
            
            if (totalFinal >= ENVIO_GRATIS_UMBRAL) {
                mensaje += `*Envío:* ¡Bonificado (Gratis)!\n`;
            } else {
                mensaje += `*Envío:* A coordinar\n`;
            }

            const mensajeFormateado = encodeURIComponent(mensaje);
            const numeroTelefono = "541162998770";
            const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeFormateado}`;
            
            window.open(urlWhatsApp, "_blank");
        });
    }
});