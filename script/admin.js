// acronym { QA: Question and Answer }

const adminPageConfig = {
    htmlOfListItemQA: ""
};

(function loadAdminPage() {
    restartHtmlOfListItemQA(adminPageConfig.htmlOfListItemQA);
    const allAnswerData = loadAllAnswerDataFromLocalStorage();
    allAnswerData.forEach((item, index) => {
        if (item.type === "whQuestion") loadAnswerOfWhQuestionToUI(index, item);
        else if (item.type === "singleChoiceQuestion") loadAnswerOfSingleChoiceQuestionToUI(index, item);
        else if (item.type === "multipleChoicesQuestion") loadAnswerOfMultipleChoicesQuestionToUI(index, item);
    })
    document.getElementById("listOfItemQA").innerHTML = adminPageConfig.htmlOfListItemQA;
})();

function restartHtmlOfListItemQA(html) {
    html = "";
}

function loadAllAnswerDataFromLocalStorage() {
    return JSON.parse(localStorage.getItem("listOfItemQA"));
}

function loadAnswerOfWhQuestionToUI(index, data) {
    adminPageConfig.htmlOfListItemQA += `
        <div class="detailOfEachItemQA">
            <div class="questionContent"><strong>Question ${index+1}:</strong> ${data.questionContent} <span>(${data.type})</span></div>
            <div class="answerContent"><span>&gt;</span>${data.myAnswer}</div>
        </div>
        `;
}

function loadAnswerOfSingleChoiceQuestionToUI(index, data) {
    let singleChoiceSet = "";

    data.choices.forEach((choice, index) => {
        if (data.myAnswer.answerContent === choice.answerContent) {
            singleChoiceSet += `
              <form class="adminPage-eachSingleChoiceAnswer">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}" checked>
                <label class="${choice.isCorrect ? "adminPage-rightSingleChoice" : "adminPage-wrongSingleChoice"}" for="answerChoice${data.id}${index}">${choice.answerContent} (${data.myAnswer.isCorrect ? "Correct" : "Incorrect"})</label>
              </form>
            `;
        } else {
            singleChoiceSet += `
              <form class="adminPage-eachSingleChoiceAnswer">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}">
                <label class="${choice.isCorrect && "adminPage-rightSingleChoice"}" for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </form>
            `;
        }
    })

    adminPageConfig.htmlOfListItemQA += `
        <div class="detailOfEachItemQA">
            <div class="questionContent"><strong>Question ${index+1}:</strong> ${data.questionContent} <span>(${data.type})</span></div>
            <div class="answerContent">${singleChoiceSet}</div>
        </div>
        `;
}

function loadAnswerOfMultipleChoicesQuestionToUI(index, data) {
    let multipleChoicesSet = "";

    data.choices.forEach((choice, index) => {
        let isExist = false;
        data.myAnswer.find(item => { if (item.answerContent === choice.answerContent) isExist = true; })
        if (isExist) {
            multipleChoicesSet += `
              <div class="adminPage-eachMultipleChoicesAnswer ${choice.isCorrect ? "adminPage-rightMultipleChoices" : "adminPage-wrongMultipleChoices"}">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent} (${choice.isCorrect ? "Correct" : "Incorrect"})</label>
              </div>
            `;
        } else {
            multipleChoicesSet += `
              <div class="adminPage-eachMultipleChoicesAnswer ${choice.isCorrect && "adminPage-wrongMultipleChoices"}">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        }
    })

    adminPageConfig.htmlOfListItemQA += `
        <div class="detailOfEachItemQA">
            <div class="questionContent"><strong>Question ${index+1}:</strong> ${data.questionContent} <span>(${data.type})</span></div>
            <div class="answerContent answerOfMultipleChoice">${multipleChoicesSet}</div>
        </div>
        `;
}