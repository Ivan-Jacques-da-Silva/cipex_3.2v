
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import './BirthdayFireworks.css';

const BirthdayFireworks = ({ userBirthday, onComplete }) => {
    const [showFireworks, setShowFireworks] = useState(false);

    const randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const basicConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const randomDirectionConfetti = () => {
        confetti({
            angle: randomInRange(55, 125),
            spread: randomInRange(50, 70),
            particleCount: randomInRange(50, 100),
            origin: { y: 0.6 }
        });
    };

    const makeItRainConfetti = () => {
        const end = Date.now() + (3 * 1000);
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff8787', '#a8e6cf', '#c7ceea'];

        function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }
        frame();
    };

    const startBirthdayCelebration = () => {
        // Sequência de confetes
        basicConfetti();
        
        setTimeout(() => {
            randomDirectionConfetti();
        }, 500);
        
        setTimeout(() => {
            makeItRainConfetti();
        }, 1000);
        
        setTimeout(() => {
            randomDirectionConfetti();
        }, 2500);
        
        setTimeout(() => {
            basicConfetti();
        }, 4000);
    };

    useEffect(() => {
        // Verificar se é aniversário hoje
        const today = new Date();
        const birthday = new Date(userBirthday);
        
        const isBirthday = today.getDate() === birthday.getDate() && 
                          today.getMonth() === birthday.getMonth();

        // Verificar se já foi mostrado hoje
        const lastShown = localStorage.getItem('birthday-fireworks-shown');
        const todayString = today.toDateString();

        if (isBirthday && lastShown !== todayString) {
            setShowFireworks(true);
            localStorage.setItem('birthday-fireworks-shown', todayString);

            // Iniciar celebração imediatamente
            startBirthdayCelebration();

            // Ocultar após 6 segundos
            const timer = setTimeout(() => {
                setShowFireworks(false);
                onComplete && onComplete();
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [userBirthday, onComplete]);

    if (!showFireworks) return null;

    return (
        <div className="birthday-fireworks-container">
            <div className="birthday-content">
                <div className="title">Let's partyyyyyy!</div>
                <div className="emoji-container">
                    <span className="emoji">🎉</span>
                    <span className="emoji">😎</span>
                    <span className="emoji">🎊</span>
                </div>
                <div className="birthday-message">
                    <h1>🎂 Happy Birthday! 🎂</h1>
                    <p>Hope your special day is amazing!</p>
                </div>
                <div className="button-container">
                    <button onClick={basicConfetti}>Basic</button>
                    <button onClick={randomDirectionConfetti}>Random direction</button>
                    <button onClick={makeItRainConfetti}>Make it rain</button>
                </div>
            </div>
        </div>
    );
};

export default BirthdayFireworks;
