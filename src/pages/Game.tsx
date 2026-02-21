"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, Heart, Coins, Trophy, RefreshCcw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  xpReward: number;
  goldReward: number;
  image: string;
}

const ENEMIES = [
  { name: "Slime", hp: 30, attack: 5, xp: 20, gold: 10, icon: "💧" },
  { name: "Goblin", hp: 50, attack: 8, xp: 40, gold: 25, icon: "👺" },
  { name: "Skeleton", hp: 80, attack: 12, xp: 70, gold: 50, icon: "💀" },
  { name: "Orc", hp: 120, attack: 18, xp: 120, gold: 100, icon: "👹" },
  { name: "Dragon", hp: 300, attack: 35, xp: 500, gold: 500, icon: "🐉" },
];

const Game: React.FC = () => {
  const { player, attackEnemy, gainRewards, healPlayer, upgradeAttack, resetGame } = useGame();
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  const spawnEnemy = () => {
    const baseEnemy = ENEMIES[Math.min(Math.floor(player.level / 2), ENEMIES.length - 1)];
    const levelMult = 1 + (player.level - 1) * 0.2;
    
    setEnemy({
      name: baseEnemy.name,
      maxHp: Math.floor(baseEnemy.hp * levelMult),
      hp: Math.floor(baseEnemy.hp * levelMult),
      attack: Math.floor(baseEnemy.attack * levelMult),
      xpReward: Math.floor(baseEnemy.xp * levelMult),
      goldReward: Math.floor(baseEnemy.gold * levelMult),
      image: baseEnemy.icon
    });
    setCombatLog(["A wild " + baseEnemy.name + " appeared!"]);
  };

  useEffect(() => {
    if (!enemy) spawnEnemy();
  }, [enemy]);

  const handleAttack = () => {
    if (!enemy || player.hp <= 0) return;

    const { damageDealt, damageTaken, enemyDefeated } = attackEnemy(enemy.hp, enemy.attack);
    
    const newLog = [
      `You hit ${enemy.name} for ${damageDealt} damage!`,
      `${enemy.name} hits you for ${damageTaken} damage!`,
      ...combatLog
    ].slice(0, 5);
    
    setCombatLog(newLog);

    if (enemyDefeated) {
      toast.success(`Defeated ${enemy.name}! Gained ${enemy.xpReward} XP and ${enemy.goldReward} Gold.`);
      gainRewards(enemy.xpReward, enemy.goldReward);
      setEnemy(null);
    } else {
      setEnemy(prev => prev ? { ...prev, hp: prev.hp - damageDealt } : null);
    }

    if (player.hp - damageTaken <= 0) {
      toast.error("You were defeated! Game Over.");
    }
  };

  const handleHeal = () => {
    if (healPlayer(50, 20)) {
      toast.success("Healed for 50 HP!");
    } else {
      toast.error("Not enough gold or already at full health!");
    }
  };

  const handleUpgrade = () => {
    if (upgradeAttack(50)) {
      toast.success("Attack upgraded!");
    } else {
      toast.error("Not enough gold!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">RPG Adventure</h1>
        <Button variant="outline" size="sm" onClick={resetGame}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset Progress
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Stats */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Hero (Lv. {player.level})</span>
              <Badge variant="secondary">XP: {player.xp}/{player.nextLevelXp}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" /> HP</span>
                <span>{player.hp} / {player.maxHp}</span>
              </div>
              <Progress value={(player.hp / player.maxHp) * 100} className="h-2 bg-red-100" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sword className="h-5 w-5 text-blue-500" />
                <span className="font-bold">Attack: {player.attack}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-bold">Gold: {player.gold}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enemy Section */}
        <Card className={player.hp <= 0 ? "opacity-50" : ""}>
          <CardHeader>
            <CardTitle className="text-center">
              {enemy ? `${enemy.name}` : "Searching..."}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="text-8xl animate-bounce h-32 flex items-center">
              {enemy?.image || "🔍"}
            </div>
            {enemy && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enemy HP</span>
                  <span>{enemy.hp} / {enemy.maxHp}</span>
                </div>
                <Progress value={(enemy.hp / enemy.maxHp) * 100} className="h-2" />
                <Button 
                  className="w-full h-16 text-xl" 
                  onClick={handleAttack}
                  disabled={player.hp <= 0}
                >
                  <Sword className="mr-2 h-6 w-6" /> ATTACK!
                </Button>
              </div>
            )}
            {player.hp <= 0 && (
              <Button variant="destructive" className="w-full" onClick={resetGame}>
                Revive (Reset)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Shop & Log */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Village Shop & Combat Log
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={handleHeal}>
                <span>Heal 50 HP</span>
                <Badge variant="outline">20 Gold</Badge>
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={handleUpgrade}>
                <span>Upgrade Attack (+2)</span>
                <Badge variant="outline">50 Gold</Badge>
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg h-32 overflow-y-auto text-sm font-mono">
              {combatLog.map((log, i) => (
                <div key={i} className={i === 0 ? "text-primary font-bold" : "opacity-70"}>
                  {log}
                </div>
              ))}
              {combatLog.length === 0 && <span className="text-muted-foreground italic">Waiting for action...</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Game;