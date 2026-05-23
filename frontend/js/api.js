const API_BASE_URL = 'http://localhost:3001/api';
const API_KEY = 'luxury-recipe-key-2024';

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'API call failed');
    }
    
    return data;
}

async function searchRecipes(ingredient, diet = '', cuisine = '', maxTime = 60) {
    const params = new URLSearchParams({
        ingredient: ingredient || 'chicken',
        diet: diet,
        cuisine: cuisine,
        maxReadyTime: maxTime
    });
    return await apiCall(`/search?${params.toString()}`);
}

async function getRecipeDetails(recipeId) {
    return await apiCall(`/recipe/${recipeId}`);
}

async function getFavorites() {
    return await apiCall('/favorites');
}

async function addToFavorite(recipeId, title, image, notes = '') {
    return await apiCall('/favorites', 'POST', { recipeId, title, image, notes });
}

async function removeFromFavorite(favoriteId) {
    return await apiCall(`/favorites/${favoriteId}`, 'DELETE');
}

async function getShoppingList() {
    return await apiCall('/shopping-list');
}

async function addShoppingItem(name, quantity, unit) {
    return await apiCall('/shopping-list', 'POST', { name, quantity, unit });
}

async function updateShoppingItem(itemId, checked, quantity) {
    return await apiCall(`/shopping-list/${itemId}`, 'PUT', { checked, quantity });
}

async function deleteShoppingItem(itemId) {
    return await apiCall(`/shopping-list/${itemId}`, 'DELETE');
}