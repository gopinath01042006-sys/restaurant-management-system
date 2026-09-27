import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const MenuItemModal = ({ isOpen, onClose, itemToEdit }) => {
  const { categories, addMenuItem, updateMenuItem } = useRestaurant();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("starters");
  const [subcategory, setSubcategory] = useState("Veg Starters");
  const [price, setPrice] = useState(350);
  const [isVeg, setIsVeg] = useState(true);
  const [prepTime, setPrepTime] = useState(15);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [taxRate, setTaxRate] = useState(5);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setSubcategory(itemToEdit.subcategory || "");
      setPrice(itemToEdit.price);
      setIsVeg(itemToEdit.isVeg);
      setPrepTime(itemToEdit.prepTime);
      setSpiceLevel(itemToEdit.spiceLevel || "Medium");
      setDescription(itemToEdit.description);
      setIngredients(itemToEdit.ingredients || "");
      setTaxRate(itemToEdit.taxRate || 5);
    } else {
      setName("");
      setCategory("starters");
      setSubcategory("Veg Starters");
      setPrice(350);
      setIsVeg(true);
      setPrepTime(15);
      setSpiceLevel("Medium");
      setDescription("");
      setIngredients("");
      setTaxRate(5);
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide the dish name.");
      return;
    }

    const itemData = {
      name: name.trim(),
      category,
      subcategory,
      price: Number(price) || 0,
      isVeg,
      prepTime: Number(prepTime) || 15,
      spiceLevel,
      description: description.trim(),
      ingredients: ingredients.trim(),
      taxRate: Number(taxRate) || 5
    };

    if (itemToEdit) {
      updateMenuItem({ ...itemToEdit, ...itemData });
    } else {
      addMenuItem(itemData);
    }

    onClose();
  };

  const selectedCategoryObj = categories.find((c) => c.id === category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? `Edit Dish: ${itemToEdit.name}` : "Add New Dish to Menu"}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {itemToEdit ? "Save Changes" : "Add Dish"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Dish Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Kashmiri Dum Aloo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dietary Classification</label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
              <button
                type="button"
                className={`btn btn-sm ${isVeg ? "btn-success" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setIsVeg(true)}
              >
                🌱 Vegetarian
              </button>
              <button
                type="button"
                className={`btn btn-sm ${!isVeg ? "btn-danger" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setIsVeg(false)}
              >
                🍗 Non-Vegetarian
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-control form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                const cat = categories.find((c) => c.id === e.target.value);
                if (cat && cat.subcategories.length > 0) {
                  setSubcategory(cat.subcategories[0]);
                }
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subcategory</label>
            <select
              className="form-control form-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              {selectedCategoryObj?.subcategories.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Price in INR (₹) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Preparation Time (Mins)</label>
            <input
              type="number"
              min="1"
              max="90"
              className="form-control"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Spice Level</label>
            <select
              className="form-control form-select"
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
            >
              <option value="Mild">Mild</option>
              <option value="Medium">Medium</option>
              <option value="Spicy">Spicy (Fiery)</option>
              <option value="Sweet">Sweet (Dessert)</option>
              <option value="Refreshing">Refreshing (Drink)</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description / Taste Notes</label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="Appetizing description for staff and customers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Key Ingredients & Allergen Advisory</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Cottage cheese, yogurt, cashews, dairy..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
