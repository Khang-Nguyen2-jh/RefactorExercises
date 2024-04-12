const IS_TERMINATE_WHEN_INPUT_KEYWORD = true;
const KEYWORDS = ["this", "is", "a", "list", "of", "keywords"];

const questionTree = async (
  inputFile,
  questionGroupId,
  startQuestionIndex = 0,
  title = "",
  additionalText = "",
  finishContent = "Finish",
  errorMessage = "Question data is not exist!"
) => {
  let questionData;
  let questionContent;
  let questionAnswer;

  const optionTypes = {
    choose: (question) => {
      handleChooseType(question);
    },
    textinput: (question) => {
      handleTextInputType(question);
    },
  };

  const handleChooseType = (question) => {
    for (const option of question.options) {
      const optionBtn = document.createElement("button");
      optionBtn.textContent = option.label;
      optionBtn.addEventListener("click", () => {
        handleGoNextQuestion(option.nextQuestionId);
      });
      // Add button to answer
      questionAnswer.appendChild(optionBtn);
    }
  };

  // If text input contains keyword, return true, else return false
  const isContainKeyword = (textInput) => {
    const textInputArray = textInput.split(" ");
    for (const keyword of KEYWORDS) {
      if (
        textInputArray.findIndex(
          (word) => word.toLowerCase() === keyword.toLowerCase()
        ) !== -1
      ) {
        return {
          isTrue: true,
          keyword,
        };
      }
    }
    return {
      isTrue: false,
      keyword: null,
    };
  };

  const handleTextInputType = (question) => {
    const textInput = document.createElement("textarea");
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.addEventListener("click", () => {
      // Validate input not null or all space letters
      const inputContent = textInput.value;
      if (!inputContent || !inputContent.trim()) {
        window.alert("Invalid input");
        return;
      }
      // Handle keyword
      if (IS_TERMINATE_WHEN_INPUT_KEYWORD) {
        const { isTrue, keyword } = isContainKeyword(inputContent);
        if (isTrue) {
          window.alert(
            `Input is invalid because it contains keywords: ${keyword}`
          );
          return;
        }
      }
      // Go next question
      const nextQuestionId = question.nextQuestionId;
      handleGoNextQuestion(nextQuestionId);
    });
    // Add button to answer
    questionAnswer.appendChild(textInput);
    questionAnswer.appendChild(submitBtn);
  };

  const initQuestion = async (link) => {
    const response = await fetch(link);
    if (response.ok) {
      const jsonData = await response.json();
      // Initialize questions
      return jsonData;
    } else {
      window.alert(`Cannot read file at ${link}`);
      return null;
    }
  };

  const handleClearQuestion = () => {
    questionContent.replaceChildren();
    questionAnswer.replaceChildren();
  };

  const handleGoNextQuestion = (questionId) => {
    if (questionId) {
      const question = questionData.find(
        (question) => question.id === questionId
      );
      if (question) handleRenderQuestion(question);
      else {
        window.alert(`Cannot find question has id = ${questionId}`);
      }
    } else {
      handleFinishQuestions(finishContent);
    }
  };

  const handleFinishQuestions = (finishQuestionContent) => {
    handleClearQuestion();
    questionContent.innerHTML = `
      <h2>${finishQuestionContent}</h2>`;
    const optionBtn = document.createElement("button");
    optionBtn.textContent = "Restart";
    optionBtn.addEventListener("click", () => {
      handleRenderQuestion(questionData[0]);
    });
    questionAnswer.appendChild(optionBtn);
  };

  const handleChangeQuestion = (question) => {
    const { id, backup } = question;
    const randomIndexQuestion = Math.floor(Math.random() * backup.length);
    // create new question (deep copy)
    const newQuestion = JSON.parse(JSON.stringify(backup[randomIndexQuestion]));
    newQuestion.id = id;
    newQuestion.backup = JSON.parse(JSON.stringify(backup));
    return handleRenderQuestion(newQuestion);
  };

  const handleRenderQuestion = (question = questionData[0]) => {
    handleClearQuestion();
    const questionContentTitle = document.createElement("div");
    const questionContentTitleH2 = document.createElement("h2");
    const questionContentText = document.createElement("p");
    questionContentTitleH2.innerHTML = `Question ${question.id}`;
    questionContentText.innerHTML = question.text;
    questionContentTitle.classList.add("question-title");
    questionContentTitle.appendChild(questionContentTitleH2);
    if (question?.backup?.length) {
      const changeQuestionButton = document.createElement("button");
      changeQuestionButton.innerHTML = "Change";
      changeQuestionButton.addEventListener("click", () => {
        handleChangeQuestion(question);
      });
      questionContentTitle.appendChild(changeQuestionButton);
    }
    questionContent.appendChild(questionContentTitle);
    questionContent.appendChild(questionContentText);

    optionTypes[question.type](question);
  };

  const initHTML = (id) => {
    const mainTag = document.getElementById(id);
    // const questionContainer = document.createElement("section");
    // questionContainer.classList.add(`${questionGroupId}`);
    questionContent = document.createElement("section");
    questionContent.id = `question-content-${questionGroupId}`;
    questionAnswer = document.createElement("section");
    questionAnswer.id = `question-answer-${questionGroupId}`;
    // Handle Title
    if (title) {
      const questionTitle = document.createElement("h1");
      questionTitle.innerHTML = title;
      mainTag.appendChild(questionTitle);
    }
    // Handle content
    if (additionalText) {
      const questionGroupContent = document.createElement("p");
      questionGroupContent.innerHTML = additionalText;
      mainTag.appendChild(questionGroupContent);
    }
    // Append Child
    mainTag.appendChild(questionContent);
    mainTag.appendChild(questionAnswer);
  };

  // Running question tree
  const handleRunQuestionTree = async (
    file,
    startIndex = 0,
    errorMessage = "Error!Try again later."
  ) => {
    questionData = await initQuestion(file);
    console.assert(startIndex < questionData.length);
    if (
      questionData.length &&
      startIndex >= 0 &&
      startIndex < questionData.length
    ) {
      initHTML(questionGroupId);
      handleRenderQuestion(questionData[startIndex]);
    } else {
      window.alert(errorMessage);
    }
  };
  await handleRunQuestionTree(inputFile, startQuestionIndex, errorMessage);
};

/**
 * Updates:
 * - List keywords, user nhap dug keyword => co 1 function (trog)
 * + tiep tuc
 * + terminate => show message
 *
 * - doi cau hoi
 * moi cau hoi se co 1 hoac nhieu hoac k co cau hoi backup
 * neu co => show button doi cau hoi
 */

const main = async () => {
  await questionTree(
    "./data/data.json",
    "id1",
    0,
    "This is custom title",
    "This is custom content",
    "This is custom finish content!",
    "This is custom error"
  );
  // await questionTree(
  //   "./data/data.json",
  //   "id2",
  //   0,
  //   "This is custom title",
  //   "This is custom content",
  //   "This is custom finish content!",
  //   "This is custom error"
  // );
  // await questionTree(
  //   "./data/data.json",
  //   "id4",
  //   1,
  //   "",
  //   "This is custom content"
  // );
};
main();
