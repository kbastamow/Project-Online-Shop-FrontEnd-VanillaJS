const API_URL = "http://localhost:3000/";

//NavBar
const productBtn = document.getElementById("product-btn")
const accessories = document.getElementById("accessories")
const music = document.getElementById("music")
const dropdownCats = document.querySelectorAll(".dropdown-item")
const searchForm = document.getElementById("search")
const searchText = document.getElementById("search-text") 


//Offcanvas
const formDisplay = document.getElementById("form-display")
const userInfo = document.getElementById("user-info")
const cartDiv = document.getElementById("cart-div")
const logoutBtn = document.getElementById("logout-btn");


//Login
const loginBtn = document.getElementById("login-btn")
const loginForm = document.getElementById("login-form")
const email = document.getElementById("email")
const password = document.getElementById("password")
const loginAlert = document.getElementById("login-alert")
let loginInputs = document.querySelectorAll("#login-form input")
for (let i = 0; i < loginInputs.length; i++) {
  loginInputs[i].addEventListener('input', function() {
    enableSubmit(loginInputs, loginBtn)
});
}

//Sign-up form
const suForm = document.getElementById("signup-form");
const formBtn = document.getElementById("reveal-form-btn");
const pwOne = document.getElementById("password-one");
const pwTwo = document.getElementById("password-two")
const suAlert = document.getElementById("signup-alert")
const suBtn = document.getElementById("signup-btn")
let suInputs = document.querySelectorAll('#signup-form input');
for (let i = 0; i < suInputs.length; i++) {
    suInputs[i].addEventListener('input', function() {
      enableSubmit(suInputs, suBtn)
  });
  }

//Main
const productsDiv = document.getElementById("products")

//User-related variables:

let user = {};
let token = localStorage.getItem("shop_token") || "";
let cart = []; 

let productInfo = []; //save information of cart's products in array
let total = 0;



//AXIOS get products

async function getProducts(e) {
  try {
    e.preventDefault();
    const res = await axios.get(API_URL + "products/getAllwithAssociations");
    const products = res.data;
    displayProducts(products)
  } catch (err) {
    console.error(err);
  }
}

async function getByCategory(e, cat) {
  e.preventDefault()
  try {
    const res = await axios.get(API_URL + "categories/getAllJoinProducts");
    const category = (res.data).find(obj => obj.name === cat);
    if (category && category.Products.length > 0) {
      let products = category.Products;
      console.log(products);
      return displayProducts(products)
    } else {
      const notFound = document.createElement("div");
      notFound.setAttribute("class", "alert alert-primary w-100 p-1  text-center");
      notFound.textContent = `No products in category "${cat}"`
      productsDiv.insertBefore(notFound, productsDiv.firstChild);
      setTimeout(function () {
        productsDiv.removeChild(productsDiv.firstElementChild);
      }, 4000);

    }
  } catch (err) {
    console.error(err);
  }
}

async function search(e) {
  try {
    e.preventDefault();
    const res = await axios.get(API_URL + "products/findByName/" + searchText.value);
    const products = res.data;
    if (products.length === 0) {
      const notFound = document.createElement("div");
      notFound.setAttribute("class", "alert alert-primary w-100 p-1 text-center");
      notFound.textContent = `No products match "${searchText.value}"`
      productsDiv.insertBefore(notFound, productsDiv.firstChild);
      setTimeout(function () {
        productsDiv.removeChild(productsDiv.firstElementChild);
      }, 4000);
    } else {
    console.log(products);
    displayProducts(products)
    }
  } catch (err) {
    console.error(err);
  }
}

//Display Catalogue of products

function displayProducts(array) {
    clearDisplay(products)
    array.forEach(product => {
        const card = document.createElement("div");
        card.setAttribute("class", "card bg-dark border-3 border-white mx-auto mx-md-3 my-3 col-9 col-md-2 text-center rounded-0");
        card.innerHTML = `<h4 class="card-title w-100  bg-black text-bg-dark p-2 mb-0">${product.name}</h4>
                           <div class="image-zoom w-100 bg-white">
                               <img src="${API_URL}uploaded_imgs/${product.image}" class="img-fluid" />
                           </div>
                           <div class="card-body bg-white text-bg-light">
                               <h5>${product.price}€</h5>
                               <p class="show-details mt-2" data-bs-toggle="collapse" data-bs-target="#details${product.id}">Show Details</p>
                               <p id="details${product.id}" class="collapse text-center">${product.description}</p>
                           </div>
                           `
        productsDiv.appendChild(card);

        const rating = calculateStars(product);  //Long function - declared separately and called here
        const reviewDiv = displayReviews(product) //Another function that has been separated to avoid overly long main function
        const buyBtn = document.createElement("button");
        buyBtn.setAttribute("class", "buy-btn btn btn-dark rounded-0 border-0 py-3")
        buyBtn.setAttribute("value", product.id)
        buyBtn.innerText = "Add to cart";
        buyBtn.addEventListener("click", addToCart);

        card.appendChild(rating);
        card.appendChild(buyBtn);
        card.appendChild(reviewDiv);
    })
}

