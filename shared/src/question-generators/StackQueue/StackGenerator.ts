import { Language } from "@shared/api/Language.ts"
import { validateParameters } from "@shared/api/Parameters.ts"
import {
  FreeTextFeedbackFunction,
  minimalMultipleChoiceFeedback,
  MultiFreeTextFormatFunction,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { Stack } from "@shared/question-generators/StackQueue/Stack.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunction, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Stack-Implementation using an Array",
    description: "Basic questions to test the understanding of Stacks",
    dynamic: "dynamic",
    notDynamic: "not dynamic",
    stackEmpty: "Currently the stack is empty.",
    stackContainsValues: `The stack currently contains the following elements:`,
    multipleChoiceText:
      `Consider having a **{{0}} Stack "{{1}}"**, who can store at most` +
      " ${{2}}$ " +
      `elements. 
{{3}}
       **We perform the following operations:**
{{4}}
    **What can we definitely say about the stack?**
    `,
    freeTextInput:
      `
    Consider having a **{{0}} Stack "{{1}}"**, who can store at most` +
      " ${{2}}$ " +
      `elements {{3}}
    **We perform the following operations:**
{{4}}
    `,
  },
  de: {
    name: "Implementierung eines Stacks mit einem Array",
    dynamic: "dynamisch",
    notDynamic: "nicht dynamisch",
    stackEmpty: "Der Stack ist aktuell leer.",
    stackContainsValues: `Der Stack enthält aktuell folgende Elemente:`,
    description: "Basisfragen zum Testen des Verständnisses von Stacks",
    multipleChoiceText:
      `Angenommen Sie haben einen **{{0}} Stack "{{1}}"**, welcher maximal` +
      " ${{2}}$ " +
      `Elemente speichern kann. 
{{3}}
       **Wir führen nun folgende Operationen aus:** 
{{4}}
    **Welche Aussagen können wir nun über den Stack treffen?**`,
  },
}

const answerOptionList: Translations = {
  en: {
    overFlowErrorV1: "We get an overflow error",
    overFlowErrorV1N: "We don't get an overflow error",
    stackFullV1: "The Stack {{0}} is full",
    stackFullV1N: "The Stack {{0}} is not full",
    stackEmptyV1: "The Stack {{0}} is empty",
    stackEmptyV1N: "The Stack {{0}} is not empty",
    bottomElementV1: "In the Stack {{0}} the bottom element is {{1}}",
    topElementV1: "The top element of the Stack {{0}} is {{1}}",
    couldStoreElementsV1: "The Stack {{0}} could store {{1}} elements",
    currentlyStoreElementsV1: "The Stack {{0}} currently stores {{1}} elements",
    pushMoreCouldStoreV1:
      "Pushing {{0}} values onto the Stack {{1}} will increase the number of elements stored by {{0}}",
    pushMoreCouldStoreV1N:
      "Pushing {{0}} values onto the Stack {{1}} will not increase the number of elements stored",
    pushMoreCouldIncrSizeV1:
      "Pushing {{0}} values onto the Stack {{1}} will increase the size of the Stack to {{2}}",
    pushMoreCouldIncrSizeV1N:
      "Pushing {{0}} values onto the Stack {{1}} will not increase the size of the Stack",
    popForQuaterV1: "Popping {{0}} values from the Stack {{1}} will decrease the size by 4",
  },
  de: {
    overFlowErrorV1: "Wir bekommen einen Overflow Fehler",
    overFlowErrorV1N: "Wir bekommen keinen Overflow Fehler",
    stackFullV1: "Der Stack {{0}} ist voll",
    stackFullV1N: "Der Stack {{0}} ist nicht voll",
    stackEmptyV1: "Der Stack {{0}} ist leer",
    stackEmptyV1N: "Der Stack {{0}} ist nicht leer",
    bottomElementV1: "Im Stack {{0}} ist das unterste Element {{1}}",
    topElementV1: "Das oberste Element des Stacks {{0}} ist {{1}}",
    couldStoreElementsV1: "Der Stack {{0}} könnte {{1}} Elemente speichern",
    currentlyStoreElementsV1: "Der Stack {{0}} speichert aktuell {{1}} Elemente",
    pushMoreCouldStoreV1:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Anzahl der gespeicherten Elemente um {{0}} erhöhen",
    pushMoreCouldStoreV1N:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Anzahl der gespeicherten Elemente nicht erhöhen",
    pushMoreCouldIncrSizeV1:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Größe des Stacks auf {{2}} erhöhen",
    pushMoreCouldIncrSizeV1N:
      "Das Pushen von {{0}} Elementen auf den Stack {{1}} wird die Größe des Stacks nicht erhöhen",
    popForQuaterV1: "Das Popen von {{0}} Elementen vom Stack {{1}} wird die Größe um 4 verringern",
  },
}

