import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Droplets, Sparkles, Shirt, Bath, Zap, Search, Loader2, ShieldCheck, Trash2, Hand, Waves, Heart, Sun, Activity, Download, Flame } from 'lucide-react';
import { cn } from './lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

// Audio Context setup
const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
};

type DeliveryMethod = 'Inhaler' | 'Vape' | 'Cologne' | 'Perfume' | 'Laundry' | 'BodyWash' | 'Shampoo' | 'Conditioner' | 'Lotion' | 'Sanitizer' | 'Broadcast';

interface ScentProfile {
  name: string;
  hex: string;
  description: string;
  flavorProfile: string;
  scentProfile: string;
  molecularStructure: string;
  frequencies: number[];
}

interface ScentLayer {
  id: string;
  profile: ScentProfile;
  prominence: number;
}

export default function App() {
  const [isInhaling, setIsInhaling] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Inhaler');
  const [customInput, setCustomInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scentLayers, setScentLayers] = useState<ScentLayer[]>([]);
  const [potency, setPotency] = useState(5);
  const [vaporIntensity, setVaporIntensity] = useState(5);
  const [isVaporMode, setIsVaporMode] = useState(false);
  const [isHardcore, setIsHardcore] = useState(false);
  const [coilTemp, setCoilTemp] = useState(60);
  const [cleansingProgress, setCleansingProgress] = useState(0);
  const [stainProgress, setStainProgress] = useState(0);
  const [debrisProgress, setDebrisProgress] = useState(0);
  const [hydrationProgress, setHydrationProgress] = useState(0);
  const [exfoliationProgress, setExfoliationProgress] = useState(0);
  const [vitaminProgress, setVitaminProgress] = useState(0);
  
  const [hasStain, setHasStain] = useState(false);
  const [hasDebris, setHasDebris] = useState(false);
  const [hasHydration, setHasHydration] = useState(false);
  const [hasExfoliation, setHasExfoliation] = useState(false);
  const [hasVitamins, setHasVitamins] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [showFrequencies, setShowFrequencies] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const generateCustomScent = async () => {
    if (!customInput.trim()) return;
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate an EXTREMELY POTENT molecular sensory profile for the following compound/flavor: "${customInput}". 
        The delivery method is "${deliveryMethod}".
        The potency level is ${potency}/50. 
        ${isHardcore ? "HARDCORE MODE IS ACTIVE: Make the flavor and scent descriptions overwhelming, intense, and hyper-saturated. The molecular structure should be complex and dense." : ""}
        
        The profile must include:
        - A name for the scent/flavor.
        - A hex color code representing its visual aura.
        - A short poetic description.
        - A detailed flavor profile (how it would taste if inhaled or applied).
        - A detailed scent profile (how it would smell in the air or on skin).
        - A simulated "Molecular Structure" string (e.g., C10H15N or O3-Lattice).
        - An array of 4 frequencies (in Hz) that represent the "molecular resonance" of this compound (between 100Hz and 1000Hz). 
          For healing/wellness methods (Lotion, Conditioner, Shampoo, BodyWash), prefer Solfeggio frequencies like 174Hz, 285Hz, 396Hz, 417Hz, 528Hz, 639Hz, 741Hz, 852Hz, or 963Hz.
        
        Tailor the description to the delivery method:
        - Inhaler: Focus on lung absorption and instant calm.
        - Vape: Focus on thick, flavorful vapor clouds, intense throat hit, and immediate flavor saturation.
        - Cologne/Perfume: Focus on skin contact, sillage, and top/middle/base notes.
        - Laundry: Focus on fabric penetration, long-lasting freshness, and aggressive lifting of molecular stains and debris.
        - BodyWash: Focus on lather, deep cleansing of odors/debris, exfoliating dead skin, and skin hydration.
        - Shampoo: Focus on scalp cleansing, removing hair debris, deep hair hydration, and vitamin nourishment.
        - Sanitizer: Focus on sterilization, germ-killing, and a sharp, clinical freshness.
        - Lotion: Focus on skin absorption, deep hydration, vitamin nourishment, and a smooth, lingering scent.
        - Conditioner: Focus on hair texture, deep hydration, silkiness, and vitamin infusion.
        - Broadcast: Focus on spatial resonance and environmental saturation.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hex: { type: Type.STRING },
              description: { type: Type.STRING },
              flavorProfile: { type: Type.STRING },
              scentProfile: { type: Type.STRING },
              molecularStructure: { type: Type.STRING },
              frequencies: { 
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
              }
            },
            required: ["name", "hex", "description", "flavorProfile", "scentProfile", "molecularStructure", "frequencies"]
          }
        }
      });

      const profile = JSON.parse(response.text) as ScentProfile;
      const newLayer: ScentLayer = {
        id: Math.random().toString(36).substr(2, 9),
        profile,
        prominence: 1.0
      };
      
      setScentLayers(prev => [...prev, newLayer]);
      
      // Reset all flags first
      setHasStain(false); setHasDebris(false); setHasHydration(false); setHasExfoliation(false); setHasVitamins(false);
      setStainProgress(0); setDebrisProgress(0); setHydrationProgress(0); setExfoliationProgress(0); setVitaminProgress(0);
      
      if (deliveryMethod === 'Laundry') {
        setHasStain(true); setHasDebris(true);
      } else if (deliveryMethod === 'BodyWash') {
        setHasStain(true); setHasDebris(true); setHasExfoliation(true); setHasHydration(true);
      } else if (deliveryMethod === 'Shampoo') {
        setHasDebris(true); setHasHydration(true); setHasVitamins(true);
      } else if (deliveryMethod === 'Conditioner' || deliveryMethod === 'Lotion') {
        setHasHydration(true); setHasVitamins(true);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop any existing audio first
    stopAudio(true);

    // Master Gain
    const masterBus = ctx.createGain(); // Will route into compressor
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    
    // Delivery Method Envelope
    let attackTime = 3;
    let targetGain = 0.6 * (1 + (vaporIntensity / 10)) * (isHardcore ? 2 : 1); // Boost gain for hardcore
    
    if (deliveryMethod === 'Cologne' || deliveryMethod === 'Perfume') {
      attackTime = 0.5; // Quick splash/spray
      targetGain = 0.4;
    } else if (deliveryMethod === 'Vape') {
      attackTime = 0.8; // Coil heat-up
      targetGain = 1.8 * (1 + (vaporIntensity / 5)) * (isHardcore ? 3 : 1); // Massive gain for loud Vape
    } else if (deliveryMethod === 'Laundry') {
      attackTime = 5; // Slow soak
      targetGain = 0.3;
    } else if (deliveryMethod === 'BodyWash' || deliveryMethod === 'Shampoo') {
      attackTime = 2; // Lathering
      targetGain = 0.5;
    } else if (deliveryMethod === 'Sanitizer') {
      attackTime = 0.3; // Instant clinical spray
      targetGain = 0.4;
    } else if (deliveryMethod === 'Lotion') {
      attackTime = 4; // Thick, slow application
      targetGain = 0.35;
    } else if (deliveryMethod === 'Conditioner') {
      attackTime = 2.5; // Silky application
      targetGain = 0.45;
    } else if (deliveryMethod === 'Broadcast') {
      attackTime = 1; // Resonant spread
      targetGain = 0.7;
    }
    
    masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + attackTime);
    
    // Vapor Saturation / Distortion
    let saturationNode: WaveShaperNode | null = null;
    if (isVaporMode || isHardcore) {
      saturationNode = ctx.createWaveShaper();
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      const k = (vaporIntensity * 10) * (isHardcore ? 5 : 1); // Massive saturation for hardcore
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      saturationNode.curve = curve;
      saturationNode.oversample = '4x';
    }

    // Analyser for real-time visualization
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Hard Brickwall Compressor to allow extreme gain without shutting down audio context
    const dynamicsCompressor = ctx.createDynamicsCompressor();
    dynamicsCompressor.threshold.value = -12;
    dynamicsCompressor.knee.value = 0;
    dynamicsCompressor.ratio.value = 20;
    dynamicsCompressor.attack.value = 0.001;
    dynamicsCompressor.release.value = 0.1;
    
    if (saturationNode) {
      masterGain.connect(saturationNode);
      saturationNode.connect(masterBus);
    } else {
      masterGain.connect(masterBus);
    }

    masterBus.connect(dynamicsCompressor);
    dynamicsCompressor.connect(analyser);
    analyser.connect(ctx.destination);
    
    gainNodeRef.current = masterGain;
    
    // Start Visualizer
    startVisualizer();

    // Filter to simulate breath/application opening
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(isVaporMode ? 8000 : 2000, ctx.currentTime + attackTime + 1);
    filter.connect(masterGain);

    // Frequencies from active layers
    scentLayers.forEach((layer) => {
      const freqs = layer.profile.frequencies;
      const layerGain = ctx.createGain();
      layerGain.gain.value = layer.prominence;
      layerGain.connect(filter);

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const panner = ctx.createStereoPanner();
        
        // Binaural/Resonant Sound Technology:
        // Apply a slight frequency offset between channels for entrainment simulation
        const binauralOffset = 4.5; // Theta wave offset
        const channelFreq = i % 2 === 0 ? freq : freq + binauralOffset;

        if (deliveryMethod === 'Laundry') {
          osc.type = 'triangle';
        } else if (deliveryMethod === 'Broadcast') {
          osc.type = 'sawtooth'; // Richer harmonics for "spreading"
        } else if (deliveryMethod === 'Sanitizer') {
          osc.type = 'square'; // Harsh, clinical resonance
        } else if (deliveryMethod === 'Conditioner' || deliveryMethod === 'Shampoo') {
          osc.type = 'triangle'; // Silky harmonics
        } else {
          osc.type = 'sine';
        }

        // Vapor Intensity Harmonics
        if (isVaporMode || isHardcore) {
          const harmonic = ctx.createOscillator();
          harmonic.type = isHardcore ? 'sawtooth' : 'sawtooth';
          harmonic.frequency.value = channelFreq * 2;
          const hGain = ctx.createGain();
          hGain.gain.value = 0.05 * (vaporIntensity / 10) * (isHardcore ? 3 : 1);
          harmonic.connect(hGain);
          hGain.connect(layerGain);
          harmonic.start();
          oscillatorsRef.current.push(harmonic);

          if (isHardcore) {
            const subHarmonic = ctx.createOscillator();
            subHarmonic.type = 'square';
            subHarmonic.frequency.value = channelFreq / 2;
            const shGain = ctx.createGain();
            shGain.gain.value = 0.02 * (vaporIntensity / 10);
            subHarmonic.connect(shGain);
            shGain.connect(layerGain);
            subHarmonic.start();
            oscillatorsRef.current.push(subHarmonic);
          }
        }

        osc.frequency.value = channelFreq;
        
        // Add a little detune for a chorus effect
        osc.detune.value = (Math.random() - 0.5) * 15;

        panner.pan.value = (i / freqs.length) * 2 - 1;

        osc.connect(panner);
        panner.connect(layerGain);
        osc.start();
        oscillatorsRef.current.push(osc);
      });
    });

    // Default chord if no layers
    if (scentLayers.length === 0) {
      const defaultFreqs = [174.61, 220.00, 261.63, 329.63];
      defaultFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        osc.connect(filter);
        osc.start();
        oscillatorsRef.current.push(osc);
      });
    }
    
    // Add some "texture" noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    
    // Adjust noise for delivery method
    let noiseFreq = 400;
    if (deliveryMethod === 'BodyWash' || deliveryMethod === 'Shampoo') noiseFreq = 800; // Bubbles
    if (deliveryMethod === 'Sanitizer') noiseFreq = 2500; // High-freq sterile hiss
    if (deliveryMethod === 'Lotion') noiseFreq = 200; // Low, smooth rub
    if (deliveryMethod === 'Conditioner') noiseFreq = 600; // Silky flow
    if (deliveryMethod === 'Cologne') noiseFreq = 1500; // Sharp spray
    if (deliveryMethod === 'Vape') noiseFreq = 1200; // Airflow hiss
    
    noiseFilter.frequency.setValueAtTime(noiseFreq, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(noiseFreq * 3, ctx.currentTime + attackTime + 1);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = deliveryMethod === 'Vape' 
      ? 0.15 * (isHardcore ? 2 : 1) * (1 + (vaporIntensity / 10)) 
      : deliveryMethod === 'Inhaler' ? 0.03 : 0.05;
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    
    oscillatorsRef.current.push(noise);

    // Sub-Bass Grounding Layer (7.83Hz Schumann Resonance Simulation)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = 60; // Audible sub
    const subLFO = ctx.createOscillator();
    subLFO.frequency.value = 7.83; // Schumann modulation
    const subGain = ctx.createGain();
    subGain.gain.value = 0.05;
    subLFO.connect(subGain.gain);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    subLFO.start();
    oscillatorsRef.current.push(subOsc, subLFO);

    // Vape Fumes, Warmth & Crackle Effect
    if (deliveryMethod === 'Vape' || isHardcore) {
      // Warmth Body Oscillator (Throat Hit & Fume Thickness)
      const warmthOsc = ctx.createOscillator();
      warmthOsc.type = 'triangle';
      warmthOsc.frequency.value = 100 + coilTemp; // 120Hz to 200Hz
      const warmthGain = ctx.createGain();
      warmthGain.gain.value = (coilTemp / 100) * 0.6 * (1 + (vaporIntensity / 10));
      
      const warmthFilter = ctx.createBiquadFilter();
      warmthFilter.type = 'lowpass';
      warmthFilter.frequency.value = 400 + (coilTemp * 2);
      warmthOsc.connect(warmthFilter);
      warmthFilter.connect(masterGain);
      warmthOsc.start();
      oscillatorsRef.current.push(warmthOsc);

      // Hot Crackle
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const crackleData = crackleBuffer.getChannelData(0);
      for (let i = 0; i < crackleBuffer.length; i++) {
        if (Math.random() > (isHardcore ? 0.80 : 0.90)) {
          crackleData[i] = Math.random() * 2 - 1;
        }
      }
      const crackle = ctx.createBufferSource();
      crackle.buffer = crackleBuffer;
      crackle.loop = true;
      const crackleGain = ctx.createGain();
      crackleGain.gain.value = (isHardcore ? 0.8 : 0.4) * (1 + (vaporIntensity / 5)) * (1 + (coilTemp / 100));
      
      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'bandpass';
      crackleFilter.frequency.value = 2000 + (coilTemp * 30); // Hotter = sharper crackle

      crackle.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(masterGain);
      crackle.start();
      oscillatorsRef.current.push(crackle);
    }

    // Healing / Hydration LFO
    if (hasHydration || hasVitamins) {
      const healLFO = ctx.createOscillator();
      healLFO.type = 'sine';
      healLFO.frequency.value = 0.5; // 0.5Hz slow pulse
      
      const healGain = ctx.createGain();
      healGain.gain.value = 0.15;
      
      healLFO.connect(healGain);
      healGain.connect(masterGain.gain);
      healLFO.start();
      oscillatorsRef.current.push(healLFO);
    }

    // Turbo Scrubbing Effect
    if (isTurbo && (deliveryMethod === 'Laundry' || deliveryMethod === 'BodyWash' || deliveryMethod === 'Shampoo')) {
      const scrubOsc = ctx.createOscillator();
      scrubOsc.type = 'square';
      scrubOsc.frequency.setValueAtTime(50, ctx.currentTime);
      
      const scrubLFO = ctx.createOscillator();
      scrubLFO.type = 'sine';
      scrubLFO.frequency.value = 8; // 8Hz scrubbing rhythm
      
      const scrubGain = ctx.createGain();
      scrubGain.gain.value = 0.1;
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 40; // Frequency modulation depth
      
      scrubLFO.connect(lfoGain);
      lfoGain.connect(scrubOsc.frequency);
      scrubOsc.connect(scrubGain);
      scrubGain.connect(masterGain);
      
      scrubOsc.start();
      scrubLFO.start();
      oscillatorsRef.current.push(scrubOsc, scrubLFO);
    }
  };

  const startVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      const baseColor = scentLayers.length > 0 ? scentLayers[0].profile.hex : '#4f46e5';

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / (isVaporMode ? 1.5 : 2);
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = isVaporMode ? 0.8 : 0.5;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const stopAudio = (immediate = false) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioCtxRef.current && gainNodeRef.current) {
      const ctx = audioCtxRef.current;
      
      if (immediate) {
        gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
        cleanupOscillators();
      } else {
        // Slow release
        gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
        
        // Stop oscillators after fade out
        setTimeout(() => {
          cleanupOscillators();
        }, 4000);
      }
    }
  };

  const cleanupOscillators = () => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch (e) {}
      try { osc.disconnect(); } catch (e) {}
    });
    oscillatorsRef.current = [];
  };

  // Cleansing, Stain, Debris, Hydration, Exfoliation & Vitamin Logic
  useEffect(() => {
    let interval: number;
    const activeMethods = ['BodyWash', 'Sanitizer', 'Laundry', 'Shampoo', 'Conditioner', 'Lotion'];
    if (isInhaling && activeMethods.includes(deliveryMethod)) {
      const speedMultiplier = (isTurbo ? 2.5 : 1) * (1 + (vaporIntensity / 10));
      
      interval = window.setInterval(() => {
        let allDone = true;

        setCleansingProgress(prev => {
          const next = Math.min(100, prev + 2 * speedMultiplier);
          if (next < 100) allDone = false;
          return next;
        });
        
        if (hasStain) {
          setStainProgress(prev => {
            const next = Math.min(100, prev + 1.5 * speedMultiplier);
            if (next < 100) allDone = false;
            else setHasStain(false);
            return next;
          });
        }

        if (hasDebris) {
          setDebrisProgress(prev => {
            const next = Math.min(100, prev + 3 * speedMultiplier); // Debris wipes off faster
            if (next < 100) allDone = false;
            else setHasDebris(false);
            return next;
          });
        }

        if (hasExfoliation) {
          setExfoliationProgress(prev => {
            const next = Math.min(100, prev + 1.8 * speedMultiplier);
            if (next < 100) allDone = false;
            else setHasExfoliation(false);
            return next;
          });
        }

        if (hasHydration) {
          setHydrationProgress(prev => {
            const next = Math.min(100, prev + 1.2 * speedMultiplier); // Hydration takes longer
            if (next < 100) allDone = false;
            else setHasHydration(false);
            return next;
          });
        }

        if (hasVitamins) {
          setVitaminProgress(prev => {
            const next = Math.min(100, prev + 1.4 * speedMultiplier);
            if (next < 100) allDone = false;
            else setHasVitamins(false);
            return next;
          });
        }

        if (allDone && scentLayers.length > 0) {
          setScentLayers([]);
          setCustomInput('');
        }
      }, 100);
    } else if (!isInhaling) {
      setCleansingProgress(0);
      if (!hasStain) setStainProgress(0);
      if (!hasDebris) setDebrisProgress(0);
      if (!hasExfoliation) setExfoliationProgress(0);
      if (!hasHydration) setHydrationProgress(0);
      if (!hasVitamins) setVitaminProgress(0);
    }
    return () => clearInterval(interval);
  }, [isInhaling, deliveryMethod, scentLayers, hasStain, hasDebris, hasExfoliation, hasHydration, hasVitamins, isTurbo, vaporIntensity, isHardcore, coilTemp]);

  const downloadProfile = () => {
    if (scentLayers.length === 0) return;
    const data = JSON.stringify(scentLayers, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurasense-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePressIn = (e: React.PointerEvent) => {
    // Prevent default to avoid text selection or other default behaviors
    e.preventDefault();
    setIsInhaling(true);
    setHasStarted(true);
    startAudio();
  };

  const handlePressOut = (e: React.PointerEvent) => {
    e.preventDefault();
    if (isInhaling) {
      setIsInhaling(false);
      stopAudio();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio(true);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 overflow-hidden relative selection:bg-transparent">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none flex items-center justify-center">
        <motion.div 
          className="w-[600px] h-[600px] rounded-full blur-[100px]"
          style={{ backgroundColor: scentLayers.length > 0 ? scentLayers[0].profile.hex : '#4f46e5' }}
          animate={{
            scale: isInhaling ? 1.5 : 1,
            opacity: isInhaling ? 0.6 : 0.2,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </div>

      <div className="z-10 flex flex-col items-center max-w-2xl w-full px-6 text-center py-12 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light tracking-tight mb-2 text-indigo-100">AuraSense</h1>
          <p className="text-slate-400 font-light text-sm italic">Molecular Frequency Architect</p>
        </motion.div>

        {/* Custom Architect Section */}
        <div className="w-full bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/5 mb-8 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { id: 'Inhaler', icon: Wind, label: 'Inhaler' },
                { id: 'Vape', icon: Zap, label: 'Vape' },
                { id: 'Cologne', icon: Zap, label: 'Cologne' },
                { id: 'Perfume', icon: Sparkles, label: 'Perfume' },
                { id: 'Laundry', icon: Shirt, label: 'Laundry' },
                { id: 'BodyWash', icon: Bath, label: 'Body Wash' },
                { id: 'Shampoo', icon: Sparkles, label: 'Shampoo' },
                { id: 'Conditioner', icon: Waves, label: 'Conditioner' },
                { id: 'Lotion', icon: Hand, label: 'Lotion' },
                { id: 'Sanitizer', icon: ShieldCheck, label: 'Sanitizer' },
                { id: 'Broadcast', icon: Zap, label: 'Broadcast' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setDeliveryMethod(method.id as DeliveryMethod)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border",
                    deliveryMethod === method.id 
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200" 
                      : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                  )}
                >
                  <method.icon className="w-3.5 h-3.5" />
                  {method.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Describe flavor, compound, or scent..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all pr-12"
                onKeyDown={(e) => e.key === 'Enter' && generateCustomScent()}
              />
              <button
                onClick={generateCustomScent}
                disabled={isGenerating || !customInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2 text-left">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <span>Molecular Potency</span>
                  <span>{potency}/50</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={potency}
                  onChange={(e) => setPotency(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsHardcore(!isHardcore)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300 border",
                    isHardcore ? "bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                  )}
                  title="Hardcore Mode"
                >
                  <Flame className={cn("w-4 h-4", isHardcore && "fill-current")} />
                </button>

                <button
                  onClick={() => setShowFrequencies(!showFrequencies)}
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300 border",
                    showFrequencies ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                  )}
                  title="Frequency Analysis"
                >
                  <Activity className="w-4 h-4" />
                </button>

                {(deliveryMethod === 'Laundry' || deliveryMethod === 'BodyWash' || deliveryMethod === 'Shampoo') && (
                  <button
                    onClick={() => setIsTurbo(!isTurbo)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-300 border",
                      isTurbo 
                        ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                        : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                    )}
                    title="Turbo Scrub"
                  >
                    <Zap className={cn("w-4 h-4", isTurbo && "fill-current")} />
                  </button>
                )}
              </div>
            </div>

            {/* Vapor Mode Controls */}
            {deliveryMethod === 'Vape' && (
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex-1 space-y-2 text-left">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    <span>Coil Warmth / Fume Density</span>
                    <span className={cn(coilTemp > 80 ? "text-red-400" : coilTemp > 50 ? "text-orange-400" : "text-cyan-400")}>{Math.round(coilTemp)}°C</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={coilTemp}
                    onChange={(e) => setCoilTemp(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: coilTemp > 80 ? '#ef4444' : coilTemp > 50 ? '#f97316' : '#06b6d4' }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2 text-left">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <span>Vapor Intensity</span>
                  <span className={vaporIntensity > 30 ? "text-red-500 animate-pulse" : ""}>{vaporIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={vaporIntensity}
                  onChange={(e) => setVaporIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadProfile}
                  disabled={scentLayers.length === 0}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:bg-white/10 disabled:opacity-30 transition-all"
                  title="Download Profile"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsVaporMode(!isVaporMode)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                    isVaporMode 
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                      : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                  )}
                >
                  <Wind className={cn("w-3 h-3", isVaporMode && "animate-pulse")} />
                  Vapor Mode
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFrequencies && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-bold">Real-Time Frequency Analysis</span>
                      <div className="flex gap-2">
                        {scentLayers.length > 0 && scentLayers[0].profile.frequencies.map((f, i) => (
                          <span key={i} className="text-[9px] font-mono text-slate-400">{f.toFixed(1)}Hz</span>
                        ))}
                      </div>
                    </div>
                    <canvas 
                      ref={canvasRef} 
                      width={400} 
                      height={60} 
                      className="w-full h-[60px] rounded-lg bg-black/20"
                    />
                    <div className="mt-2 flex justify-between text-[8px] text-slate-600 font-mono uppercase tracking-tighter">
                      <span>20Hz</span>
                      <span>Binaural Offset: 4.5Hz (Theta)</span>
                      <span>Schumann: 7.83Hz</span>
                      <span>20kHz</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {['BodyWash', 'Sanitizer', 'Laundry', 'Shampoo', 'Conditioner', 'Lotion'].includes(deliveryMethod) && scentLayers.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-emerald-500 font-bold items-center gap-2">
                    <div className="flex items-center gap-1"><Droplets className="w-2.5 h-2.5" /> {['Laundry', 'BodyWash', 'Shampoo'].includes(deliveryMethod) ? 'Cleansing Progress' : 'Application Progress'}</div>
                    <span>{Math.round(cleansingProgress)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${cleansingProgress}%` }}
                    />
                  </div>
                </div>

                {hasStain && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-amber-500 font-bold items-center gap-2">
                      <div className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Stain Removal</div>
                      <span>{Math.round(stainProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-amber-500" initial={{ width: 0 }} animate={{ width: `${stainProgress}%` }} />
                    </div>
                  </div>
                )}

                {hasDebris && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-blue-500 font-bold items-center gap-2">
                      <div className="flex items-center gap-1"><Trash2 className="w-2.5 h-2.5" /> Debris Removal</div>
                      <span>{Math.round(debrisProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${debrisProgress}%` }} />
                    </div>
                  </div>
                )}

                {hasExfoliation && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-rose-400 font-bold items-center gap-2">
                      <div className="flex items-center gap-1"><Activity className="w-2.5 h-2.5" /> Exfoliating Dead Skin</div>
                      <span>{Math.round(exfoliationProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-rose-400" initial={{ width: 0 }} animate={{ width: `${exfoliationProgress}%` }} />
                    </div>
                  </div>
                )}

                {hasHydration && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-cyan-400 font-bold items-center gap-2">
                      <div className="flex items-center gap-1"><Droplets className="w-2.5 h-2.5" /> Deep Hydration</div>
                      <span>{Math.round(hydrationProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-cyan-400" initial={{ width: 0 }} animate={{ width: `${hydrationProgress}%` }} />
                    </div>
                  </div>
                )}

                {hasVitamins && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-yellow-400 font-bold items-center gap-2">
                      <div className="flex items-center gap-1"><Sun className="w-2.5 h-2.5" /> Vitamin Infusion</div>
                      <span>{Math.round(vitaminProgress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-yellow-400" initial={{ width: 0 }} animate={{ width: `${vitaminProgress}%` }} />
                    </div>
                  </div>
                )}
                
                <p className="text-[9px] text-slate-500 italic">
                  {deliveryMethod === 'Laundry' ? 'Hold to deep clean active odors and lift molecular stains/debris from fabric resonance.' : 
                   deliveryMethod === 'BodyWash' ? 'Hold to wash off odors/debris, exfoliate dead skin, and hydrate skin resonance.' :
                   deliveryMethod === 'Shampoo' ? 'Hold to cleanse scalp, remove debris, hydrate hair, and infuse vitamins.' :
                   deliveryMethod === 'Conditioner' || deliveryMethod === 'Lotion' ? 'Hold to deeply hydrate and infuse nourishing vitamins via sound resonance.' :
                   'Hold to apply and sanitize.'}
                </p>
              </div>
            )}
          </div>

          {scentLayers.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Active Molecular Layers</span>
                <button 
                  onClick={() => setScentLayers([])}
                  className="text-[9px] text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest font-bold"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                {scentLayers.map((layer) => (
                  <div key={layer.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ backgroundColor: layer.profile.hex }} />
                        <span className="text-sm font-medium text-indigo-100">{layer.profile.name}</span>
                        <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-slate-500">
                          {layer.profile.molecularStructure}
                        </span>
                      </div>
                      <button 
                        onClick={() => setScentLayers(prev => prev.filter(l => l.id !== layer.id))}
                        className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter w-16">Prominence</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={layer.prominence}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setScentLayers(prev => prev.map(l => l.id === layer.id ? { ...l, prominence: val } : l));
                        }}
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-400"
                      />
                      <span className="text-[10px] text-indigo-400 font-mono w-8 text-right font-bold">{Math.round(layer.prominence * 100)}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-slate-600 font-bold">Flavor</span>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{layer.profile.flavorProfile}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-slate-600 font-bold">Scent</span>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{layer.profile.scentProfile}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center w-80 h-80 mb-8">
            {/* Breathing Circles */}
            {scentLayers.map((layer, idx) => (
              <motion.div
                key={layer.id}
                className="absolute inset-0 rounded-full border"
                style={{ 
                  backgroundColor: `${layer.profile.hex}10`,
                  borderColor: `${layer.profile.hex}20`,
                  zIndex: scentLayers.length - idx
                }}
                animate={{
                  scale: isInhaling ? (1.2 + idx * 0.05) : (0.8 - idx * 0.05),
                  opacity: isInhaling ? layer.prominence : 0,
                  filter: (deliveryMethod === 'Vape' && isInhaling && vaporIntensity > 20) ? `blur(${vaporIntensity / 10}px) contrast(1.5)` : 'none'
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            ))}

          {/* The Delivery Device */}
          <motion.button
            onPointerDown={handlePressIn}
            onPointerUp={handlePressOut}
            onPointerLeave={handlePressOut}
            onPointerCancel={handlePressOut}
            className="relative z-20 w-40 h-48 cursor-pointer select-none touch-none group outline-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={(isTurbo || (deliveryMethod === 'Vape' && (vaporIntensity > 10 || isHardcore))) && isInhaling ? {
              x: [0, -4, 4, -4, 4, 0],
              y: [0, 4, -4, 4, -4, 0],
            } : {}}
            transition={(isTurbo || (deliveryMethod === 'Vape' && (vaporIntensity > 10 || isHardcore))) && isInhaling ? {
              duration: isHardcore ? 0.05 : 0.08,
              repeat: Infinity,
            } : {}}
          >
            {deliveryMethod === 'Inhaler' ? (
              <>
                {/* Canister */}
                <motion.div 
                  className="absolute top-0 left-8 w-16 h-28 bg-gradient-to-b from-slate-200 to-slate-400 rounded-t-2xl rounded-b-lg shadow-inner z-10 border border-slate-400/50"
                  animate={{ y: isInhaling ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-2xl" />
                </motion.div>
                {/* Main Body */}
                <div className="absolute bottom-0 left-4 w-24 h-32 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-3xl shadow-[0_10px_40px_rgba(79,70,229,0.4)] z-20 border border-indigo-400/30 overflow-hidden flex flex-col items-center pt-8">
                  <Wind className={cn(
                    "w-8 h-8 transition-all duration-1000 z-30",
                    isInhaling ? "text-white scale-110" : "text-indigo-300 scale-100"
                  )} />
                </div>
                {/* Mouthpiece */}
                <div className="absolute bottom-2 left-24 w-16 h-14 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-r-2xl shadow-xl z-10 border-y border-r border-indigo-400/30" />
              </>
            ) : deliveryMethod === 'Vape' ? (
              <div className="relative w-full h-full flex flex-col items-center justify-end pb-4">
                {/* Vape Mod */}
                <div className={cn(
                  "w-24 h-36 bg-gradient-to-b from-slate-800 to-black rounded-xl border transition-colors duration-500 shadow-2xl relative overflow-hidden",
                  isHardcore ? "border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]" : "border-white/10"
                )}>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-black/60 rounded border border-white/5 flex items-center justify-center">
                    <span className={cn("text-[10px] font-mono", isHardcore ? "text-orange-400" : "text-cyan-400")}>{vaporIntensity * 10}W</span>
                  </div>
                  {/* Fire Button */}
                  <motion.div 
                    className={cn(
                      "absolute top-16 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors",
                      isInhaling 
                        ? (isHardcore ? "border-orange-500 bg-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "border-cyan-500 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)]")
                        : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full", isInhaling ? (isHardcore ? "bg-orange-400" : "bg-cyan-400") : "bg-white/10")} />
                  </motion.div>
                </div>
                {/* Tank/Atomizer */}
                <div className="absolute bottom-36 w-16 h-16 bg-gradient-to-b from-slate-400 to-slate-600 rounded-t-lg border-x border-t border-white/20 flex flex-col items-center">
                  <div className="w-12 h-10 bg-black/40 border border-white/10 rounded mt-1 overflow-hidden relative">
                    {/* Coil Glow */}
                    {isInhaling && (
                      <motion.div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 blur-[2px]"
                        animate={{ 
                          opacity: [0.5, 1, 0.5],
                          scaleX: [1, 1.8, 1],
                          backgroundColor: coilTemp > 80 ? ['#ef4444', '#b91c1c', '#ef4444'] : coilTemp > 50 ? ['#f97316', '#ea580c', '#f97316'] : ['#06b6d4', '#0891b2', '#06b6d4']
                        }}
                        transition={{ duration: 0.15, repeat: Infinity }}
                      />
                    )}
                    {/* Juice Level */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-cyan-500/20" />
                  </div>
                  {/* Drip Tip */}
                  <div className="w-6 h-6 bg-slate-900 rounded-t-md border-x border-t border-white/10" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <motion.div 
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl border border-white/20"
                  animate={{
                    scale: isInhaling ? 1.1 : 1,
                    rotate: isInhaling ? 360 : 0,
                  }}
                  transition={{ duration: 4, ease: "linear", repeat: isInhaling ? Infinity : 0 }}
                >
                  {deliveryMethod === 'Cologne' || deliveryMethod === 'Perfume' ? <Droplets className="w-12 h-12 text-white" /> :
                   deliveryMethod === 'Laundry' ? <Shirt className="w-12 h-12 text-white" /> :
                   deliveryMethod === 'Broadcast' ? <Zap className="w-12 h-12 text-white" /> :
                   deliveryMethod === 'Sanitizer' ? <ShieldCheck className="w-12 h-12 text-white" /> :
                   deliveryMethod === 'Lotion' ? <Hand className="w-12 h-12 text-white" /> :
                   deliveryMethod === 'Conditioner' ? <Waves className="w-12 h-12 text-white" /> :
                   deliveryMethod === 'Shampoo' ? <Sparkles className="w-12 h-12 text-white" /> :
                   <Bath className="w-12 h-12 text-white" />}
                </motion.div>
              </div>
            )}

            {/* Audio Waves / Breath Visual / Vapor Clouds */}
            <AnimatePresence>
              {isInhaling && (
                <div className="absolute bottom-5 left-[165px] pointer-events-none">
                  {deliveryMethod === 'Vape' ? (
                    <div className="relative">
                      {[...Array(isHardcore ? 40 : 25)].map((_, i) => {
                        const isCore = i > (isHardcore ? 25 : 15);
                        return (
                        <motion.div
                          key={i}
                          className={cn(
                            "absolute blur-2xl rounded-full",
                            isCore ? (coilTemp > 80 ? "bg-red-600/30" : coilTemp > 50 ? "bg-orange-500/30" : "bg-cyan-400/30") : 
                            (isHardcore ? "bg-orange-200/50" : "bg-white/50")
                          )}
                          initial={{ width: 10, height: 10, x: 0, y: 0, opacity: 0 }}
                          animate={{ 
                            width: [10, (isHardcore ? 250 : 160) + i * 20], 
                            height: [10, (isHardcore ? 200 : 100) + i * 15], 
                            x: [0, (isHardcore ? 400 : 250) + i * 40], 
                            y: [0, (i - (isHardcore ? 20 : 12)) * 30], 
                            opacity: [0, isHardcore ? 0.9 : 0.7, 0] 
                          }}
                          transition={{ 
                            duration: isHardcore ? 1.5 : 2, 
                            repeat: Infinity, 
                            delay: i * 0.03,
                            ease: "easeOut"
                          }}
                        />
                      )})}
                    </div>
                  ) : (
                    <motion.div 
                      className="flex items-center gap-1.5"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 bg-indigo-300/60 rounded-full"
                          animate={{
                            height: [8, 24 + i * 4, 8],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="h-16 flex items-center justify-center mb-12">
          <AnimatePresence mode="wait">
            {isInhaling ? (
              <motion.p
                key="inhale"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-light text-indigo-200 tracking-[0.2em]"
              >
                {deliveryMethod === 'Inhaler' ? 'Inhaling...' : 
                 deliveryMethod === 'Vape' ? 'Vaping...' :
                 deliveryMethod === 'Laundry' ? (cleansingProgress < 100 || hasStain || hasDebris ? 'Washing...' : 'Purified!') :
                 deliveryMethod === 'BodyWash' ? (cleansingProgress < 100 || hasStain || hasDebris || hasExfoliation || hasHydration ? 'Cleansing & Hydrating...' : 'Purified & Glowing!') : 
                 deliveryMethod === 'Shampoo' ? (cleansingProgress < 100 || hasDebris || hasHydration || hasVitamins ? 'Washing Hair...' : 'Nourished & Clean!') :
                 deliveryMethod === 'Sanitizer' ? (cleansingProgress < 100 ? 'Sanitizing...' : 'Sterilized!') :
                 deliveryMethod === 'Lotion' ? (cleansingProgress < 100 || hasHydration || hasVitamins ? 'Applying Lotion...' : 'Skin Hydrated!') :
                 deliveryMethod === 'Conditioner' ? (cleansingProgress < 100 || hasHydration || hasVitamins ? 'Conditioning...' : 'Hair Silky & Hydrated!') :
                 deliveryMethod === 'Broadcast' ? 'Broadcasting...' : 'Applying...'}
              </motion.p>
            ) : hasStarted ? (
              <motion.p
                key="exhale"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-light text-slate-400 tracking-[0.2em]"
              >
                {deliveryMethod === 'Inhaler' || deliveryMethod === 'Vape' ? 'Exhale...' : 'Complete.'}
              </motion.p>
            ) : (
              <motion.p
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-light text-slate-500"
              >
                Press and hold to activate
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
