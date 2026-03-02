export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export interface ParamDefinition {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'datemultirange' | 'file' | 'blob';
    required?: boolean;
    description?: string;
    default?: any;
    example?: any;
}

export interface EndpointResponse {
    description: string;
    body?: any; // Può essere un oggetto, un array o il NOME di un modello (stringa)
    headers?: Record<string, string>;
}

export interface EndpointConfig {
    path: string;
    method: HttpMethod;
    baseUrl?: string;
    group?: string; // Gruppo/Schema di appartenenza (es. "Utenti", "Ordini")
    name?: string;
    description?: string;
    tags?: string[];
    params?: Record<string, ParamDefinition>;
    query?: Record<string, ParamDefinition>;
    body?: string | Record<string, any>; // Può essere un oggetto o il NOME di un modello (stringa)
    responses: Record<number | string, EndpointResponse>;
}

export interface ExpressoSwaggerInfo {
    title: string;
    version: string;
    description?: string;
}

export interface ExpressoSwaggerSettings {
    withCredentials?: boolean;
    theme?: 'light' | 'dark' | 'system';
    primaryColor?: string;
}

export interface ExpressoSwaggerConfig {
    info: ExpressoSwaggerInfo;
    baseUrl?: string;
    settings?: ExpressoSwaggerSettings;
    models?: Record<string, any>; // Definizione dei modelli globali
}

export interface ExpressoSwaggerDocument extends ExpressoSwaggerConfig {
    endpoints: EndpointConfig[];
}
