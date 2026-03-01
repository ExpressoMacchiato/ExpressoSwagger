import { ExpressoSwaggerConfig, EndpointConfig } from './types';

export class ExpressoSwagger {
    private config: ExpressoSwaggerConfig;
    private endpoints: EndpointConfig[] = [];

    constructor(config: ExpressoSwaggerConfig) {
        this.config = {
            ...config,
            settings: {
                withCredentials: true, // Default impostato per risolvere il tuo problema
                theme: 'system',
                ...config.settings,
            },
        };
    }

    /**
     * Aggiunge un nuovo endpoint alla documentazione.
     * L'interfaccia è pensata per essere intuitiva e guidata dai tipi.
     */
    public addEndpoint(endpoint: EndpointConfig): this {
        this.endpoints.push(endpoint);
        return this;
    }

    /**
     * Ritorna l'intera configurazione e gli endpoint in un unico oggetto JSON.
     */
    public getDocument() {
        return {
            ...this.config,
            endpoints: this.endpoints,
        };
    }
}
