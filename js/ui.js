// js/ui.js

const showModal = (contentHTML) => {
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = contentHTML;
    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');

    // Add enter animation classes
    setTimeout(() => {
        modalContent.classList.remove('opacity-0', 'translate-y-4', 'scale-95');
        modalContent.classList.add('modal-enter');
    }, 10);
};

const hideModal = () => {
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');

    // Add leave animation classes
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-leave');

    setTimeout(() => {
        modalContainer.classList.add('hidden');
        modalContainer.classList.remove('flex');
        modalContent.classList.remove('modal-leave');
        modalContent.classList.add('opacity-0', 'translate-y-4', 'scale-95');
        modalContent.innerHTML = '';
    }, 200); // match standard css transition duration
};

const showInfoModal = () => {
    const html = `
        <div class="p-8 text-center">
            <h3 class="text-2xl font-bold text-slate-800 mb-6">Sobre o <span class="text-primary">Limbus</span></h3>
            <p class="text-slate-600 mb-2 text-lg">Criador: <strong class="text-slate-800">Guilherme Bardalho</strong></p>
            <p class="text-slate-600 mb-8 text-lg">Email para contato: <a href="mailto:guilhermevb2019@Outlook.com" class="text-primary hover:underline font-medium">guilhermevb2019@Outlook.com</a></p>
            <button onclick="hideModal()" class="bg-primary hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors shadow-sm">Fechar</button>
        </div>
    `;
    showModal(html);
};

window.showInfoModal = showInfoModal;
