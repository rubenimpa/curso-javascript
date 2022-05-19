class Tag {
    constructor(nombre, id, clase, valor, tagsHijos) {
        this.nombre = nombre;
        this.id = id;
        this.clase = clase;
        this.valor = valor;
        this.tagsHijos = tagsHijos;
    }

    //Función que se encargará de devolver el string de salida del tag ya armado
    tagSalida(...tags) {
    }
}


class Producto {

    constructor(id, nombre, precio, cantidad = 0) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.cantidad = cantidad;
    }

}

//Definición del catalogo
const catalogo = [  new Producto(1, "olla 24 cm", 25000),
                    new Producto(2, "sarten 20 cm", 20000),
                    new Producto(3, "savarin", 5000),
                    new Producto(4, "olla 20 cm", 18000),
                    new Producto(5, "flip", 15000),
                    new Producto(6, "mate", 4000),
                    new Producto(7, "termo", 7000),
                    new Producto(8, "wok", 6000),
                    new Producto(9, "multiprocesador", 11000)
                ];

//Array resultado de la búsqueda
let encontrados = [];

//Asignación de eventos
let searchButton = document.getElementById("search-button");
let searchInput = document.getElementById("search-input");
let orderDescendentButton = document.getElementById("order-descendent");
let orderAscendentButton = document.getElementById("order-ascendent");
let mostrarButton = document.getElementById("mostrar-button");

//Definición de los eventos de click sobre el botón y enter en el input
searchButton.addEventListener("click", buscar);
searchInput.addEventListener("keypress", (e) => {
    if ( e.key === "Enter" ) {
        buscar();
    }
});

//Definición de los eventos de orden ascendente y descendente
orderAscendentButton.addEventListener("click", () => {
    encontrados.sort( ({precio: precio1}, {precio: precio2}) => precio1 - precio2 );
    crearSalida();
})
orderDescendentButton.addEventListener("click", () => {
    encontrados.sort( ({precio: precio1}, {precio: precio2}) => precio1 - precio2 );
    crearSalida();
})

//Definición del evento de botón de agregados que muestra la lista de items seleccionados
mostrarButton.addEventListener("click", () => {
    mostrarAgregados();
})

//Función de busqueda a partir del valor ingresado en el input
function buscar() {
    let entrada = searchInput.value.toLocaleLowerCase();
    encontrados = catalogo.filter(item => entrada.trim() === "" || item.nombre.toLocaleLowerCase().includes(entrada));

    crearSalida();    
    orderDescendentButton.disabled = orderAscendentButton.disabled = false;
}

//Asignación de eventos de los botones de cada item
function asignarEventosItems() {
    let itemIndice = 0;

    //Evento agregar: suma el item a una nueva lista de elegidos
    //Evento eliminar: quita el item de la lista de encontrados
    encontrados.forEach((item) => {
        document.getElementById("agregar-item-"+itemIndice).addEventListener("click", agregarItem(item));
        document.getElementById("eliminar-item-"+itemIndice++).addEventListener("click", eliminarItem(item));
    });
}

//Agrega un item al localStorage que se muestran luego con el boton "Agregados"
const agregarItem = (item) => {
    return (e) => {
        item.cantidad++;
        localStorage.setItem(item.id, JSON.stringify(item));
    }
}

//Elimina un item del localStorage
const eliminarItem = ({id}) => {
    return (e) => {
        localStorage.removeItem(id);
    }
}

//Función de creación de salida con los items resultado
function crearSalida() {
    let indiceId = 0;
    let tagsSalida = [];

    //Se recorre y definen los tags de salida por cada item
    encontrados.forEach(({nombre, precio}) => {
        tagsSalida.push(new Tag("div", `catalogo-item-${indiceId}`, "catalogo-item", "", 
                            [new Tag("button", `eliminar-item-${indiceId}`, "", "X", []), 
                             new Tag("button", `agregar-item-${indiceId++}`, "", "+", []),
                             new Tag("p", "", "", `Nombre: ${nombre}`, []),
                             new Tag("p", "", "", `Precio: ${precio}`, [])]));
    });
    document.getElementById('catalogo').innerHTML = crearTagsSalida(...tagsSalida);
    asignarEventosItems();
}

//Función que muestra los items agregados
function mostrarAgregados() {
    let indiceId = 0;
    let item;
    let tagsSalida = [];

    //Se recorre y definen los tags de salida por cada item
    for (let i = 0; i < localStorage.length; i++) {
        let clave = localStorage.key(i);
        item = JSON.parse(localStorage.getItem(clave));
        tagsSalida.push(new Tag("div", `catalogo-item-${indiceId}`, "catalogo-item", "", 
                            [new Tag("p", "", "", `Nombre: ${item.nombre}`, []),
                             new Tag("p", "", "", `Precio: ${item.precio}`, []),
                             new Tag("p", "", "", `Cantidad: ${item.cantidad}`, [])]));
    }
    document.getElementById('catalogo').innerHTML = crearTagsSalida(...tagsSalida);
}

//Función temporal que devuelve el string de salida a partir de los tags recibidos
function crearTagsSalida(...tags) {
    let salida = "";
    let salidaTagsHijos = "";

    tags.forEach((tag) => {
        salidaTagsHijos = crearTagsSalida(...tag.tagsHijos);
        salida = salida.concat(`<${tag.nombre} `.concat(tag.id ? `id="${tag.id}" ` : "").concat(tag.clase ? `class="${tag.clase}"` : "").concat(">").concat(tag.valor || salidaTagsHijos).concat(`</${tag.nombre}>`));
    });

    return salida;
}