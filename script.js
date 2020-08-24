// acronym { QA: Question and Answer }

const START = 1,
    FINISH = 0;

const timerForQAConfig = {
    currentSetOfQA: {},
    timerControlButtonMode: FINISH,
    timerIntervalMethod: null
}

function startTimerForQA() {
    setTimerActivityStatus("activated");
    renderQuestionForUI();
    switchModeOfTimerControlButton(START);
}

async function finishTimerForQA() {
    setTimerActivityStatus("deactivated");
    setEnterablePropertyForAnswerInput(true);
    deactivateAllButtons("finishButton");
    await showFinishedNotificationMessage();
    switchModeOfTimerControlButton(FINISH);
}

function switchModeOfTimerControlButton(buttonMode) {
    timerForQAConfig.timerControlButtonMode = buttonMode;

    if (buttonMode === START) renderNewButtonModeForUI("finishButton", "startButton");
    else if (buttonMode === FINISH) renderNewButtonModeForUI("startButton", "finishButton");
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

function renderQuestionForUI() {
    const newQuestionData = getNewQuestion();
    changeCurrentQuestionWithNewData(newQuestionData[0]);
    restartCurrentQuestionInConfig(newQuestionData[0]);
}

function getNewQuestion() {
    const randomId = Math.round(Math.random() * 9);
    return question.filter(item => item.id === randomId);
}

function changeCurrentQuestionWithNewData(data) {
    document.getElementById("questionAndAnswerArea").innerHTML = `
      <div class="eachSetOfQuestionAndAnswer">
        <h2 id="questionContent${data.id}"><span>Question: </span>${data.content}</h2>
        <textarea id="answerContent" type="text" placeholder="Enter your answer here..."></textarea>
      </div>
    `;
}

function restartCurrentQuestionInConfig(question) {
    timerForQAConfig.currentSetOfQA = {
        ...timerForQAConfig.currentSetOfQA,
        ...question
    };
}

function showFinishedNotificationMessage() {
    return new Promise(async resolve => {
        const textAreaValue = document.getElementById("answerContent").value;

        if (textAreaValue !== "") await addEffectForNotificationMessage("successNotification");
        else await addEffectForNotificationMessage("warningNotification");

        resolve();
    })
}

function addEffectForNotificationMessage(notificationType) {
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
        }, 1000)
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

function setEnterablePropertyForAnswerInput(enterableType) {
    document.getElementById("answerContent").disabled = enterableType;
}

function setTimerActivityStatus(status) {
    if (status === "activated") activateTimer();
    if (status === "deactivated") deactivateTimer();
}

function activateTimer() {
    const secondsCountingSet = document.getElementById("secondsCountingSet-countingNumber");
    const minutesCountingSet = document.getElementById("minutesCountingSet-countingNumber");
    const hoursCountingSet = document.getElementById("hoursCountingSet-countingNumber");
    let hour = minute = second = 0;

    secondsCountingSet.innerHTML = minutesCountingSet.innerHTML = hoursCountingSet.innerHTML = "00";

    timerForQAConfig.timerIntervalMethod = setInterval(function() {
        second += 1;
        if (second < 10) secondsCountingSet.innerHTML = `0${second}`;
        else if (second >= 60) {
            second = 0;
            minute += 1;
            secondsCountingSet.innerHTML = "00";
            if (minute < 10) minutesCountingSet.innerHTML = `0${minute}`;
            else if (minute >= 60) {
                minute = 0;
                hour += 1;
                minutesCountingSet.innerHTML = "00";
                if (hour < 10) hoursCountingSet.innerHTML = `0${hour}`;
                else hoursCountingSet.innerHTML = `${hour}`;
            } else minutesCountingSet.innerHTML = `${minute}`;
        } else secondsCountingSet.innerHTML = `${second}`;
    }, 1000)
}

function deactivateTimer() {
    clearInterval(timerForQAConfig.timerIntervalMethod);
}