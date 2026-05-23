Epicurean - Luxury Recipe Finder

Team Members
Kiara Minozra - Lead Developer
Christine Joy Ilustrisimo
Nichole Ruiz

Project Overview
Epicurean is a luxury recipe finder web application that allows users to discover gourmet recipes, save favorites, and create shopping lists. The app integrates with the Spoonacular API to provide access to thousands of recipes.

Features
Search Recipes- By ingredients, diet, cuisine, and cooking time
Favorites - Save and manage favorite recipes
Shopping List - Create and organize shopping lists
Recipe Details- View ingredients and instructions
Luxury UI- Modern gold and black theme

Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| API | Spoonacular REST API |
| Authentication | API Key |

API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?ingredient={query}` | Search recipes |
| GET | `/api/recipe/{id}` | Get recipe details |
| GET | `/api/favorites` | Get all favorites |
| POST | `/api/favorites` | Add to favorites |
| PUT | `/api/favorites/{id}` | Update favorite notes |
| DELETE | `/api/favorites/{id}` | Remove from favorites |
| GET | `/api/shopping-list` | Get shopping list |
| POST | `/api/shopping-list` | Add item |
| PUT | `/api/shopping-list/{id}` | Update item |
| DELETE | `/api/shopping-list/{id}` | Delete item |

HTTP Status Codes
| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

Setup Instructions

Prerequisites
- Node.js (v18 or higher)
- Spoonacular API key (free at spoonacular.com)

Installation

1. Clone the repository:
```bash
git clone https://github.com/kiaraminozra/recipe-luxury-app.git
cd recipe-luxury-app
