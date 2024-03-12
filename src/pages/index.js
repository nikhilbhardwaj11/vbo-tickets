import axios from "axios";
import { Inter } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function PaymentScreen() {
  // Get your own redirect URl from Clover dashboard where app is listed.
  const APP_REDIRECT_URL =
    "https://sandbox.dev.clover.com/oauth/merchants/0N26RMVFMHPS1?client_id=HDHY1VRHZRFMC&packageName=com.vbo.myapplication";

  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [selectedOption, setSelectedOption] = useState("payNow");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPrintingLatest, setIsPrintingLatest] = useState(false);
  const [apiToken, setApiToken] = useState(
    "b65b2682-0009-e78f-1a15-8962f8399623"
  );

  const router = useRouter();

  const handleUpdateToken = () => {
    // Redirect the user to the authentication URL
    window.location.href = APP_REDIRECT_URL;
  };
  // Check if the URL contains the expected query parameters indicating a callback
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

  // Call the checkCallback function when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      checkCallback();
    }
  }, []);

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
        setApiToken(localStorage.getItem("access_token"));
        // Redirect the user to the desired URL
        router.push("/");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setErrorMessage("");
    setPaymentId("");
    setAmount("");
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setErrorMessage("");
  };

  const handlePaymentIdChange = (e) => {
    setPaymentId(e.target.value);
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      setErrorMessage("Please select an option.");
      return;
    }

    switch (selectedOption) {
      case "payNow":
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
          setErrorMessage("Please enter a valid amount.");
          return;
        }
        router.push(`/pay?amount=${amount}`);
        break;
      case "refund":
        if (!paymentId) {
          setErrorMessage("Please enter a payment ID.");
          return;
        }
        getRefund(paymentId);
        break;
      case "printReceipt":
        if (!paymentId) {
          setErrorMessage("Please enter a payment ID.");
          return;
        }
        printReceipt(paymentId);
        break;
      default:
        break;
    }
  };

  const getRefund = async (paymentId) => {
    try {
      const response = await axios.post(
        "https://vpo-api.mobileprogramming.net/api/getOrderData",
        {
          token: apiToken || "b65b2682-0009-e78f-1a15-8962f8399623",
          payment_id: paymentId,
        }
      );
      const id = response.data.order;
      if (id) {
        router.push(`/refund?amount=${amount}&pId=${paymentId}&orderId=${id}`);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Invalid Payment ID");
    }
  };

  const getLatestOrder = async () => {
    setIsPrintingLatest(true);
    try {
      const response = await axios.post(
        "https://vpo-api.mobileprogramming.net/api/getLatestOrderId",
        {
          token: apiToken || "b65b2682-0009-e78f-1a15-8962f8399623",
        }
      );
      console.log(response.data);
      const id = response.data;
      if (id) {
        router.push(`/latest?orderId=${id}`);
      }
      setIsPrintingLatest(false);
    } catch (error) {
      console.error(error);
      setIsPrintingLatest(false);
      setErrorMessage("Internal Server Error: " + error);
    }
  };

  const printReceipt = async (paymentId) => {
    try {
      const response = await axios.post(
        "https://vpo-api.mobileprogramming.net/api/getOrderData",
        {
          token: apiToken || "b65b2682-0009-e78f-1a15-8962f8399623",
          payment_id: paymentId,
        }
      );
      const id = response.data.order;
      if (id) {
        router.push(`/print?orderId=${id}`);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Invalid Payment ID");
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center ${inter.className}`}
    >
      <div className="flex flex-col items-center border border-gray-300 p-10 rounded-lg">
        <Image
          src="/logo.png"
          alt="Payment screen text"
          width={150}
          height={150}
          className="mb-8"
        />
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => handleOptionSelect("payNow")}
              className={`px-6 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedOption === "payNow"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500"
              }`}
            >
              Pay Now
            </button>
            <button
              onClick={() => handleOptionSelect("printReceipt")}
              className={`px-6 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedOption === "printReceipt"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:border-green-500 hover:text-green-500"
              }`}
            >
              Print Receipt
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleOptionSelect("refund")}
              className={`px-6 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedOption === "refund"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-700 hover:border-red-500 hover:text-red-500"
              }`}
            >
              Refund
            </button>
            <button
              onClick={() => getLatestOrder()}
              className={`px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                isPrintingLatest
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-500 text-white"
              }`}
              disabled={isPrintingLatest}
            >
              {isPrintingLatest ? "Printing Latest..." : "Print Latest Receipt"}
            </button>
          </div>
        </div>

        {selectedOption && (
          <div className="w-full">
            <div className="mt-8">
              {selectedOption === "payNow" && (
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={handleAmountChange}
                  onWheel={(e) => e.target.blur()}
                  className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {selectedOption === "refund" && (
                <input
                  type="text"
                  placeholder="Enter payment ID"
                  value={paymentId}
                  onChange={handlePaymentIdChange}
                  className=" border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {selectedOption === "printReceipt" && (
                <input
                  type="text"
                  placeholder="Enter payment ID"
                  value={paymentId}
                  onChange={handlePaymentIdChange}
                  className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {errorMessage && (
                <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className={`mt-4 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                !selectedOption ||
                (!amount && selectedOption === "payNow") ||
                (!paymentId &&
                  (selectedOption === "refund" ||
                    selectedOption === "printReceipt"))
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={
                !selectedOption ||
                (!amount && selectedOption === "payNow") ||
                (!paymentId &&
                  (selectedOption === "refund" ||
                    selectedOption === "printReceipt"))
              }
            >
              Submit
            </button>
          </div>
        )}
      </div>
      <div
        className=" hover:bg-red-500 hover:text-white bg-gray-200 border border-gray-300 p-2 m-2 rounded-md"
        title="Click to update OAuth Token For API Calling"
      >
        <button className="" onClick={handleUpdateToken}>
          Update OAuth Token
        </button>
      </div>
    </main>
  );
}
