# Documentation API RestaurantPro

## Base URL
```
Production: https://api.restaurantpro.com
Development: http://localhost:3001
```

## Authentification

Toutes les routes API (sauf `/auth/login` et `/auth/register`) nécessitent un token JWT dans le header Authorization.

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### POST /api/auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "manager"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager"
  }
}
```

#### POST /api/auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager",
    "restaurant": {
      "id": "uuid",
      "name": "Restaurant Name",
      "type": "chain"
    }
  }
}
```

#### GET /api/auth/me
Obtenir les informations de l'utilisateur connecté.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "manager",
    "restaurant": {
      "id": "uuid",
      "name": "Restaurant Name",
      "type": "chain"
    }
  }
}
```

### Restaurants

#### GET /api/restaurants
Obtenir la liste des restaurants de l'utilisateur.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Restaurant Name",
    "type": "chain",
    "address": "123 Street Name",
    "phone": "01 23 45 67 89",
    "email": "contact@restaurant.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/restaurants
Créer un nouveau restaurant.

**Body:**
```json
{
  "name": "New Restaurant",
  "type": "gastronomy",
  "address": "456 New Street",
  "phone": "01 98 76 54 32",
  "email": "new@restaurant.com"
}
```

#### PUT /api/restaurants/:id
Modifier un restaurant.

#### DELETE /api/restaurants/:id
Supprimer un restaurant.

### Inventaire

#### GET /api/inventory
Obtenir l'inventaire du restaurant.

**Response:**
```json
{
  "inventory": [
    {
      "id": "uuid",
      "quantity": 50.5,
      "costPerUnit": 12.50,
      "expiryDate": "2023-12-31",
      "batchNumber": "LOT123",
      "Ingredient": {
        "id": "uuid",
        "name": "Bœuf haché",
        "category": "Viandes",
        "unit": "kg",
        "allergens": []
      },
      "Supplier": {
        "id": "uuid",
        "name": "Fournisseur ABC"
      }
    }
  ]
}
```

#### POST /api/inventory
Ajouter du stock.

**Body:**
```json
{
  "ingredientId": "uuid",
  "quantity": 25.0,
  "costPerUnit": 15.80,
  "expiryDate": "2023-12-31",
  "batchNumber": "LOT456"
}
```

#### PUT /api/inventory/:id
Modifier un élément d'inventaire.

#### GET /api/inventory/ingredients
Obtenir la liste des ingrédients disponibles.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Bœuf haché",
    "category": "Viandes",
    "unit": "kg",
    "allergens": [],
    "isActive": true
  }
]
```

### Recettes

#### GET /api/recipes
Obtenir les recettes du restaurant.

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "Burger Classic",
      "description": "Notre burger signature",
      "category": "Plats principaux",
      "portions": 1,
      "preparationTime": 15,
      "difficulty": "easy",
      "instructions": "1. Faire griller le pain...",
      "estimatedCost": 4.50,
      "Ingredients": [
        {
          "id": "uuid",
          "name": "Bœuf haché",
          "unit": "kg",
          "RecipeIngredient": {
            "quantity": 0.15,
            "notes": "Steak 150g"
          }
        }
      ]
    }
  ]
}
```

#### POST /api/recipes
Créer une nouvelle recette.

**Body:**
```json
{
  "name": "Nouvelle Recette",
  "description": "Description de la recette",
  "category": "Plats principaux",
  "portions": 4,
  "preparationTime": 30,
  "difficulty": "medium",
  "instructions": "Étapes de préparation...",
  "ingredients": [
    {
      "ingredientId": "uuid",
      "quantity": 0.5,
      "notes": "Notes spéciales"
    }
  ]
}
```

#### PUT /api/recipes/:id
Modifier une recette.

#### DELETE /api/recipes/:id
Supprimer une recette.

#### POST /api/recipes/:id/calculate-cost
Calculer le coût précis d'une recette.

**Response:**
```json
{
  "totalCost": 8.45,
  "costPerPortion": 2.11,
  "ingredients": [
    {
      "name": "Bœuf haché",
      "quantity": 0.15,
      "unit": "kg",
      "costPerUnit": 12.50,
      "totalCost": 1.88
    }
  ]
}
```

### Chaînes (Chain Management)

#### GET /api/chains/dashboard
Obtenir les données du dashboard chaîne.

**Response:**
```json
{
  "sites": [
    {
      "id": "uuid",
      "name": "Site Paris Centre",
      "location": "Paris, France",
      "manager": "Marie Dupont",
      "dailyRevenue": 2500,
      "score": 85,
      "status": "active"
    }
  ],
  "performance": {
    "totalRevenue": 125000,
    "avgScore": 82,
    "compliance": 95
  }
}
```

#### GET /api/chains/:chainId/sites
Obtenir les sites d'une chaîne.

#### POST /api/chains/:chainId/sites
Ajouter un nouveau site.

#### GET /api/chains/:chainId/standards
Obtenir les standards de la chaîne.

#### POST /api/chains/:chainId/audits
Programmer un audit.

### Gastronomie

#### GET /api/gastronomy/dashboard
Obtenir les données du dashboard gastronomique.

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "name": "Saumon aux champignons",
      "costPerPortion": 12.50,
      "totalCost": 12.50,
      "suggestedPrice": 28.00,
      "margin": 55,
      "portions": 1,
      "ingredients": [
        {
          "name": "Saumon frais",
          "quantity": 0.18,
          "unit": "kg",
          "cost": 5.13,
          "costPerUnit": 28.50
        }
      ]
    }
  ],
  "seasonalIngredients": [
    {
      "name": "Champignons de saison",
      "price": 8.50,
      "discount": 15
    }
  ],
  "currentSeason": "Hiver"
}
```

