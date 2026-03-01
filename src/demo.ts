import { ExpressoSwagger } from './core';

const models = {
    Post: {
        userId: 1,
        id: 1,
        title: "Titolo del post",
        body: "Contenuto del post..."
    },
    User: {
        id: 1,
        name: "Leanne Graham",
        username: "Bret",
        email: "Sincere@april.biz"
    }
};

const app = new ExpressoSwagger({
    info: {
        title: "ExpressoSwagger Demo UI",
        version: "1.3.0",
        description: "Test completo dei gruppi, metodi HTTP colorati e parametri dinamici."
    },
    baseUrl: "https://jsonplaceholder.typicode.com",
    models: models,
    settings: {
        withCredentials: false,
        theme: 'dark'
    }
});

// Gruppo: Catalogo Post
app.addEndpoint({
    path: "/posts",
    method: "GET",
    group: "Catalogo Post",
    name: "Lista Post",
    responses: { 200: { description: "Successo", body: ["Post"] } }
});

// Gruppo: DEMO_API (Tutti i metodi richiesti)
app.addEndpoint({
    path: "/posts",
    method: "GET",
    group: "DEMO_API",
    name: "Get con Parametro Opzionale",
    description: "Recupera i post filtrando opzionalmente per userId.",
    query: {
        userId: { type: "number", description: "ID dell'utente (opzionale)" }
    },
    responses: { 200: { description: "Successo", body: ["Post"] } }
});

app.addEndpoint({
    path: "/posts",
    method: "POST",
    group: "DEMO_API",
    name: "Crea Risorsa (POST)",
    description: "Crea un nuovo post inviando un body JSON.",
    body: "Post",
    responses: { 201: { description: "Creato con successo", body: "Post" } }
});

app.addEndpoint({
    path: "/posts/{id}",
    method: "PUT",
    group: "DEMO_API",
    name: "Aggiorna Completo (PUT)",
    description: "Sostituisce interamente la risorsa specificata.",
    params: { id: { type: "number", required: true, description: "ID della risorsa" } },
    body: "Post",
    responses: { 200: { description: "Aggiornato", body: "Post" } }
});

app.addEndpoint({
    path: "/posts/{id}",
    method: "PATCH",
    group: "DEMO_API",
    name: "Aggiorna Parziale (PATCH)",
    description: "Modifica solo alcuni campi della risorsa specificata.",
    params: { id: { type: "number", required: true, description: "ID della risorsa" } },
    body: { title: "Nuovo Titolo" },
    responses: { 200: { description: "Modificato", body: "Post" } }
});

app.addEndpoint({
    path: "/posts/{id}",
    method: "DELETE",
    group: "DEMO_API",
    name: "Elimina Risorsa (DELETE)",
    description: "Rimuove permanentemente la risorsa specificata.",
    params: { id: { type: "number", required: true, description: "ID della risorsa" } },
    responses: { 200: { description: "Eliminato con successo", body: {} } }
});

// Gruppo: Gestione Utenti
app.addEndpoint({
    path: "/users",
    method: "GET",
    group: "Gestione Utenti",
    name: "Lista Utenti",
    responses: { 200: { description: "Successo", body: ["User"] } }
});

const apiDocument = app.getDocument();
export default apiDocument;
