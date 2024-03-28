import { Language } from "@shared/api/Language.ts"
import { validateParameters } from "@shared/api/Parameters.ts"
import {
  minimalMultipleChoiceFeedback,
  Question,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { Queue } from "@shared/question-generators/StackQueue/Queue.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Queue-Implementation using an Array",
    description: "Basic questions to test the understanding of Queue",
    queueEmpty: "Currently the queue is empty.",
    queueContainsValues: `The queue currently contains the following elements:`,
    multipleChoiceText:
      `Consider having a **Queue "{{0}}"**, who can store at most` +
      " ${{1}}$ " +
      `elements. 
{{2}}
       **We perform the following operations:**
{{3}}
    **What can we definitely say about the queue?**
    `,
    freeTextInput:
      `
    Consider having a **Queue "{{0}}"**, who can store at most` +
      " ${{1}}$ " +
      `elements {{2}}
    **We perform the following operations:**
{{3}}
    `,
  },
  de: {
    name: "Implementierung einer Queue mit einem Array",
    queueEmpty: "Die Queue ist aktuell leer.",
    queueContainsValues: `Die Queue enthält aktuell folgende Elemente:`,
    description: "Basisfragen zum Testen des Verständnisses von Queues",
    multipleChoiceText:
      `Angenommen Sie haben einen **Stack "{{1}}"**, welcher maximal` +
      " ${{2}}$ " +
      `Elemente speichern kann. 
{{3}}
       **Wir führen nun folgende Operationen aus:** 
{{4}}
    **Welche Aussagen können wir nun über die Queue treffen?**`,
    freeTextInput:
      `
    Consider having a **Queue "{{1}}"**, who can store at most` +
      " ${{2}}$ " +
      `elements {{3}}
    **We perform the following operations:**
{{4}}
    `,
  },
}

const answerOptionList: Translations = {
  en: {
    overFlowErrorV1: "We get an overflow error",
    overFlowErrorV1N: "We don't get an overflow error",
    queueFullV1: "The Queue {{0}} is full",
    queueFullV1N: "The Queue {{0}} is not full",
    queueEmptyV1: "The Queue {{0}} is empty",
    queueEmptyV1N: "The Queue {{0}} is not empty",
    queueFrontV1: "The front-element of the Queue {{0}} is {{1}}",
    queueRearV1: "The rear-element of the Queue {{0}} is {{1}}",
    currentNumberOfElements: "The current number of elements in the Queue {{0}} is {{1}}",
  },
  de: {
    overFlowErrorV1: "Wir bekommen einen Overflow Fehler",
    overFlowErrorV1N: "Wir bekommen keinen Overflow Fehler",
    queueFullV1: "Die Queue {{0}} ist voll",
    queueFullV1N: "Die Queue {{0}} ist nicht voll",
    queueEmptyV1: "Die Queue {{0}} ist leer",
    queueEmptyV1N: "Die Queue {{0}} ist nicht leer",
    queueFrontV1: "Das Front-Element der Queue {{0}} ist {{1}}",
    queueRearV1: "Das Rear-Element der Queue {{0}} ist {{1}}",
    currentNumberOfElements: "Die aktuelle Anzahl an Elementen in der Queue {{0}} beträgt {{1}}",
  },
}

/**
 * Function to generate the operations for the queue (CHOICE option)
 * @param elements
 * @param queueSize
 * @param queueOverFlowError
 * @param queueName
 * @param random
 */
function generateOperationsQueue(
  elements: number[],
  queueSize: number,
  queueOverFlowError: boolean,
  queueName: string,
  random: Random,
) {
  const queue: Queue = new Queue(queueSize)
  for (const value of elements) {
    queue.queueElement(value)
  }

  const operations: string[] = []
  if (queueOverFlowError) {
    const missingElements = queueSize - queue.getCurrentNumberOfElements()
    const amountOperations = random.int(missingElements + 1, missingElements + 3)
    for (let i = 0; i < amountOperations; i++) {
      operations.push(queueName + ".enqueue(" + random.int(0, 20) + ")")
    }
    for (let i = 0; i < amountOperations - missingElements - 1; i++) {
      operations.push(queueName + ".dequeue()")
    }
    random.shuffle(operations)
  } else {
    const amountOperations = random.int(4, 8)
    for (let i = 0; i < amountOperations; i++) {
      // decide whether to enqueue or dequeue
      const enOrDe =
        queue.getCurrentNumberOfElements() === 0
          ? true
          : queue.getCurrentNumberOfElements() === queueSize
            ? false
            : random.choice([true, false])

      if (enOrDe) {
        const enqueueValue = random.int(1, 20)
        queue.queueElement(enqueueValue)
        operations.push(queueName + ".enqueue(" + enqueueValue + ")")
      } else {
        queue.dequeueElement()
        operations.push(queueName + ".dequeue()")
      }
    }
  }

  return {
    queue,
    operations,
  }
}

