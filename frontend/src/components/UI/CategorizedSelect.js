import React from 'react';

const CategorizedSelect = ({ 
  value, 
  onChange, 
  categorizedIngredients, 
  categories, 
  placeholder = "Sélectionner un ingrédient",
  showCustomOption = true,
  className = "input",
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    >
      <option value="">{placeholder}</option>
      
      {categories.map(category => (
        <optgroup key={category} label={`=== ${category.toUpperCase()} ===`}>
          {categorizedIngredients[category]?.map(ingredient => (
            <option key={ingredient.id} value={ingredient.id}>
              {ingredient.name} ({ingredient.unit})
              {ingredient.isCustom ? ' ⭐' : ''}
            </option>
          ))}
        </optgroup>
      ))}
      
      {showCustomOption && (
        <optgroup label="=== ACTIONS ===">
          <option value="custom">➕ Autre - Créer un nouvel ingrédient</option>
        </optgroup>
      )}
    </select>
  );
};

export default CategorizedSelect;