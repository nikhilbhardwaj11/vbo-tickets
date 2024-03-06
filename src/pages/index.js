import { Inter } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function PaymentScreen() {
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [selectedOption, setSelectedOption] = useState("payNow");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPrintingLatest, setIsPrintingLatest] = useState(false);
  const router = useRouter();

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
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
          setErrorMessage("Please enter a valid amount.");
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
          token: "3d0a5331-f4ea-f72c-c61e-1f136054e238",
          payment_id: paymentId,
        }
      );
      const id = response.data.order;
      if (id) {
        router.push(
          `/refund?amount=${amount}&paymentId=${paymentId}&orderId=${id}`
        );
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
          token: "3d0a5331-f4ea-f72c-c61e-1f136054e238",
        }
      );
      console.log(response.data);
      const id = response.data
      if (id) {
        router.push(
          `/latest?orderId=${id}`
        );
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
          token: "3d0a5331-f4ea-f72c-c61e-1f136054e238",
          payment_id: paymentId,
        }
      );
      const id = response.data.order;
      if (id) {
        router.push(
          `/print?orderId=${id}`
        );
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
                <>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    onWheel={(e) => e.target.blur()}
                    className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <br />
                  <input
                    type="text"
                    placeholder="Enter payment ID"
                    value={paymentId}
                    onChange={handlePaymentIdChange}
                    className="mt-4 border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
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
              <br />
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
          </div>
        )}
      </div>
    </main>
  );
}
