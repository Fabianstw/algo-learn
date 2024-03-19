// CustomInput.tsx
import React, { Fragment } from "react"
import { FreeTextFeedback } from "@shared/api/QuestionGenerator.ts"
import { MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"
import { Input } from "@/components/ui/input"

interface CustomInputProps {
  id: string
  state: {
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }
  setText: (fieldID: string, value: string) => void
}

export const CustomInput: React.FC<CustomInputProps> = ({
  id,
  state,
  setText,
}: {
  id: string
  state: {
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }
  setText: (fieldID: string, value: string) => void
}) => {
  const inputSplit = id.split("#")
  const inputID = inputSplit[0]
  const inputAlign = inputSplit[1]
  const inputPrompt = inputSplit[2]
  const inputSize = inputSplit[3]
  const inputPlaceholder = inputSplit[4]

  // check if inputID exists in state
  if (!state.text[inputID]) {
    state.text[inputID] = ""
    state.modeID[inputID] = "initial"
    state.formatFeedback[inputID] = ""
  }

  const msgColorBorder =
    state.modeID[inputID] !== "draft" && state.modeID[inputID] !== "initial"
      ? "border-red-500 focus:border-red-500 focus:outline-none"
      : ""
  const msgColor =
    state.modeID[inputID] !== "draft" && state.modeID[inputID] !== "initial"
      ? "mt-2 rounded bg-red-600 dark:bg-red-400 bg-opacity-50 p-2 text-sm"
      : "mt-2 text-green-600 dark:text-green-400"

  const sizeSplit = inputSize.split("_")
  let width = sizeSplit[0]
  let height = sizeSplit[1]

  let align = ""
  if (inputAlign === "IL") {
    if (!width) width = "16"
    if (!height) height = "6"
    align = "m-2 inline-block h-" + height + " w-" + width
  } else {
    if (width) {
      align = align + "w-" + width + " "
    } else {
      align = align + "w-full" + " "
    }
    if (height) {
      align = align + "h-" + height + " "
    } else {
      align = align + "h-full" + " "
    }
  }

  let promptElement
  if (inputPrompt) {
    promptElement = <Markdown md={inputPrompt} />
  }

  let spacing
  if (inputAlign === "NL") {
    spacing = <br />
  }

  let inputElement
  if (inputAlign === "IL") {
    inputElement = (
      <>
        <Fragment key={`inline-fragment-${inputID}`}>
          <Input
            key={`newline-input-${inputID}`}
            autoFocus
            disabled={state.mode === "correct" || state.mode === "incorrect"}
            value={state.text[inputID] || ""}
            onChange={(e) => {
              setText(inputID, e.target.value)
            }}
            type="text"
            className={`${align}`}
            placeholder={inputPlaceholder ? inputPlaceholder : ""}
          />
        </Fragment>
      </>
    )
  } else {
    inputElement = (
      <div>
        {spacing}
        <div className="flex flex-row items-center">
          <div className="mr-2">
            {promptElement}
            {inputPrompt ? (
              <FeedbackComponent
                inputID={inputID}
                className="mt-2 rounded bg-opacity-100 pb-2 pt-2 text-sm"
                formatFeedback={state.formatFeedback}
                feedback={false}
              />
            ) : null}
          </div>
          <div className="flex w-full flex-col">
            <Input
              key={`newline-input-${inputID}`}
              autoFocus
              disabled={state.mode === "correct" || state.mode === "incorrect"}
              value={state.text[inputID] || ""}
              onChange={(e) => {
                setText(inputID, e.target.value)
              }}
              type="text"
              className={`${msgColorBorder} ${align}`}
              placeholder={inputPlaceholder || ""}
            />
            <FeedbackComponent
              inputID={inputID}
              className={`${msgColor}`}
              formatFeedback={state.formatFeedback}
              feedback={true}
            />
          </div>
        </div>
        {spacing}
      </div>
    )
  }

  return <>{inputElement}</>
}

interface Props {
  inputID: string
  className: string
  formatFeedback: { [key: string]: string }
  feedback: boolean
}

export const FeedbackComponent: React.FC<Props> = ({ inputID, className, formatFeedback, feedback }) => {
  return (
    <>
      {formatFeedback[inputID] && (
        <div className={`${className}`}>{feedback ? formatFeedback[inputID] : <span>&nbsp;</span>}</div>
      )}
    </>
  )
}