/**
 * This function generates the operations for the stack
 * @param elements  The elements to push onto the stack before generating operations
 *                  Those are the start values
 * @param stackSize The size of the stack at the beginning
 * @param resize   If the stack is dynamic or not
 * @param increase If the stack should increase or decrease
 * @param stackOverFlowError If we want to get an overflow error
 * @param stackName The name of the stack
 * @param random
 */
function generateOperations(
  elements: number[],
  stackSize: number,
  resize: boolean,
  increase: boolean,
  stackOverFlowError: boolean,
  stackName: string,
  random: Random,
) {
  const stack: Stack = new Stack(stackSize, stackOverFlowError ? true : resize)
  for (const value of elements) {
    stack.push(value)
  }
  let operations: string[] = []
  // Differ between the two cases
  // if true, create an operation list, in which we exceed the max array size
  if (stackOverFlowError) {
    const missingElements = stack.getSize() - stack.getCurrentPosition()
    const amountOperations = random.int(missingElements + 1, missingElements + 3)
    for (let i = 0; i < amountOperations; i++) {
      operations.push(stackName + ".push(" + random.int(1, 20) + ")")
    }
    for (let i = 0; i < amountOperations - missingElements - 1; i++) {
      random.weightedChoice([
        [true, 0.15],
        [false, 0.85],
      ])
        ? operations.push(stackName + ".push(" + random.int(1, 20) + ")")
        : operations.push(stackName + ".getTop()")
    }
    operations = random.shuffle(operations)
    // do those operations until we get an overflow error
    for (let i = 0; i < operations.length; i++) {
      const value = operations[i].match(/\((.*?)\)/)
      if (value !== null) {
        if (operations[i].includes("push")) {
          // get the value from inside the ()
          stack.push(parseInt(value[1]))
        }
      }
    }
  } else {
    const numOfOperations = random.int(4, 8)
    for (let i = 0; i < numOfOperations; i++) {
      // if there are no elements in the stack, we can only push, or the stack is full
      // and no resizing allowed then only pop, otherwise 50% for each push or pop
      const pushOrPop =
        stack.getCurrentPosition() === 0
          ? true
          : !resize && stack.getCurrentPosition() === stackSize - 1
            ? false
            : increase
              ? random.weightedChoice([
                  [true, 0.7],
                  [false, 0.3],
                ])
              : random.weightedChoice([
                  [true, 0.25],
                  [false, 0.75],
                ])

      if (pushOrPop) {
        const pushValue = random.int(1, 20)
        operations.push(stackName + ".push(" + pushValue + ")")
        stack.push(pushValue)
      } else {
        operations.push(stackName + ".getTop()")
        stack.getTop()
      }
    }
  }

  return {
    operations: operations,
    stack: stack,
  }
}

