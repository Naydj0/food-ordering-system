$(function () {
    // Main Menu JS
    $(window).scroll(function () {
        if ($(this).scrollTop() < 50) {
            $("nav").removeClass("site-top-nav");
            $("#back-to-top").fadeOut();
        } else {
            $("nav").addClass("site-top-nav");
            $("#back-to-top").fadeIn();
        }
    });
    

    // Shopping Cart Toggle JS
    $("#shopping-cart").on("click", function () {
        $("#cart-content").toggle("blind", "", 500);
    });

    // Back-To-Top Button JS
    $("#back-to-top").click(function (event) {
        event.preventDefault();
        $("html, body").animate(
            {
            scrollTop: 0,
            },
            1000
        );
    });

    // Delete Cart Item JS
    $(document).on("click", ".btn-delete", function (event) {
        event.preventDefault();
        $(this).closest("tr").remove();
        updateCartTotal();
    });

    // Update Cart Item Total on Quantity Change
    $(document).on("change", ".cart-qty-input", function() {
        let quantity = $(this).val();
        let price = parseFloat($(this).closest("tr").find("td:nth-child(3)").text().replace("$", ""));
        let itemTotal = price * quantity;
        $(this).closest("tr").find(".item-total").text("$" + itemTotal.toFixed(2));
        updateCartTotal();
    });

    // Update Cart Total Price JS
    function updateCartTotal() {
        let total = 0;
        $("#cart-content .cart-table tr:not(:first-child, :last-child)").each(function () {
            const rowTotal = parseFloat($(this).find(".item-total").text().replace("$", ""));
            if (!isNaN(rowTotal)) {
                total += rowTotal;
            }
        });
        $("#cart-content .cart-total-price").text("$" + total.toFixed(2));
    }
    updateCartTotal(); // Initial call to set the initial total

    // Confirm Order Button Action
    $("#confirm-order-btn").on("click", function(event) {
        event.preventDefault();
        let orderItems = [];
        $("#cart-content .cart-table tr:not(:first-child, :last-child)").each(function() {
            let foodName = $(this).find("td:nth-child(2)").text();
            let price = $(this).find("td:nth-child(3)").text();
            let quantity = $(this).find(".cart-qty-input").val();
            orderItems.push({ name: foodName, price: price, quantity: quantity });
        });

        sessionStorage.setItem("currentOrder", JSON.stringify(orderItems));
        window.location.href = "order.html";
    });

    // Display Confirmed Order on order.html
    if (window.location.pathname.includes("order.html")) {
        let storedOrder = sessionStorage.getItem("currentOrder");
        let orderTableBody = $(".tbl-full tbody");
        let grandTotalElement = $("#grand-total");
        let emptyOrderMessage = $("#empty-order-message");
        let orderTable = $(".tbl-full");
        let grandTotal = 0;

        if (storedOrder) {
            let orderItems = JSON.parse(storedOrder);

            if (orderItems.length > 0) {
                orderItems.forEach(item => {
                    let itemTotal = parseFloat(item.price.replace('$', '')) * parseInt(item.quantity);
                    grandTotal += itemTotal;
                    let newRow = `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.price}</td>
                            <td>${item.quantity}</td>
                            <td>$${itemTotal.toFixed(2)}</td>
                        </tr>
                    `;
                    orderTableBody.append(newRow);
                });
                grandTotalElement.text("$" + grandTotal.toFixed(2));
                orderTable.show();
                emptyOrderMessage.hide();
            } else {
                orderTable.hide();
                emptyOrderMessage.show();
            }
            // We do NOT remove from sessionStorage here, so the order persists
            // as long as the session is active.
        } else {
            orderTable.hide();
            emptyOrderMessage.show();
        }
    }

// Initialize the cart as an empty array
// Load cart from localStorage or initialize as empty array
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const storedCart = localStorage.getItem("cart");
if (storedCart) {
    cart = JSON.parse(storedCart);

    


    updateCartUI();
    localStorage.setItem("cart", JSON.stringify(cart));
}


// This function will be triggered when an item is added to the cart
window.addToCart = function(name, price, img, quantity) {
    price = parseFloat(price);
    quantity = parseInt(quantity);
    if (isNaN(price) || isNaN(quantity) || quantity < 1) {
        alert("Invalid price or quantity.");
        return;
    }

    const item = {
        name,
        price,
        img,
        qty: quantity,
        total: quantity * price
    };

    // Check if item is already in the cart
    const existingItem = cart.find(i => i.name === name);
    if (existingItem) {
        existingItem.qty += item.qty;
        existingItem.total = existingItem.qty * existingItem.price;
    } else {
        cart.push(item);
    }

    updateCartUI();
    localStorage.setItem("cart", JSON.stringify(cart));
 // Update the cart UI to reflect changes
};

// Update the cart UI to display the contents
function updateCartUI() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    // Clear the current cart items
    cartItemsContainer.innerHTML = "";

    // Calculate total cart price
    let total = 0;

    // Loop through all cart items and create a table row for each
    cart.forEach(item => {
        total += item.total;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${item.img}" alt="${item.name}" style="width: 50px;"></td>
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>$${item.total.toFixed(2)}</td>
            <td><span class="btn-delete" onclick="removeFromCart('${item.name}')">&times;</span></td>
        `;
        cartItemsContainer.appendChild(row);
    });

    // Update cart count and total price
    cartCount.textContent = cart.length;
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Remove an item from the cart
window.removeFromCart = function(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartUI();
};

// Toggle the visibility of the cart content when clicking the cart icon
document.getElementById("shopping-cart")?.addEventListener("click", () => {
    const cartContent = document.getElementById("cart-content");
    cartContent.classList.toggle("visible");
});

// Bind Add to Cart button click event (assuming buttons have class 'add-to-cart-btn')
$(document).on("click", ".add-to-cart-btn", function() {
    const name = $(this).data("name");
    const price = $(this).data("price");
    const img = $(this).data("img");
    const quantity = $(this).closest(".food-menu-box").find(".food-qty-input").val() || 1;
    window.addToCart(name, price, img, quantity);
});
});

$(document).ready(function () {
    $("form").on("submit", function (event) {
        event.preventDefault(); // Prevent actual form submission

        // Get order details from sessionStorage
        let storedOrder = sessionStorage.getItem("currentOrder");
        if (!storedOrder) {
            alert("No items in the cart!");
            return;
        }

        let orderItems = JSON.parse(storedOrder);

        // Get user input
        let fullName = $("input[placeholder='Enter your name...']").val();
        let phone = $("input[placeholder='Enter your phone...']").val();
        let email = $("input[placeholder='Enter your email...']").val();
        let address = $("input[placeholder='Enter your address...']").val();

        // Prepare receipt data
        let receipt = {
            customer: { fullName, phone, email, address },
            orderItems: orderItems,
            date: new Date().toLocaleString()
        };

        // Save receipt to sessionStorage
        sessionStorage.setItem("lastReceipt", JSON.stringify(receipt));

        // Clear cart
        sessionStorage.removeItem("currentOrder");

        // Optionally redirect to a receipt page
        window.location.href = "receipt.html";
    });
});


$(document).ready(function () {
    const receiptData = JSON.parse(sessionStorage.getItem("lastReceipt"));
    if (receiptData) {
        // Use jQuery to populate the receipt HTML with `receiptData`
        // e.g., $("#receipt-name").text(receiptData.customer.fullName);
    } else {
        // Show message: no receipt found
    }
});

function addToCart(foodItem) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === foodItem.name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: foodItem.name, price: foodItem.price, quantity: 1 });
    }

    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI(cart); // Optional: update the cart in the DOM
}

document.querySelector('.btn-primary[href="order.html"]').addEventListener('click', function (e) {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert("No items in the cart!");
        e.preventDefault();
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
        date: new Date().toLocaleString(),
        items: cart,
        total: total.toFixed(2)
    };

    let history = JSON.parse(sessionStorage.getItem('orderHistory')) || [];
    history.push(order);
    sessionStorage.setItem('orderHistory', JSON.stringify(history));

    sessionStorage.removeItem('cart'); // Clear cart
});
