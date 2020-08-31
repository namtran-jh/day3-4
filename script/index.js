// acronym { QA: Question and Answer }
const LOAD = 0,
    START = 1,
    FINISH = 2;

const UNSHOWED = "unshowed",
    SHOWING = "showing",
    SHOWED = "showed",
    OUTOFTIME = "outOfTime";

const MULTIPLE_CHOICES_QUESTION = "MULTIPLE_CHOICES_QUESTION",
    SINGLE_CHOICE_QUESTION = "SINGLE_CHOICE_QUESTION",
    WH_QUESTION = "WH_QUESTION";

const currentData = {
    listOfItemQA: [],
    currentSetOfQA: {}
};
// -2
const timerForQAConfig = {
    timerControlButtonMode: LOAD,
    timerIntervalMethod: null
};

// Import data file

function viewInputFileName() {
    const inputFile = document.getElementById("questionDataInputFile");
    const inputFileName = document.getElementById("inputFileName");

    if (!inputFile.files[0]) inputFileName.innerHTML = "Nothing is selected";
    else inputFileName.innerHTML = inputFile.files[0].name;
}

function loadInputFile() {
    //Checking logic
    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    const input = document.getElementById('questionDataInputFile');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load file'");
    } else {
        const myFile = input.files[0];
        const fileReader = new FileReader();
        fileReader.onload = loadCompletelyFileData;
        fileReader.readAsText(myFile);
        switchModeOfTimerControlButton(LOAD);
        lockUploadFileInputButton(true);
    }

    function loadCompletelyFileData(e) {
        currentData.listOfItemQA = JSON.parse(e.target.result);
        modifyListOfItemQAInConfig();
    }

    function modifyListOfItemQAInConfig() {
        shuffleQuestionList(currentData.listOfItemQA);
        insertAnswerVariableForEachQuestionData();
        insertQuestionStatusVariableForEachQuestionData();
    }
}

function shuffleQuestionList(list) {
    //Copy - 1
    let currentIndex = list.length;

    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        const temporaryValue = list[currentIndex];
        list[currentIndex] = list[randomIndex];
        list[randomIndex] = temporaryValue;
    }

    return list;
}

function insertAnswerVariableForEachQuestionData() {
    // - 10
    currentData.listOfItemQA.forEach(item => {
        if (item.type === WH_QUESTION) item.myAnswer = "";
        else if (item.type === SINGLE_CHOICE_QUESTION) item.myAnswer = {};
        else if (item.type === MULTIPLE_CHOICES_QUESTION) item.myAnswer = [];
    })
}

function insertQuestionStatusVariableForEachQuestionData() {
    currentData.listOfItemQA.forEach(item => {
        item.status = UNSHOWED;
    })
}

function lockUploadFileInputButton(isLock) {
    if (isLock) document.getElementById('questionDataInputFile').setAttribute("disabled", true);
    else document.getElementById('questionDataInputFile').removeAttribute("disabled");
}

// Start/Finish timer for QA

function startTimerForQA() {
    renderQuestionForUI();
    renderTimerForUI();
    renderQuestionListNavigationForUI();
    switchModeOfTimerControlButton(START);
}

async function finishTimerForQA(isVerified) {
    deactivateTimer();

    if (!isVerified) {
        if (!checkIsFulfillAllQuestion()) {
            renderPopupOfVerifyFinishQA();
            return;
        }
    }

    saveAllAnswerDataToLocalStorage();
    updateCurrentTimerForUI({ second: 0, minute: 0, hour: 0 });
    changeDisplayStatusOfSpecificElement("questionAndAnswerArea", "hide");
    changeDisplayStatusOfSpecificElement("questionListNavigationBar", "hide");
    changeDisplayStatusOfSpecificElement("endNotificationAndLinkOfAdminPage", "show");
    deactivateAllButtons("finishButton");
    await showFinishedNotificationMessage("success");
    switchModeOfTimerControlButton(FINISH);
}

// All buttons

function switchModeOfTimerControlButton(buttonMode) {
    timerForQAConfig.timerControlButtonMode = buttonMode;

    if (buttonMode === LOAD) renderNewButtonModeForUI("startButton", "loadButton");
    else if (buttonMode === START) renderNewButtonModeForUI("finishButton", "startButton");
    else if (buttonMode === FINISH) {
        renderNewButtonModeForUI("loadButton", "finishButton");
        lockUploadFileInputButton(false);
    }
}

