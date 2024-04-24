// State variables
let amount = "";
let paymentId = "";
let selectedOption = "payNow";
let apiToken = "b65b2682-0009-e78f-1a15-8962f8399623";

// Router simulation
const router = {
  push: (path) => {
    console.log("Redirecting to:", path);
    window.location.href = path;
  },
};

// Handle update token
const handleUpdateToken = () => {
  const APP_REDIRECT_URL =
    "https://sandbox.dev.clover.com/oauth/merchants/0N26RMVFMHPS1?client_id=HDHY1VRHZRFMC&packageName=com.vbo.myapplication";
  // Redirect the user to the authentication URL
  window.location.href = APP_REDIRECT_URL;
};

// Check callback
const checkCallback = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const code = queryParams.get("code");
  const client_id = queryParams.get("client_id");

  if (code && client_id) {
    // The URL contains the 'code' and 'client_id' parameter, indicating a callback
    console.log("Client Id:", client_id);
    console.log("Code:", code);

    exchangeCodeForToken(client_id, code);
  } else {
    // The URL does not contain the expected parameters
    // This might not be a callback URL, or the authentication failed
    console.log("No callback detected");
  }
};

// Exchange code for token
const exchangeCodeForToken = (client_id, code) => {
  const client_secret = "a341eb50-af74-4f1c-5fd7-d9e5ca34cc49";
  const accessTokenUrl = `https://sandbox.dev.clover.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`;

  fetch(accessTokenUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("access_token", data.access_token);
      apiToken = localStorage.getItem("access_token");
      // Redirect the user to the desired URL
      router.push("/");
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};

// Handle option select
const handleOptionSelect = (option) => {
  selectedOption = option;
  paymentId = "";
  amount = "";
};

// Handle form submission
const handleSubmit = () => {
  if (!selectedOption) {
    return;
  }

  // Get input field values
  amount = document.getElementById("amountInput").value;
  paymentId = document.getElementById("paymentIdInput").value;

  console.log("selectedOption", selectedOption, "Amount:", amount, "Payment ID:", paymentId);
  switch (selectedOption) {
    case "payNow":
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return;
      }
      router.push(`/pay?amount=${amount}`);
      break;
    case "refund":
      if (!paymentId) {
        return;
      }
      getRefund(paymentId);
      break;
    case "printReceipt":
      if (!paymentId) {
        return;
      }
      printReceipt(paymentId);
      break;
    default:
      break;
  }
};

const printReceipt = async (paymentId) => {
  try {
    const response = await fetch(
      "https://vpo-api.mobileprogramming.net/api/getOrderData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "b65b2682-0009-e78f-1a15-8962f8399623",
          payment_id: paymentId,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const id = data.order;
    if (id) {
      router.push(`/print?orderId=${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};

// Get refund
const getRefund = async (paymentId) => {
  console.log("Refunding.....", paymentId);
  try {
    const response = await fetch(
      "https://vpo-api.mobileprogramming.net/api/getOrderData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: apiToken,
          payment_id: paymentId,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    const id = data.order;
    if (id) {
      router.push(`/refund?amount=${amount}&pId=${paymentId}&orderId=${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};

// Get latest order
const getLatestOrder = async () => {
  try {
    const response = await fetch(
      "https://vpo-api.mobileprogramming.net/api/getLatestOrderId",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: apiToken,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const id = await response.json();
    if (id) {
      router.push(`/latest?orderId=${id}`);
    }
  } catch (error) {
    console.error(error);
  }
};

// Check for callback when the component mounts
if (typeof window !== "undefined") {
  checkCallback();
}

// Event listener for form submission
document.getElementById("submitButton").addEventListener("click", handleSubmit);

// Update token button click event
document
  .getElementById("updateTokenBtn")
  .addEventListener("click", handleUpdateToken);

// Event listeners for radio button changes
document.querySelectorAll('input[name="paymentOption"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    handleOptionSelect(event.target.value);
  });
});

// Event listener for printing latest receipt
document
  .getElementById("printLatestBtn")
  .addEventListener("click", getLatestOrder);
