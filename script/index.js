// acronym { QA: Question and Answer }
const LOAD = 0,
    START = 1,
    FINISH = 2;

const UNSHOWED = "unshowed",
    SHOWING = "showing",
    SHOWED = "showed",
    OUTOFTIME = "outOfTime";

const timerForQAConfig = {
    listOfItemQA: [],
    currentSetOfQA: {},
    timerControlButtonMode: LOAD,
    timerIntervalMethod: null
}

// Import data file

function viewInputFileName() {
    const inputFile = document.getElementById("questionDataInputFile");
    const inputFileName = document.getElementById("inputFileName");

    if (!inputFile.files[0]) inputFileName.innerHTML = "Nothing is selected";
    else inputFileName.innerHTML = inputFile.files[0].name;
}

function loadInputFile() {
    let input, myFile, fileReader;

    if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('questionDataInputFile');
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load file'");
    } else {
        myFile = input.files[0];
        fileReader = new FileReader();
        fileReader.onload = loadCompletelyFileData;
        fileReader.readAsText(myFile);
        switchModeOfTimerControlButton(LOAD);
        lockUploadFileInputButton(true);
    }

    function loadCompletelyFileData(e) {
        timerForQAConfig.listOfItemQA = JSON.parse(e.target.result);
        modifyListOfItemQAInConfig();
    }

    function modifyListOfItemQAInConfig() {
        shuffleQuestionList(timerForQAConfig.listOfItemQA);
        insertAnswerVariableForEachQuestionData();
        insertQuestionStatusVariableForEachQuestionData();
    }
}

function shuffleQuestionList(list) {
    var currentIndex = list.length,
        temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = list[currentIndex];
        list[currentIndex] = list[randomIndex];
        list[randomIndex] = temporaryValue;
    }

    return list;
}

function insertAnswerVariableForEachQuestionData() {
    timerForQAConfig.listOfItemQA.forEach(item => {
        if (item.type === "whQuestion") item.myAnswer = "";
        else if (item.type === "singleChoiceQuestion") item.myAnswer = {};
        else if (item.type === "multipleChoicesQuestion") item.myAnswer = [];
    })
}

