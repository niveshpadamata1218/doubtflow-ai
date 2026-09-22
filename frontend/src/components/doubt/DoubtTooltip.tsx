type DoubtTooltipProps = {
  left: number
  top: number
  onRaise: () => void
}

export function DoubtTooltip({ left, top, onRaise }: DoubtTooltipProps) {
  return (
    <button
      className="doubt-tooltip"
      style={{ left, top }}
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onRaise}
    >
      <span aria-hidden="true">?</span>
      Raise Doubt
    </button>
  )
}
