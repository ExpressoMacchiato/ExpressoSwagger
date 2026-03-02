import { EndpointConfig, ExpressoSwaggerConfig, ExpressoSwaggerDocument } from './types';

export class ExpressoSwagger
{
    public config: ExpressoSwaggerConfig = { info: { title: "Dynamically Generated API", version: "1.0.0", description: "" }, models: {} };
    public endpoints: EndpointConfig[] = [];

    constructor(config: ExpressoSwaggerConfig)
    {
        this.config = config;
    }

    /**
     * Aggiunge un range di endpoint alla documentazione.
     */
    public setEndpoints(_endpoints: EndpointConfig[])
    {
        this.endpoints = _endpoints;
    }

    /**
     * Aggiunge un nuovo endpoint alla documentazione.
     * L'interfaccia è pensata per essere intuitiva e guidata dai tipi.
     */
    public addEndpoint(_endpoint: EndpointConfig)
    {
        this.endpoints.push(_endpoint);
    }

    /**
     * Ritorna l'intera configurazione e gli endpoint in un unico oggetto JSON.
     */
    public getDocument():ExpressoSwaggerDocument
    {
        return { ...this.config, endpoints: this.endpoints };
    }
}
