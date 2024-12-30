// admin-orders.js

const API_URL =
  "https://mohamed-apis.vercel.app/order/get/orders?select=userId,products,couponId,subTotal";

// Placeholder for fetched orders
let currentOrders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 5;

// Fetch Orders from API
async function fetchOrders() {
  // Retrieve tokens from localStorage
  const token = localStorage.getItem("token");
  const { accessToken, refreshToken } = token ? JSON.parse(token) : {};

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken ? `Bearer ${accessToken}` : null,
        "refresh-token": refreshToken || null,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch orders.");
    }

    const data = await response.json();

    // Handle empty or invalid data
    if (!data || !data.result) {
      currentOrders = [];
    } else {
      currentOrders = data.result;
    }

    filteredOrders = currentOrders;
    renderOrdersWithPagination(filteredOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    showPopupMessage("Failed to fetch orders. Please try again.", "error");
  }
}

// Render Orders with Pagination
function renderOrdersWithPagination(orders) {
  const start = (currentPage - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const paginatedOrders = orders.slice(start, end);

  renderOrders(paginatedOrders);
  renderPagination(orders.length);
}

// Render Orders
function renderOrders(orders) {
  const orderContainer = document.getElementById("order-container");
  orderContainer.innerHTML = "";

  if (orders.length === 0) {
    orderContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";

    orderCard.innerHTML = `
      <h2>${order.userId.name || "Unknown User"}</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Items:</strong> ${order.products
        .map((p) => p.name)
        .join(", ")}</p>
      <p><strong>Total:</strong> $${order.subTotal || "0.00"}</p>
      <div>
        <button class="accept-btn" onclick="acceptOrder('${
          order._id
        }')">Accept</button>
        <button class="reject-btn" onclick="rejectOrder('${
          order._id
        }')">Reject</button>
      </div>
    `;

    orderContainer.appendChild(orderCard);
  });
}

// Render Pagination
function renderPagination(totalOrders) {
  const paginationContainer = document.getElementById("pagination-container");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  if (totalPages <= 1) return; // No pagination if only one page

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.className = "page-button";
    pageButton.textContent = i;

    if (i === currentPage) {
      pageButton.classList.add("active");
    }

    pageButton.addEventListener("click", () => {
      currentPage = i;
      renderOrdersWithPagination(filteredOrders);
    });

    paginationContainer.appendChild(pageButton);
  }
}

// Accept Order
function acceptOrder(orderId) {
  console.log(`Order ${orderId} accepted.`);
  showPopupMessage(`Order ${orderId} accepted.`, "success");
}

// Reject Order
function rejectOrder(orderId) {
  console.log(`Order ${orderId} rejected.`);
  showPopupMessage(`Order ${orderId} rejected.`, "error");
}

// Search Orders
function handleSearch() {
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  filteredOrders = currentOrders.filter(
    (order) =>
      order.userId.name.toLowerCase().includes(searchInput) ||
      order._id.toLowerCase().includes(searchInput)
  );
  currentPage = 1;
  renderOrdersWithPagination(filteredOrders);
}

document
  .getElementById("search-button")
  .addEventListener("click", handleSearch);

// Show Popup Message
function showPopupMessage(message, type) {
  const popup = document.getElementById("popup-message");
  const popupText = document.getElementById("popup-text");

  popupText.textContent = message;
  popup.className = `popup ${type}`;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// Initialize Orders on Page Load
document.addEventListener("DOMContentLoaded", fetchOrders);
