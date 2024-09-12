document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const score = urlParams.get('score');
    const total = urlParams.get('total');

    const resultText = document.getElementById('result-text');

    if (resultText) {
        resultText.textContent = `Your final score is ${score} out of ${total}. Thank you for taking the quiz!`;
    }
});
