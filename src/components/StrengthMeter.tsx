import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import "microtip/microtip.css"

/**
 * Display a strength meter / progress bar
 *
 * @param {Object} props
 * @param {number} props.strength A number between 0 and 1
 * @param {string} props.tooltip A tooltip to display on hover
 */
export function StrengthMeterCircular({ strength }: { strength: number }) {
  return (
    <CircularProgressbarWithChildren value={strength} maxValue={1}>
      Sort
      <br />
      {`${Math.round(strength * 100)}%`}
    </CircularProgressbarWithChildren>
  )
}

/**
 * Display a strength meter / progress bar
 *
 * @param {Object} props
 * @param {number} props.strength A number between 0 and 1
 * @param {string} props.tooltip A tooltip to display on hover
 */
export function StrengthMeter({
  strength,
  steps = 4,
  tooltip,
}: {
  strength: number
  steps?: number
  tooltip?: string
}) {
  const strengthRounded = strength < 0.01 ? 0 : Math.ceil(strength * steps)
  const bar = <ProgressBar done={strengthRounded} total={steps} />
  if (tooltip) {
    return (
      <button
        aria-label={tooltip}
        data-microtip-position="right"
        data-microtip-size="large"
        role="tooltip"
        className="cursor-default"
        type="button"
      >
        {bar}
      </button>
    )
  } else {
    return bar
  }
}

function ProgressBar({
  done = 0,
  doing = 0,
  total,
}: {
  done?: number
  doing?: number
  total?: number
}) {
  total ??= done + doing
  const doneDiv = <div className={`inline-block h-4 w-4 bg-green-500`}></div>
  const doingDiv = <div className={`inline-block h-4 w-4 bg-orange-500`}></div>
  const restDiv = <div className={`inline-block h-4 w-4 bg-slate-500`}></div>
  let bar = <></>
  for (let i = 0; i < total; i++) {
    bar = (
      <>
        {bar}
        {i < done ? doneDiv : i < done + doing ? doingDiv : restDiv}
      </>
    )
  }
  return <div className="flex h-4 gap-2 text-left">{bar}</div>
}