function renderNewButtonModeForUI(activatedButton, deactivatedButton) {
    document.getElementById(activatedButton).classList.add("activatedButton");
    document.getElementById(activatedButton).classList.remove("deactivatedButton");

    document.getElementById(deactivatedButton).classList.add("deactivatedButton");
    document.getElementById(deactivatedButton).classList.remove("activatedButton");
}

function deactivateAllButtons(deactivatedButton) {
    document.getElementById(deactivatedButton).classList.add("deactivatedButton");
    document.getElementById(deactivatedButton).classList.remove("activatedButton");
}

// QA

function changeCurrentTimerAndQA(id) {
    const questionIndex = currentData.listOfItemQA.findIndex(item => item.id === id);

    deactivateTimer();

    if (checkAllQuestionIsOutOfTime()) {
        finishTimerForQA();
        return;
    }

    if (checkOneQuestionIsOutOfTime(id)) {
        if (checkIsLastQuestion(id)) {
            changeCurrentTimerAndQA(currentData.listOfItemQA[0].id);
            return;
        } else {
            changeCurrentTimerAndQA(currentData.listOfItemQA[questionIndex + 1].id);
            return;
        }
    }

    changeCurrentNavigationButton(id);
    changeCurrentTimerWithNewData(id);
    changeCurrentQuestionWithNewData(id);
}

function checkAllQuestionIsOutOfTime() {
    //Check for each -1
    return currentData.listOfItemQA.every(item => item.status === OUTOFTIME);
}

function checkOneQuestionIsOutOfTime(id) {
    //Check for each -1
    if (currentData.listOfItemQA.filter(item => item.id === id)[0].status === OUTOFTIME) return true;
    else return false;
}

function checkIsLastQuestion(id) {
    //Check for each -1
    if (currentData.listOfItemQA.findIndex(item => item.id === id) === currentData.listOfItemQA.length - 1) return true;
    else return false;
}

function renderQuestionForUI() {
    const newQuestion = currentData.listOfItemQA[0];
    changeCurrentQuestionWithNewData(newQuestion.id);
    changeDisplayStatusOfSpecificElement("questionAndAnswerArea", "show");
    changeDisplayStatusOfSpecificElement("questionListNavigationBar", "show");
    changeDisplayStatusOfSpecificElement("endNotificationAndLinkOfAdminPage", "hide");
}

function changeDisplayStatusOfSpecificElement(elementId, status) {
    if (status === "show") document.getElementById(elementId).style.display = "flex";
    else if (status === "hide") document.getElementById(elementId).style.display = "none";
}

function changeCurrentQuestionWithNewData(id) {
    const currentQuestion = currentData.listOfItemQA.filter(item => item.id === id)[0];

    restartCurrentSetOfQAInConfig(currentQuestion);

    if (currentQuestion.type === WH_QUESTION) loadWhQuestionData(currentQuestion);
    else if (currentQuestion.type === SINGLE_CHOICE_QUESTION) loadSingleChoiceQuestionData(currentQuestion);
    else if (currentQuestion.type === MULTIPLE_CHOICES_QUESTION) loadMultipleChoicesQuestionData(currentQuestion);
}

function restartCurrentSetOfQAInConfig(question) {
    currentData.currentSetOfQA = {
        ...currentData.currentSetOfQA,
        ...question
    };
}

function loadWhQuestionData(data) {
    document.getElementById("questionAndAnswerArea").innerHTML = `
      <div class="eachSetOfQuestionAndAnswer">
        <h2 id="questionContent${data.id}"><span>Question: </span>${data.questionContent}</h2>
        <textarea id="answerContent${data.id}" type="text" onchange="autosaveWhAnswer(${data.id}, this.value)" placeholder="Enter your answer here...">${data.myAnswer}</textarea>
      </div>
    `;
}

function loadSingleChoiceQuestionData(data) {
    //Check for each
    const htmlOfAllChoices = data.choices.reduce((str, choice, index) => {
        if (data.myAnswer.answerContent === choice.answerContent) {
            return str += `
              <div class="eachSingleChoiceAnswer">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        } else {
            return str += `
              <div class="eachSingleChoiceAnswer">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        }
    }, "")

    document.getElementById("questionAndAnswerArea").innerHTML = `
      <div class="eachSetOfQuestionAndAnswer">
        <h2 id="questionContent${data.id}"><span>Question: </span>${data.questionContent}</h2>
        ${htmlOfAllChoices}
      </div>
    `;
}

