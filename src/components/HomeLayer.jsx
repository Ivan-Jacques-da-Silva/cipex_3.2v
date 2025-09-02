import React, { useState, useEffect } from 'react'
import SalesStatisticOne from './child/Carrousel';
import MenuHome from './child/MenuHome';
import BirthdayFireworks from './child/BirthdayFireworks';
import { API_BASE_URL } from './config';

const ElementoHome = () => {
    const [userBirthday, setUserBirthday] = useState(null);

    const checkIfBirthday = (birthDate) => {
        if (!birthDate) return false;

        const today = new Date();
        const birth = new Date(birthDate);

        // Extrair apenas dia e mês para comparação
        const todayDay = today.getDate();
        const todayMonth = today.getMonth(); // 0-11

        const birthDay = birth.getDate();
        const birthMonth = birth.getMonth(); // 0-11

        console.log('Hoje:', `${todayDay}/${todayMonth + 1}`);
        console.log('Aniversário:', `${birthDay}/${birthMonth + 1}`);

        return todayDay === birthDay && todayMonth === birthMonth;
    };

    useEffect(() => {
        const fetchUserBirthday = async () => {
            const userId = localStorage.getItem('userId');

            if (userId) {
                try {
                    const response = await fetch(`${API_BASE_URL}/aniversario/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        console.log('Dados do aniversário:', userData);

                        if (userData.cp_datanascimento) {
                            setUserBirthday(userData.cp_datanascimento);
                        }
                    } else {
                        console.error('Erro ao buscar dados do aniversário');
                    }
                } catch (error) {
                    console.error('Erro na requisição:', error);
                }
            }
        };

        fetchUserBirthday();
    }, []);

    return (
        <>
            {userBirthday && checkIfBirthday(userBirthday) && (
                <BirthdayFireworks 
                    userBirthday={userBirthday}
                    onComplete={() => console.log('Birthday fireworks completed!')}
                />
            )}

            <MenuHome />

            <section className="row gy-4 mt-1">
                <SalesStatisticOne />
            </section>
        </>
    )
}

export default ElementoHome