function generateOperationsFreetext(
  elements: number[],
  stackSize: number,
  resize: boolean,
  random: Random,
) {
  const stack: Stack = new Stack(stackSize, resize)
  // initialize the stack with the elements
  for (const value of elements) {
    stack.push(value)
  }

  function ppORsizeDecider(lastOperation: { [key: string]: string }, i: number): boolean {
    let ppORsize = random.weightedChoice([
      [true, 0.2],
      [false, 0.8],
    ])
    if (i > 0) {
      if (
        Object.prototype.hasOwnProperty.call(lastOperation, "size") ||
        Object.prototype.hasOwnProperty.call(lastOperation, "amount")
      ) {
        ppORsize = false
      }
    }
    return ppORsize
  }

  const operations: { [key: string]: string }[] = []

  const numOfOperations = random.int(4, 8)
  if (!resize) {
    for (let i = 0; i < numOfOperations; i++) {
      // decide if we want to ask for current number of elements or current size
      const ppORsize = ppORsizeDecider(operations[i - 1], i)
      // if true -> push or pop if false -> current size of current number of elements
      if (ppORsize) {
        const sizeOrAmount = random.choice([true, false])
        // if true -> getSize() if false -> getCurrentPosition()
        if (sizeOrAmount) {
          operations.push({ size: stack.getSize().toString() })
        } else {
          operations.push({ amount: stack.getCurrentPosition().toString() })
        }
      } else {
        // if there are no elements in the stack, we can only push, or the stack is full
        // and no resizing allowed then only pop, otherwise 50% for each push or pop
        const pushOrPop =
          stack.getCurrentPosition() === 0
            ? true
            : !resize && stack.getCurrentPosition() === stackSize - 1
              ? false
              : random.weightedChoice([
                  [true, 0.5],
                  [false, 0.5],
                ])

        if (pushOrPop) {
          const pushValue = random.int(1, 20)
          operations.push({ push: pushValue.toString() })
          stack.push(pushValue)
        } else {
          const topValue = stack.getTop()
          operations.push({ getTop: topValue.toString() })
        }
      }
    }
  } else {
    const increase = random.weightedChoice([
      [true, stack.getCurrentPosition()],
      [false, stack.getSize() - stack.getCurrentPosition()],
    ])
    for (let i = 0; i < numOfOperations; i++) {
      // decide if we want to ask for current number of elements or current size
      const ppORsize = ppORsizeDecider(operations[i - 1], i)
      // if true -> push or pop if false -> current size of current number of elements
      if (ppORsize) {
        const sizeOrAmount = random.choice([true, false])
        // if true -> getSize() if false -> getCurrentPosition()
        if (sizeOrAmount) {
          operations.push({ size: stack.getSize().toString() })
        } else {
          operations.push({ amount: stack.getCurrentPosition().toString() })
        }
      } else {
        const pushOrPop = increase
          ? random.weightedChoice([
              [true, 0.7],
              [false, 0.3],
            ])
          : random.weightedChoice([
              [true, 0.25],
              [false, 0.75],
            ])
        if (pushOrPop) {
          const pushValue = random.int(1, 20)
          operations.push({ push: pushValue.toString() })
          stack.push(pushValue)
        } else {
          const topValue = stack.getTop()
          operations.push({ getTop: topValue.toString() })
        }
      }
    }
  }

  return {
    operations,
    stack,
  }
}

/**
 * This function generates the answers for the stack (which are correct) using options from answerOptionList
 * @param stack
 * @param stackOverflowError
 * @param dynamic
 * @param stackName
 * @param random
 * @param lang
 */
function generateCorrectAnswers(
  stack: Stack,
  stackOverflowError: boolean,
  dynamic: boolean,
  stackName: string,
  random: Random,
  lang: Language,
) {
  const answers = []
  if (stackOverflowError) {
    answers.push(t(answerOptionList, lang, "overFlowErrorV1"))
    /*
    random.choice([true, false])
      ? answers.push(
          `If the Stack ${stackName} would have been dynamic, it could store ${stack.getSize()} now.`,
        )
      : null
     */
    // more correct answers here???
  } else {
    // TODO use the same sentence logic, but vary between sentence structure
    if (stack.getCurrentPosition() === stack.getSize()) {
      answers.push(t(answerOptionList, lang, "stackFullV1", [stackName]))
    }
    if (stack.getCurrentPosition() === 0) {
      answers.push(t(answerOptionList, lang, "stackEmptyV1", [stackName]))
    } else {
      answers.push(
        t(answerOptionList, lang, "bottomElementV1", [stackName, stack.getStack()[0].toString()]),
      )
    }
    if (stack.getCurrentPosition() > 0) {
      answers.push(
        t(answerOptionList, lang, "topElementV1", [stackName, stack.getTopValue().toString()]),
      )
    }

    answers.push(
      t(answerOptionList, lang, "couldStoreElementsV1", [stackName, stack.getSize().toString()]),
    )
    answers.push(
      t(answerOptionList, lang, "currentlyStoreElementsV1", [
        stackName,
        stack.getCurrentPosition().toString(),
      ]),
    )
    if (dynamic) {
      const increaseValue = (stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)).toString()
      answers.push(t(answerOptionList, lang, "pushMoreCouldStoreV1", [increaseValue, stackName]))
      answers.push(
        t(answerOptionList, lang, "pushMoreCouldIncrSizeV1", [
          increaseValue,
          stackName,
          (stack.getSize() * 2).toString(),
        ]),
      )
    }
  }
  // Shuffle the answers and return a subset 2 to 4 of those or if the answer length only 1 then 1 to 4
  return random.subset(
    answers,
    random.int(answers.length === 1 ? 1 : 2, answers.length > 3 ? 4 : answers.length),
  )
}

