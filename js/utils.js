// js/utils.js

const formatCPF = (cpf) => {
    return cpf.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const formatCNPJ = (cnpj) => {
    return cnpj.replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const formatDateExtenso = (city, uf) => {
    const data = new Date();
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    // Formato exato: Palhoça - SC, "__" de "_________" de 2026.
    const currentDay = data.getDate().toString().padStart(2, '0');
    return `${city} - ${uf}, "${currentDay}" de "${meses[data.getMonth()]}" de ${data.getFullYear()}.`;
};

const formatInputDate = (htmlDate) => {
    if (!htmlDate) return "";
    const [year, month, day] = htmlDate.split('-');
    return `${day}/${month}/${year}`;
};

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const normalizeText = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};



