/**
 * This script defines the add, view, and delete operations for Ingredient objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

/* 
 * TODO: Get references to various DOM elements
 * - addIngredientNameInput
 * - deleteIngredientNameInput
 * - ingredientListContainer
 * - searchInput (optional for future use)
 * - adminLink (if visible conditionally)
 */
const addIngredientNameInput = document.getElementById("add-ingredient-name-input");
const deleteIngredientNameInput = document.getElementById("delete-ingredient-name-input");
const ingredientListContainer = document.getElementById("ingredient-list");
const searchInput = document.getElementById("search-input");
const adminLink = document.getElementById("admin-link");
const addButton = document.getElementById("add-ingredient-submit-button");
const deleteButton = document.getElementById("delete-ingredient-submit-button");
const isAdmin = sessionStorage.getItem("is-admin");


/* 
 * TODO: Attach 'onclick' events to:
 * - "add-ingredient-submit-button" → addIngredient()
 * - "delete-ingredient-submit-button" → deleteIngredient()
 */

if (addButton) addButton.onclick = addIngredient;

if (deleteButton) deleteButton.onclick = deleteIngredient;



/*
 * TODO: Create an array to keep track of ingredients
 */
let ingredients = [];


/* 
 * TODO: On page load, call getIngredients()
 */
getIngredients();  


/**
 * TODO: Add Ingredient Function
 * 
 * Requirements:
 * - Read and trim value from addIngredientNameInput
 * - Validate input is not empty
 * - Send POST request to /ingredients
 * - Include Authorization token from sessionStorage
 * - On success: clear input, call getIngredients() and refreshIngredientList()
 * - On failure: alert the user
 */
async function addIngredient() {
    const name = addIngredientNameInput.value.trim();
    if (!name) {
        alert("Please enter an ingredient name.");
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/ingredients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem("auth-token")}`
            },
            body: JSON.stringify({ name }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to add ingredient');
        }

        addIngredientNameInput.value = ''; 
        await getIngredients(); 
    } catch (error) {
        console.error('Error adding ingredient:', error);
        alert(`Error: ${error.message}`);
    }
}


/**
 * TODO: Get Ingredients Function
 * 
 * Requirements:
 * - Fetch all ingredients from backend
 * - Store result in `ingredients` array
 * - Call refreshIngredientList() to display them
 * - On error: alert the user
 */
async function getIngredients() {
    try {
        const headers = {};
        const token = sessionStorage.getItem("auth-token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }



        const res = await fetch(`${BASE_URL}/ingredients`, {headers});

        if (!res.ok) throw new Error("Failed to fetch ingredients");

        ingredients = await res.json();
        refreshIngredientList();
    } catch (error) {
        console.error(error);
        alert("Error fetching ingredients");
    }
}


/**
 * TODO: Delete Ingredient Function
 * 
 * Requirements:
 * - Read and trim value from deleteIngredientNameInput
 * - Search ingredientListContainer's <li> elements for matching name
 * - Determine ID based on index (or other backend logic)
 * - Send DELETE request to /ingredients/{id}
 * - On success: call getIngredients() and refreshIngredientList(), clear input
 * - On failure or not found: alert the user
 */
async function deleteIngredient() {
    const name = deleteIngredientNameInput.value.trim();
    if (!name) {
        alert("Please enter an ingredient name to delete.");
        return;
    }

    await getIngredients(); 

    const ingredient = ingredients.find(i => i.name === name);
    
    if (!ingredient) {
        alert("Ingredient not found");
        return;
    }


    try {
        const res = await fetch(`${BASE_URL}/ingredients/${ingredient.id}`, {
            method: "DELETE",
            headers: sessionStorage.getItem("auth-token") ? { Authorization: `Bearer ${sessionStorage.getItem("auth-token")}` } : {}
        });

        if (!res.ok) throw new Error("Failed to delete ingredient");

        deleteIngredientNameInput.value = "";
        await getIngredients();

    } catch (error) {
        console.error("Error deleting ingredient:", error);
        alert("Error deleting ingredient.");
    }
}


/**
 * TODO: Refresh Ingredient List Function
 * 
 * Requirements:
 * - Clear ingredientListContainer
 * - Loop through `ingredients` array
 * - For each ingredient:
 *   - Create <li> and inner <p> with ingredient name
 *   - Append to container
 */
function refreshIngredientList() {
    ingredientListContainer.innerHTML = ''; 
    ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        const p = document.createElement('p'); 
        p.textContent = ingredient.name;
        li.appendChild(p);
        ingredientListContainer.appendChild(li);
    });
}
