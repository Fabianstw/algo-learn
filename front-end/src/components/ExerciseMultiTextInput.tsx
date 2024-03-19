import { useState } from "react"
import { FreeTextFeedback, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { InteractWithQuestion, MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"
import { Result } from "@/components/QuestionComponent.tsx"
// import { Input } from "@/components/ui/input"
import useGlobalDOMEvents from "@/hooks/useGlobalDOMEvents.ts"
import { useSound } from "@/hooks/useSound.ts"
import { useTranslation } from "@/hooks/useTranslation.ts"

export function ExerciseMultiTextInput({
  question,
  regenerate,
  onResult,
  permalink,
}: {
  question: MultiFreeTextQuestion
  regenerate?: () => void
  onResult?: (result: Result) => void
  permalink?: string
}) {
  const { playSound } = useSound()
  const { t } = useTranslation()

  const [state, setState] = useState<{
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }>({
    mode: "invalid",
    modeID: {},
    text: {},
    formatFeedback: {},
  })

  const { mode, text, feedbackObject } = state

  function checkOverallMode(currentModeIDs: { [x: string]: string }) {
    // if every mode in modeID is draft, the overall mode is draft too
    for (const value of Object.values(currentModeIDs)) {
      if (value === "invalid" || value === "initial") {
        return "invalid"
      }
    }
    return "draft"
  }

  function setText(fieldID: string, value: string) {
    setState((state) => ({ ...state, text: { ...state.text, [fieldID]: value } }))
    if (question.checkFormat) {
      void Promise.resolve(question.checkFormat({ text: value }, fieldID)).then(({ valid, message }) => {
        setState({
          ...state,
          text: { ...state.text, [fieldID]: value },
          modeID: {
            ...state.modeID,
            [fieldID]: valid ? "draft" : "invalid",
          },
          formatFeedback: {
            ...state.formatFeedback,
            [fieldID]: !valid ? (message ? message : "") : message ? message : "",
          },
          // call the func providing the modeID, because of the delay in setState
          mode: checkOverallMode({ ...state.modeID, [fieldID]: valid ? "draft" : "invalid" }),
        })
        // const color = valid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
        // setMsgColor((prev) => ({ ...prev, [fieldID]: color }));
      })
    } else {
      const valid = value.trim().length > 0
      setState({ ...state, text, mode: valid ? "draft" : "invalid" })
    }
  }

  function handleClick() {
    if (mode === "draft") {
      if (question.feedback !== undefined) {
        const userAnswer = JSON.stringify(text)
        void Promise.resolve(question.feedback({ text: userAnswer })).then((feedbackObject) => {
          let mode: MODE = "draft"
          if (feedbackObject.correct === true) {
            playSound("pass")
            mode = "correct"
          } else if (feedbackObject.correct === false) {
            playSound("fail")
            mode = "incorrect"
          }
          setState({ ...state, mode, feedbackObject })
        })
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult && onResult(mode)
    }
  }

  useGlobalDOMEvents({
    keydown(e: Event) {
      if (!(e instanceof KeyboardEvent)) {
        return
      }
      const key = e.key
      if (key === "Enter") {
        e.preventDefault()
        handleClick()
      }
    },
  })

  const message =
    mode === "correct" ? (
      <b className="text-2xl">{t("feedback.correct")}</b>
    ) : mode === "incorrect" ? (
      feedbackObject?.correctAnswer ? (
        <>
          <b className="text-xl">{t("feedback.possible-correct-solution")}:</b>
          <br />
          <Markdown md={feedbackObject.correctAnswer} />
        </>
      ) : (
        <b className="text-2xl">{t("feedback.incorrect")}</b>
      )
    ) : null

  return (
    <InteractWithQuestion
      permalink={permalink}
      name={question.name}
      regenerate={regenerate}
      footerMode={mode}
      footerMessage={message}
      handleFooterClick={handleClick}
    >
      <Markdown md={question.text} setText={setText} state={state} />
    </InteractWithQuestion>
  )
}

/*

{parts.map((part, index) => {
        return part.startsWith("{#{") && part.endsWith("}#}") ? (
          (() => {
            part = part.replaceAll("{#{", "").replaceAll("}#}", "")
            return alignment[part] === "inline" ? (
              <Fragment key={`inline-fragment-${index}`}>
                <Input
                  key={`inline-input-${index}`}
                  autoFocus
                  disabled={mode === "correct" || mode === "incorrect"}
                  value={text[part] || ""}
                  onChange={(e) => {
                    setText(part, e.target.value)
                  }}
                  type="text"
                  className="m-2 inline-block h-6 w-16"
                />
              </Fragment>
            ) : alignment[part] === "oneline" ? (
              <Fragment key={`oneline-fragment-${index}`}>
                <div key={`oneline-div-${index}`} className="flex flex-wrap m-5">
                  {part.split('|').map((inputID: string, indexOneline: number) => (
                    <div key={`${index}-${indexOneline}`}
                         className="flex place-items-center gap-4 pl-3 w-full md:w-1/2">
                      {prompts[inputID] && <Markdown md={prompts[inputID]}/>}
                      <Input
                        key={`newline-input-${indexOneline}`}
                        autoFocus
                        disabled={mode === "correct" || mode === "incorrect"}
                        value={text[inputID] || ""}
                        onChange={(e) => {
                          setText(inputID, e.target.value)
                        }}
                        type="text"
                      />
                      <div className={`flex items-center ${msgColor[inputID]}`}>
                        <div>
                          <Markdown md={formatFeedback[inputID]}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Fragment>
            ) : (
              <Fragment key={`newline-fragment-${index}`}>
                <br/>
                <br/>
                <div key={index} className="flex place-items-center gap-2 pl-3 mr-4">
                  {prompts[part] && <Markdown md={prompts[part]}/>}
                  <Input
                    key={`newline-input-${index}`}
                    autoFocus
                    disabled={mode === "correct" || mode === "incorrect"}
                    value={text[part] || ""}
                    onChange={(e) => {
                      setText(part, e.target.value)
                    }}
                    type="text"
                  />
                  <div className={`flex h-12 items-center ${msgColor[part]}`}>
                  <div>
                      <Markdown md={formatFeedback[part]}/>
                    </div>
                  </div>
                </div>
                <br/>
              </Fragment>
            )
          })()
        ) : part.length > 0 ? (
          <span key={`${index}-text`}>
            <Markdown md={part}/>
          </span>
        ) : null
      })}
      <br/>

 */