/**
 * This function generates the wrong answers for the stack using options from answerOptionList
 * @param stack
 * @param stackOverflowError
 * @param dynamic
 * @param stackName
 * @param random
 * @param lang
 * @param amount
 */
function generateWrongAnswer(
  stack: Stack,
  stackOverflowError: boolean,
  dynamic: boolean,
  stackName: string,
  random: Random,
  lang: Language,
  amount: number,
): string[] {
  const wrongAnswers: string[] = []
  // either the wrong option we get or we don't get an overflow error
  if (stackOverflowError) {
    wrongAnswers.push(t(answerOptionList, lang, "overFlowErrorV1N"))
  } else {
    wrongAnswers.push(t(answerOptionList, lang, "overFlowErrorV1"))
  }

  // check the stack size
  // check if full
  if (stack.getSize() === stack.getCurrentPosition()) {
    wrongAnswers.push(t(answerOptionList, lang, "stackFullV1N", [stackName]))
  } else {
    stack.getSize() - stack.getCurrentPosition() < 3
      ? wrongAnswers.push(t(answerOptionList, lang, "stackFullV1", [stackName]))
      : null
  }
  // check if empty
  if (stack.getCurrentPosition() === 0) {
    wrongAnswers.push(t(answerOptionList, lang, "stackEmptyV1N", [stackName]))
  } else {
    stack.getCurrentPosition() < 3
      ? wrongAnswers.push(t(answerOptionList, lang, "stackEmptyV1", [stackName]))
      : null
  }

  // check the top element
  if (stack.getCurrentPosition() > 0) {
    if (
      stack.getStack()[stack.getCurrentPosition() - 1] !==
      stack.getStack()[stack.getCurrentPosition() - 1]
    ) {
      wrongAnswers.push(
        t(answerOptionList, lang, "topElementV1", [
          stackName,
          stack.getStack()[stack.getCurrentPosition() - 1].toString(),
        ]),
      )
    }
    random.uniform() > 0.8
      ? wrongAnswers.push(
          t(answerOptionList, lang, "topElementV1", [stackName, random.int(1, 20).toString()]),
        )
      : null
  }

  // re-declaring increaseValue to get different numbers
  if (!dynamic) {
    let increaseValue = (stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)).toString()
    wrongAnswers.push(t(answerOptionList, lang, "pushMoreCouldStoreV1", [increaseValue, stackName]))
    increaseValue = (stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)).toString()
    wrongAnswers.push(
      t(answerOptionList, lang, "pushMoreCouldIncrSizeV1", [
        increaseValue,
        stackName,
        (stack.getSize() * 2).toString(),
      ]),
    )
    let decreaseValue = stack.getCurrentPosition() - Math.floor(stack.getSize() * 0.25)
    if (decreaseValue > stack.getCurrentPosition()) decreaseValue += random.int(0, 1)
    wrongAnswers.push(t(answerOptionList, lang, "popForQuaterV1", [decreaseValue.toString(), stackName]))
  } else {
    let increaseValue = (stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)).toString()
    wrongAnswers.push(t(answerOptionList, lang, "pushMoreCouldStoreV1N", [increaseValue, stackName]))
    increaseValue = (stack.getSize() - stack.getCurrentPosition() + random.int(1, 3)).toString()
    wrongAnswers.push(
      t(answerOptionList, lang, "pushMoreCouldIncrSizeV1N", [
        increaseValue,
        stackName,
        (stack.getSize() * 2).toString(),
      ]),
    )
    // No question about decreasing here
  }
  // TODO: Missing more wrong answers

  return random.subset(wrongAnswers, amount > wrongAnswers.length ? wrongAnswers.length : amount)
}

