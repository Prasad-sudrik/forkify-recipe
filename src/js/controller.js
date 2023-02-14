import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { async } from 'regenerator-runtime';

// if(module.hot){
//   module.hot.accept();
// }



const controlRecipes = async function(){
  try{
    // resultsView.renderError();
    const id = window.location.hash.slice(1);
    // console.log(id);
    
    if(!id) return;
    recipeView.renderSpinner();
    

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //  1)Updating  bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 2) loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
    
  
  }catch(err){
    recipeView.renderError();
    console.error(err);
  }
}


const controlSearchResults = async function(){
  try{
    // resultsView.renderSpinner
    resultsView.renderSpinner();
    //Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // Load search results
    await model.loadSearchResults(query);

    //Render results 
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);


  }
  catch(err){
    console.error(err);
  }
}



const controlPagination = function(goToPage){
  // Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //Render NEW pagination buttons
  paginationView.render(model.state.search);
}
const controlServings = function(newServings){
  //Update the recipe servings (in state)
  model.updateServings(newServings);


  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
  //Update the recipe view
}

const controlAddBookmark = function(){
  // Add or Remove Bookmarks
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  
  // Update reciepe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}
const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  // console.log(newRecipe);
  try{
    addRecipeView.renderSpinner();


  await  model.uploadRecipe(newRecipe);
  console.log(model.state.recipe);

  //Render recipe
  recipeView.render(model.state.recipe);

  addRecipeView.renderMessage();

  bookmarksView.render(model.state.bookmarks);

  window.history.pushState(null,'',`#${model.state.recipe.id}`);
  // window.history.back()
  
  //Close form window
  setTimeout(function(){
    addRecipeView.toggleWindow()
  },MODAL_CLOSE_SEC*1000);

  }catch(err){
    console.error('error 💀',err);
    addRecipeView.renderError(err.message);
  }

  //upload new recipe
}

///////////////////////////////////////
// controlRecipes();
const init = function () { 
  bookmarksView.addHandlerRender(controlBookmarks) ;
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();

