import { Button } from "@/components/ui/button";
import { MeasurementStore } from "@/lib/stores/Measurement/Measurement";
import { AreaStore } from "@/lib/stores/Area/Area";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import {
    calcLinePixels,
    calcPolygonArea,
    convertPx,
    convertPxArea,
    DEFAULT_DPI,
    DISTANCE_UNITS,
    DistanceUnit,
} from "@/lib/utils/measurement/distance";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/shadcn";
import { HTMLAttributes, useState } from "react";
import { Check, Ruler, Shapes, X } from "lucide-react";
import { ICON } from "@/lib/utils/const";
import {
    CURSOR_MODES,
    DashboardToolbarStore,
} from "@/lib/stores/DashboardToolbar";

type AreaModeSectionProps = {
    unit: DistanceUnit;
    setUnit: (unit: DistanceUnit) => void;
    unitLabel: string;
    dpi: number;
};

function AreaModeSection({
    unit,
    setUnit,
    unitLabel,
    dpi,
}: AreaModeSectionProps) {
    const { t } = useTranslation();

    const leftTempPoints = AreaStore.use(
        state => state.tempPoints[CANVAS_ID.LEFT]
    );
    const rightTempPoints = AreaStore.use(
        state => state.tempPoints[CANVAS_ID.RIGHT]
    );
    const leftFinished = AreaStore.use(
        state => state.finishedPolygon[CANVAS_ID.LEFT]
    );
    const rightFinished = AreaStore.use(
        state => state.finishedPolygon[CANVAS_ID.RIGHT]
    );

    const leftIsDrawing = leftTempPoints.length > 0;
    const rightIsDrawing = rightTempPoints.length > 0;
    const leftHasResult = leftFinished !== null && leftFinished.length >= 3;
    const rightHasResult = rightFinished !== null && rightFinished.length >= 3;
    const hasAnyArea =
        leftIsDrawing || rightIsDrawing || leftHasResult || rightHasResult;

    return (
        <>
            <p className="text-xs text-muted-foreground leading-relaxed">
                {t("Area instructions", { ns: "tooltip" })}
            </p>

            {hasAnyArea && (
                <div className="flex flex-col gap-2 text-sm">
                    {(leftIsDrawing || leftHasResult) && (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">L</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                        AreaStore.actions.clearCanvas(
                                            CANVAS_ID.LEFT
                                        )
                                    }
                                >
                                    ×
                                </Button>
                            </div>
                            {leftIsDrawing && !leftHasResult && (
                                <p className="text-xs text-muted-foreground pl-1">
                                    {t("Drawing", { ns: "tooltip" })}:{" "}
                                    {leftTempPoints.length}{" "}
                                    {t("Points", { ns: "tooltip" })}
                                </p>
                            )}
                            {leftHasResult && leftFinished && (
                                <div className="flex justify-between pl-1">
                                    <span className="text-xs text-muted-foreground">
                                        {t("Area", { ns: "tooltip" })}:
                                    </span>
                                    <span className="font-mono text-xs font-medium">
                                        {convertPxArea(
                                            calcPolygonArea(leftFinished),
                                            unit,
                                            dpi
                                        )}{" "}
                                        {unitLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {(rightIsDrawing || rightHasResult) && (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">P</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                        AreaStore.actions.clearCanvas(
                                            CANVAS_ID.RIGHT
                                        )
                                    }
                                >
                                    ×
                                </Button>
                            </div>
                            {rightIsDrawing && !rightHasResult && (
                                <p className="text-xs text-muted-foreground pl-1">
                                    {t("Drawing", { ns: "tooltip" })}:{" "}
                                    {rightTempPoints.length}{" "}
                                    {t("Points", { ns: "tooltip" })}
                                </p>
                            )}
                            {rightHasResult && rightFinished && (
                                <div className="flex justify-between pl-1">
                                    <span className="text-xs text-muted-foreground">
                                        {t("Area", { ns: "tooltip" })}:
                                    </span>
                                    <span className="font-mono text-xs font-medium">
                                        {convertPxArea(
                                            calcPolygonArea(rightFinished),
                                            unit,
                                            dpi
                                        )}{" "}
                                        {unitLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {(leftHasResult || rightHasResult) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="shrink-0">
                                {t("Unit", { ns: "tooltip" })}:
                            </span>
                            <select
                                value={unit}
                                onChange={e =>
                                    setUnit(e.target.value as DistanceUnit)
                                }
                                className="rounded border border-border bg-background px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {DISTANCE_UNITS.map(u => (
                                    <option key={u} value={u}>
                                        {u === "px" ? "px²" : `${u}²`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {hasAnyArea && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => AreaStore.actions.clearAll()}
                >
                    {t("Clear area", { ns: "tooltip" })}
                </Button>
            )}
        </>
    );
}

export type MeasurementPanelProps = HTMLAttributes<HTMLDivElement>;

export function MeasurementPanel({
    className,
    ...props
}: MeasurementPanelProps) {
    const { t } = useTranslation();
    const [unit, setUnit] = useState<DistanceUnit>("px");
    const [dpi, setDpi] = useState(DEFAULT_DPI);

    const cursorMode = DashboardToolbarStore.use(
        state => state.settings.cursor.mode
    );
    const isAreaMode = cursorMode === CURSOR_MODES.AREA;

    const leftLine = MeasurementStore.use(
        state => state.finishedLines[CANVAS_ID.LEFT]
    );
    const rightLine = MeasurementStore.use(
        state => state.finishedLines[CANVAS_ID.RIGHT]
    );
    const leftLineExists = leftLine !== null;
    const rightLineExists = rightLine !== null;

    const leftPx = calcLinePixels(leftLine) ?? 0;
    const rightPx = calcLinePixels(rightLine) ?? 0;
    const unitLabel = unit === "px" ? "px²" : `${unit}²`;

    return (
        <div
            className={cn(
                "flex flex-col gap-3 p-3 glass rounded-xl",
                className
            )}
            {...props}
        >
            <div className="flex bg-secondary/50 p-1 rounded-lg gap-1">
                <button
                    type="button"
                    onClick={() =>
                        DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                            CURSOR_MODES.MEASUREMENT
                        )
                    }
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-md transition-all text-xs font-medium",
                        !isAreaMode
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                    )}
                >
                    <Ruler className="w-4 h-4" />
                    {t("Ruler", { ns: "tooltip" })}
                </button>
                <button
                    type="button"
                    onClick={() =>
                        DashboardToolbarStore.actions.settings.cursor.setCursorMode(
                            CURSOR_MODES.AREA
                        )
                    }
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-md transition-all text-xs font-medium",
                        isAreaMode
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
                    )}
                >
                    <Shapes className="w-4 h-4" />
                    {t("Area", { ns: "tooltip" })}
                </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0">{t("DPI", { ns: "tooltip" })}:</span>
                <input
                    type="number"
                    min={1}
                    value={dpi}
                    onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        if (val > 0) setDpi(val);
                    }}
                    className="w-16 rounded border border-border bg-background px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
            </div>

            {!isAreaMode && (
                <>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("Measurement instructions", { ns: "tooltip" })}
                    </p>

                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold">L</span>
                                {leftLineExists ? (
                                    <Check
                                        size={ICON.SIZE}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                        className="text-green-500"
                                    />
                                ) : (
                                    <X
                                        size={ICON.SIZE}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                        className="text-muted-foreground"
                                    />
                                )}
                                {leftLineExists && (
                                    <span className="text-xs text-muted-foreground">
                                        {convertPx(leftPx, unit, dpi)} {unit}
                                    </span>
                                )}
                            </div>
                            {leftLineExists && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                        MeasurementStore.actions.clearLine(
                                            CANVAS_ID.LEFT
                                        )
                                    }
                                >
                                    <X
                                        size={12}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                    />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold">P</span>
                                {rightLineExists ? (
                                    <Check
                                        size={ICON.SIZE}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                        className="text-green-500"
                                    />
                                ) : (
                                    <X
                                        size={ICON.SIZE}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                        className="text-muted-foreground"
                                    />
                                )}
                                {rightLineExists && (
                                    <span className="text-xs text-muted-foreground">
                                        {convertPx(rightPx, unit, dpi)} {unit}
                                    </span>
                                )}
                            </div>
                            {rightLineExists && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                        MeasurementStore.actions.clearLine(
                                            CANVAS_ID.RIGHT
                                        )
                                    }
                                >
                                    <X
                                        size={12}
                                        strokeWidth={ICON.STROKE_WIDTH}
                                    />
                                </Button>
                            )}
                        </div>
                    </div>

                    {(leftLineExists || rightLineExists) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="shrink-0">
                                {t("Unit", { ns: "tooltip" })}:
                            </span>
                            <select
                                value={unit}
                                onChange={e =>
                                    setUnit(e.target.value as DistanceUnit)
                                }
                                className="rounded border border-border bg-background px-1 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {DISTANCE_UNITS.map(u => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => MeasurementStore.actions.clearAll()}
                        disabled={!leftLineExists && !rightLineExists}
                    >
                        {t("Clear measurement", { ns: "tooltip" })}
                    </Button>
                </>
            )}

            {isAreaMode && (
                <AreaModeSection
                    unit={unit}
                    setUnit={setUnit}
                    unitLabel={unitLabel}
                    dpi={dpi}
                />
            )}
        </div>
    );
}
