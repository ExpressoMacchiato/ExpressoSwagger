import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Clock, Code, Database, Globe, Key, Plus, Search, Settings, Shield, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// HTTP Method Color Map
const methodColors: Record<string, { bg: string, text: string, border: string }> = {
    GET: { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/20' },
    POST: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    PUT: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    PATCH: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
    DEFAULT: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20' }
};

const SidebarItem = ({ method, title, active, onClick }: any) => {
    const colors = methodColors[method] || methodColors.DEFAULT;

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center px-4 py-2 text-[13px] font-medium transition-all duration-200 rounded-lg group text-left ${
                active
                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent'
            }`}
        >
            <span className={`font-black mr-3 text-[9px] w-12 py-1 rounded-md text-center shrink-0 border ${colors.bg} ${colors.text} ${colors.border} uppercase tracking-tighter`}>
                {method}
            </span>
            <span className={`truncate ${active ? 'text-primary-500 font-bold' : ''}`}>{title}</span>
        </button>
    );
};

const InputField = ({ label, value, onChange, placeholder, type = "text", description }: any) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
            {description && (
                <span className="text-[9px] text-slate-400 italic max-w-[150px] truncate">{description}</span>
            )}
        </div>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 text-sm bg-slate-950/50 border border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500/50 transition-all outline-none text-white placeholder:text-slate-600"
        />
    </div>
);

const SchemaPreview = ({ data, title }: { data: any, title: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!data) return null;

    return (
        <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <Code className="w-3.5 h-3.5" />
                    <span>Schema: {title}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <pre className="p-4 text-[12px] font-mono text-primary-600 dark:text-primary-400 overflow-x-auto bg-slate-50/50 dark:bg-slate-950/20">
                            {JSON.stringify(data, null, 4)}
                        </pre>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ExpressoSwaggerUI = ({ document: initialDocument, url }: { document?: any, url?: string }) => {
    const [document, setDocument] = useState<any>(initialDocument);
    const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [globalHeaders, setGlobalHeaders] = useState<Array<{ key: string, value: string }>>([]);

    const [params, setParams] = useState<Record<string, string>>({});
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [body, setBody] = useState<string>("");
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!url);
    const [executionTime, setExecutionTime] = useState<number | null>(null);

    useEffect(() => {
        const savedHeaders = localStorage.getItem('expresso_global_headers');
        if (savedHeaders) {
            try {
                setGlobalHeaders(JSON.parse(savedHeaders));
            } catch (e) {
                console.error("Error loading global headers", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('expresso_global_headers', JSON.stringify(globalHeaders));
    }, [globalHeaders]);

    useEffect(() => {
        if (url) {
            setFetching(true);
            axios.get(url)
                .then(res => {
                    setDocument(res.data);
                    setSelectedEndpoint(res.data.endpoints[0]);
                })
                .catch(err => console.error("Error loading JSON document", err))
                .finally(() => setFetching(false));
        } else if (initialDocument && initialDocument.endpoints) {
            setDocument(initialDocument);
            setSelectedEndpoint(initialDocument.endpoints[0]);
        }
    }, [url, initialDocument]);

    const closeConfig = () => {
        setGlobalHeaders(prev => prev.filter(h => h.key.trim() !== '' || h.value.trim() !== ''));
        setIsConfigOpen(false);
    };

    const resolveModel = (data: any): any => {
        if (!document || !document.models) return data;
        if (typeof data === 'string' && document.models[data]) {
            return document.models[data];
        }
        if (Array.isArray(data) && typeof data[0] === 'string' && document.models[data[0]]) {
            return [document.models[data[0]]];
        }
        return data;
    };

    const filteredGroupedEndpoints = useMemo(() => {
        if (!document || !document.endpoints) return {};
        const term = searchTerm.toLowerCase();
        return document.endpoints.reduce((acc: any, endpoint: any) => {
            const group = endpoint.group || 'Default';
            const matchesSearch =
                endpoint.path.toLowerCase().includes(term) ||
                (endpoint.name && endpoint.name.toLowerCase().includes(term)) ||
                endpoint.method.toLowerCase().includes(term) ||
                group.toLowerCase().includes(term);

            if (matchesSearch) {
                if (!acc[group]) acc[group] = [];
                acc[group].push(endpoint);
            }
            return acc;
        }, {});
    }, [document, searchTerm]);

    useEffect(() => {
        if (selectedEndpoint) {
            const initialParams: Record<string, string> = {};
            Object.keys(selectedEndpoint.params || {}).forEach(k => initialParams[k] = "");
            setParams(initialParams);

            const initialQuery: Record<string, string> = {};
            Object.keys(selectedEndpoint.query || {}).forEach(k => initialQuery[k] = "");
            setQueryParams(initialQuery);

            const resolvedBody = resolveModel(selectedEndpoint.body);
            setBody(resolvedBody ? JSON.stringify(resolvedBody, null, 4) : "");

            setResponse(null);
            setExecutionTime(null);
        }
    }, [selectedEndpoint]);

    const executeApi = async () => {
        setLoading(true);
        setResponse(null);
        const startTime = performance.now();

        try {
            const hostBaseUrl = document.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
            const finalBaseUrl = selectedEndpoint.baseUrl || hostBaseUrl;

            let pathWithParams = selectedEndpoint.path;
            Object.entries(params).forEach(([key, value]) => {
                pathWithParams = pathWithParams.replace(`{${key}}`, value || `{${key}}`);
            });

            const baseUrlClean = finalBaseUrl.replace(/\/$/, '');
            const pathClean = pathWithParams.replace(/^\//, '');
            const fullUrl = `${baseUrlClean}/${pathClean}`;

            const headers: Record<string, string> = {};
            globalHeaders.forEach(h => {
                if (h.key && h.value) headers[h.key] = h.value;
            });

            const result = await axios({
                method: selectedEndpoint.method,
                url: fullUrl,
                params: queryParams,
                data: ['GET', 'DELETE'].includes(selectedEndpoint.method) ? undefined : JSON.parse(body || "{}"),
                headers: headers,
                withCredentials: document.settings?.withCredentials ?? true,
                validateStatus: () => true
            });

            const endTime = performance.now();
            setExecutionTime(Math.round(endTime - startTime));
            setResponse(result);
        } catch (err: any) {
            setResponse({
                status: "Error",
                data: { error: err.message },
                headers: {}
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Documentation...</p>
            </div>
        </div>
    );

    if (!document || !selectedEndpoint) return <div className="p-10 text-center text-slate-500">No API document found.</div>;

    const hostBaseUrl = document.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const finalBaseUrl = selectedEndpoint.baseUrl || hostBaseUrl;
    let displayPath = selectedEndpoint.path;
    Object.entries(params).forEach(([key, value]) => {
        displayPath = displayPath.replace(`{${key}}`, value || `{${key}}`);
    });
    const baseUrlClean = finalBaseUrl.replace(/\/$/, '');
    const pathClean = displayPath.replace(/^\//, '');
    const fullUrl = `${baseUrlClean}/${pathClean}`;

    const activeQueryParams = Object.entries(queryParams).filter(([_, v]) => v !== "");
    const queryString = activeQueryParams.length > 0
        ? "?" + new URLSearchParams(activeQueryParams).toString()
        : "";
    const displayFullUrl = fullUrl + queryString;

    const currentMethodColors = methodColors[selectedEndpoint.method] || methodColors.DEFAULT;

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden text-slate-900 dark:text-slate-100 relative">

            <AnimatePresence>
                {isConfigOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeConfig} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-40" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 bottom-0 w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-50 p-8 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white"><Key className="w-5 h-5" /></div>
                                    <div><h3 className="font-bold text-lg">Global Config</h3><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Authentication & Headers</p></div>
                                </div>
                                <button onClick={closeConfig} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Global Headers</h4>
                                        <button onClick={() => setGlobalHeaders([...globalHeaders, { key: '', value: '' }])} className="flex items-center space-x-1 text-[10px] font-bold bg-primary-500 text-white px-2 py-1 rounded-md uppercase tracking-tight"><Plus className="w-3 h-3" /><span>Add</span></button>
                                    </div>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {globalHeaders.length === 0 && <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl"><p className="text-xs text-slate-400 italic">No headers configured.</p></div>}
                                        {globalHeaders.map((header, idx) => (
                                            <div key={idx} className="flex items-end space-x-2 group">
                                                <div className="flex-1 space-y-1">
                                                    <input placeholder="Key" value={header.key} onChange={(e) => { const newHeaders = [...globalHeaders]; newHeaders[idx].key = e.target.value; setGlobalHeaders(newHeaders); }} className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
                                                    <input placeholder="Value" value={header.value} onChange={(e) => { const newHeaders = [...globalHeaders]; newHeaders[idx].value = e.target.value; setGlobalHeaders(newHeaders); }} className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
                                                </div>
                                                <button onClick={() => setGlobalHeaders(globalHeaders.filter((_, i) => i !== idx))} className="p-2 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                            <h1 className="font-bold text-lg tracking-tight uppercase">Expresso</h1>
                        </div>
                        <button onClick={() => setIsConfigOpen(true)} className="p-2 text-slate-400 hover:text-primary-500 relative">
                            <Settings className="w-5 h-5 hover:rotate-45 transition-transform duration-300" />
                            {globalHeaders.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white dark:border-slate-900" />}
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search API..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl outline-none" />
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-8">
                    {Object.entries(filteredGroupedEndpoints).map(([group, endpoints]: any) => (
                        <div key={group}>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 px-2 border-l-2 border-primary-500 pl-3">{group}</p>
                            <div className="space-y-1.5">
                                {endpoints.map((endpoint: any, idx: number) => (
                                    <SidebarItem key={idx} method={endpoint.method} title={endpoint.name || endpoint.path} active={selectedEndpoint === endpoint} onClick={() => setSelectedEndpoint(endpoint)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 px-12 py-10">
                <div className="max-w-4xl mx-auto">
                    <motion.div key={selectedEndpoint.path + selectedEndpoint.method} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center space-x-3 mb-4">
                            <span className={`px-3 py-1 text-[11px] font-black rounded-lg uppercase border ${currentMethodColors.bg} ${currentMethodColors.text} ${currentMethodColors.border}`}>{selectedEndpoint.method}</span>
                            <span className="text-sm font-mono text-slate-400">{selectedEndpoint.path}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">{selectedEndpoint.name}</h2>

                        <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6 border border-slate-200 dark:border-slate-800 group relative">
                            <Globe className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            <code className="text-[13px] font-mono break-all text-slate-500 dark:text-slate-400 flex-1">{displayFullUrl}</code>
                            <button onClick={() => navigator.clipboard.writeText(displayFullUrl)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-[10px] font-bold uppercase text-primary-500">Copy</button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium whitespace-pre-wrap">
                            {selectedEndpoint.description || "No description provided."}
                        </p>

                        <div className="space-y-12">
                            <section>
                                <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2"><Shield className="w-5 h-5 text-slate-400" /><h3 className="text-xl font-bold">Security</h3></div>
                                <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl flex items-center justify-between">
                                    <span className="text-sm font-medium">Include Credentials (Cookies/Session)</span>
                                    <span className="text-[10px] font-bold bg-primary-500 text-white px-2 py-1 rounded-full uppercase tracking-tighter">Enabled</span>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-2"><Database className="w-5 h-5 text-slate-400" /><h3 className="text-xl font-bold">Responses</h3></div>
                                <div className="space-y-6">
                                    {Object.entries(selectedEndpoint.responses).map(([code, res]: any) => (
                                        <div key={code} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-start space-x-4 mb-2"><span className={`px-2.5 py-1 rounded-lg text-xs font-black ${code.startsWith('2') ? 'text-green-500' : 'text-red-500'}`}>{code}</span><p className="text-[15px] font-medium pt-0.5">{res.description}</p></div>
                                            {res.body && <SchemaPreview data={resolveModel(res.body)} title={typeof res.body === 'string' ? res.body : 'Object'} />}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>

            <aside className="w-[480px] bg-slate-900 flex flex-col flex-shrink-0 text-white border-l border-slate-800 shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 bg-slate-900"><h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Try It Out</h4><button onClick={executeApi} disabled={loading} className="px-6 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50">{loading ? 'Executing...' : 'Execute API'}</button></div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 font-mono text-[13px]">
                    {Object.keys(selectedEndpoint.params || {}).length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Path Parameters</p>
                            {Object.entries(selectedEndpoint.params || {}).map(([key, def]: any) => (
                                <InputField key={key} label={key} placeholder={def.description} description={def.description} value={params[key]} onChange={(val: string) => setParams(prev => ({ ...prev, [key]: val }))} />
                            ))}
                        </div>
                    )}
                    {Object.keys(selectedEndpoint.query || {}).length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Query Parameters</p>
                            {Object.entries(selectedEndpoint.query || {}).map(([key, def]: any) => (
                                <InputField key={key} label={key} placeholder={def.description} description={def.description} value={queryParams[key]} onChange={(val: string) => setQueryParams(prev => ({ ...prev, [key]: val }))} />
                            ))}
                        </div>
                    )}
                    {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Request Body (JSON)</p>
                            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Enter JSON body here..." className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-[13px] outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-slate-300 font-mono resize-none" />
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Response</p>{response && <div className="flex items-center space-x-3 text-[10px] font-bold"><span className="flex items-center text-slate-400"><Clock className="w-3 h-3 mr-1" /> {executionTime}ms</span><span className={response.status < 300 ? 'text-green-500' : 'text-red-500'}>STATUS: {response.status}</span></div>}</div>
                        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 min-h-[100px] overflow-x-auto"><pre className={`whitespace-pre ${response ? (response.status >= 400 ? 'text-red-400' : 'text-green-400') : 'text-slate-600'}`}>{response ? JSON.stringify(response.data, null, 4) : "// Click 'Execute API'"}</pre></div>
                    </div>
                </div>
            </aside>
        </div>
    );
};
