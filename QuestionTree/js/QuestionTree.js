const questionTree = () => {
  let questionArray;
  let questionTreeContainerId;
  let questionTreeContainer;
  let questionTraveled = [];
  const findQuestionById = (questionId) => {
    return questionArray.find((question) => question.id === questionId);
  };
  const pushQuestion = (question) => {
    questionArray.push(question);
  };
  const popQuestion = () => {
    questionArray.pop();
  };
  const findQuestionByIndex = (index) => {
    if (index < 0 || index >= questionArray.length) {
      return null;
    } else {
      return questionArray[index];
    }
  };
  const renderCreateNewQuestionUI = (previousQuestion) => {
    const questionCustomSection = document.querySelector(
      `.question-custom-${questionTreeContainerId}`
    );
    questionCustomSection.replaceChildren();
    const newQuestionContentInputElement = createInputElement(
      "name",
      "Enter new question content"
    );
    const previousQuestionAnswerInputElement = createInputElement(
      "previousQuestionAnswer",
      "Enter previous answer"
    );
    const submitCreateNewQuestionButton = createButtonElement(
      "Create",
      "",
      () => {
        questionCustomSection.replaceChildren();
        const newQuestion = createQuestion({
          content: newQuestionContentInputElement.value,
          answers: [],
        });
        pushQuestion(newQuestion);
        previousQuestion.answers.push({
          label: previousQuestionAnswerInputElement.value,
          nextQuestionId: newQuestion.id,
        });
        renderQuestion(previousQuestion);
      }
    );
    questionCustomSection.appendChild(previousQuestionAnswerInputElement);
    questionCustomSection.appendChild(newQuestionContentInputElement);
    questionCustomSection.appendChild(submitCreateNewQuestionButton);
  };
  const renderPreviousQuestion = () => {
    if (questionTraveled.length) {
      const lastQuestionIdTraveled =
        questionTraveled[questionTraveled.length - 1];
      renderQuestion(questionArray[lastQuestionIdTraveled]);
      questionTraveled.pop();
    }
  };
  const renderDeleteQuestionUI = (question) => {
    if (questionTraveled.length) {
      const lastQuestionIdTraveled =
        questionTraveled[questionTraveled.length - 1];
      const lastQuestionTraveled = findQuestionById(lastQuestionIdTraveled);
      const answerIndex = lastQuestionTraveled.answers.findIndex(
        (answer) => answer.nextQuestionId === question.id
      );
      lastQuestionTraveled.answers.splice(answerIndex, 1);
      renderQuestion(lastQuestionTraveled);
      questionTraveled.pop();
      deleteQuestion(question.id);
    }
  };
  const createButtonElement = (innerHTML, className = "", onClickHandler) => {
    const newButtonElement = document.createElement("button");
    newButtonElement.className = className;
    newButtonElement.innerHTML = innerHTML;
    newButtonElement.onclick = onClickHandler;
    return newButtonElement;
  };
  const createInputElement = (
    inputName,
    placeholder = "",
    className = "",
    defaultValue = ""
  ) => {
    const newInputElement = document.createElement("input");
    newInputElement.name = inputName;
    newInputElement.placeholder = placeholder;
    newInputElement.defaultValue = defaultValue;
    newInputElement.className = className;
    return newInputElement;
  };
  const createQuestionContentElement = (innerHTML, className = "") => {
    const newQuesionContentElement = document.createElement("h2");
    newQuesionContentElement.innerHTML = innerHTML;
    newQuesionContentElement.className = className;
    return newQuesionContentElement;
  };
  const renderUpdateQuestionUI = (question) => {
    const questionCustomSection = document.querySelector(
      `.question-custom-${questionTreeContainerId}`
    );
    questionCustomSection.replaceChildren();
    const newQuestionContentInputElement = createInputElement(
      "content",
      "Enter new question content",
      "",
      question.content
    );
    questionCustomSection.appendChild(newQuestionContentInputElement);
    question.answers.forEach((answer) => {
      const newQuestionAnswerInputElement = createInputElement(
        "answer",
        "Enter new answer",
        "",
        answer.label
      );
      questionCustomSection.appendChild(newQuestionAnswerInputElement);
    });
    const submitUpdateQuestionButton = createButtonElement("Save", "", () => {
      question.content = newQuestionContentInputElement.value;
      // Remove first child (content input) to call forEach function
      // to go through the answer inputs
      questionCustomSection.removeChild(newQuestionContentInputElement);
      question.answers.forEach((answer, answerIndex) => {
        answer.label = questionCustomSection.children[answerIndex].value;
      });
      questionCustomSection.replaceChildren();
      renderQuestion(question);
    });
    questionCustomSection.appendChild(submitUpdateQuestionButton);
  };
  const readQuestionFromJSONFile = async (path) => {
    const getQuestionArrayResponse = await fetch(path);
    if (getQuestionArrayResponse.ok) {
      const questionArrayJSON = await getQuestionArrayResponse.json();
      return questionArrayJSON;
    } else {
      window.alert(errorMessage);
      return [];
    }
  };
  const renderQuestion = (question) => {
    const createHeaderSection = () => {
      const headerSection = document.createElement("section");
      headerSection.classList.add(`question-header-${questionTreeContainerId}`);
      const buttonGroupData = [
        {
          innerHTML: "Add",
          onClickHandler: () => {
            renderCreateNewQuestionUI(question);
          },
        },
        {
          innerHTML: "Update",
          onClickHandler: () => {
            renderUpdateQuestionUI(question);
          },
        },
        {
          innerHTML: "Delete",
          onClickHandler: () => {
            renderDeleteQuestionUI(question);
          },
        },
        {
          innerHTML: "Restart",
          onClickHandler: () => {
            questionTraveled = [];
            renderQuestion(questionArray[0]);
          },
          innerHTML: "Back",
          onClickHandler: () => {
            renderPreviousQuestion();
          },
        },
      ];
      buttonGroupData.forEach((buttonData) => {
        const newButton = createButtonElement(
          buttonData.innerHTML,
          "",
          buttonData.onClickHandler
        );
        headerSection.appendChild(newButton);
      });
      return headerSection;
    };
    const createQuestionCustomSection = () => {
      const questionOptionSection = document.createElement("section");
      questionOptionSection.classList.add(
        `question-custom-${questionTreeContainerId}`
      );
      return questionOptionSection;
    };
    const createContentSection = () => {
      const createAnswerButtons = (answers) => {
        const answerButtonGroupSection = document.createElement("section");
        answers.forEach((answer) => {
          const answerButton = createButtonElement(answer.label, "", () => {
            questionTraveled.push(question.id);
            const nextQuestion = findQuestionById(answer.nextQuestionId);
            renderQuestion(nextQuestion);
          });
          answerButtonGroupSection.appendChild(answerButton);
        });
        return answerButtonGroupSection;
      };
      const contentSection = document.createElement("section");
      contentSection.classList.add(
        `question-content-${questionTreeContainerId}`
      );
      const questionContentElement = createQuestionContentElement(
        question.content
      );
      contentSection.appendChild(questionContentElement);
      if (question.answers.length) {
        const answerButtons = createAnswerButtons(question.answers);
        contentSection.appendChild(answerButtons);
      }
      return contentSection;
    };
    questionTreeContainer.replaceChildren();
    questionTreeContainer.appendChild(createHeaderSection());
    questionTreeContainer.appendChild(createQuestionCustomSection());
    questionTreeContainer.appendChild(createContentSection());
  };
  const createQuestion = (question) => {
    return {
      ...question,
      id: new Date().valueOf(),
    };
  };
  const updateQuestion = (questionId, question) => {
    const index = questionArray.findIndex(
      (question) => question.id === questionId
    );
    if (index !== -1) {
      for (let attribute in question) {
        questionArray[index][attribute] = question[attribute];
      }
    } else {
      window.alert("Question not found");
    }
  };
  const deleteQuestion = (questionId) => {
    questionArray = questionArray.filter(
      (question) => question.id !== questionId
    );
  };
  const updateElementStyles = (element, styles) => {
    for (let key in styles) {
      element.style[key] = styles[key];
    }
  };
  return {
    init: async (
      path = "",
      containerId = "",
      options = { startQuestionIndex: 0 }
    ) => {
      questionTreeContainerId = containerId;
      questionTreeContainer = document.getElementById(containerId);
      if (path) {
        questionArray = await readQuestionFromJSONFile(path);
        if (questionArray.length) {
          if (
            options.startQuestionIndex < 0 ||
            options.startQuestionIndex >= questionArray.length
          ) {
            options.startQuestionIndex = 0;
          }
          renderQuestion(questionArray[options.startQuestionIndex]);
        } else {
          window.alert("Question list is empty!");
        }
      } else {
        questionArray = [];
      }
    },
    pushQuestion,
    popQuestion,
    rerender: () => {
      if (questionArray.length) {
        renderQuestion(questionArray[0]);
      }
    },
    print: () => {
      console.log(questionArray);
    },
    styles: {
      updateContainerStyles: (newStyles) => {
        updateElementStyles(questionTreeContainer, newStyles);
      },
    },
    question: {
      create: (question) => {
        return createQuestion(question);
      },
      update: (questionId, newQuestionData) => {
        updateQuestion(questionId, newQuestionData);
      },
      delete: (questionId) => {
        deleteQuestion(questionId);
      },
      findQuestionById,
      findQuestionByIndex,
    },
  };
};

export default questionTree;
