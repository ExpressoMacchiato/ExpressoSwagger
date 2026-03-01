const express = require('express');
const path = require('path');
const { ExpressoSwagger, getUIPath } = require('../dist/lib/index.js');

const app = express();
const port = 4000;

// 1. Configurazione della documentazione (Logica Core)
const swagger = new ExpressoSwagger({
    info: {
        title: "ExpressoSwagger Playground",
        version: "2.0.0",
        description: "Stai vedendo la versione COMPILATA e distribuibile della libreria."
    },
    baseUrl: "https://jsonplaceholder.typicode.com",
    models: {
        User: { id: 1, name: "Mario Rossi", email: "mario@example.com" },
        Post: { userId: 1, id: 1, title: "Post di Prova", body: "Contenuto..." }
    },
    settings: { withCredentials: false }
});

// Aggiunta di alcuni endpoint di test
swagger.addEndpoint({
    path: "/users",
    method: "GET",
    group: "Utenti",
    summary: "Lista Utenti",
    responses: { 200: { description: "Successo", body: ["User"] } }
});

swagger.addEndpoint({
    path: "/posts/{id}",
    method: "GET",
    group: "Post",
    summary: "Dettaglio Post",
    params: { id: { type: "number", required: true } },
    responses: { 200: { description: "Trovato", body: "Post" } }
});

// 2. Servire i file statici della UI (Utilizzando getUIPath)
const uiPath = getUIPath();
console.log(`Servendo la UI da: ${uiPath}`);
app.use('/docs', express.static(uiPath));

// 3. Servire il JSON della documentazione
app.get('/docs/docs.json', (req, res) => {
    res.json(swagger.getDocument());
});

// Redirect root to docs
app.get('/', (req, res) => res.redirect('/docs'));

app.listen(port, () => {
    console.log(`
🚀 Playground pronto!`);
    console.log(`👉 Apri il browser su: http://localhost:${port}/docs`);
    console.log(`
(Premi Ctrl+C per fermare il server)`);
});
