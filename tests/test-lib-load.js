const { ExpressoSwagger, getUIPath } = require('../dist/lib/index.js');
const fs = require('fs');
const path = require('path');

console.log("--- TEST CARICAMENTO LIBRERIA ---");

try {
    // 1. Verifica Classe Core
    const swagger = new ExpressoSwagger({ info: { title: "Test", version: "1.0.0" } });
    const doc = swagger.getDocument();
    if (doc.info.title === "Test") {
        console.log("✅ Classe ExpressoSwagger: Caricata correttamente.");
    }

    // 2. Verifica getUIPath
    const uiPath = getUIPath();
    console.log(`Percorso UI rilevato: ${uiPath}`);

    if (fs.existsSync(uiPath) && fs.existsSync(path.join(uiPath, 'index.html'))) {
        console.log("✅ Percorso UI: Valido e contiene index.html.");
    } else {
        console.log("❌ Percorso UI: Non valido o index.html mancante.");
        process.exit(1);
    }

    console.log("--- TEST SUPERATO CON SUCCESSO ---");
} catch (error) {
    console.error("❌ Errore durante il caricamento della libreria:", error);
    process.exit(1);
}
