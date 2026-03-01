import { describe, it, expect } from 'vitest';
import { ExpressoSwagger } from '../src/core';

describe('ExpressoSwagger Core', () => {
    it('dovrebbe generare correttamente le informazioni di base', () => {
        const swagger = new ExpressoSwagger({
            info: { title: "Test API", version: "1.0.0" }
        });
        const doc = swagger.getDocument();
        expect(doc.info.title).toBe("Test API");
        expect(doc.info.version).toBe("1.0.0");
    });

    it('dovrebbe raggruppare gli endpoint correttamente', () => {
        const swagger = new ExpressoSwagger({
            info: { title: "Test", version: "1" }
        });
        
        swagger.addEndpoint({
            path: "/users",
            method: "GET",
            group: "Users",
            responses: { 200: { description: "OK" } }
        });

        const doc = swagger.getDocument();
        expect(doc.endpoints).toHaveLength(1);
        expect(doc.endpoints[0].group).toBe("Users");
    });

    it('dovrebbe risolvere i modelli (DRY)', () => {
        const swagger = new ExpressoSwagger({
            info: { title: "Test", version: "1" },
            models: { User: { id: 1, name: "Mario" } }
        });
        
        const doc = swagger.getDocument();
        expect(doc.models.User.name).toBe("Mario");
    });
});
