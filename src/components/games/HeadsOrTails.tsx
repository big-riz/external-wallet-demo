import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Confetti from 'react-confetti';
import Image from 'next/image';
import { createNewGame, makeBet, fetchStats, fetchPlayerStats } from '@/app/actions/coinFlipActions';
import styles from './HeadsOrTails.module.css'
import { useWallet } from '@/app/context/WalletContext';

const Coin = ({ isFlipping, result }: { isFlipping: boolean; result: 'Heads' | 'Tails' | null }) => (
  <div className={`${styles.coin} ${isFlipping ? styles.flipping : ''} ${result ? styles[result.toLowerCase()] : ''}`}>
    <div className={`${styles.side} ${styles.heads}`}>
      <Image src="/Heads.webp" alt="Heads" width={150} height={150} />
    </div>
    <div className={`${styles.side} ${styles.tails}`}>
      <Image src="/Tails.webp" alt="Tails" width={150} height={150} />
    </div>
  </div>
);

const DotsLoader = () => (
  <span className={styles.loaderDots}>
    <span></span>
    <span></span>
    <span></span>
  </span>
);

export default function HeadsOrTailsGame() {
  const [choice, setChoice] = useState<'Heads' | 'Tails'>('Heads');
  const [wager, setWager] = useState<number>(0.01);
  const [result, setResult] = useState<{ message: string; isWin: boolean } | null>(null);
  const [globalResults, setGlobalResults] = useState<any>({});
  const [playerResults, setPlayerResults] = useState<any>({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameId, setGameId] = useState<number | null>(null);
  const [randomSeedHash, setRandomSeedHash] = useState<string>('');
  const [flipResult, setFlipResult] = useState<'Heads' | 'Tails' | null>(null);

  const { refreshBalances } = useWallet();

  useEffect(() => {
    fetchNewGame();
    fetchGlobalStats();
    fetchPlayerStatistics();
  }, []);

  const fetchNewGame = async () => {
    try {
      const game = await createNewGame();
      setGameId(game.gameId);
      setRandomSeedHash(game.randomSeedHash);
    } catch (error) {
      console.error('Error fetching new game:', error);
    }
  };

  const fetchGlobalStats = async () => {
    try {
      const stats = await fetchStats();
      setGlobalResults(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPlayerStatistics = async () => {
    try {
      const stats = await fetchPlayerStats();
      setPlayerResults(stats);
    } catch (error) {
      console.error('Error fetching player statistics:', error);
    }
  };

  const handleBet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!gameId) return;

    setIsFlipping(true);
    setResult(null);
    setFlipResult(null);

    const formData = new FormData(event.currentTarget);

    try {
      const betResult = await makeBet(formData);

      const isWin = betResult.playerSelection === betResult.result;
      setFlipResult(betResult.result as 'Heads' | 'Tails');
      setResult({
        message: isWin
          ? `You won $${Number(betResult.wagerPayoutAmount).toFixed(3)}!`
          : `You lost $${Number(betResult.wagerAmount).toFixed(2)}.`,
        isWin,
      });

      if (isWin) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      setIsFlipping(false);

      // Update balances and stats in the background
      refreshBalances();
      fetchGlobalStats();
      fetchPlayerStatistics();
      fetchNewGame();

    } catch (error: any) {
      console.error('Error placing bet:', error);
      setResult({ message: error.message || 'Error placing bet.', isWin: false });
      setIsFlipping(false);
      fetchNewGame();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      {showConfetti && <Confetti />}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Heads or Tails</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="mb-8">
            <Coin isFlipping={isFlipping} result={flipResult} />
          </div>
          <form onSubmit={handleBet} className="w-full space-y-4">
            <input type="hidden" name="gameId" value={gameId ?? ''} />
            <RadioGroup
              name="playerSelection"
              onValueChange={(value) => setChoice(value as 'Heads' | 'Tails')}
              value={choice}
              className="flex justify-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Heads" id="heads" />
                <Label htmlFor="heads">Heads</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Tails" id="tails" />
                <Label htmlFor="tails">Tails</Label>
              </div>
            </RadioGroup>
            <div>
              <Label htmlFor="wager">Wager Amount</Label>
              <Input
                type="number"
                id="wager"
                name="wagerAmount"
                value={wager}
                onChange={(e) => setWager(Number(e.target.value))}
                min="0.01"
                max="1"
                step="0.01"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                To Win: ${(wager * 1.98).toFixed(3)}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isFlipping}>
              {isFlipping ? <span className='flex item-center justify-center'><DotsLoader/> </span> : 'Place Bet'}
            </Button>
          </form>
          {result && !isFlipping && (
            <div
              className={`mt-4 p-4 rounded-md w-full text-center ${
                result.isWin ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {result.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Global Results</TabsTrigger>
              <TabsTrigger value="player">My Stats</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <div className="space-y-2">
                <p>Total Games: {globalResults.totalGames || 0}</p>
                <p>Heads Percentage: {globalResults.headsPercentage?.toFixed(2) || 0}%</p>
                <p>Total Wins: {globalResults.totalWins || 0}</p>
                <p>Total Payouts: ${Number(globalResults.totalPayouts)?.toFixed(3) || 0}</p>
              </div>
            </TabsContent>
            <TabsContent value="player">
              <div className="space-y-2">
                <p>Total Games: {playerResults.totalGames || 0}</p>
                <p>Heads Percentage: {playerResults.headsPercentage?.toFixed(2) || 0}%</p>
                <p>Total Wins: {playerResults.totalWins || 0}</p>
                <p>Total Payouts: ${Number(playerResults.totalPayouts)?.toFixed(3) || 0}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
