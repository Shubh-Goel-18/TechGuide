document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const panes = document.querySelectorAll('.tab-pane');
    const languageSelect = document.getElementById('language');

    // Function to switch tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-tab');
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === target) pane.classList.add('active');
            });
        });
    });

    // Event listener for language selection
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        updateSolutionContent(activeTab, selectedLanguage);
    });

    // Function to update the solution content based on the selected language and tab
    function updateSolutionContent(tabId, language) {
        const solution = window.algorithm.solutions[tabId][language];
        if (solution) {
            document.getElementById(`${tabId}-solution`).textContent = solution.code;
            document.getElementById(`${tabId}-explanation`).textContent = solution.explanation;
        }
    }

    // Initialize the page with the default tab and language
    updateSolutionContent('brute-force', languageSelect.value);
});
