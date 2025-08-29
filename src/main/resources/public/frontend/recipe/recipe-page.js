/**
 * This script defines the CRUD operations for Recipe objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

let recipes = [];

// Wait for DOM to fully load before accessing elements
window.addEventListener("DOMContentLoaded", () => {

    /* 
     * TODO: Get references to various DOM elements
     * - Recipe name and instructions fields (add, update, delete)
     * - Recipe list container
     * - Admin link and logout button
     * - Search input
    */
    const adminLink = document.getElementById("admin-link");
    const logoutButton = document.getElementById("logout-button");

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    const recipeList = document.getElementById("recipe-list");

    const addNameInput = document.getElementById("add-recipe-name-input"); 
    const addInstructionsInput = document.getElementById("add-recipe-instructions-input");
    const addButton = document.getElementById("add-recipe-submit-input");

    const updateNameInput = document.getElementById("update-recipe-name-input");
    const updateInstructionsInput = document.getElementById("update-recipe-instructions-input");
    const updateButton = document.getElementById("update-recipe-submit-input");

    const deleteNameInput = document.getElementById("delete-recipe-name-input");
    const deleteButton = document.getElementById("delete-recipe-submit-input");

    const token = sessionStorage.getItem("auth-token");
    const isAdmin = sessionStorage.getItem("is-admin");

    /*
     * TODO: Show logout button if auth-token exists in sessionStorage
     */
    if(token && logoutButton) {
        logoutButton.style.display = "inline-block";
    }
    
    /*
     * TODO: Show admin link if is-admin flag in sessionStorage is "true"
     */
    if (isAdmin === "true" && adminLink) {
        adminLink.style.display = "inline-block";
    }
    /*
     * TODO: Attach event handlers
     * - Add recipe button → addRecipe()
     * - Update recipe button → updateRecipe()
     * - Delete recipe button → deleteRecipe()
     * - Search button → searchRecipes()
     * - Logout button → processLogout()
     */

    if (addButton) addButton.onclick = addRecipe;    
    if (updateButton) updateButton.onclick = updateRecipe; 
    if (deleteButton) deleteButton.onclick = deleteRecipe; 
    if (searchButton) searchButton.onclick = searchRecipes;
    if (logoutButton) logoutButton.onclick = processLogout; 


    /*
     * TODO: On page load, call getRecipes() to populate the list
     */
    getRecipes(); 


    /**
     * TODO: Search Recipes Function
     * - Read search term from input field
     * - Send GET request with name query param
     * - Update the recipe list using refreshRecipeList()
     * - Handle fetch errors and alert user
     */
    async function searchRecipes() {
        const term = searchInput.value.trim().toLowerCase();
        try {
            await getRecipes();
            recipes = recipes.filter(r => r.name.toLowerCase().includes(term));
            refreshRecipeList(); 
            /* const res = await fetch(`${BASE_URL}/recipes?name=${encodeURIComponent(term)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to search recipes");
            recipes = await res.json();
            refreshRecipeList();*/
        } catch (error) {
            console.error(error);
            alert("Error searching recipes");
        }
    }

    /**
     * TODO: Add Recipe Function
     * - Get values from add form inputs
     * - Validate both name and instructions
     * - Send POST request to /recipes
     * - Use Bearer token from sessionStorage
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function addRecipe() {
        const name = addNameInput.value.trim();
        const instructions = addInstructionsInput.value.trim();

        if (!name || !instructions) {
            alert("Please enter both name and instructions");
            return;
        }

        if (!token) {
            alert("You must be logged in to add a recipe");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/recipes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, instructions })
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend error:", res.status, errorText);
                alert("Failed to add recipe");
                return; 
            }

            addNameInput.value = "";
            addInstructionsInput.value = "";

            await getRecipes();
        } catch (err) {
            console.error(err);
            alert("Error adding recipe");
        }

    }

    /**
     * TODO: Update Recipe Function
     * - Get values from update form inputs
     * - Validate both name and updated instructions
     * - Fetch current recipes to locate the recipe by name
     * - Send PUT request to update it by ID
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function updateRecipe() {
        const name = updateNameInput.value.trim();
        const instructions = updateInstructionsInput.value.trim();
        if (!name || !instructions) {
            alert("Please enter both name and updated instructions");
            return;
        }

        
        await getRecipes(); 
        const recipe = recipes.find(r => r.name === name);
        if (!recipe) {
            alert("Recipe not found");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` })
                },
                body: JSON.stringify({ name, instructions })
            });
            if (!res.ok) throw new Error("Failed to update recipe");

            updateNameInput.value = "";
            updateInstructionsInput.value = "";
            await getRecipes();
        } catch (error) {
            console.error(error);
            alert("Error updating recipe");
        }
    }

    /**
     * TODO: Delete Recipe Function
     * - Get recipe name from delete input
     * - Find matching recipe in list to get its ID
     * - Send DELETE request using recipe ID
     * - On success: refresh the list
     */
    async function deleteRecipe() {
        const name = deleteNameInput.value.trim();
        if (!name) {
            alert("Please enter a recipe name");
            return;
        }



        await getRecipes(); 
        const recipe = recipes.find(r => r.name === name);
        if (!recipe) {
            alert("Recipe not found");
            return;
        }



        try {
            const res = await fetch(`${BASE_URL}/recipes/${recipe.id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error("Failed to delete recipe");

            deleteNameInput.value = "";
            await getRecipes();
        } catch (error) {
            console.error(error);
            alert("Error deleting recipe");
        }
    }

    /**
     * TODO: Get Recipes Function
     * - Fetch all recipes from backend
     * - Store in recipes array
     * - Call refreshRecipeList() to display
     */
    async function getRecipes() {
        try {
            const headers = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${BASE_URL}/recipes`, { headers });
            if (!res.ok) throw new Error("Failed to fetch recipes");
            recipes = await res.json();
            refreshRecipeList();
        } catch (error) {
            console.error(error);
            alert("Error fetching recipes");
        }
    }

    /**
     * TODO: Refresh Recipe List Function
     * - Clear current list in DOM
     * - Create <li> elements for each recipe with name + instructions
     * - Append to list container
     */
    function refreshRecipeList() {
        recipeList.innerHTML = "";
        recipes.forEach(r => {
            const li = document.createElement("li");
            li.textContent = `${r.name}: ${r.instructions}`;
            recipeList.appendChild(li);
        });
    }

    /**
     * TODO: Logout Function
     * - Send POST request to /logout
     * - Use Bearer token from sessionStorage
     * - On success: clear sessionStorage and redirect to login
     * - On failure: alert the user
     */
    async function processLogout() {
         try {
            const res = await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to logout");

            sessionStorage.clear();
            window.location.href = "../login/login-page.html";
        } catch (err) {
            console.error(err);
            alert("Error logging out");
        }
    }

});

