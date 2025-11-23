import { useState, useEffect, useMemo } from 'react'
import './App.css'

interface Currency {
  currency: string
  price: number
}

interface FormErrors {
  amount?: string
  fromCurrency?: string
  toCurrency?: string
}

function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [fromCurrency, setFromCurrency] = useState<string>('')
  const [toCurrency, setToCurrency] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitMessage, setSubmitMessage] = useState<string>('')

  // Fetch currency prices on mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://interview.switcheo.com/prices.json')
        const data: Currency[] = await response.json()
        
        // Filter out currencies without prices and remove duplicates
        const uniqueCurrencies = data.reduce((acc: Currency[], curr) => {
          if (curr.price && !acc.find(c => c.currency === curr.currency)) {
            acc.push(curr)
          }
          return acc
        }, [])
        
        setCurrencies(uniqueCurrencies.sort((a, b) => a.currency.localeCompare(b.currency)))
        
        // Set default currencies
        if (uniqueCurrencies.length >= 2) {
          setFromCurrency(uniqueCurrencies[0].currency)
          setToCurrency(uniqueCurrencies[1].currency)
        }
      } catch (error) {
        console.error('Failed to fetch currencies:', error)
      }
    }

    fetchPrices()
  }, [])

  // Calculate exchange rate and converted amount
  const { exchangeRate, convertedAmount } = useMemo(() => {
    if (!fromCurrency || !toCurrency || !amount) {
      return { exchangeRate: 0, convertedAmount: 0 }
    }

    const fromPrice = currencies.find(c => c.currency === fromCurrency)?.price || 0
    const toPrice = currencies.find(c => c.currency === toCurrency)?.price || 0

    if (fromPrice === 0 || toPrice === 0) {
      return { exchangeRate: 0, convertedAmount: 0 }
    }

    const rate = fromPrice / toPrice
    const converted = parseFloat(amount) * rate

    return {
      exchangeRate: rate,
      convertedAmount: isNaN(converted) ? 0 : converted
    }
  }, [fromCurrency, toCurrency, amount, currencies])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
    }

    if (!fromCurrency) {
      newErrors.fromCurrency = 'Please select a currency to swap from'
    }

    if (!toCurrency) {
      newErrors.toCurrency = 'Please select a currency to swap to'
    }

    if (fromCurrency === toCurrency) {
      newErrors.toCurrency = 'Cannot swap to the same currency'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle swap currencies
  const handleSwap = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setSubmitMessage('')

    // Simulate API call with timeout
    setTimeout(() => {
      setLoading(false)
      setSubmitMessage(`Successfully swapped ${amount} ${fromCurrency} to ${convertedAmount.toFixed(6)} ${toCurrency}!`)
      setAmount('')
    }, 1500)
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Currency Swap</h1>
        <p className="subtitle">Exchange your crypto assets instantly</p>

        <form onSubmit={handleSubmit} className="form">
          {/* From Currency Section */}
          <div className="input-group">
            <label className="label">From</label>
            <div className="input-row">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setErrors({ ...errors, amount: undefined })
                }}
                placeholder="0.00"
                className="amount-input"
                step="any"
                min="0"
              />
              <select
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value)
                  setErrors({ ...errors, fromCurrency: undefined })
                }}
                className="currency-select"
              >
                {currencies.map((curr) => (
                  <option key={curr.currency} value={curr.currency}>
                    {curr.currency}
                  </option>
                ))}
              </select>
            </div>
            {errors.amount && <span className="error">{errors.amount}</span>}
            {errors.fromCurrency && <span className="error">{errors.fromCurrency}</span>}
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <button
              type="button"
              onClick={handleSwap}
              className="swap-button"
              title="Swap currencies"
            >
              ⇅
            </button>
          </div>

          {/* To Currency Section */}
          <div className="input-group">
            <label className="label">To</label>
            <div className="input-row">
              <input
                type="text"
                value={convertedAmount.toFixed(6)}
                readOnly
                placeholder="0.00"
                className="amount-input readonly"
              />
              <select
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value)
                  setErrors({ ...errors, toCurrency: undefined })
                }}
                className="currency-select"
              >
                {currencies.map((curr) => (
                  <option key={curr.currency} value={curr.currency}>
                    {curr.currency}
                  </option>
                ))}
              </select>
            </div>
            {errors.toCurrency && <span className="error">{errors.toCurrency}</span>}
          </div>

          {/* Exchange Rate Display */}
          {exchangeRate > 0 && (
            <div className="exchange-rate">
              1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Swap Now'}
          </button>

          {/* Success Message */}
          {submitMessage && (
            <div className="success-message">
              {submitMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default App
