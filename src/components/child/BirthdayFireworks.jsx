import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./BirthdayFireworks.css";

// Função para limpar os dados dos confetes (chamada no logout)
export const clearBirthdayFireworksSession = () => {
    // Limpa a flag de exibição da sessão atual
    sessionStorage.removeItem("birthday-fireworks-shown");
    // Limpa a flag de exibição do dia atual
    localStorage.removeItem("birthday-fireworks-shown");
};

const BirthdayFireworks = ({ userBirthday, onComplete }) => {
    const [showFireworks, setShowFireworks] = useState(false);
    const [userName, setUserName] = useState("");
    const [isInitialized, setIsInitialized] = useState(false);

    const randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const startBirthdayCelebration = () => {
        // Celebração única com confetes
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: [
                "#ff6b6b",
                "#4ecdc4",
                "#ffe66d",
                "#ff8787",
                "#a8e6cf",
                "#c7ceea",
            ],
        });

        // Confetes adicionais dos lados
        setTimeout(() => {
            confetti({
                particleCount: 100,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: [
                    "#ff6b6b",
                    "#4ecdc4",
                    "#ffe66d",
                    "#ff8787",
                    "#a8e6cf",
                    "#c7ceea",
                ],
            });
            confetti({
                particleCount: 100,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: [
                    "#ff6b6b",
                    "#4ecdc4",
                    "#ffe66d",
                    "#ff8787",
                    "#a8e6cf",
                    "#c7ceea",
                ],
            });
        }, 200);
    };

    useEffect(() => {
        if (userBirthday && !isInitialized) {
            // Verificar se é aniversário hoje
            const today = new Date();
            const birthday = new Date(userBirthday);

            const isBirthday = today.getDate() === birthday.getDate() &&
                              today.getMonth() === birthday.getMonth();

            // Verificar se já foi mostrado hoje
            const lastShown = localStorage.getItem('birthday-fireworks-shown');
            const todayString = today.toDateString();

            if (isBirthday && lastShown !== todayString) {
                const userDisplayName = localStorage.getItem('userName') || 'Friend';
                
                setUserName(userDisplayName);
                setShowFireworks(true);
                setIsInitialized(true);
                
                // Marcar como mostrado hoje
                localStorage.setItem('birthday-fireworks-shown', todayString);

                // Iniciar celebração imediatamente
                startBirthdayCelebration();

                // Ocultar após 8 segundos
                const timer = setTimeout(() => {
                    setShowFireworks(false);
                    onComplete && onComplete();
                }, 6000);

                return () => clearTimeout(timer);
            } else {
                setIsInitialized(true);
            }
        }
    }, [userBirthday, onComplete]);

    if (!showFireworks) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(220, 220, 220, 0.2)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 99999,
                pointerEvents: "auto",
            }}
        >
            <div
                style={{
                    color: "#333",
                    fontFamily: "Arial, sans-serif",
                    animation: "fadeInScale 2.5s ease-out",
                    textAlign: "center",
                }}
            >
                <h1
                    style={{
                        fontSize: "2.5rem",
                        margin: "0",
                        fontWeight: "bold",
                        textShadow:
                            "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                    }}
                >
                    Congratulations {userName}!
                </h1>
            </div>
        </div>
    );
};

export default BirthdayFireworks;
