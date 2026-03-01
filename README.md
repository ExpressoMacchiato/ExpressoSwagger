# ☕ ExpressoSwagger

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

> This library was entirely made by Gemini.

**ExpressoSwagger** is a modern, high-performance, and visually stunning alternative to Swagger UI. Designed for developers who care about aesthetics and functionality, it offers a seamless way to document and test your APIs without the clunky overhead of traditional tools.

![ExpressoSwagger Interface](https://raw.githubusercontent.com/ExpressoMacchiato/ExpressoMacchiato/refs/heads/master/_assets/image.png)

## 🌟 Why ExpressoSwagger?

Traditional Swagger can be rigid and visually dated. ExpressoSwagger was built to solve specific pain points:

*   **⚡ Modern 3-Column Layout**: A clean, ergonomic interface inspired by Stripe and Redoc. Navigation on the left, Documentation in the center, and a powerful Console on the right.
*   **🍪 Native Session Support**: Tired of CORS and credential issues? ExpressoSwagger supports `withCredentials` natively, making cookie-based and session-based authentication testing a breeze.
*   **🛠️ Zero Decorators**: No more polluting your controllers with bulky decorators. Configure everything programmatically with simple, strongly-typed TypeScript objects.
*   **♻️ DRY Models**: Define your data structures once and reuse them across multiple endpoints.
*   **🔍 Smart Method Search**: Search not just for paths or titles, but also by HTTP method (e.g., type "POST" to see all creation endpoints).
*   **💾 Persistent Global Headers**: Set your Authorization tokens or API keys once in the Global Config panel; they are saved in your browser and injected into every call automatically.

## 📦 Installation

```bash
npm i expresso-swagger
```

## 🚀 Quick Start

ExpressoSwagger is **framework-agnostic**. Whether you use Express, Fastify, Koa, or a custom solution, integration takes seconds.

### 1. Configure your API

```typescript
const { ExpressoSwagger } = require('expresso-swagger');

const doc = new ExpressoSwagger({
    info: {
        title: "Store Management API",
        version: "1.0.0",
        description: "Manage products, users, and orders with ease."
    },
    baseUrl: "https://api.myapp.com",
    models: {
        User: { id: 1, username: "dev_user", role: "admin" }
    },
    settings: { withCredentials: true }
});

doc.addEndpoint({
    path: "/users",
    method: "GET",
    group: "Users",
    summary: "Retrieve all users",
    responses: {
        200: { description: "List of users", body: ["User"] }
    }
});
```

### 2. Serve the UI (Example with Express)

```typescript
const express = require('express');
const { getUIPath } = require('expresso-swagger');

const app = express();

// Serve the compiled UI assets
app.use('/docs', express.static(getUIPath()));

// Serve the documentation JSON (the UI looks for it at ./docs.json)
app.get('/docs/docs.json', (req, res) => {
    res.json(doc.getDocument());
});

app.listen(3000, () => console.log('API Docs: http://localhost:3000/docs'));
```

## 🎨 UI Features

-   **Color-coded Methods**: Instantly distinguish between GET, POST, PUT, and DELETE with vibrant badges.
-   **Inline Descriptions**: Support for multiline descriptions (`\n`) to keep your documentation detailed but readable.
-   **Real-time URL Building**: Watch your final API URL update dynamically as you type parameters.
-   **Schema Preview**: Elegant, foldable JSON previews for every response type.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, feel free to open an issue or submit a pull request.

## 📜 License

This project is licensed under the MIT License.
