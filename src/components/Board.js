// FastDraw
import React, { useEffect, useRef, useState } from "react";

const Board = ({
  clear,
  setClear,
  line,
  setLine,
  rect,
  setRect,
  circle,
  setCircle,
}) => {
  const screenDimensions = [window.screen.width, window.screen.height];
  const [canvasContext, setCanvasContext] = useState(null);
  const [startPos, setStartPos] = useState([null, null]); // (x1, y1)
  const [endPos, setEndPos] = useState([null, null]); // (x2, y2)
  const [isPathInitiated, setIsPathInitiated] = useState(false);
  const [cursorPos, setCursorPos] = useState([null, null]);
  const [displayObjects, setDisplayObjects] = useState({
    linesCoordinates: [],
    rectCoordinates: [],
    circleCoordinates: [],
  });

  const canvasRef = useRef();

  useEffect(() => {
    setCanvasContext(canvasRef.current.getContext("2d"));
  }, []);

  useEffect(() => {
    if (clear) {
      setClear(false);
      // erase everything from board
      setDisplayObjects({
        linesCoordinates: [],
        rectCoordinates: [],
        circleCoordinates: [],
      });
      canvasContext.clearRect(0, 0, screenDimensions[0], screenDimensions[1]);
      console.log("cleared");
    }
  }, [clear]);

  const initiatePath = () => {
    if (canvasContext) {
      canvasContext.fillStyle = "black";
      canvasContext.beginPath();
      canvasContext.moveTo(startPos[0], startPos[1]);
      setIsPathInitiated(true);
    }
  };

  useEffect(() => {
    if (startPos[0] && startPos[1]) {
      if (line) {
        initiatePath();
        console.log("path initiated for line...");
      }
      if (rect) {
        initiatePath();
        console.log("path initiated for rect...");
      }
      if (circle) {
        initiatePath();
        console.log("path inititaed for circle...");
      }
    }
  }, [startPos]);

  useEffect(() => {
    if (endPos[0] && endPos[1] && canvasContext) {
      clearCanvas();
      redrawLines();
      redrawRects();
      redrawCircles();
      if (line) {
        console.log("path terminated");
        canvasContext.lineTo(endPos[0], endPos[1]);
        canvasContext.stroke();
        setCursorPos([null, null]);
        setIsPathInitiated(false);
        setLine();
      }
      if (rect) {
        canvasContext.strokeRect(
          startPos[0],
          startPos[1],
          endPos[0] - startPos[0],
          endPos[1] - startPos[1]
        );
        setIsPathInitiated(false);
        setRect(); // to change of rect to false, as rect is made
      }
      if (circle) {
        console.log("ending...");
        const x = (startPos[0] + endPos[0]) / 2;
        const y = (startPos[1] + endPos[1]) / 2;
        const [radiusX, radiusY] = generateCircleRadii(...startPos, ...endPos);
        canvasContext.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
        canvasContext.stroke();
        setCursorPos([null, null]);
        setIsPathInitiated(false);
        setCircle();
      }
    }
  }, [endPos]);

  const getRelativePointCoordinates = (x, y) => {
    const x0 = canvasRef.current.getBoundingClientRect().left;
    const y0 = canvasRef.current.getBoundingClientRect().top;
    const xNew = x - x0;
    const yNew = y - y0;
    return [xNew, yNew];
  };

  const redrawLines = () => {
    for (const lineObj of displayObjects.linesCoordinates) {
      if (lineObj.endTo[0] && lineObj.endTo[1]) {
        canvasContext.beginPath();
        canvasContext.moveTo(lineObj.startFrom[0], lineObj.startFrom[1]);
        canvasContext.lineTo(lineObj.endTo[0], lineObj.endTo[1]);
        canvasContext.stroke();
      }
    }
  };

  const redrawRects = () => {
    for (const rectObj of displayObjects.rectCoordinates) {
      if (rectObj.endTo[0] && rectObj.endTo[1]) {
        canvasContext.strokeRect(
          rectObj.startFrom[0],
          rectObj.startFrom[1],
          rectObj.endTo[0] - rectObj.startFrom[0],
          rectObj.endTo[1] - rectObj.startFrom[1]
        );
      }
    }
  };

  const generateCircleRadii = (x1, y1, x2, y2) => {
    const x_distance = Math.pow(
      Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2),
      1 / 2
    );
    const y_distance = Math.abs(y2 - y1);
    return [x_distance, y_distance];
  };

  const redrawCircles = () => {
    for (const circleObj of displayObjects.circleCoordinates) {
      if (circleObj.endTo[0] && circleObj.endTo[1]) {
        const x = (circleObj.startFrom[0] + circleObj.endTo[0]) / 2;
        const y = (circleObj.startFrom[1] + circleObj.endTo[1]) / 2;
        const [radiusX, radiusY] = generateCircleRadii(
          ...circleObj.startFrom,
          ...circleObj.endTo
        );
        canvasContext.beginPath();
        canvasContext.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
        canvasContext.stroke();
      }
    }
  };

  const clearCanvas = () => {
    canvasContext.clearRect(0, 0, screenDimensions[0], screenDimensions[1]);
  };

  useEffect(() => {
    if (canvasContext) clearCanvas();
    if (cursorPos[0] && cursorPos[1] && isPathInitiated) {
      if (line) {
        canvasContext.beginPath();
        canvasContext.moveTo(startPos[0], startPos[1]);
        canvasContext.lineTo(cursorPos[0], cursorPos[1]);
        canvasContext.stroke();
      }
      if (rect) {
        canvasContext.strokeRect(
          startPos[0],
          startPos[1],
          cursorPos[0] - startPos[0],
          cursorPos[1] - startPos[1]
        );
      }
      if (circle) {
        console.log("changing");
        const x = (startPos[0] + cursorPos[0]) / 2;
        const y = (startPos[1] + cursorPos[1]) / 2;
        const [radiusX, radiusY] = generateCircleRadii(
          ...startPos,
          ...cursorPos
        );
        canvasContext.beginPath();
        canvasContext.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
        canvasContext.stroke();
      }
    }
    redrawLines();
    redrawRects();
    redrawCircles();
  }, [cursorPos]);

  const constructLine = (e) => {
    console.log("line constructing");
    const relCoordinates = getRelativePointCoordinates(e.clientX, e.clientY); // relative coordinates of the mouse wrt canvas
    if (!isPathInitiated) {
      setStartPos(relCoordinates);

      setDisplayObjects({
        ...displayObjects,
        linesCoordinates: [
          ...displayObjects.linesCoordinates,
          {
            startFrom: relCoordinates,
            endTo: [null, null],
          },
        ],
      });
    } else {
      console.log("ending line");
      setEndPos(relCoordinates);
      const lastLineCoord =
        displayObjects.linesCoordinates[
          displayObjects.linesCoordinates.length - 1
        ];
      const copiedLinesCoordinates = displayObjects.linesCoordinates.slice(
        0,
        displayObjects.linesCoordinates.length - 1
      );
      lastLineCoord.endTo = relCoordinates;
      setDisplayObjects({
        ...displayObjects,
        linesCoordinates: [...copiedLinesCoordinates, lastLineCoord],
      });
    }
  };

  const constructRect = (e) => {
    const relCoordinates = getRelativePointCoordinates(e.clientX, e.clientY); // relative coordinates of the mouse wrt canvas
    console.log("rect requested: ", rect);
    if (!isPathInitiated) {
      setStartPos(relCoordinates);

      setDisplayObjects({
        ...displayObjects,
        rectCoordinates: [
          ...displayObjects.rectCoordinates,
          {
            startFrom: relCoordinates,
            endTo: [null, null],
          },
        ],
      });
    } else {
      setEndPos(relCoordinates);
      const lastRectCoord =
        displayObjects.rectCoordinates[
          displayObjects.rectCoordinates.length - 1
        ];
      const copiedRectsCoordinates = displayObjects.rectCoordinates.slice(
        0,
        displayObjects.rectCoordinates.length - 1
      );
      lastRectCoord.endTo = relCoordinates;
      setDisplayObjects({
        ...displayObjects,
        rectCoordinates: [...copiedRectsCoordinates, lastRectCoord],
      });
    }
  };

  const constructCircle = (e) => {
    console.log("circle clicked");
    const relCoordinates = getRelativePointCoordinates(e.clientX, e.clientY); // relative coordinates of the mouse wrt canvas
    if (!isPathInitiated) {
      console.log("circle started...");
      setStartPos(relCoordinates);

      setDisplayObjects({
        ...displayObjects,
        circleCoordinates: [
          ...displayObjects.circleCoordinates,
          {
            startFrom: relCoordinates,
            endTo: [null, null],
          },
        ],
      });
    } else {
      console.log("ending circle...");
      setEndPos(relCoordinates);
      const lastCircleCoord =
        displayObjects.circleCoordinates[
          displayObjects.circleCoordinates.length - 1
        ];
      const copiedCirclesCoordinates = displayObjects.circleCoordinates.slice(
        0,
        displayObjects.circleCoordinates.length - 1
      );
      lastCircleCoord.endTo = relCoordinates;
      setDisplayObjects({
        ...displayObjects,
        circleCoordinates: [...copiedCirclesCoordinates, lastCircleCoord],
      });
    }
  };

  return (
    <div
      className={`flex items-center h-screen w-screen ${
        line || rect || circle ? "cursor-crosshair" : "cursor-default"
      }`}
    >
      <canvas
        className="bg-white border border-black rounded-xl"
        id="canvas"
        ref={canvasRef}
        width={screenDimensions[0] / 1.3}
        height={screenDimensions[1] / 1.3}
        onMouseMove={(e) => {
          setCursorPos(getRelativePointCoordinates(e.clientX, e.clientY));
        }}
        onClick={(e) => {
          if (line) {
            constructLine(e);
            return;
          }
          if (rect) {
            constructRect(e);
            return;
          }
          if (circle) {
            constructCircle(e);
            return;
          }
        }}
        tabIndex={0}
      ></canvas>
    </div>
  );
};

export default Board;
