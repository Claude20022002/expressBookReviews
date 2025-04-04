const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000"; // URL de l'API

// Tâche 10 : Obtenir la liste des livres avec async-await et Axios
public_users.get("/", async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la récupération des livres.",
        });
    }
});

// Tâche 11 : Obtenir les détails d'un livre par ISBN avec async-await et Axios
public_users.get("/isbn/:isbn", async (req, res) => {
    const { isbn } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Livre non trouvé." });
    }
});

// Tâche 12 : Obtenir les détails d'un livre par Auteur avec async-await et Axios
public_users.get("/author/:author", async (req, res) => {
    const { author } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/author/${author}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({
            message: "Aucun livre trouvé pour cet auteur.",
        });
    }
});

// Tâche 13 : Obtenir les détails d'un livre par Titre avec async-await et Axios
public_users.get("/title/:title", async (req, res) => {
    const { title } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/title/${title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "Aucun livre trouvé avec ce titre." });
    }
});

// Tâche 5 : Obtenir les critiques d'un livre par ISBN
public_users.get("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book && book.reviews) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({
            message: "Aucune critique trouvée pour ce livre",
        });
    }
});

// Tâche 6 : Enregistrement d'un nouvel utilisateur
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Nom d'utilisateur et mot de passe requis" });
    }
    if (users.some((user) => user.username === username)) {
        return res.status(409).json({ message: "Nom d'utilisateur déjà pris" });
    }
    users.push({ username, password });
    res.status(201).json({ message: "Utilisateur enregistré avec succès" });
});

module.exports.general = public_users;
