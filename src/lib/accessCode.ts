// Gerador e Validador de Códigos de Acesso Offline (Algorítmico)
// Permite que os administradores gerem códigos válidos que funcionam em qualquer celular sem precisar de internet ou banco de dados.

export const validateAccessCode = (code: string): boolean => {
    code = code.toUpperCase();
    
    // Formato exigido: AGRO-XXXX-XXXX
    const regex = /^AGRO-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!regex.test(code)) return false;

    // Lógica Matemática: A soma da tabela ASCII dos 8 caracteres deve ser divisível por 13.
    const chars = code.replace(/-/g, '').substring(4); // Pega apenas o XXXX-XXXX
    let sum = 0;
    for (let i = 0; i < chars.length; i++) {
        sum += chars.charCodeAt(i);
    }
    
    return sum % 13 === 0;
}

export const generateAccessCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (true) {
        let p1 = '';
        let p2 = '';
        for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
        for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
        
        const code = `AGRO-${p1}-${p2}`;
        if (validateAccessCode(code)) {
            return code;
        }
    }
}
