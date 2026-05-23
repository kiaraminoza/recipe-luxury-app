markdown
API Documentation - Epicurean Recipe Finder

Base URL
http://localhost:3001/api

Authentication
All API requests require an API key in the header:
X-API-Key: luxury-recipe-key-2024


Endpoints

1. Search Recipes
GET `/api/search`

Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| ingredient | string | Search query (e.g., chicken, salmon) |
| diet | string | vegetarian, vegan, gluten free |
| cuisine | string | italian, asian, mexican |
| maxReadyTime | integer | Max cooking time in minutes |

Example Request:
GET /api/search?ingredient=salmon&diet=vegetarian
Example Response:
```json
{
  "success": true,
  "count": 10,
  "recipes": [
    {
      "id": 123,
      "title": "Grilled Salmon",
      "image": "https://...",
      "readyInMinutes": 25,
      "servings": 4
    }
  ]
}
GET /api/recipe/{id}

Response:

json
{
  "success": true,
  "recipe": {
    "id": 123,
    "title": "Grilled Salmon",
    "extendedIngredients": [...],
    "instructions": "..."
  }
}

Get Favorites
GET /api/favorites

Add to Favorites
POST /api/favorites

Body:

json
{
  "recipeId": 123,
  "title": "Grilled Salmon",
  "image": "https://..."
}

Remove from Favorites
DELETE /api/favorites/{id}

Get Shopping List
GET /api/shopping-list


Add Shopping Item
POST /api/shopping-list

Body:

json
{
  "name": "Olive Oil",
  "quantity": 2,
  "unit": "tbsp"
}

Update Shopping Item
PUT /api/shopping-list/{id}

Body:

json
{
  "checked": true,
  "quantity": 3
}

Delete Shopping Item
DELETE /api/shopping-list/{id}

Error Responses
401 Unauthorized
json
{
  "error": "Unauthorized. Invalid API key."
}
404 Not Found
json
{
  "error": "Favorite not found"
}
500 Server Error
json
{
  "error": "Failed to fetch recipes"
}
 
