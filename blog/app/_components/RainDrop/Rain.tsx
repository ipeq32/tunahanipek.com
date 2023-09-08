"use client"
import { rain } from '@jotai/atoms';
import { useAtom } from 'jotai';
import React, { useState, useEffect } from 'react';

const RainEffect = () => {
  const [rainDrops, setRainDrops] = useState<React.ReactNode[]>([]);
  const [rainDelay, setRainDelay] = useState<number>(0);
  const [rainEffect, setRainEffect] = useAtom(rain.rainEffectAtom);

  useEffect(() => {
    if (rainEffect) {
      const interval = setInterval(() => {
        setRainDelay(delay => {
          if (delay >= (11520 / window.innerWidth)) {
            const newRainDrop = (
              <RainDrop
                key={Date.now()}
                left={Math.floor(Math.random() * window.innerWidth)}
                onAnimationEnd={() => {
                  setRainDrops(rainDrops => rainDrops.filter(drop => drop !== newRainDrop));
                }}
              />
            );
            setRainDrops(rainDrops => [newRainDrop, ...rainDrops]);
            return 0;
          }
          return delay + 1;
        });
      }, 1000 / 60);

      setTimeout(() => {
        clearInterval(interval);
        setRainEffect(false);
      }, 5000);

    } else {
      setRainDrops([]);
    }
  }, [rainEffect]);

  return (
    <div className="absolute top-0 right-0 h-full w-full overflow-hidden pointer-events-none">
      {rainDrops}
    </div>
  );
}

export default RainEffect;

interface RainDropProps {
  left: number;
  onAnimationEnd?: () => void;
}

const RainDrop = (props: RainDropProps) => {
  return (
    <div
      className="h-5 w-[0.1rem] z-50 rounded-3xl absolute bg-white animate-drop shadow-3xl shadow-white"
      style={{ left: props.left }}
      onAnimationEnd={props.onAnimationEnd}
    />
  );
}