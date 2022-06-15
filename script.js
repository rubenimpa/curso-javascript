class Tag {
    constructor(nombre, id, clase, attr, valor, tagsHijos) {
        this.nombre = nombre;
        this.id = id;
        this.clase = clase;
        this.valor = valor;
        this.attr = attr;
        this.tagsHijos = tagsHijos;
    }

}

class Producto {

    constructor(id, nombre, imagen, precio, cantidad = 0) {
        this.id = id;
        this.nombre = nombre;
        this.imagen = imagen;
        this.precio = precio;
        this.cantidad = cantidad;
    }

}

//Whatsapp destino
const WHATSAPP_DESTINO = "https://wa.me/5491131156083?text="; 

//Definición del catalogo
const catalogo = [];

//Carga de items del catalogo
const cargaCatalogo = async () => {
    const resp = await fetch('/data.json')
    const data = await resp.json()
   
    data.forEach((item) => {
        catalogo.push(new Producto(item.id, item.nombre, item.imagen, item.precio));
    });
}
cargaCatalogo();


//Array resultado de la búsqueda
let encontrados = [];

//Asignación de eventos
let searchButton = document.getElementById("search-button");
let searchInput = document.getElementById("search-input");
let mostrarButton = document.getElementById("mostrar-button");
let linkComprar = document.getElementById("link-comprar");

//Definición de los eventos de click sobre el botón y enter en el input
searchButton.addEventListener("click", buscar);
searchInput.addEventListener("keypress", (e) => {
    if ( e.key === "Enter" ) {
        buscar();
    }
});

//Definición del evento de botón de agregados que muestra la lista de items seleccionados
mostrarButton.addEventListener("click", () => {
    mostrarAgregados();
})

//Definición del evento del link Comprar
linkComprar.addEventListener("click", () => {
    let textLink = "Hola! quería consultar por estos productos:%0A";

    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        item = JSON.parse(localStorage.getItem(clave));
        textLink = textLink.concat(`${item.nombre}, unidades: ${item.cantidad}%0A`);
    }
    //Se indica el link destino al hacer clic sobre el link
    linkComprar.href = localStorage.length !== 0 ? WHATSAPP_DESTINO.concat(textLink) : "#";
})


//Función de busqueda a partir del valor ingresado en el input
function buscar() {
    let entrada = searchInput.value.toLocaleLowerCase();
    encontrados = catalogo.filter(item => entrada.trim() === "" || item.nombre.toLocaleLowerCase().includes(entrada));

    crearSalida();    
}

//Asignación de eventos de los botones de cada item
function asignarEventosItems() {
    let itemIndice = 0;

    //Evento comprar: suma el item al carrito/storage
    encontrados.forEach((item) => {
        document.getElementById("button-item-"+itemIndice++).addEventListener("click", agregarItem(item));
    });
}

//Agrega un item al localStorage que se muestran luego con el boton "Agregados"
const agregarItem = (item) => {
    return (e) => {
        item.cantidad++;
        localStorage.setItem(item.id, JSON.stringify(item));
        Toastify({
            text: `${item.nombre}: `  + item.cantidad,
            duration: 3000
        }).showToast();
    }
}

//Asignación de eventos de los botones de la ventana de carrito
function addEventItemsCart() {
    let itemIndice = 0;

    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        item = JSON.parse(localStorage.getItem(clave));
        document.getElementById("agregar-item-"+itemIndice).addEventListener("click", addItemCart(item));
        document.getElementById("eliminar-item-"+itemIndice++).addEventListener("click", eliminarItem(item));    
    }
    
}

const addItemCart = (item) => {
    return (e) => {
        item.cantidad++;
        localStorage.setItem(item.id, JSON.stringify(item));
        mostrarAgregados();
    }
}

//Elimina un item del localStorage
const eliminarItem = (item) => {
    return (e) => {
        item.cantidad = 0;
        localStorage.removeItem(item.id);
        mostrarAgregados();
    }
}

//Función de creación de salida con los items resultado
function crearSalida() {
    let indiceId = 0;
    let tagsSalida = [];

    //Se recorre y definen los tags de salida por cada item
    encontrados.forEach(({nombre, imagen, precio}) => {
        tagsSalida.push(new Tag("div", `catalogo-item-${indiceId}`, "catalogo-item", "", "", 
                            [new Tag("img", "", "img-item", `src="${imagen}"`, `Nombre: ${nombre}`, []),
                             new Tag("p", "", "", "", `Precio: ${precio}`, []),
                             new Tag("button", `button-item-${indiceId++}`, "btn-primary btn", "", "Comprar", [])]));
    });
    document.getElementById('catalogo').innerHTML = crearTagsSalida(...tagsSalida);
    asignarEventosItems();
}

//Función que muestra los items agregados
function mostrarAgregados() {
    let indiceId = 0
    let item;
    let tagsSalida = [];
    let total = 0;

     //Se recorre y definen los tags de salida por cada item
    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        item = JSON.parse(localStorage.getItem(clave));
        tagsSalida.push(new Tag("div", `agregado-item-${indiceId}`, "agregado-item", "", "", 
                            [new Tag("p", "", "agregado-col-1", "", `${item.nombre}`, []),
                             new Tag("p", "", "", "", `$${item.precio}`, []),
                             new Tag("p", "", "", "", `${item.cantidad}`, []),
                             new Tag("button", `eliminar-item-${indiceId}`, "btn-primary btn", "", "X", []), 
                             new Tag("button", `agregar-item-${indiceId++}`, "btn-primary btn", "", "+", [])]));
        total += (item.precio*item.cantidad);
    }
    document.getElementById('items-carrito').innerHTML = crearTagsSalida(...tagsSalida);
    document.getElementById('modal-footer-total').innerHTML = `Total $: ${total}`;
    addEventItemsCart();
}

//Función temporal que devuelve el string de salida a partir de los tags recibidos
function crearTagsSalida(...tags) {
    let salida = "";
    let salidaTagsHijos = "";

    tags.forEach((tag) => {
        salidaTagsHijos = crearTagsSalida(...tag.tagsHijos);
        salida = salida.concat(`<${tag.nombre} `.concat(tag.attr ? `${tag.attr} ` : "").concat(tag.id ? `id="${tag.id}" ` : "").concat(tag.clase ? `class="${tag.clase}"` : "").concat(">").concat(tag.valor || salidaTagsHijos).concat(`</${tag.nombre}>`));
    });

    return salida;
}