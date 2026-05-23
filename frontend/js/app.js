// ============ TAB NAVIGATION ============
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Update active button style
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const buttons = document.querySelectorAll('.nav-btn');
    if (tabName === 'search') buttons[0].classList.add('active');
    if (tabName === 'favorites') buttons[1].classList.add('active');
    if (tabName === 'shopping') buttons[2].classList.add('active');
    
    // Load data when tab is opened
    if (tabName === 'favorites') {
        loadFavorites();
    } else if (tabName === 'shopping') {
        loadShoppingList();
    }
}

// Make it global
window.showTab = showTab;

// Main Application Logic
let currentRecipes = [];

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const dietSelect = document.getElementById('dietSelect');
const cuisineSelect = document.getElementById('cuisineSelect');
const timeSelect = document.getElementById('timeSelect');
const recipesGrid = document.getElementById('recipesGrid');
const loadingOverlay = document.getElementById('loadingOverlay');

// Show/Hide Loading
function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.add('active');
}

function hideLoading() {
    setTimeout(() => {
        if (loadingOverlay) loadingOverlay.classList.remove('active');
    }, 500);
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1a1a1a;
        border: 1px solid #d4af37;
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" style="color:#d4af37"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Search Functionality
async function performSearch() {
    const ingredient = searchInput ? searchInput.value.trim() : 'chicken';
    const diet = dietSelect ? dietSelect.value : '';
    const cuisine = cuisineSelect ? cuisineSelect.value : '';
    const maxTime = timeSelect ? timeSelect.value : 60;
    
    showLoading();
    
    try {
        const data = await searchRecipes(ingredient, diet, cuisine, maxTime);
        currentRecipes = data.recipes || [];
        renderRecipes(currentRecipes);
        
        const resultCount = document.getElementById('resultCount');
        if (resultCount) {
            resultCount.textContent = `${currentRecipes.length} recipes found`;
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast('Failed to fetch recipes. Please try again.', 'error');
        if (recipesGrid) {
            recipesGrid.innerHTML = `<div class="empty-state"><p>Unable to fetch recipes. Check your API key!</p></div>`;
        }
    } finally {
        hideLoading();
    }
}

// Render Recipes
function renderRecipes(recipes) {
    if (!recipesGrid) return;
    
    if (!recipes || recipes.length === 0) {
        recipesGrid.innerHTML = `<div class="empty-state"><p>No recipes found. Try a different ingredient!</p></div>`;
        return;
    }
    
    recipesGrid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" onclick="viewRecipe(${recipe.id})">
            <div class="recipe-image">
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='https://via.placeholder.com/300x200'">
                <button class="favorite-btn" data-recipe-id="${recipe.id}" onclick="event.stopPropagation(); toggleFavorite(${recipe.id}, '${escapeHtml(recipe.title)}', '${recipe.image}')">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} min</span>
                    <span><i class="fas fa-users"></i> ${recipe.servings || 'N/A'} servings</span>
                </div>
            </div>
        </div>
    `).join('');
    
    setTimeout(updateFavoriteButtons, 100);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// View Recipe Details
async function viewRecipe(recipeId) {
    showLoading();
    try {
        const data = await getRecipeDetails(recipeId);
        const recipe = data.recipe;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2 style="color: #d4af37; margin-bottom: 20px;">${escapeHtml(recipe.title)}</h2>
            <img src="${recipe.image}" style="width: 100%; border-radius: 15px; margin-bottom: 20px;">
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} min</span>
                <span><i class="fas fa-users"></i> ${recipe.servings || 'N/A'} servings</span>
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="color: #d4af37;">Ingredients</h3>
                <ul>${recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('') : '<li>Ingredients not available</li>'}</ul>
            </div>
        `;
        
        document.getElementById('recipeModal').style.display = 'block';
    } catch (error) {
        showToast('Could not load recipe details', 'error');
    } finally {
        hideLoading();
    }
}

