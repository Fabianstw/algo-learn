// CustomInput2.tsx
import React, { useState } from "react"
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
  const inputPlaceholder = inputSplit[3]
  const feedbackVariation = inputSplit[4] // case over -> overlay | new -> no overlay, move other stuff down

  // check if inputID exists in state
  if (!state.text[inputID]) {
    state.text[inputID] = ""
    state.modeID[inputID] = "initial"
    state.formatFeedback[inputID] = ""
  }

  const inputBorderColor =
    state.modeID[inputID] === "invalid" ? "border-red-500 focus:border-red-500" : ""

  const align: string = "w-full h-full"

  let promptElement
  if (inputPrompt) {
    promptElement = <Markdown md={inputPrompt} />
  }

  let spacing
  if (inputAlign === "NL") {
    spacing = <br />
  }

  const [isInputFocused, setIsInputFocused] = useState(false)

  const inputElement = (
    <div>
      {spacing}
      <div className="flex flex-col">
        <div className="flex flex-row items-center">
          <div className="mr-2">{promptElement}</div>

          <div className={`${align} relative`}>
            <Input
              key={`newline-input-${inputID}`}
              autoFocus
              disabled={state.mode === "correct" || state.mode === "incorrect"}
              value={state.text[inputID] || ""}
              onChange={(e) => {
                setText(inputID, e.target.value)
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              type="text"
              className={`${inputBorderColor} focus:outline-none`}
              placeholder={inputPlaceholder || ""}
            />
          </div>
        </div>
        {isInputFocused && state.text[inputID] && (
          <FeedbackComponent
            inputID={inputID}
            formatFeedback={state.formatFeedback}
            mode={state.modeID}
          />
        )}
      </div>
      {spacing}
    </div>
  )

  return <>{inputElement}</>
}



const FeedbackComponent = ({
  inputID,
  formatFeedback,
  mode,
}: {
  inputID: string
  formatFeedback: { [key: string]: string }
  mode: { [p: string]: string }
}) => {
  console.log(mode[inputID])
  const feedbackBackgroundColor = formatFeedback[inputID]
    ? mode[inputID] === "draft"
      ? "border-l-4 border-green-400"
      : "border-l-4 border-red-400"
    : ""
  console.log(feedbackBackgroundColor)
  return (
    <div className={`mt-2 p-2 ${feedbackBackgroundColor} `}>
      {formatFeedback[inputID] && <span>{formatFeedback[inputID]}</span>}
    </div>
  )
}

/*

const FeedbackComponent = ({inputID, formatFeedback, mode}) => {
  const feedbackBackgroundColor = formatFeedback[inputID] ? (mode[inputID] === "draft" ? "bg-green-400" : "bg-red-400") : "";

  return (
    <div
      className={`absolute left-0 top-full z-10 ${feedbackBackgroundColor} border border-gray-300 dark:border-gray-700 shadow-md p-2 mt-1 rounded-md`}>
      {formatFeedback[inputID] && (
        <span>{formatFeedback[inputID]}</span>
      )}
    </div>
  );
};



<div>
    {spacing}
    <div className="flex flex-row items-center">
      <div className="mr-2">{promptElement}</div>

      <div className={`${align} relative`}>
        <Input
          key={`newline-input-${inputID}`}
          autoFocus
          disabled={state.mode === "correct" || state.mode === "incorrect"}
          value={state.text[inputID] || ""}
          onChange={(e) => {
            setText(inputID, e.target.value)
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          type="text"
          className={`${inputBorderColor} mb-1 focus:outline-none w-full`}
          placeholder={inputPlaceholder || ""}
        />
        {isInputFocused && state.text[inputID] && (
          <FeedbackComponent
            inputID={inputID}
            formatFeedback={state.formatFeedback}
            mode={state.modeID}
          />
        )}
      </div>
    </div>
      {spacing}
    </div>

 */