function loadMultipleChoicesQuestionData(data) {
    const htmlOfAllChoices = data.choices.reduce((str, choice, index) => {
        const isExist = data.myAnswer.map(item => item.answerContent).includes(choice.answerContent);
        if (isExist) {
            return str += `
              <div class="eachSingleChoiceAnswer">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        } else {
            return str += `
              <div class="eachSingleChoiceAnswer">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        }
    }, "")

    document.getElementById("questionAndAnswerArea").innerHTML = `
      <div class="eachSetOfQuestionAndAnswer">
        <h2 id="questionContent${data.id}"><span>Question: </span>${data.questionContent}</h2>
        ${htmlOfAllChoices}
      </div>
    `;
}

function autosaveWhAnswer(id, value) {
    currentData.listOfItemQA.find(currentQA => currentQA.id === id).myAnswer = value;
}

function autosaveSingleChoiceAnswer(id, value, isCorrect) {
    currentData.listOfItemQA.find(currentQA => currentQA.id === id).myAnswer = {
        answerContent: value,
        isCorrect: isCorrect
    };
}

function autosaveMultipleChoicesAnswer(id, value, isCorrect, isChecked) {
    if (isChecked) {
        currentData.listOfItemQA.find(currentQA => currentQA.id === id).myAnswer.push({
            answerContent: value,
            isCorrect: isCorrect
        });
    } else {
        const newAnswerArr = currentData.listOfItemQA.find(currentQA => currentQA.id === id).myAnswer.filter(item => item.answerContent !== value)
        currentData.listOfItemQA.find(currentQA => currentQA.id === id).myAnswer = newAnswerArr;
    }
}

// Navigation of QA

function renderQuestionListNavigationForUI() {
    const newQuestion = currentData.listOfItemQA[0];
    renderNavigationButton();
    changeCurrentNavigationButton(newQuestion.id);
}

function renderNavigationButton() {
    const listOfItemQA = currentData.listOfItemQA;

    const htmlOfNavigationButton = listOfItemQA.reduce((str, item, index) => {
        return str += `
            <div id="navigationButton${listOfItemQA[index].id}" class="navigationButton unshowedNavigationButton" onclick="changeCurrentTimerAndQA(${listOfItemQA[index].id})">${index + 1}</div>
        `;
    }, "")

    document.getElementById("questionListNavigationBar").innerHTML = htmlOfNavigationButton;
}

function changeCurrentNavigationButton(id) {
    const currentNavigationButton = document.getElementById(`navigationButton${currentData.currentSetOfQA.id}`);
    const newNavigationButton = document.getElementById(`navigationButton${id}`);

    if (currentNavigationButton === newNavigationButton) {
        newNavigationButton.classList.remove("unshowedNavigationButton");
        newNavigationButton.classList.add("showingNavigationButton");
    } else {
        currentNavigationButton.classList.remove("showingNavigationButton");
        if (currentData.currentSetOfQA.durationTime !== 0) currentNavigationButton.classList.add("showedNavigationButton");

        if (newNavigationButton.classList.contains("showedNavigationButton")) newNavigationButton.classList.remove("showedNavigationButton");
        else newNavigationButton.classList.remove("unshowedNavigationButton");
        newNavigationButton.classList.add("showingNavigationButton");
    }
}

function updateOutOfTimeQuestion(index) {
    currentData.listOfItemQA[index].status = OUTOFTIME;
    document.getElementById(`navigationButton${currentData.listOfItemQA[index].id}`).classList.remove("showingNavigationButton");
    document.getElementById(`navigationButton${currentData.listOfItemQA[index].id}`).classList.add("outOfTimeNavigationButton");
}

// Timer

function renderTimerForUI() {
    const newQuestionId = currentData.listOfItemQA[0].id;
    changeCurrentTimerWithNewData(newQuestionId);
}

function changeCurrentTimerWithNewData(id) {
    const currentQuestion = currentData.listOfItemQA.filter(item => item.id === id)[0];
    const questionIndex = currentData.listOfItemQA.findIndex(item => item.id === id);

    activateTimer(currentQuestion.durationTime, questionIndex);
}

function activateTimer(timerData, questionIndex) {
    const detailTimerSet = handleChangingCountingNumber(timerData);
    updateCurrentTimerForUI(detailTimerSet);
    updateDurationTimeInListItemConfig(questionIndex, timerData);

    timerForQAConfig.timerIntervalMethod = setInterval(function() {
        if (timerData > 0) {
            timerData -= 1;
            updateCurrentTimerForUI(handleChangingCountingNumber(timerData));
            updateDurationTimeInListItemConfig(questionIndex, timerData);
            restartCurrentSetOfQAInConfig({ durationTime: timerData });
        } else {
            deactivateTimer();
            updateOutOfTimeQuestion(questionIndex);
            if (questionIndex === currentData.listOfItemQA.length - 1) changeCurrentTimerAndQA(currentData.listOfItemQA[0].id);
            else changeCurrentTimerAndQA(currentData.listOfItemQA[questionIndex + 1].id);
        }
    }, 1000)
}