function generateOperationsQueueFreetext(elements: number[], queueSize: number, random: Random) {
  const queue: Queue = new Queue(queueSize)
  for (const value of elements) {
    queue.queueElement(value)
  }

  const operations: { [key: string]: string }[] = []
  const numOperations = random.int(6, 9)

  for (let i = 0; i < numOperations; i++) {
    let queueOrSize = random.weightedChoice([
      ["queue", 0.75],
      ["get", 0.25],
    ])
    if (i > 0) {
      if (
        Object.prototype.hasOwnProperty.call(operations[i - 1], "numberElements") ||
        Object.prototype.hasOwnProperty.call(operations[i - 1], "getFront")
      ) {
        queueOrSize = "queue"
      }
    }
    if (queueOrSize === "queue") {
      let enOrDe = random.choice(["enqueue", "dequeue"])
      if (queue.getCurrentNumberOfElements() === 0) {
        // only possible to enqueue
        enOrDe = "enqueue"
      } else if (queue.getCurrentNumberOfElements() === queue.getSize()) {
        // only dequeue is possible
        enOrDe = "dequeue"
      }
      // if enqueue or dequeue is chosen, add the operation
      if (enOrDe === "enqueue") {
        const enqueueValue = random.int(1, 20)
        operations.push({ enqueue: enqueueValue.toString() })
        queue.queueElement(enqueueValue)
      } else {
        const dequeueValue = queue.dequeueElement()
        operations.push({ dequeue: dequeueValue.toString() })
      }
    }
    // use operation numberElements, getRear or getFront
    else {
      const numOrRearOrFront = random.choice(["numberElements", "getFront"])
      if (numOrRearOrFront === "numberElements") {
        operations.push( {numberElements: queue.getCurrentNumberOfElements().toString()} )
      } else if (numOrRearOrFront === "getFront") {
        operations.push( {getFront: queue.getFront().toString()} )
      }
    }
  }

  return {
    operations,
    queue
  }
}

function generateCorrectAnswersQueue(
  queue: Queue,
  queueOverFlowError: boolean,
  queueName: string,
  random: Random,
  lang: Language,
) {
  const answers: string[] = []
  if (queueOverFlowError) {
    answers.push(t(answerOptionList, lang, "overFlowErrorV1"))
  } else {
    if (queue.getCurrentNumberOfElements() === queue.getSize()) {
      answers.push(t(answerOptionList, lang, "queueFullV1", [queueName]))
    }
    if (queue.getCurrentNumberOfElements() === 0) {
      answers.push(t(answerOptionList, lang, "queueEmptyV1", [queueName]))
    } else {
      // get the front element
      // front element is the next element to get dequeued
      answers.push(t(answerOptionList, lang, "queueFrontV1", [queueName, queue.getFront().toString()]))
      // get the rear element
      answers.push(t(answerOptionList, lang, "queueRearV1", [queueName, queue.getRear().toString()]))
    }
    if (
      queue.getCurrentNumberOfElements() !== queue.getSize() &&
      queue.getCurrentNumberOfElements() !== 0
    ) {
      answers.push(t(answerOptionList, lang, "queueFullV1N", [queueName]))
      answers.push(t(answerOptionList, lang, "queueEmptyV1N", [queueName]))
    }
    answers.push(
      t(answerOptionList, lang, "currentNumberOfElements", [
        queueName,
        queue.getCurrentNumberOfElements().toString(),
      ]),
    )
  }
  random.subset(
    random.shuffle(answers),
    answers.length >= 4 ? random.int(1, 4) : random.int(1, answers.length),
  )
  return { answers }
}

