import { markdownToLatex } from "./markdown"
import { Question, MultipleChoiceQuestion } from "../api/QuestionGenerator"

/** Function to render the question in LaTeX */
export function questionToTex(question: Question): string {
  if (question.type === "MultipleChoiceQuestion") {
    const q: MultipleChoiceQuestion = question
    return `\\begin{exercise}[${markdownToLatex(q.name)}]
${markdownToLatex(q.text ?? "")}
\\begin{itemize}
${q.answers.map((answer) => `    \\item ${markdownToLatex(answer)}`).join("\n")}
\\end{itemize}
\\end{exercise}`
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported question type: ${question.type}`)
  }
}
