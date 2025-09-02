import React, { useState, useEffect } from 'react'
import SalesStatisticOne from './child/Carrousel';
import MenuHome from './child/MenuHome';
import BirthdayFireworks from './child/BirthdayFireworks';

const ElementoHome = () => {
    const [userBirthday, setUserBirthday] = useState(null);

    useEffect(() => {
        // SISTEMA FORÇADO PARA TESTE - Sempre mostra os confetes
        // Limpa o sessionStorage para permitir mostrar novamente
        sessionStorage.removeItem('birthday-fireworks-shown-session');
        
        // Define uma data qualquer para forçar o teste
        setUserBirthday('2025-09-01');
        
        // CÓDIGO ORIGINAL COMENTADO PARA TESTE:
        // const userData = localStorage.getItem('userData');
        // if (userData) {
        //     const user = JSON.parse(userData);
        //     if (user.cp_data_nascimento) {
        //         setUserBirthday(user.cp_data_nascimento);
        //     }
        // }
    }, []);

    return (
        <>
            {userBirthday && (
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