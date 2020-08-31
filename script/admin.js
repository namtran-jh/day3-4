// acronym { QA: Question and Answer }
const adminPageHtmlElement = {
    htmlOfListItemQA: "",
    correctSymbol: `<span class="symbolOfCorrectAnswer">&#10004;</span>`,
    incorrectSymbol: `<span class="symbolOfIncorrectAnswer">&#10008;</span>`
};

const typeQAConfig = {
    WH_QUESTION: "WH_QUESTION",
    SINGLE_CHOICE_QUESTION: "SINGLE_CHOICE_QUESTION",
    MULTIPLE_CHOICES_QUESTION: "MULTIPLE_CHOICES_QUESTION"
};

(function loadAdminPage() {
    const allAnswerData = loadAllAnswerDataFromLocalStorage();
    allAnswerData.forEach((item, index) => {
        if (item.type === typeQAConfig.WH_QUESTION) loadAnswerOfWhQuestionToUI(index, item);
        else if (item.type === typeQAConfig.SINGLE_CHOICE_QUESTION) loadAnswerOfSingleChoiceQuestionToUI(index, item);
        else if (item.type === typeQAConfig.MULTIPLE_CHOICES_QUESTION) loadAnswerOfMultipleChoicesQuestionToUI(index, item);
    });
    document.getElementById("listOfItemQA").innerHTML = adminPageHtmlElement.htmlOfListItemQA;
})();

function loadAllAnswerDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem("listOfItemQA"));
}

function loadAnswerOfWhQuestionToUI(index, data) {
    adminPageHtmlElement.htmlOfListItemQA += `
        <div class="detailOfEachItemQA">
            <div class="questionContent"><strong>Question ${index + 1}:</strong> ${data.questionContent} <span>(${data.type})</span></div>
            <div class="answerContent"><span>&gt;</span>${data.myAnswer}</div>
        </div>
    `;
}

function loadAnswerOfSingleChoiceQuestionToUI(index, data) {
    const singleChoiceSet = data.choices.reduce((str, choice, index) => {
        if (data.myAnswer.answerContent === choice.answerContent) {
            return str += `
              <form class="adminPage-eachSingleChoiceAnswer ${choice.isCorrect ? "highlightLabelOfRightChoice" : "highlightLabelOfWrongChoice"}">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent} ${choice.isCorrect ? adminPageHtmlElement.correctSymbol : adminPageHtmlElement.incorrectSymbol}</label>
              </form>
            `;
        } else {
            return str += `
              <form class="adminPage-eachSingleChoiceAnswer ${choice.isCorrect && "highlightLabelOfRightChoice"}">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </form>
            `;
        }
    }, "");

    adminPageHtmlElement.htmlOfListItemQA += `
        <div class="detailOfEachItemQA">
            <div class="questionContent"><strong>Question ${index + 1}:</strong> ${data.questionContent} <span>(${data.type})</span></div>
            <div class="answerContent">${singleChoiceSet}</div>
        </div>
    `;
}

function loadAnswerOfMultipleChoicesQuestionToUI(index, data) {
    const multipleChoicesSet = data.choices.reduce((str, choice, index) => {
        //refactor logic
        const isExist = data.myAnswer.find(item => item.answerContent === choice.answerContent);
        if (!!isExist) {
            return str += `
              <div class="adminPage-eachMultipleChoicesAnswer ${choice.isCorrect ? "highlightLabelOfRightChoice" : "highlightLabelOfWrongChoice"}">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent} ${choice.isCorrect ? adminPageHtmlElement.correctSymbol : adminPageHtmlElement.incorrectSymbol} </label>
              </div>
            `;
        } else {
            return str += `
              <div class="adminPage-eachMultipleChoicesAnswer ${choice.isCorrect && "highlightLabelOfRightChoice"}">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        }
    }, "")

    adminPageHtmlElement.htmlOfListItemQA += `
        <div class="detailOfEachItemQA">
            <div class="questionContent"><strong>Question ${index + 1}:</strong> ${data.questionContent} <span>(${data.type})</span></div>
            <div class="answerContent answerOfMultipleChoice">${multipleChoicesSet}</div>
        </div>
    `;
}