#### POST /api/gastronomy/recipes/:id/precise-costing
Calculer le coût précis au gramme près.

#### GET /api/gastronomy/seasonal-ingredients
Obtenir les ingrédients de saison.

#### GET /api/gastronomy/traceability/:batchId
Obtenir la traçabilité d'un lot.

#### POST /api/gastronomy/profitability/analyze
Analyser la rentabilité des plats.

### Dashboard

#### GET /api/dashboard
Obtenir les données du dashboard principal.

**Response:**
```json
{
  "stats": {
    "revenue": 15000,
    "revenueTrend": 5.2,
    "sites": 12,
    "covers": 150,
    "criticalStock": 3,
    "avgMargin": 65,
    "performance": 88
  },
  "recentActivities": [
    {
      "message": "Stock de bœuf haché mis à jour",
      "time": "Il y a 2 heures"
    }
  ],
  "chainData": {
    "totalSites": 12,
    "bestPerformer": "Paris Centre",
    "avgScore": 85
  },
  "gastronomyData": {
    "mostProfitable": "Saumon aux champignons",
    "avgFoodCost": 32,
    "seasonalIngredients": 8
  }
}
```

## Codes d'erreur

### HTTP Status Codes
- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `422` - Erreur de validation
- `500` - Erreur serveur

### Format des erreurs
```json
{
  "error": "Message d'erreur",
  "message": "Description détaillée",
  "code": "ERROR_CODE",
  "details": {
    "field": "Erreur spécifique au champ"
  }
}
```

## Rate Limiting

- **Limite**: 100 requêtes par 15 minutes par IP
- **Headers de réponse**:
  - `X-RateLimit-Limit`: Limite totale
  - `X-RateLimit-Remaining`: Requêtes restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## Pagination

Pour les endpoints retournant des listes, utilisez les paramètres de query:

```
GET /api/recipes?page=1&limit=20&sort=name&order=asc
```

**Paramètres:**
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20, max: 100)
- `sort`: Champ de tri
- `order`: Ordre de tri (`asc` ou `desc`)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Webhooks (Futur)

Les webhooks permettront de recevoir des notifications en temps réel:

- `inventory.low_stock` - Stock critique
- `recipe.cost_changed` - Coût de recette modifié
- `audit.completed` - Audit terminé

## SDK et Intégrations

### JavaScript SDK
```javascript
import RestaurantPro from '@restaurantpro/sdk';

const client = new RestaurantPro({
  apiKey: 'your-api-key',
  baseURL: 'https://api.restaurantpro.com'
});

// Obtenir l'inventaire
const inventory = await client.inventory.list();

// Créer une recette
const recipe = await client.recipes.create({
  name: 'Nouvelle recette',
  ingredients: [...]
});
```

### Intégrations tierces
- **POS**: Square, Toast, Lightspeed
- **Comptabilité**: QuickBooks, Sage, Cegid
- **Fournisseurs**: API Metro, Sysco
- **Livraison**: Uber Eats, Deliveroo