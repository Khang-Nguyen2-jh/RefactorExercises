import questionTree from "./QuestionTree.js";

const main = async () => {
  const newQuestionTree = questionTree();
  await newQuestionTree.init("./data/data.json", "id1");
  const newQuestion = newQuestionTree.question.create({
    content: "Is 4^3 = 64?",
    answers: [],
  });
  newQuestionTree.pushQuestion(newQuestion);
  newQuestionTree.question.update(3, {
    answers: [{ label: "Go to new question", nextQuestionId: newQuestion.id }],
  });
  newQuestionTree.styles.updateContainerStyles({
    "background-color": "rgb(245, 255, 151)",
    padding: "24px",
    width: "500px",
  });
};
main();
