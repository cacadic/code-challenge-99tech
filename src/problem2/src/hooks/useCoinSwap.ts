import { useState, useEffect, useMemo } from "react";
import { fetchCoins } from "../api/coinService";
import type { Coin } from "../api/coinService";

/**
 * Custom hook managing coin swap logic
 * - Fetch coins from API on component mount
 * - Manage selected coins (pay and receive)
 * - Calculate conversion rate and received amount
 */
export const useCoinSwap = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [payCoin, setPayCoin] = useState<Coin | null>(null);
  const [receiveCoin, setReceiveCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const fetchedCoins = await fetchCoins();
        setAllCoins(fetchedCoins);
        
        const coinsWithBalance = fetchedCoins.filter(coin => coin.balance > 0);
        setCoins(coinsWithBalance);

        if (coinsWithBalance.length > 0) {
          setPayCoin(coinsWithBalance[0]);
          const ethCoin = fetchedCoins.find(c => c.symbol.toLowerCase() === "eth");
          setReceiveCoin(ethCoin || coinsWithBalance[coinsWithBalance.length > 1 ? 1 : 0]);
        }
      } catch (error) {
        console.error("Failed to fetch coins:", error);
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoading(false);
      }
    };

    loadCoins();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const receivedAmount =
    payCoin && receiveCoin && numAmount > 0
      ? (numAmount * payCoin.valueUSDT) / receiveCoin.valueUSDT
      : 0;

  const conversionRate = useMemo(() => {
    if (!payCoin || !receiveCoin) return "0.000000";
    return (payCoin.valueUSDT / receiveCoin.valueUSDT).toFixed(6);
  }, [payCoin, receiveCoin]);

  const refreshCoins = async () => {
    try {
      const fetchedCoins = await fetchCoins();
      setAllCoins(fetchedCoins);

      const coinsWithBalance = fetchedCoins.filter((coin) => coin.balance > 0);
      setCoins(coinsWithBalance);

      if (payCoin) {
        const nextPay = coinsWithBalance.find(
          (c) => c.symbol.toLowerCase() === payCoin.symbol.toLowerCase()
        );
        setPayCoin(nextPay || coinsWithBalance[0] || null);
      }
      if (receiveCoin) {
        const nextReceive = fetchedCoins.find(
          (c) => c.symbol.toLowerCase() === receiveCoin.symbol.toLowerCase()
        );
        const fallback = fetchedCoins.find(
          (c) => !payCoin || c.symbol.toLowerCase() !== payCoin.symbol.toLowerCase()
        );
        setReceiveCoin(nextReceive || fallback || null);
      }
    } catch (e) {
      console.error("Failed to refresh coins:", e);
    }
  };

  const swapCoins = async () => {
    if (!payCoin || !receiveCoin || isSwapping) return false;

    setIsSwapping(true);
    
    await new Promise((resolve) => setTimeout(resolve, 300));

    const temp = payCoin;
    setPayCoin(receiveCoin);
    setReceiveCoin(temp);
    
    setIsSwapping(false);
    return true;
  };

  return {
    coins,
    allCoins,
    loading,
    isSwapping,
    payCoin,
    receiveCoin,
    amount,
    setAmount,
    setPayCoin,
    setReceiveCoin,
    receivedAmount,
    conversionRate,
    swapCoins,
    refreshCoins,
  };
};
