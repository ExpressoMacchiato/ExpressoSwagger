import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExpressoSwaggerUI } from './ui';
import './ui/index.css';

// La UI compilata cercherà il documento JSON nello stesso percorso dove viene servita
// Questo la rende perfetta per essere servita da un middleware backend
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ExpressoSwaggerUI url="./docs.json" />
    </React.StrictMode>
);
