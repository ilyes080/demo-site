const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Modèles de base
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'staff'),
    defaultValue: 'staff'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('chain', 'gastronomy', 'standard'),
    allowNull: false
  },
  address: DataTypes.TEXT,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

// Modèle pour les chaînes
const ChainGroup = sequelize.define('ChainGroup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
});

// Ingrédients
const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  allergens: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Fournisseurs
const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contact: DataTypes.JSONB,
  specialty: DataTypes.STRING,
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  }
});

// Inventaire
const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  costPerUnit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  expiryDate: DataTypes.DATE,
  batchNumber: DataTypes.STRING
});

// Recettes
const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  portions: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  preparationTime: DataTypes.INTEGER,
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  instructions: DataTypes.TEXT,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Ingrédients de recette
const RecipeIngredient = sequelize.define('RecipeIngredient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  notes: DataTypes.STRING
});

// Relations
User.belongsToMany(Restaurant, { through: 'UserRestaurant' });
Restaurant.belongsToMany(User, { through: 'UserRestaurant' });

Restaurant.belongsTo(ChainGroup, { foreignKey: 'chainGroupId' });
ChainGroup.hasMany(Restaurant, { foreignKey: 'chainGroupId' });

Inventory.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Inventory.belongsTo(Ingredient, { foreignKey: 'ingredientId' });
Inventory.belongsTo(Supplier, { foreignKey: 'supplierId' });

Recipe.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Recipe.belongsToMany(Ingredient, { through: RecipeIngredient });
Ingredient.belongsToMany(Recipe, { through: RecipeIngredient });

module.exports = {
  sequelize,
  User,
  Restaurant,
  ChainGroup,
  Ingredient,
  Supplier,
  Inventory,
  Recipe,
  RecipeIngredient
};