import { HTMLAttributes, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AreaStore } from "@/lib/stores/Area/Area";
import { CANVAS_ID } from "@/components/pixi/canvas/hooks/useCanvasContext";
import {
    calcPolygonArea,
    convertPxArea,
    DISTANCE_UNITS,
    DistanceUnit,
} from "@/lib/utils/measurement/distance";
import { cn } from "@/lib/utils/shadcn";

export type AreaPanelProps = HTMLAttributes<HTMLDivElement>;

export function AreaPanel({ className, ...props }: AreaPanelProps) {
    const { t } = useTranslation();
    const [unit, setUnit] = useState<DistanceUnit>("px");

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
    const hasAnything =
        leftIsDrawing || rightIsDrawing || leftHasResult || rightHasResult;

    const unitLabel = unit === "px" ? "px²" : `${unit}²`;

    return (
        <div
            className={cn(
                "flex flex-col gap-3 p-3 glass rounded-xl",
                className
            )}
            {...props}
        >
            <p className="text-xs text-muted-foreground leading-relaxed">
                {t("Area instructions", { ns: "tooltip" })}
            </p>

            {hasAnything && (
                <div className="flex flex-col gap-2 text-sm">
                    {/* Left canvas */}
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
                                            unit
                                        )}{" "}
                                        {unitLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right canvas */}
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
                                            unit
                                        )}{" "}
                                        {unitLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Unit selector — only when there's a result */}
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

            {hasAnything && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => AreaStore.actions.clearAll()}
                >
                    {t("Clear area", { ns: "tooltip" })}
                </Button>
            )}
        </div>
    );
}