//Average rating

function calculateStars(product) {
    const reviews = product.Reviews;
    let ratingDisplay = "";
    if (reviews.length === 0) {
        ratingDisplay = `<p>No reviews yet</p>`
    } else {
        let average = reviews.reduce((acc, val) => acc + val.stars, 0) / reviews.length
        average = Math.round(average * 2) / 2 //rounds to nearest 0.5

        let fullStars = Math.floor(average);
        let halfStars = average - fullStars;
        let emptyStars = 5 - Math.ceil(average);

        for (let i = 0; i < fullStars; i++) {
            ratingDisplay += `<i class="fa-solid fa-star" style="color: #e33517;"></i>`
        }
        if (halfStars) {
            ratingDisplay += `<i class="fa-regular fa-star-half-stroke" style="color: #e33517;"></i>`
        }
        for (let i = 0; i < emptyStars; i++) {
            ratingDisplay += `<i class="fa-regular fa-star" style="color: #e33517;"></i>`
        }
        ratingDisplay += `<p class="read-more mt-2" data-bs-toggle="collapse" data-bs-target="#reviews${product.id}">Read more</p>
                      <div id="reviews${product.id}" class="collapse text-center"></div>`
    }

    const rating = document.createElement("div");
    rating.setAttribute("class", "rating-display bg-white text-bg-light")
    rating.innerHTML = `<p class="mb-0">Rating:</p>${ratingDisplay}`
    return rating;

}

//Individual reviews

function displayReviews(product) {
    const reviews = product.Reviews;
    const reviewDiv = document.createElement("div");
    reviewDiv.setAttribute("id", `reviews${product.id}`);
    reviewDiv.setAttribute("class", "collapse text-center text-bg-dark border-top border-light pt-3")
    for (review of reviews) {
        const fullStars = review.stars;
        const emptyStars = 5 - fullStars
        for (let i = 0; i < fullStars; i++) {
            reviewDiv.innerHTML += `<i class="fa-solid fa-star fa-xs" style="color: #ffffff;"></i>`
        }
        for (let i = 0; i < emptyStars; i++) {
            reviewDiv.innerHTML += `<i class="fa-regular fa-star fa-xs" style="color: #ffffff;"></i>`
        }
        reviewDiv.innerHTML += `<p class="small px-2"><em>${review.details}</em></p>`
    }
    return reviewDiv;
}



async function addToCart(e){
    e.preventDefault();
    if (Object.entries(user).length === 0) {    
        return alert("Log in to continue shopping!");   //Change to prettier style!
    }    
    const item = this.value;
    const quantity = 1;
    const itemObject = {item, quantity};

    const index = cart.findIndex(cartItem => cartItem.item === item);
    if (index === -1) {  //If not found, value is -1. Retrieve from server.
      cart.push(itemObject);
      try{
        const res = await axios.get(API_URL + "products/findById/" + item)
        productInfo.push(res.data);
      }catch(error){
        console.error(error)
      }
    } else {  //Else simply increase quantity
      cart[index].quantity += 1;
    }
    localStorage.setItem("shopping_cart", JSON.stringify(cart));
    displayCart()
  
  }

  async function login(e) {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL + "users/login", {
        email: email.value,
        password: password.value
      });
      email.value = "";
      password.value = "";  //reset fields so info doesn´t show on logout
      localStorage.setItem("shop_token", res.data.token);
      token = res.data.token;
      user = res.data.user;
      welcome();
    } catch (err) {
      console.error(err);
      loginAlert.setAttribute("class", "alert alert-danger p-2" )
      loginAlert.textContent = "Incorrect email/password"; //WHY IS THIS DISPLAYING ANYWAy?
      setTimeout(function () {
        loginAlert.textContent = "";
        loginAlert.removeAttribute("class")
      }, 4000);
    }
  }
  
  
  function welcome() {
    formDisplay.setAttribute("datahide", "hidden");
    userInfo.removeAttribute("datahide");
    document.querySelector("#user-info h4").textContent = `Welcome, ${user.name}`
    logoutBtn.addEventListener("click", logout);
    getProductInfo();   //clears cart variable and displays empty cart message
  
  }
  

async function logout(e){
  e.preventDefault();
  const token = localStorage.getItem("shop_token");
  try {
      await axios.put(API_URL + "users/logout", {}, {
      headers: {
        "Authorization": token
      }
    });
     clearDisplay(cartDiv);
     user = {};
     localStorage.removeItem("shop_token");
     userInfo.setAttribute("datahide", "hidden");
     formDisplay.removeAttribute("datahide"); 
    } catch(error){
    console.error(error);
  }
}


