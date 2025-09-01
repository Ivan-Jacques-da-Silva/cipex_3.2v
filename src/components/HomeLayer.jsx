import React, { useState, useEffect } from 'react'
import SalesStatisticOne from './child/Carrousel';
import MenuHome from './child/MenuHome';
import BirthdayFireworks from './child/BirthdayFireworks';

const ElementoHome = () => {
    const [userBirthday, setUserBirthday] = useState(null);

    useEffect(() => {
        // SISTEMA FORÇADO PARA TESTE - REMOVER DEPOIS
        // Limpa o localStorage para permitir mostrar novamente
        localStorage.removeItem('birthday-fireworks-shown');
        
        // Define a data de aniversário como hoje para forçar o teste
        setUserBirthday(new Date().toISOString().split('T')[0]);
        
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