export const queueQuestion: QuestionGenerator = {
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["queue"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],

  generate: (generatorPath, lang = "en", parameters, seed) => {
    const random = new Random(seed)

    const permalink = serializeGeneratorCall({
      generator: queueQuestion,
      lang,
      parameters,
      seed,
      generatorPath,
    })

    // throw an error if the variant is unknown
    if (!validateParameters(parameters, queueQuestion.expectedParameters)) {
      throw new Error(
        `Unknown variant ${parameters.variant.toString()}. 
                Valid variants are: ${queueQuestion.expectedParameters.join(", ")}`,
      )
    }

    const variant = parameters.variant as "choice" | "input"

    const queueName = random.choice("ABCQU".split(""))
    const queueSize = random.choice([4, 5, 6, 7, 8]) // Using only 8 values here, because it is not able to resize

    const queueOverFlowError =
      variant === "choice"
        ? random.weightedChoice([
            [true, 0.15],
            [false, 0.85],
          ])
        : false

    console.log("overflow? " + queueOverFlowError)

    // dynamic does not exist in this queue code
    // increase or decrease is not possible, when there is no dynamic queue
    // and startElements not so much variation like in stack
    const startElementsAmount = queueOverFlowError
      ? random.int(queueSize - 4, queueSize - 1)
      : random.int(0, queueSize - 1)

    const startElements: number[] = []
    let queueInformationElements = ""
    if (startElementsAmount === 0) {
      queueInformationElements = t(translations, lang, "queueEmpty")
    } else {
      queueInformationElements = t(translations, lang, "queueContainsValues")
      queueInformationElements += "\n\n|Index|Value|\n|---|---|\n"
      for (let i = 0; i < startElementsAmount; i++) {
        const newValue = random.int(0, 20)
        startElements.push(newValue)
        queueInformationElements += `|${i}|${newValue}|\n`
      }
      queueInformationElements += "|#div_my-5#||\n"
    }

    // variation between choice and input
    let question: Question
    if (variant === "choice") {
      const generatedOperations = generateOperationsQueue(
        startElements,
        queueSize,
        queueOverFlowError,
        queueName,
        random,
      )

      const correctAnswers = generateCorrectAnswersQueue(
        generatedOperations.queue,
        queueOverFlowError,
        queueName,
        random,
        lang,
      )

      const allAnswers = correctAnswers.answers
      allAnswers.splice(0, 0, "still need more answers")

      const queue = generatedOperations.queue
      console.log(queue.getQueue())
      const operations = generatedOperations.operations

      question = {
        type: "MultipleChoiceQuestion",
        name: queueQuestion.name(lang),
        path: permalink,
        allowMultiple: true,
        text: t(translations, lang, "multipleChoiceText", [
          queueName,
          queueSize.toString(),
          queueInformationElements,
          "\n- " + operations.join("\n- "),
        ]),
        answers: allAnswers,
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: 0,
        }),
      }
    } else {

      const operationsFreeText = generateOperationsQueueFreetext(
        startElements,
        queueSize,
        random
      )

      let inputText = "| Operation | Result |\n| --- | --- |\n"
      const correctAnswers: { [key: string]: string } = {}
      let index = 0
      for (const operation of operationsFreeText.operations) {
        if (Object.prototype.hasOwnProperty.call(operation, "enqueue")) {
          inputText += `| ${queueName}.enqueue(${operation.enqueue}) |(void function)|\n`
        }
        if (Object.prototype.hasOwnProperty.call(operation, "dequeue")) {
          inputText += `| ${queueName}.dequeue() | {{dequeue-${index}####}} |\n`
          correctAnswers[`dequeue-${index}`] = operation.dequeue
        }
        if (Object.prototype.hasOwnProperty.call(operation, "numberElements")) {
          inputText += `| ${queueName}.numberElements() | {{numElements-${index}####}} |\n`
          correctAnswers[`numElements-${index}`] = operation.numberElements
        }
        if (Object.prototype.hasOwnProperty.call(operation, "getFront")) {
          inputText += `| ${queueName}.getFront() | {{getFront-${index}####}} |\n`
          correctAnswers[`getFront-${index}`] = operation.getFront
        }
        index++
      }

      const fullOrPartQueue = random.choice(["full", "part"])
      if (fullOrPartQueue === "full") {
        inputText += `|${queueName}.getQueue()|{{getQueue-${index}####}}|`
        correctAnswers[`getQueue-${index}`] = operationsFreeText.queue.getQueue()
      }
      else {
        inputText += `|${queueName}.toString()|{{toString-${index}####}}|`
        correctAnswers[`toString-${index}`] = operationsFreeText.queue.toString()
      }
      inputText += `|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |`

      // add the hint what toString and getQueue mean
      if (fullOrPartQueue === "full") {
        inputText += `\n\n **Note:** The method **getQueue()** returns the complete queue as a string. If the queue is not full, the remaining elements are filled with -1.\n`
      }
      else {
        inputText += `\n\n **Note:** The method **toString()** only returns the part between rear and front. Every other value from the field is ignored.\n`
      }

      console.log(correctAnswers)

      question = {
        type: "MultiFreeTextQuestion",
        name: queueQuestion.name(lang),
        path: permalink,
        text: t(translations, lang, "freeTextInput", [
          queueName,
          queueSize.toString(),
          queueInformationElements,
          inputText,
        ]),
        fillOutAll: true,
      }
    }

    return { question }
  },
}
