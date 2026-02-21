"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PlayerStats {
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  xp: number;
  nextLevelXp: number;
  gold: number;
}

interface GameContextType {
  player: PlayerStats;
  attackEnemy: (enemyHp: number, enemyAttack: number) => { damageDealt: number; damageTaken: number; enemyDefeated: boolean };
  gainRewards: (xp: number, gold: number) => void;
  healPlayer: (amount: number, cost: number) => boolean;
  upgradeAttack: (cost: number) => boolean;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'rpg_game_stats';

const initialStats: PlayerStats = {
  level: 1,
  hp: 100,
  maxHp: 100,
  attack: 10,
  xp: 0,
  nextLevelXp: 100,
  gold: 0,
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerStats>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialStats;
    } catch {
      return initialStats;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(player));
  }, [player]);

  const attackEnemy = (enemyHp: number, enemyAttack: number) => {
    const damageDealt = Math.floor(player.attack * (0.8 + Math.random() * 0.4));
    const damageTaken = Math.floor(enemyAttack * (0.8 + Math.random() * 0.4));
    
    const newHp = Math.max(0, player.hp - damageTaken);
    const enemyDefeated = (enemyHp - damageDealt) <= 0;

    setPlayer(prev => ({ ...prev, hp: newHp }));

    return { damageDealt, damageTaken, enemyDefeated };
  };

  const gainRewards = (xpGain: number, goldGain: number) => {
    setPlayer(prev => {
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newMaxHp = prev.maxHp;
      let newAttack = prev.attack;
      let newNextLevelXp = prev.nextLevelXp;

      while (newXp >= newNextLevelXp) {
        newXp -= newNextLevelXp;
        newLevel++;
        newMaxHp += 20;
        newAttack += 5;
        newNextLevelXp = Math.floor(newNextLevelXp * 1.5);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        maxHp: newMaxHp,
        attack: newAttack,
        nextLevelXp: newNextLevelXp,
        gold: prev.gold + goldGain,
        hp: newLevel > prev.level ? newMaxHp : prev.hp // Full heal on level up
      };
    });
  };

  const healPlayer = (amount: number, cost: number) => {
    if (player.gold >= cost && player.hp < player.maxHp) {
      setPlayer(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + amount),
        gold: prev.gold - cost
      }));
      return true;
    }
    return false;
  };

  const upgradeAttack = (cost: number) => {
    if (player.gold >= cost) {
      setPlayer(prev => ({
        ...prev,
        attack: prev.attack + 2,
        gold: prev.gold - cost
      }));
      return true;
    }
    return false;
  };

  const resetGame = () => setPlayer(initialStats);

  return (
    <GameContext.Provider value={{ player, attackEnemy, gainRewards, healPlayer, upgradeAttack, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};