function insertQuestionStatusVariableForEachQuestionData() {
    timerForQAConfig.listOfItemQA.forEach(item => {
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
    const questionIndex = timerForQAConfig.listOfItemQA.findIndex(item => item.id === id);

    deactivateTimer();

    if (checkAllQuestionIsOutOfTime()) {
        finishTimerForQA();
        return;
    }

    if (checkOneQuestionIsOutOfTime(id)) {
        if (checkIsLastQuestion(id)) {
            changeCurrentTimerAndQA(timerForQAConfig.listOfItemQA[0].id);
            return;
        } else {
            changeCurrentTimerAndQA(timerForQAConfig.listOfItemQA[questionIndex + 1].id);
            return;
        }
    }

    changeCurrentNavigationButton(id);
    changeCurrentTimerWithNewData(id);
    changeCurrentQuestionWithNewData(id);
}

function checkAllQuestionIsOutOfTime() {
    let isOutOfTime = true;
    timerForQAConfig.listOfItemQA.forEach(item => {
        if (item.status !== OUTOFTIME) isOutOfTime = false;
    })
    return isOutOfTime;
}

function checkOneQuestionIsOutOfTime(id) {
    let isOutOfTime = false;
    timerForQAConfig.listOfItemQA.forEach(item => {
        if (item.id === id && item.status === OUTOFTIME) isOutOfTime = true;
    })
    return isOutOfTime;
}

function checkIsLastQuestion(id) {
    let isLastQuestion = false;
    timerForQAConfig.listOfItemQA.forEach((item, index) => {
        if (item.id === id && index === timerForQAConfig.listOfItemQA.length - 1) isLastQuestion = true;
    })
    return isLastQuestion;
}

function renderQuestionForUI() {
    const newQuestion = timerForQAConfig.listOfItemQA[0];
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
    const currentQuestion = timerForQAConfig.listOfItemQA.filter(item => item.id === id)[0];

    restartCurrentSetOfQAInConfig(currentQuestion);

    if (currentQuestion.type === "whQuestion") loadWhQuestionData(currentQuestion);
    else if (currentQuestion.type === "singleChoiceQuestion") loadSingleChoiceQuestionData(currentQuestion);
    else if (currentQuestion.type === "multipleChoicesQuestion") loadMultipleChoicesQuestionData(currentQuestion);
}

function restartCurrentSetOfQAInConfig(question) {
    timerForQAConfig.currentSetOfQA = {
        ...timerForQAConfig.currentSetOfQA,
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
    let htmlOfAllChoices = "";

    data.choices.forEach((choice, index) => {
        if (data.myAnswer.answerContent === choice.answerContent) {
            htmlOfAllChoices += `
              <div class="eachSingleChoiceAnswer">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        } else {
            htmlOfAllChoices += `
              <div class="eachSingleChoiceAnswer">
                <input type="radio" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveSingleChoiceAnswer(${data.id}, this.value, ${choice.isCorrect})" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        }
    })

    document.getElementById("questionAndAnswerArea").innerHTML = `
      <div class="eachSetOfQuestionAndAnswer">
        <h2 id="questionContent${data.id}"><span>Question: </span>${data.questionContent}</h2>
        ${htmlOfAllChoices}
      </div>
    `;
}

function loadMultipleChoicesQuestionData(data) {
    let htmlOfAllChoices = "";

    data.choices.forEach((choice, index) => {
        let isExist = false;
        data.myAnswer.find(item => { if (item.answerContent === choice.answerContent) isExist = true })
        if (isExist) {
            htmlOfAllChoices += `
              <div class="eachSingleChoiceAnswer">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}" checked>
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        } else {
            htmlOfAllChoices += `
              <div class="eachSingleChoiceAnswer">
                <input type="checkbox" name="answerChoice" id="answerChoice${data.id}${index}" onclick="autosaveMultipleChoicesAnswer(${data.id}, this.value, ${choice.isCorrect}, this.checked)" value="${choice.answerContent}">
                <label for="answerChoice${data.id}${index}">${choice.answerContent}</label>
              </div>
            `;
        }
    })

    document.getElementById("questionAndAnswerArea").innerHTML = `
      <div class="eachSetOfQuestionAndAnswer">
        <h2 id="questionContent${data.id}"><span>Question: </span>${data.questionContent}</h2>
        ${htmlOfAllChoices}
      </div>
    `;
}

function autosaveWhAnswer(id, value) {
    timerForQAConfig.listOfItemQA.forEach(currentQA => {
        if (currentQA.id === id)
            currentQA.myAnswer = value;
    });
}

function autosaveSingleChoiceAnswer(id, value, isCorrect) {
    timerForQAConfig.listOfItemQA.forEach(currentQA => {
        if (currentQA.id === id)
            currentQA.myAnswer = {
                answerContent: value,
                isCorrect: isCorrect
            };
    })
}

function autosaveMultipleChoicesAnswer(id, value, isCorrect, isChecked) {
    if (isChecked) {
        timerForQAConfig.listOfItemQA.forEach(currentQA => {
            if (currentQA.id === id)
                currentQA.myAnswer.push({
                    answerContent: value,
                    isCorrect: isCorrect
                })
        })
    } else {
        let newAnswerArr = [];
        timerForQAConfig.listOfItemQA.forEach(currentQA => {
            if (currentQA.id === id) {
                currentQA.myAnswer.forEach(item => {
                    if (item.answerContent !== value)
                        newAnswerArr.push(item)
                })
                currentQA.myAnswer = newAnswerArr;
            }
        })
    }
}

// Navigation of QA

function renderQuestionListNavigationForUI() {
    const newQuestion = timerForQAConfig.listOfItemQA[0];
    renderNavigationButton();
    changeCurrentNavigationButton(newQuestion.id);
}

function renderNavigationButton() {
    let htmlOfNavigationButton = "";
    const listOfItemQA = timerForQAConfig.listOfItemQA;

    for (let i = 0; i < listOfItemQA.length; i++) {
        htmlOfNavigationButton += `
          <div id="navigationButton${listOfItemQA[i].id}" class="navigationButton unshowedNavigationButton" onclick="changeCurrentTimerAndQA(${listOfItemQA[i].id})">${i+1}</div>
        `;
    }

    document.getElementById("questionListNavigationBar").innerHTML = htmlOfNavigationButton;
}

function changeCurrentNavigationButton(id) {
    const currentNavigationButton = document.getElementById(`navigationButton${timerForQAConfig.currentSetOfQA.id}`);
    const newNavigationButton = document.getElementById(`navigationButton${id}`);

    if (currentNavigationButton === newNavigationButton) {
        newNavigationButton.classList.remove("unshowedNavigationButton");
        newNavigationButton.classList.add("showingNavigationButton");
    } else {
        currentNavigationButton.classList.remove("showingNavigationButton");
        if (timerForQAConfig.currentSetOfQA.durationTime !== 0) currentNavigationButton.classList.add("showedNavigationButton");

        if (newNavigationButton.classList.contains("showedNavigationButton")) newNavigationButton.classList.remove("showedNavigationButton");
        else newNavigationButton.classList.remove("unshowedNavigationButton");
        newNavigationButton.classList.add("showingNavigationButton");
    }
}

function updateOutOfTimeQuestion(index) {
    timerForQAConfig.listOfItemQA[index].status = OUTOFTIME;
    document.getElementById(`navigationButton${timerForQAConfig.listOfItemQA[index].id}`).classList.remove("showingNavigationButton");
    document.getElementById(`navigationButton${timerForQAConfig.listOfItemQA[index].id}`).classList.add("outOfTimeNavigationButton");
}

// Timer

function renderTimerForUI() {
    const newQuestionId = timerForQAConfig.listOfItemQA[0].id;
    changeCurrentTimerWithNewData(newQuestionId);
}

function changeCurrentTimerWithNewData(id) {
    const currentQuestion = timerForQAConfig.listOfItemQA.filter(item => item.id === id)[0];
    const questionIndex = timerForQAConfig.listOfItemQA.findIndex(item => item.id === id);

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
            if (questionIndex === timerForQAConfig.listOfItemQA.length - 1) changeCurrentTimerAndQA(timerForQAConfig.listOfItemQA[0].id);
            else changeCurrentTimerAndQA(timerForQAConfig.listOfItemQA[questionIndex + 1].id);
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
    timerForQAConfig.listOfItemQA[questionIndex].durationTime = timerData;
}

// Notification

function checkIsFulfillAllQuestion() {
    let isFulfill = true;
    timerForQAConfig.listOfItemQA.forEach(item => {
        if (item.type === "whQuestion" && item.durationTime !== 0 && item.myAnswer === "") isFulfill = false;
        if (item.type === "singleChoiceQuestion" && item.durationTime !== 0 && item.myAnswer.answerContent === undefined) isFulfill = false;
        if (item.type === "multipleChoicesQuestion" && item.durationTime !== 0 && item.myAnswer.length === 0) isFulfill = false;
    })
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

    if (!isVerified) changeCurrentTimerAndQA(timerForQAConfig.currentSetOfQA.id);
    else finishTimerForQA(true);
}

// Save data to local storage

function saveAllAnswerDataToLocalStorage() {
    localStorage.setItem("listOfItemQA", JSON.stringify(timerForQAConfig.listOfItemQA));
}