require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// In-memory storage
let favorites = [];
let shoppingLists = [];
let favoriteId = 1;
let listId = 1;

// Authentication middleware
const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'luxury-recipe-key-2024') {
        return res.status(401).json({ error: 'Unauthorized. Invalid API key.' });
    }
    next();
};

// ============ RECIPE SEARCH ============
app.get('/api/search', authenticate, async (req, res) => {
    try {
        const { ingredient, diet, cuisine, maxReadyTime } = req.query;
        
        const params = {
            apiKey: process.env.SPOONACULAR_API_KEY,
            query: ingredient || 'chicken',
            number: 24,
            addRecipeInformation: true,
            addRecipeNutrition: true,
            fillIngredients: true
        };
        
        if (diet && diet !== '') params.diet = diet;
        if (cuisine && cuisine !== '') params.cuisine = cuisine;
        if (maxReadyTime && maxReadyTime !== '') params.maxReadyTime = parseInt(maxReadyTime);
        
        const response = await axios.get(
            'https://api.spoonacular.com/recipes/complexSearch',
            { params }
        );
        
        const recipes = response.data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 30,
            servings: recipe.servings || 4,
            pricePerServing: recipe.pricePerServing || 0,
            summary: recipe.summary || '',
            diets: recipe.diets || []
        }));
        
        res.status(200).json({
            success: true,
            count: recipes.length,
            recipes: recipes
        });
        
    } catch (error) {
        console.error('Search API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch recipes',
            message: error.message 
        });
    }
});

// ============ SINGLE RECIPE DETAILS ============
app.get('/api/recipe/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/${id}/information`,
            {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY,
                    includeNutrition: true
                }
            }
        );
        
        res.status(200).json({
            success: true,
            recipe: response.data
        });
        
    } catch (error) {
        console.error('Recipe details error:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipe details' });
    }
});

// ============ FAVORITES CRUD ============
app.get('/api/favorites', authenticate, (req, res) => {
    res.status(200).json({ favorites });
});

app.post('/api/favorites', authenticate, (req, res) => {
    const { recipeId, title, image, notes } = req.body;
    
    if (!recipeId || !title) {
        return res.status(400).json({ error: 'Recipe ID and title are required' });
    }
    
    const exists = favorites.find(f => f.recipeId === parseInt(recipeId));
    if (exists) {
        return res.status(409).json({ error: 'Recipe already in favorites' });
    }
    
    const newFavorite = {
        id: favoriteId++,
        recipeId: parseInt(recipeId),
        title: title,
        image: image || 'https://via.placeholder.com/300x200',
        notes: notes || '',
        addedAt: new Date().toISOString()
    };
    
    favorites.push(newFavorite);
    res.status(201).json({ success: true, favorite: newFavorite });
});

app.put('/api/favorites/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const { notes } = req.body;
    
    const index = favorites.findIndex(f => f.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Favorite not found' });
    }
    
    favorites[index].notes = notes || '';
    res.status(200).json({ success: true, favorite: favorites[index] });
});

app.delete('/api/favorites/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const index = favorites.findIndex(f => f.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Favorite not found' });
    }
    
    favorites.splice(index, 1);
    res.status(200).json({ success: true, message: 'Removed from favorites' });
});

// ============ SHOPPING LIST CRUD ============
app.get('/api/shopping-list', authenticate, (req, res) => {
    res.status(200).json({ items: shoppingLists });
});

app.post('/api/shopping-list', authenticate, (req, res) => {
    const { name, quantity, unit } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Item name is required' });
    }
    
    const newItem = {
        id: listId++,
        name: name,
        quantity: quantity || 1,
        unit: unit || 'piece',
        checked: false,
        createdAt: new Date().toISOString()
    };
    
    shoppingLists.push(newItem);
    res.status(201).json({ success: true, item: newItem });
});

app.put('/api/shopping-list/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const { checked, quantity } = req.body;
    
    const item = shoppingLists.find(i => i.id === id);
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    
    if (checked !== undefined) item.checked = checked;
    if (quantity !== undefined) item.quantity = quantity;
    
    res.status(200).json({ success: true, item: item });
});

app.delete('/api/shopping-list/:id', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    shoppingLists = shoppingLists.filter(i => i.id !== id);
    res.status(200).json({ success: true, message: 'Item removed' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   🍽️  LUXURY RECIPE FINDER API      ║
    ║                                      ║
    ║   Server: http://localhost:${PORT}     ║
    ║   Status: ✅ RUNNING                 ║
    ╚══════════════════════════════════════╝
    `);
});