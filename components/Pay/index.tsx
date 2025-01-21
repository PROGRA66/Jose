"use client"

import { useState } from "react"
import Link from "next/link"
import { MiniKit, tokenToDecimals, Tokens, type PayCommandInput } from "@worldcoin/minikit-js"

const sendPayment = async (wldAmount: number) => {
  try {
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
    })

    const { id } = await res.json()

    console.log(id)

    const payload: PayCommandInput = {
      reference: id,
      to: "0xde6b6e1cddbfd1d94afc01957748c36c36f43af4", // Test address
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(wldAmount, Tokens.WLD).toString(),
        },
      ],
      description: `Payment of ${wldAmount} WLD`,
    }
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload)
    }
    return null
  } catch (error: unknown) {
    console.log("Error sending payment", error)
    return null
  }
}

const handlePay = async (wldAmount: number) => {
  if (!MiniKit.isInstalled()) {
    console.error("MiniKit is not installed")
    return
  }
  const sendPaymentResponse = await sendPayment(wldAmount)
  const response = sendPaymentResponse?.finalPayload
  if (!response) {
    return
  }

  if (response.status === "success") {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/confirm-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: response }),
    })
    const payment = await res.json()
    if (payment.success) {
      console.log("Payment successful!")
      alert("Payment successful!")
    } else {
      console.log("Payment failed!")
      alert("Payment failed!")
    }
  }
}

export const PayBlock = () => {
  const [wldAmount, setWldAmount] = useState("")

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">WorldPay</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/home" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link
                href="/history"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Make a WLD Payment</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="wld-amount" className="block text-sm font-medium text-gray-700">
                  WLD Amount
                </label>
                <input
                  type="number"
                  id="wld-amount"
                  value={wldAmount}
                  onChange={(e) => setWldAmount(e.target.value)}
                  placeholder="Enter WLD amount"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transi>
                onClick={() => handlePay(Number(wldAmount))}
                disabled={!wldAmount}
              >
                Pay WLD
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