//Get cart's product info from server and save in productInfo
async function getProductInfo(){
   cart = JSON.parse(localStorage.getItem("shopping_cart")) || [];
   if (cart.length === 0){
    const msg = document.createElement("p")
    msg.textContent = "There are no products in your cart"
    cartDiv.appendChild(msg);
    return;
    }
   let idArray = [];
   cart.forEach(each => idArray.push(+each.item));
   try {
    const res = await axios.post(API_URL + "products/findVarious", {
      id: idArray
    })
    productInfo = res.data;
   } catch(error){
    console.error(error)
   }

    displayCart()
}


 function displayCart() {  //Doesn't call server, uses variable productInfo
  clearDisplay(cartDiv)
  const cartProducts = document.createElement("div");
  cartProducts.setAttribute("class", "table-responsive bg bg-light m-0");
  cartProducts.innerHTML = `<table class="table table-hover mb-3">
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>No</th>
                                    <th>Price(€)</th>
                                    <th><th>
                                  </tr>
                                </thead>
                                <tbody id="table-body">
                                </tbody>
                              </table>
                                `
  cartDiv.appendChild(cartProducts);
  const tableBody = document.getElementById("table-body");

  for(each of productInfo) {
      const index = cart.findIndex(cartItem => (+cartItem.item) === each.id);
      const quantity = cart[index].quantity;
      const price = each.price * quantity;
         
      const tableRow = document.createElement("tr");    //Creating a row
      tableRow.setAttribute("id",`product${each.id}`);
      tableRow.innerHTML = `<td>${each.name}</td>
                            <td><span class="click" onClick="decrease())"><i class="fa-solid fa-circle-plus" style="color: #000000;"></i></span>
                            <span class="p-2">${quantity}</span>
                            <span class="click" onClick="increase()"><i class="fa-solid fa-circle-minus" style="color: #000000;"></i></td></span>
                            <td>${price}</td>
                            <td><button class="btn btn-dark btn-sm" onClick="remove(event, ${each.id})">Remove</button></td>
                          `
      tableBody.appendChild(tableRow);
  }

    total = calculateTotal();
    tableBody.innerHTML += `<tr class="fw-bold">
                            <td></td>
                            <td>Total</td>
                            <td id="total-price">${total}</td>
                            <td><button id="checkout" class="btn btn-success btn-sm">Place order</button></td>
                            </tr>
                            `
    const emptyCartBtn = document.createElement("button");
    emptyCartBtn.setAttribute("class", "btn btn-danger my-2");
    emptyCartBtn.innerText = "Clear cart";
    emptyCartBtn.addEventListener("click", clearCart);
    cartDiv.appendChild(emptyCartBtn);
    

  }

//Remove product from cart
 
function remove(event, id){   //Passing two values
  event.preventDefault();
  const row = document.getElementById("product" + id);
  row.remove();
  productInfo = productInfo.filter(value => value.id !== id); //update current productInfo array
  cart = cart.filter(value => +value.item !== id); //Update local storage and cart
  localStorage.setItem("shopping_cart", JSON.stringify(cart)); 
  total = calculateTotal(); 
  const totalPrice = document.getElementById("total-price")
  totalPrice.textContent = total;
}


//Calculate current Total of cart items
function calculateTotal(){
  let prices = [];
  for(each of productInfo) {
    const index = cart.findIndex(cartItem => (+cartItem.item) === each.id);
    const quantity = cart[index].quantity;
    const price = each.price * quantity;
    prices.push(price);
}
  return prices.reduce((acc, val) => acc + val);
}

function clearCart(){
    localStorage.removeItem("shopping_cart");
    productInfo = [];
    clearDisplay(cartDiv);
    welcome();  //displays offacanvas message;
  }
  


//REGISTRATION

//Reveal signup form
function revealForm(e){
    e.preventDefault();
    formBtn.setAttribute("datahide", "hidden");
    suForm.removeAttribute("datahide");
}

function register(e){
    e.preventDefault();
     if (pwOne.value !== pwTwo.value) {
    suAlert.setAttribute("class", "alert alert-danger")
    suAlert.textContent = "Passwords don't match";   
}
}


//Enable login/signup submit buttons when all fields are completed
function enableSubmit(inputs, btn) {
  for (input of inputs) {
      if (input.value === "" || input.value === null) {
          return btn.disabled = true;
      }
  }
  btn.disabled = false;
}



function clearDisplay(parent){
  while (parent.firstChild){
  parent.removeChild(parent.firstChild);
  }
}


searchForm.addEventListener("submit", search)
loginForm.addEventListener("submit", login)
productBtn.addEventListener("click", getProducts);
suForm.addEventListener("submit", register);
formBtn.addEventListener("click", revealForm);
accessories.addEventListener("click", function(e){  //THIS is how I can pass two parameters"
  getByCategory(e, "Accessories")} )
music.addEventListener("click", function(e){  
  getByCategory(e, "Sheet music")} )

for (let i = 0; i < dropdownCats.length; i++) {  //For  - of doesn't work well with eventListeners!
    const button = dropdownCats[i];
    button.addEventListener("click", function(e) {
      getByCategory(e, button.value);
    });
  }