function deactivateTimer() {
    clearInterval(timerForQAConfig.timerIntervalMethod);
}

function handleChangingCountingNumber(time) {
    let hour = 0,
        minute = Math.floor(time / 60),
        second = time % 60;

    if (minute >= 60) {
        hour = Math.floor(minute / 60);
        minute = minute % 60;
    }

    return { second, minute, hour }
}

function updateCurrentTimerForUI(detailTimerSet) {
    const secondsCountingSet = document.getElementById("secondsCountingSet-countingNumber");
    const minutesCountingSet = document.getElementById("minutesCountingSet-countingNumber");
    const hoursCountingSet = document.getElementById("hoursCountingSet-countingNumber");

    if (detailTimerSet.second < 10) secondsCountingSet.innerHTML = `0${detailTimerSet.second}`;
    else secondsCountingSet.innerHTML = detailTimerSet.second;

    if (detailTimerSet.minute < 10) minutesCountingSet.innerHTML = `0${detailTimerSet.minute}`;
    else minutesCountingSet.innerHTML = detailTimerSet.minute;

    if (detailTimerSet.hour < 10) hoursCountingSet.innerHTML = `0${detailTimerSet.hour}`;
    else hoursCountingSet.innerHTML = detailTimerSet.hour;
}

function updateDurationTimeInListItemConfig(questionIndex, timerData) {
    currentData.listOfItemQA[questionIndex].durationTime = timerData;
}

// Notification

function checkIsFulfillAllQuestion() {
    const isFulfill = currentData.listOfItemQA.reduce((state, item) => {
        if (item.type === WH_QUESTION && item.durationTime !== 0 && item.myAnswer === "") state = false;
        if (item.type === SINGLE_CHOICE_QUESTION && item.durationTime !== 0 && item.myAnswer.answerContent === undefined) state = false;
        if (item.type === MULTIPLE_CHOICES_QUESTION && item.durationTime !== 0 && item.myAnswer.length === 0) state = false;
        return state;
    }, true)
    return isFulfill;
}

function showFinishedNotificationMessage(messageStatus) {
    return new Promise(async resolve => {
        await addEffectForNotificationMessage(`${messageStatus}Notification`, 2000);
        resolve();
    })
}

function addEffectForNotificationMessage(notificationType, effectDurationTime) {
    return new Promise(async resolve => {
        const target = document.getElementById(notificationType);

        target.style.display = "flex";
        await makeNotificationBoxFadeIn(target, 30);

        setTimeout(async function() {
            await makeNotificationBoxFadeOut(target, 50);
            setTimeout(function() {
                target.style.display = "none";
                clearTimeout();
            }, 500)
            clearTimeout();
            resolve();
        }, effectDurationTime)
    })
}

function makeNotificationBoxFadeOut(target, time) {
    return new Promise(resolve => {
        const fadeOutEffect = setInterval(function() {
            if (!target.style.opacity) {
                target.style.opacity = 1;
            }
            if (target.style.opacity > 0) {
                target.style.opacity -= 0.1;
            } else {
                clearInterval(fadeOutEffect);
                resolve();
            }
        }, time);
    })
}

function makeNotificationBoxFadeIn(target, time) {
    return new Promise(resolve => {
        const fadeInEffect = setInterval(function() {
            if (!target.style.opacity) {
                target.style.opacity = 0;
            }
            if (target.style.opacity < 1) {
                target.style.opacity = parseFloat(target.style.opacity) + 0.1;
            } else {
                clearInterval(fadeInEffect);
                resolve();
            }
        }, time);
    })
}

// Popup of finish verify

function renderPopupOfVerifyFinishQA() {
    changeDisplayStatusOfSpecificElement("popupOfVerificationContainer", "show");
}

function verifyFinishQA(isVerified) {
    changeDisplayStatusOfSpecificElement("popupOfVerificationContainer", "hide");

    if (!isVerified) changeCurrentTimerAndQA(currentData.currentSetOfQA.id);
    else finishTimerForQA(true);
}

// Save data to local storage

function saveAllAnswerDataToLocalStorage() {
    localStorage.setItem("listOfItemQA", JSON.stringify(currentData.listOfItemQA));
}