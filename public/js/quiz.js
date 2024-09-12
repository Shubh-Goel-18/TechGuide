document.addEventListener('DOMContentLoaded', () => {
    const questionsData = window.questionsData;
    const language = window.language; // Retrieve the language from the global variable

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
        console.error('Questions data is not available or is empty.');
        return;
    }

    let currentQuestionIndex = 0;
    let score = 0;

    const questionContainer = document.getElementById('question-container');
    const nextButton = document.getElementById('next-btn');

    if (!questionContainer || !nextButton) {
        console.error('Required elements not found in the DOM.');
        return;
    }

    function showQuestion() {
        const question = questionsData[currentQuestionIndex];

        if (!question) {
            console.error('Question data is not available for index:', currentQuestionIndex);
            return;
        }

        questionContainer.innerHTML = `
            <h2>${question.question}</h2>
            <ul class="options-list">
                ${question.options.map((option, index) => `
                    <li class="option-item"><input type="radio" name="option" value="${index}"> ${option}</li>
                `).join('')}
            </ul>
        `;
    }

    function getSelectedOption() {
        const selected = document.querySelector('input[name="option"]:checked');
        return selected ? parseInt(selected.value, 10) : null;
    }

    nextButton.addEventListener('click', () => {
        const selectedOption = getSelectedOption();

        if (selectedOption !== null) {
            const currentQuestion = questionsData[currentQuestionIndex];

            if (currentQuestion) {
                if (selectedOption === currentQuestion.options.indexOf(currentQuestion.answer)) {
                    score++;
                }
                currentQuestionIndex++;
                if (currentQuestionIndex < questionsData.length) {
                    showQuestion();
                } else {
                    // Redirect to result page with score using a query string
                    window.location.href = `/result?score=${score}&total=${questionsData.length}&language=${language}`;
                }
            } else {
                console.error('Current question data is not available.');
            }
        } else {
            alert('Please select an option before moving to the next question.');
        }
    });

    showQuestion();
});