export const stackQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["stack", "queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],

  /**
   * Generates a new MultipleChoiceQuestion question.
   *
   * @param generatorPath The path the generator is located. Defined in settings/questionSelection
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case, none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (generatorPath, lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: stackQuestion,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    // throw an error if the variant is unknown
    if (!validateParameters(parameters, stackQuestion.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. 
                Valid variants are: ${stackQuestion.expectedParameters.join(", ")}`,
      )
    }

    const variant = parameters.variant as "choice" | "input"

    const stackName = random.choice("ABCSU".split(""))
    const stackSize = random.choice([4, 6, 8, 10])

    // weighted choice if we want to get an OverFlow error or not (15% for Overflow 85% for not)
    const stackOverflowError =
      variant === "choice"
        ? random.weightedChoice([
            [true, 0.15],
            [false, 0.85],
          ])
        : false

    // decide if stack is dynamic or not
    const dynamic = !stackOverflowError
      ? random.weightedChoice([
          [true, 0.65],
          [false, 0.35],
        ])
      : false

    // a boolean to decide if we want to increase or decrease
    // weighted because with increase happens more often than decrease
    const increase = random.weightedChoice([
      [true, 0.7],
      [false, 0.3],
    ])

    // pick a number between 0 and stack size
    const stackElementsAmount = stackOverflowError
      ? random.int(stackSize - 4, stackSize - 1)
      : dynamic
        ? increase
          ? random.int(stackSize - 3, stackSize - 1)
          : random.int(Math.ceil(stackSize * 0.25), 3)
        : random.int(0, stackSize - 1)

    let stackElementsString: string
    const stackElementsValues = []
    if (stackElementsAmount === 0) {
      stackElementsString = t(translations, lang, "stackEmpty")
    } else {
      // create a table view of the stack
      stackElementsString = t(translations, lang, "stackContainsValues")
      for (let i = 0; i < stackElementsAmount; i++) {
        stackElementsValues.push(random.int(1, 20))
      }
      stackElementsString += "\n\n| Index | Value |\n| --- | --- |"
      for (let i = 0; i < stackElementsAmount; i++) {
        stackElementsString += `\n| ${i} | ${stackElementsValues[i]} |`
      }
      // add the new line to the table for the extra feature #div_my-5#
      stackElementsString += `\n|#div_my-5#| |`
    }

    /*
    Variation between multiple choice and input
     */
    let question: Question
    if (variant === "choice") {
      const generation = generateOperations(
        stackElementsValues,
        stackSize,
        dynamic,
        increase,
        stackOverflowError,
        stackName,
        random,
      )

      const correctAnswers = generateCorrectAnswers(
        generation.stack,
        stackOverflowError,
        dynamic,
        stackName,
        random,
        lang,
      )

      const amount = 6 - correctAnswers.length
      const wrongAnswers = generateWrongAnswer(
        generation.stack,
        stackOverflowError,
        dynamic,
        stackName,
        random,
        lang,
        amount,
      )

      const allAnswers = correctAnswers.concat(wrongAnswers)
      random.shuffle(allAnswers)
      allAnswers.splice(0, 0, "**Das müssen noch mehr kompliziertere Antworten sein**")

      const correctAnswerIndex = []
      for (let i = 0; i < correctAnswers.length; i++) {
        correctAnswerIndex.push(allAnswers.indexOf(correctAnswers[i]))
      }

      question = {
        type: "MultipleChoiceQuestion",
        name: stackQuestion.name(lang),
        path: permalink,
        allowMultiple: true,
        text: t(translations, lang, "multipleChoiceText", [
          dynamic ? t(translations, lang, "dynamic") : t(translations, lang, "notDynamic"),
          stackName,
          stackSize.toString(),
          stackElementsString,
          "\n- " + generation.operations.join("\n- ") + "\n",
        ]),
        answers: allAnswers,
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: correctAnswerIndex,
        }),
      }
    } else {
      const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
        // check if the text provided is for the toString question
        if (correctAnswers[fieldID + "-format"] === "toString") {
          return { valid: true, message: "" }
        }
        // else check if the text is a number
        if (isNaN(parseInt(text))) {
          return { valid: false, message: "Please enter a number" }
        }
        return { valid: true, message: "" }
      }

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        let resultMap: { [key: string]: string } = {}
        try {
          resultMap = JSON.parse(text) as { [key: string]: string }
        } catch (e) {
          return {
            correct: false,
            message: tFunction(translations, lang).t("feedback.incomplete"),
            correctAnswer: "The answer is not a valid JSON",
          }
        }

        for (const key in resultMap) {
          if (correctAnswers[key + "-format"] === "toString") {
            // check if the user provided [ ] around the toString answer
            if (!resultMap[key].startsWith("[")) {
              resultMap[key] = "[" + resultMap[key]
            }
            if (!resultMap[key].endsWith("]")) {
              resultMap[key] = resultMap[key] + "]"
            }
          }
          if (resultMap[key] !== correctAnswers[key]) {
            return {
              correct: false,
              message: tFunction(translations, lang).t("feedback.incomplete"),
              correctAnswer: "I dont know how to display the correct solution ",
            }
          }
        }
        return {
          correct: true,
          message: tFunction(translations, lang).t("feedback.correct"),
        }
      }

      const generatedOperations = generateOperationsFreetext(
        stackElementsValues,
        stackSize,
        dynamic,
        random,
      )
      const operations = generatedOperations.operations
      const stack = generatedOperations.stack

      // {{input-1#NL###}}{{input-2####}}
      let inputText = "| Operation | Result |\n| --- | --- |\n"
      const correctAnswers: { [key: string]: string } = {}
      let index = 0
      for (const operation of operations) {
        if (Object.prototype.hasOwnProperty.call(operation, "push")) {
          inputText += `|${stackName}.push(${operation.push})|(void function)|\n`
        } else {
          if (Object.prototype.hasOwnProperty.call(operation, "getTop")) {
            inputText += `|${stackName}.getTop()|{{input-${index}####}}|\n`
            correctAnswers[`input-${index}`] = operation.getTop
            correctAnswers[`input-${index}-format`] = "getTop"
          } else if (Object.prototype.hasOwnProperty.call(operation, "size")) {
            inputText += `|${stackName}.getSize()|{{input-${index}####}}|\n`
            correctAnswers[`input-${index}`] = stack.getSize().toString()
            correctAnswers[`input-${index}-format`] = "getSize"
          } else if (Object.prototype.hasOwnProperty.call(operation, "amount")) {
            inputText += `|${stackName}.getCurrentPosition()|{{input-${index}####}}|\n`
            correctAnswers[`input-${index}`] = stack.getCurrentPosition().toString()
            correctAnswers[`input-${index}-format`] = "getCurrentPosition"
          }
        }
        index++
      }

      // add question to write down the array
      inputText += `|${stackName}.toString()|{{input-${index}####}}|\n`
      correctAnswers[`input-${index}`] = stack.toString()
      correctAnswers[`input-${index}-format`] = "toString"

      // adding the extra feature for a div
      inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`
      // generate the input fields for the operations (if either getTop, size or amount)
      // if push, we don't ask the user for input
      // last question is to write down the array

      question = {
        type: "MultiFreeTextQuestion",
        name: stackQuestion.name(lang),
        path: permalink,
        fillOutAll: true,
        text: t(translations, lang, "freeTextInput", [
          dynamic ? t(translations, lang, "dynamic") : t(translations, lang, "notDynamic"),
          stackName,
          stackSize.toString(),
          stackElementsString,
          inputText,
        ]),
        checkFormat,
        feedback,
      }
    }

    return { question }
  },
}
