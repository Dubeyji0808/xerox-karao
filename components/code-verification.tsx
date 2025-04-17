"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle, KeyRound, AlertCircle } from "lucide-react"

interface CodeVerificationProps {
  onVerify: (code: string) => void
  userName: string
}

export function CodeVerification({ onVerify, userName }: CodeVerificationProps) {
  const [code, setCode] = useState(["", "", "", "", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      return
    }

    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)
      setError(null)

      // Auto-advance to next input
      if (value !== "" && index < 4) {
        inputs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (index > 0 && code[index] === "") {
        // Move to previous input when backspace is pressed on an empty input
        inputs.current[index - 1]?.focus()
      } else if (code[index] !== "") {
        // Clear current input when backspace is pressed
        const newCode = [...code]
        newCode[index] = ""
        setCode(newCode)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 4) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted content is a 5-digit number
    if (/^\d{5}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setCode(digits)
      setError(null)

      // Focus the last input
      inputs.current[4]?.focus()
    }
  }

  const handleVerify = () => {
    const fullCode = code.join("")
    if (fullCode.length === 5) {
      setIsSubmitting(true)
      setError(null)

      // Call the verification function
      onVerify(fullCode)

      // Reset submission state after a delay
      setTimeout(() => {
        setIsSubmitting(false)
      }, 1000)
    } else {
      setError("Please enter all 5 digits of the verification code.")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <KeyRound className="h-5 w-5 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Verify Code for {userName}</h2>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Enter the 5-digit verification code provided by the user to complete the transaction.
      </p>

      <div className="flex justify-between mb-6">
        {code.map((digit, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            ref={(el) => (inputs.current[index] = el)}
            className="w-12 h-14 text-center text-xl font-bold border-gray-200 focus:border-emerald-500 focus:ring focus:ring-emerald-200 transition-all duration-300"
            aria-label={`Digit ${index + 1} of verification code`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        onClick={handleVerify}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Verifying...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Verify Code
          </span>
        )}
      </Button>
    </div>
  )
}
