// Favorites Management
let currentFavorites = [];

// Load favorites from backend
async function loadFavorites() {
    try {
        const data = await getFavorites();
        currentFavorites = data.favorites || [];
        renderFavorites();
        return currentFavorites;
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
}

// Render favorites in the grid
function renderFavorites() {
    const container = document.getElementById('favoritesGrid');
    
    if (!container) return;
    
    if (currentFavorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px;">
                <i class="fas fa-heart" style="font-size: 4rem; color: #d4af37; opacity: 0.5;"></i>
                <p style="margin-top: 20px;">No favorites yet</p>
                <small>Click the ❤️ on any recipe to save it here</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentFavorites.map(fav => `
        <div class="recipe-card" onclick="viewRecipe(${fav.recipeId})">
            <div class="recipe-image">
                <img src="${fav.image}" alt="${fav.title}" onerror="this.src='https://via.placeholder.com/300x200'">
                <button class="favorite-btn active" onclick="event.stopPropagation(); removeFavoriteItem(${fav.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="recipe-info">
                <h3 class="recipe-title">${escapeHtml(fav.title)}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-bookmark"></i> Saved ${new Date(fav.addedAt).toLocaleDateString()}</span>
                </div>
                ${fav.notes ? `<p style="color: #d4af37; font-size: 0.85rem; margin-top: 10px;">📝 ${fav.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Remove from favorites
async function removeFavoriteItem(favoriteId) {
    try {
        await removeFromFavorite(favoriteId);
        showToast('Removed from favorites', 'info');
        await loadFavorites(); // Reload the list
        updateFavoriteButtons(); // Update heart icons on search page
    } catch (error) {
        showToast('Failed to remove', 'error');
    }
}

// Toggle favorite (add/remove)
async function toggleFavorite(recipeId, title, image) {
    try {
        // Check if already in favorites
        const exists = currentFavorites.find(f => f.recipeId === parseInt(recipeId));
        
        if (exists) {
            await removeFromFavorite(exists.id);
            currentFavorites = currentFavorites.filter(f => f.id !== exists.id);
            showToast('Removed from favorites', 'info');
        } else {
            const result = await addToFavorite(recipeId, title, image);
            currentFavorites.push(result.favorite);
            showToast('Added to favorites! ✨', 'success');
        }
        
        renderFavorites();
        updateFavoriteButtons();
        
    } catch (error) {
        if (error.message.includes('already in favorites')) {
            showToast('Recipe already in favorites', 'info');
        } else {
            showToast('Failed to update favorites', 'error');
        }
    }
}

// Update heart icons on search results
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const recipeId = btn.dataset.recipeId;
        if (recipeId && currentFavorites.some(f => f.recipeId === parseInt(recipeId))) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else if (recipeId) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

// Make functions global
window.toggleFavorite = toggleFavorite;
window.removeFavoriteItem = removeFavoriteItem;
window.loadFavorites = loadFavorites;