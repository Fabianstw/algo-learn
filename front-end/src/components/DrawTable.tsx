import { ReactElement } from "react"
import { FreeTextFeedback } from "@shared/api/QuestionGenerator.ts"
import { MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"

/**
 * A component that returns a table
 * @param table The table to be drawn (passed as md format)
 * @param setText
 * @param state
 */
export function DrawTable({
  table,
  setText,
  state,
}: {
  table: { header: string[]; content: string[][]; alignment: string[]; extraFeature: string }
  setText?: (fieldID: string, value: string) => void
  state?: {
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }
}): ReactElement {
  const parsedHeader = table.header
  const parsedContent = table.content
  const parsedAlignment = table.alignment
  const extraFeature = table.extraFeature

  const extraFeatureList = extraFeature.split("?")

  // create the value for the header
  const tableHeader = []

  let borderStyle = "border"
  extraFeatureList.map((feature) => {
    if (feature.startsWith("border_")) {
      borderStyle = feature.split("_")[1]
    }
  })

  let cellVerticalAlign = "align-"
  extraFeatureList.map((feature) => {
    if (feature.startsWith("av")) {
      cellVerticalAlign = feature.split("_")[1]
    }
  })
  if (cellVerticalAlign === "align-") {
    cellVerticalAlign = "align-top"
  }

  let cellHorizontalAlign = "text-"
  extraFeatureList.map((feature) => {
    if (feature.startsWith("ah")) {
      cellHorizontalAlign += feature.split("_")[1]
    }
  })

  tableHeader.push(
    <tr key={`row-0`}>
      {parsedHeader.map((md, j) => (
        <th key={`cell-${0}-${j}`} className={`${borderStyle} p-2`}>
          <Markdown md={md} state={state} setText={setText} />
        </th>
      ))}
    </tr>,
  )

  const tableContent = []
  for (let i = 0; i < parsedContent.length; i++) {
    tableContent.push(
      <tr key={`row-${i}`}>
        {parsedContent[i].map((md, j) => (
          <td
            key={`cell-${i}-${j}`}
            className={`${borderStyle} p-2 text-${parsedAlignment[j]} ${cellVerticalAlign} ${cellHorizontalAlign}`}
          >
            <Markdown md={md} state={state} setText={setText} />
          </td>
        ))}
      </tr>,
    )
  }

  let tableClass = ""
  extraFeatureList.forEach((feature) => {
    if (feature.startsWith("table_")) {
      tableClass = feature.split("_")[1]
    }
  })
  const tableReturnValue = (
    <table className={tableClass}>
      <thead>{tableHeader}</thead>
      <tbody>{tableContent}</tbody>
    </table>
  )

  let divClass = ""
  extraFeatureList.forEach((feature) => {
    if (feature.startsWith("div_")) {
      divClass = feature.split("_")[1]
    }
  })

  if (extraFeature.startsWith("div_")) {
    return <div className={divClass}>{tableReturnValue}</div>
  } else {
    return tableReturnValue
  }
}
