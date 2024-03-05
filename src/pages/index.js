import { Inter } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function PaymentScreen() {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedOption, setSelectedOption] = useState("payNow");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setErrorMessage("");
    setTransactionId("");
    setAmount("");
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setErrorMessage("");
  };

  const handleTransactionIdChange = (e) => {
    setTransactionId(e.target.value);
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
        if (!transactionId) {
          setErrorMessage("Please enter a transaction ID.");
          return;
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
          setErrorMessage("Please enter a valid amount.");
          return;
        }
        // getOrderIdByPaymentId(transactionId);
        // const orderId = getOrderIdByPaymentId("F9ZXVNYYYMXTA");
        // console.log(orderId);
        return;
        router.push(
          `/refund?amount=${amount}&transactionId=${transactionId}&orderId=${orderId}`
        );
        break;
      case "printReceipt":
        if (!transactionId) {
          setErrorMessage("Please enter a transaction ID.");
          return;
        }
        router.push(`/print?transactionId=${transactionId}`);
        break;
      default:
        break;
    }
  };
  // const options = {
  //   method: "GET",
  //   headers: {
  //     accept: "application/json",
  //     authorization: "Bearer 3d0a5331-f4ea-f72c-c61e-1f136054e238",
  //   },
  // };
  //   fetch(`https://scl-sandbox.dev.clover.com/v1/charges/F9ZXVNYYYMXTA`, options)
  //     .then((response) => response.json())
  //     .then((response) => console.log(response))
  //     .catch((err) => console.error(err));
  
  const getRefund = async(paymentId) => {
    console.log(paymentId);
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: "Bearer 3d0a5331-f4ea-f72c-c61e-1f136054e238",
      },
    };
     const data = await fetch(`https://scl-sandbox.dev.clover.com/v1/charges/${paymentId}`, options);
     console.log(data);
        
  }
getRefund("F9ZXVNYYYMXTA")

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center ${inter.className}`}
    >
      <div className="flex flex-col items-center border border-gray-300 p-8 rounded-lg">
        <Image
          src="/logo.png"
          alt="Payment screen text"
          width={150}
          height={150}
          className="mb-8"
        />
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => handleOptionSelect("payNow")}
            className={`px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              selectedOption === "payNow"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:border-blue-500 hover:text-blue-500"
            }`}
          >
            Pay Now
          </button>
          <button
            onClick={() => handleOptionSelect("refund")}
            className={`px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              selectedOption === "refund"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:border-red-500 hover:text-red-500"
            }`}
          >
            Refund
          </button>
          <button
            onClick={() => handleOptionSelect("printReceipt")}
            className={`px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              selectedOption === "printReceipt"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 hover:border-green-500 hover:text-green-500"
            }`}
          >
            Print Receipt
          </button>
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
                    placeholder="Enter transaction ID"
                    value={transactionId}
                    onChange={handleTransactionIdChange}
                    className="mt-4 border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
              {selectedOption === "printReceipt" && (
                <input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={handleTransactionIdChange}
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
                  (!transactionId &&
                    (selectedOption === "refund" ||
                      selectedOption === "printReceipt"))
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                disabled={
                  !selectedOption ||
                  (!amount && selectedOption === "payNow") ||
                  (!transactionId &&
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