// FAVORITES FUNCTIONS
async function loadFavorites() {
    const container = document.getElementById('favoritesGrid');
    if (!container) return;
    
    try {
        const data = await getFavorites();
        const favorites = data.favorites || [];
        
        if (favorites.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No favorites yet. Click the ❤️ on any recipe!</p></div>`;
            return;
        }
        
        container.innerHTML = favorites.map(fav => `
            <div class="recipe-card" onclick="viewRecipe(${fav.recipeId})">
                <div class="recipe-image">
                    <img src="${fav.image}" alt="${fav.title}">
                    <button class="favorite-btn active" onclick="event.stopPropagation(); removeFavoriteItem(${fav.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="recipe-info">
                    <h3>${escapeHtml(fav.title)}</h3>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Failed to load favorites</p>';
    }
}

async function toggleFavorite(recipeId, title, image) {
    try {
        const favData = await getFavorites();
        const exists = favData.favorites.find(f => f.recipeId === parseInt(recipeId));
        
        if (exists) {
            await removeFromFavorite(exists.id);
            showToast('Removed from favorites', 'info');
        } else {
            await addToFavorite(recipeId, title, image);
            showToast('Added to favorites! ✨', 'success');
        }
        
        updateFavoriteButtons();
    } catch (error) {
        showToast('Failed to update favorites', 'error');
    }
}

async function removeFavoriteItem(favoriteId) {
    try {
        await removeFromFavorite(favoriteId);
        showToast('Removed from favorites', 'info');
        await loadFavorites();
        updateFavoriteButtons();
    } catch (error) {
        showToast('Failed to remove', 'error');
    }
}

async function updateFavoriteButtons() {
    try {
        const data = await getFavorites();
        const favorites = data.favorites || [];
        
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const recipeId = btn.dataset.recipeId;
            if (recipeId && favorites.some(f => f.recipeId === parseInt(recipeId))) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            } else if (recipeId) {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
        });
    } catch (error) {
        console.error('Error updating favorite buttons:', error);
    }
}

// SHOPPING LIST FUNCTIONS
async function loadShoppingList() {
    const container = document.getElementById('shoppingList');
    if (!container) return;
    
    try {
        const data = await getShoppingList();
        const items = data.items || [];
        
        if (items.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Your shopping list is empty. Add items above!</p></div>`;
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="shopping-item ${item.checked ? 'checked' : ''}">
                <div class="shopping-item-left">
                    <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleShoppingItem(${item.id}, this.checked)">
                    <span>${escapeHtml(item.name)}</span>
                    <small style="color:#d4af37;">${item.quantity} ${item.unit}</small>
                </div>
                <button class="delete-item" onclick="deleteShoppingItem(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p>Failed to load shopping list</p>';
    }
}

async function addNewItem() {
    const name = document.getElementById('itemName')?.value.trim();
    const quantity = document.getElementById('itemQuantity')?.value;
    const unit = document.getElementById('itemUnit')?.value;
    
    if (!name) {
        showToast('Please enter an item name', 'error');
        return;
    }
    
    try {
        await addShoppingItem(name, parseInt(quantity) || 1, unit);
        await loadShoppingList();
        document.getElementById('itemName').value = '';
        showToast('Item added! ✨', 'success');
    } catch (error) {
        showToast('Failed to add item', 'error');
    }
}

async function toggleShoppingItem(itemId, checked) {
    try {
        await updateShoppingItem(itemId, checked, null);
        await loadShoppingList();
    } catch (error) {
        showToast('Failed to update', 'error');
    }
}

async function deleteShoppingItem(itemId) {
    try {
        await deleteShoppingItem(itemId);
        await loadShoppingList();
        showToast('Item removed', 'info');
    } catch (error) {
        showToast('Failed to delete', 'error');
    }
}

// MODAL SETUP
function setupModal() {
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    setupModal();
    
    const addBtn = document.getElementById('addItemBtn');
    if (addBtn) addBtn.addEventListener('click', addNewItem);
    
    // Make functions global
    window.toggleFavorite = toggleFavorite;
    window.viewRecipe = viewRecipe;
    window.removeFavoriteItem = removeFavoriteItem;
    window.toggleShoppingItem = toggleShoppingItem;
    window.deleteShoppingItem = deleteShoppingItem;
    window.addNewItem = addNewItem;
    window.loadFavorites = loadFavorites;
    window.loadShoppingList = loadShoppingList;
    
    performSearch();
});