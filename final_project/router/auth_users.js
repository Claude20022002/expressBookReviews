require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Liste des utilisateurs enregistrés
const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey"; // Utiliser une variable d'environnement

// Vérifier si un nom d'utilisateur existe déjà
const isValid = (username) => {
    return users.some((user) => user.username === username);
};

// Vérifier si les identifiants sont corrects
const authenticatedUser = (username, password) => {
    return users.some(
        (user) => user.username === username && user.password === password
    );
};

// Route d'enregistrement d'un nouvel utilisateur (Tâche 6)
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Nom d'utilisateur et mot de passe requis." });
    }

    if (isValid(username)) {
        return res
            .status(409)
            .json({ message: "Nom d'utilisateur déjà pris." });
    }

    users.push({ username, password });
    return res
        .status(201)
        .json({ message: "Utilisateur enregistré avec succès." });
});

// Route de connexion (Tâche 7)
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Nom d'utilisateur et mot de passe requis." });
    }

    if (!authenticatedUser(username, password)) {
        return res
            .status(401)
            .json({ message: "Nom d'utilisateur ou mot de passe incorrect." });
    }

    // Génération du token JWT
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ message: "Connexion réussie", token });
});

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Token requis ou mal formaté" });
    }

    const token = authHeader.split(" ")[1]; // Extraire le token après "Bearer"
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token invalide" });
        req.user = user;
        next();
    });
};

// Ajouter ou modifier une critique de livre (Tâche 8)
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Livre non trouvé." });
    }

    if (!review) {
        return res.status(400).json({ message: "Critique non fournie." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {}; // Initialiser les critiques si elles n'existent pas
    }

    books[isbn].reviews[username] = review;
    return res.json({
        message: "Critique ajoutée/modifiée avec succès.",
        book: books[isbn],
    });
});

// Supprimer une critique de livre (Tâche 9)
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Livre non trouvé." });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Critique introuvable." });
    }

    delete books[isbn].reviews[username];
    return res.json({ message: "Critique supprimée avec succès." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
