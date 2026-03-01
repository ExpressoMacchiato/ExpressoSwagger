import path from 'path';
import { ExpressoSwagger } from '../core';
import { ExpressoSwaggerUI } from '../ui';

/**
 * Ritorna il percorso assoluto della cartella UI compilata.
 * Utile per servire i file statici con qualsiasi framework (Express, Fastify, ecc.)
 */
export function getUIPath(): string {
    // In produzione (dopo npm install), __dirname sarà dist/lib
    // La UI sarà in dist/ui
    return path.resolve(__dirname, '../ui');
}

export { 
    ExpressoSwagger, 
    ExpressoSwaggerUI 
};

export * from '../core/types';
