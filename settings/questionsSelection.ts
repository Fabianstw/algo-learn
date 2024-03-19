/**
 * This file contains a list of all questions available on the give instance of SEAL.
 * TODO: In future this file should be generated by a script.
 */
import { QuestionRoutes } from "../shared/src/api/QuestionRouter"
// import { ExampleQuestion } from "../shared/src/question-generators/example/example"
import { Between } from "../shared/src/question-generators/asymptotics/between"
import { LandauNotation } from "../shared/src/question-generators/asymptotics/landau"
import { AsymptoticsPreciseLanguage } from "../shared/src/question-generators/asymptotics/preciseLanguage"
import { SortTerms } from "../shared/src/question-generators/asymptotics/sort"
import { SimplifySum } from "../shared/src/question-generators/asymptotics/sum"
import { huffmanCoding } from "../shared/src/question-generators/huffman-coding/huffmanCoding.ts"
import { RecursionFormula } from "../shared/src/question-generators/recursion/formula"
import { RecurrenceMaster } from "../shared/src/question-generators/recursion/recurrenceMaster"
import { Loops } from "../shared/src/question-generators/time/loops"

/** List of all question routes */
export const allQuestionGeneratorRoutes: QuestionRoutes = [
  // {
  //   path: "example/example",
  //   generator: ExampleQuestion,
  // },
  {
    path: "asymptotics/precise-language",
    generator: AsymptoticsPreciseLanguage,
  },
  {
    path: "asymptotics/sort",
    generator: SortTerms,
  },
  {
    path: "asymptotics/landau",
    generator: LandauNotation,
  },
  {
    path: "asymptotics/sum",
    generator: SimplifySum,
  },
  {
    path: "asymptotics/between",
    generator: Between,
  },
  {
    path: "recursion/formula",
    generator: RecursionFormula,
  },
  {
    path: "recursion/master",
    generator: RecurrenceMaster,
  },
  {
    path: "time/loops",
    generator: Loops,
  },
  {
    path: "huffmancoding/huffmanCoding",
    generator: huffmanCoding,
  },
]

// links to images of question groups
export const images = {
  time: new URL("../front-end/assets/images/skill-time.jpg", import.meta.url),
  asymptotics: new URL("../front-end/assets/images/skill-asymptotics.jpg", import.meta.url),
  recursion: new URL("../front-end/assets/images/skill-recursion.jpg", import.meta.url),
  example: new URL("../front-end/assets/images/skill-default.jpg", import.meta.url),
}
