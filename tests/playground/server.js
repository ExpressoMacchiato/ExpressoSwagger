const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { ExpressoSwagger, getUIPath } = require('../../dist/lib/index.js');

const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * TEST DATA (IN-MEMORY)
 */
let posts = [
    { id: 1, title: "First Post", body: "Content of the first post", category: "News" },
    { id: 2, title: "Welcome", body: "Welcome to ExpressoSwagger", category: "Info" }
];

/**
 * EXPRESSO SWAGGER CONFIGURATION
 */
const doc = new ExpressoSwagger({
    info: {
        title: "ExpressoSwagger Master Test",
        version: "1.5.0",
        description: "This playground tests every single feature:\n- Cookie Authentication\n- Global Headers\n- DRY Models\n- Endpoint Grouping\n- Error Handling"
    },
    models: {
        Post: { id: 0, title: "", body: "", category: "" },
        User: { id: 0, username: "", role: "admin" },
        Error: { error: "Error message", code: 400 }
    },
    settings: {
        withCredentials: true // IMPORTANT: Enables cookie support for testing
    }
});

// Group: AUTHENTICATION
doc.addEndpoint({
    path: "/api/login",
    method: "POST",
    group: "Authentication",
    summary: "User Login (Cookie Auth)",
    description: "Performs login and sets an HTTP-Only 'session_id' cookie.\nUse 'admin' / 'password' to test.",
    body: { username: "admin", password: "password" },
    responses: {
        200: { description: "Login successful, cookie set", body: "User" },
        401: { description: "Invalid credentials", body: "Error" }
    }
});

// Group: POSTS (Full CRUD)
doc.addEndpoint({
    path: "/api/posts",
    method: "GET",
    group: "Posts",
    summary: "List Posts",
    description: "Returns a list of posts.\nYou can filter by category using the 'category' query parameter.\nAvailable categories: News, Info.",
    query: {
        category: { type: "string", description: "Filter by category name" },
        limit: { type: "number", default: 10 }
    },
    responses: { 200: { description: "Success", body: ["Post"] } }
});

doc.addEndpoint({
    path: "/api/posts/{id}",
    method: "GET",
    group: "Posts",
    summary: "Post Details",
    params: { id: { type: "number", required: true, description: "The unique ID of the post" } },
    responses: { 
        200: { description: "Found", body: "Post" },
        404: { description: "Not found", body: "Error" }
    }
});

doc.addEndpoint({
    path: "/api/posts",
    method: "POST",
    group: "Posts",
    summary: "Create Post",
    body: "Post",
    responses: { 201: { description: "Created", body: "Post" } }
});

// Group: SECURITY TESTS
doc.addEndpoint({
    path: "/api/secure-data",
    method: "GET",
    group: "Security",
    summary: "Protected Data (Requires Cookie)",
    description: "Returns 401 if the 'session_id' cookie is missing.\nLogin first to access this endpoint.",
    responses: {
        200: { description: "Access granted", body: { secret: "TOP_SECRET_DATA_123" } },
        401: { description: "Unauthorized", body: "Error" }
    }
});

doc.addEndpoint({
    path: "/api/custom-header-test",
    method: "GET",
    group: "Security",
    summary: "Custom Header Test",
    description: "Requires the 'x-test-key' header to respond with success.\nSet it in Global Config to test.",
    responses: { 200: { description: "Header received successfully" } }
});

/**
 * REAL API IMPLEMENTATION (MOCK BACKEND)
 */

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        res.cookie('session_id', 'expresso_secret_token_123', { httpOnly: true });
        return res.json({ id: 1, username: 'admin', role: 'admin' });
    }
    res.status(401).json({ error: "Invalid credentials", code: 401 });
});

app.get('/api/posts', (req, res) => {
    let result = posts;
    if (req.query.category) result = result.filter(p => p.category === req.query.category);
    res.json(result);
});

app.get('/api/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (post) return res.json(post);
    res.status(404).json({ error: "Post not found", code: 404 });
});

app.post('/api/posts', (req, res) => {
    const newPost = { id: posts.length + 1, ...req.body };
    posts.push(newPost);
    res.status(201).json(newPost);
});

app.get('/api/secure-data', (req, res) => {
    if (req.cookies.session_id === 'expresso_secret_token_123') {
        return res.json({ secret: "THIS IS A PROTECTED SECRET" });
    }
    res.status(401).json({ error: "Missing session cookie. Please login first!", code: 401 });
});

app.get('/api/custom-header-test', (req, res) => {
    const key = req.headers['x-test-key'];
    if (key) return res.json({ message: `Successfully received x-test-key: ${key}` });
    res.status(400).json({ error: "Missing global header x-test-key", code: 400 });
});

/**
 * SERVE EXPRESSO SWAGGER
 */
const uiPath = getUIPath();
app.use('/docs', express.static(uiPath));
app.get('/docs/docs.json', (req, res) => res.json(doc.getDocument()));
app.get('/', (req, res) => res.redirect('/docs'));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n✅ PLAYGROUND SERVER STARTED`);
    console.log(`📍 URL: http://localhost:${PORT}/docs`);
    console.log(`\nAVAILABLE TESTS:`);
    console.log(`1. Login (POST /api/login) -> Sets session cookie`);
    console.log(`2. Secure Data (GET /api/secure-data) -> Works only after login (withCredentials)`);
    console.log(`3. Header Test -> Works only if you set 'x-test-key' in Global Config`);
});
