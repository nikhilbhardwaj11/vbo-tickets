import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function PaymentScreen() {
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handlePayNow = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    setAmount("");
    setSuccessMessage("Payment successful!");
    setErrorMessage("");
    router.push(`/pay?amount=${amount}`);
  };

  const handleRefund = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    setAmount("");
    setSuccessMessage("Refund successful!");
    setErrorMessage("");
    router.push(`/refund?amount=${amount}`);
  };

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
        <div className="mt-8">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errorMessage && (
            <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-xs mt-2">{successMessage}</p>
          )}
        </div>
        <div className="flex space-x-4 mt-8">
          <button
            onClick={handlePayNow}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Pay Now
          </button>
          {/* <button
            onClick={handleRefund}
            className="px-4 py-2 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Refund
          </button> */}
        </div>
      </div>
    </main>
  );
}
