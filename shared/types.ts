export type Vec2 = [number, number];

export type SceneMeta = {
  name: string;
  duration: number;
};

export type ObjectType = "Circle" | "Text";

export type SceneObjectTransform = {
  position: Vec2;
  scale: number;
  rotation: number;
};

export type CircleProps = {
  radius: number;
  stroke_color: string;
  stroke_width?: number;
  fill_color?: string;
  fill_opacity?: number;
};

export type TextProps = {
  text: string;
  color: string;
  font_size: number;
  stroke_color?: string;
  stroke_width?: number;
};

export type SceneObject =
  | {
      id: string;
      name: string;
      type: "Circle";
      props: CircleProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Text";
      props: TextProps;
      transform: SceneObjectTransform;
    };

export type BasicStyle = {
  stroke_color?: string;
  stroke_width?: number;
  fill_color?: string;
  fill_opacity?: number;
};

export type SquareProps = {
  side_length: number;
} & BasicStyle;

export type RectangleProps = {
  width: number;
  height: number;
} & BasicStyle;

export type TriangleProps = {} & BasicStyle;

export type RegularPolygonProps = {
  n: number;
} & BasicStyle;

export type EllipseProps = {
  width: number;
  height: number;
} & BasicStyle;

export type LineProps = {
  start: Vec2;
  end: Vec2;
  stroke_color?: string;
  stroke_width?: number;
};

export type ArrowProps = LineProps;
export type VectorProps = LineProps;

export type AxesProps = {
  x_range: [number, number, number];
  y_range: [number, number, number];
  x_length?: number;
  y_length?: number;
  tips?: boolean;
};

export type NumberPlaneProps = {
  x_range: [number, number, number];
  y_range: [number, number, number];
  faded_line_ratio?: number;
};

export type TexProps = {
  tex: string;
  font_size: number;
  color: string;
  stroke_color?: string;
  stroke_width?: number;
};

export type MathTexProps = TexProps;

export type GroupProps = {
  children: string[];
};

export type FunctionPlotProps = {
  axes_id: string;
  expr: string;
  domain: [number, number];
  stroke_color?: string;
  stroke_width?: number;
};

export type GraphLabelProps = {
  plot_id: string;
  x_value: number;
  label: { type: "MathTex" | "Tex" | "Text"; value: string; font_size?: number; color?: string };
  offset?: Vec2;
};

export type VerticalLineAtXProps = {
  axes_id: string;
  plot_id?: string;
  x_value: number;
  y_range?: [number, number];
  stroke_color?: string;
  stroke_width?: number;
};

export type HighlightPointProps = {
  axes_id: string;
  x_value: number;
  y_value: number;
  radius?: number;
  color?: string;
};

export type BraceBetweenPointsProps = {
  a: Vec2;
  b: Vec2;
  direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
  color?: string;
  label?: { type: "MathTex" | "Tex" | "Text"; value: string; font_size?: number; color?: string };
  attach?: { type: "objects"; a_id: string; b_id: string } | { type: "line"; line_id: string };
};

export type ArcProps = {
  radius: number;
  start_angle: number;
  angle: number;
} & BasicStyle;

export type AngleProps = {
  a: Vec2;
  b: Vec2;
  c: Vec2;
  radius?: number;
  other_angle?: boolean;
  attach?: { type: "lines"; line1_id: string; line2_id: string };
} & BasicStyle;

export type SceneObjectV2 =
  | SceneObject
  | {
      id: string;
      name: string;
      type: "Square";
      props: SquareProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Rectangle";
      props: RectangleProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Triangle";
      props: TriangleProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "RegularPolygon";
      props: RegularPolygonProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Ellipse";
      props: EllipseProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Line";
      props: LineProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Arrow";
      props: ArrowProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Vector";
      props: VectorProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Axes";
      props: AxesProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "NumberPlane";
      props: NumberPlaneProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Tex";
      props: TexProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "MathTex";
      props: MathTexProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Group";
      props: GroupProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "FunctionPlot";
      props: FunctionPlotProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "BraceBetweenPoints";
      props: BraceBetweenPointsProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Arc";
      props: ArcProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "Angle";
      props: AngleProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "GraphLabel";
      props: GraphLabelProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "VerticalLineAtX";
      props: VerticalLineAtXProps;
      transform: SceneObjectTransform;
    }
  | {
      id: string;
      name: string;
      type: "HighlightPoint";
      props: HighlightPointProps;
      transform: SceneObjectTransform;
    };

export type RateFunction = "linear" | "smooth" | "rush_into" | "rush_from";

export type AnimationType =
  | "FadeIn"
  | "FadeOut"
  | "Move"
  | "Create"
  | "Write"
  | "Transform"
  | "ReplacementTransform"
  | "Scale"
  | "Rotate";

export type FadeAnimation = {
  id: string;
  type: "FadeIn" | "FadeOut";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: Record<string, never>;
};

export type TransformAnimation = {
  id: string;
  type: "Transform";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: {
    target: string;
  };
};

export type MoveAnimation = {
  id: string;
  type: "Move";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: {
    to: Vec2;
  };
};

export type SimpleAnimation = {
  id: string;
  type: "Create" | "Write";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: Record<string, never>;
};

export type ReplacementTransformAnimation = {
  id: string;
  type: "ReplacementTransform";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: {
    target: string;
  };
};

export type ScaleAnimation = {
  id: string;
  type: "Scale";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: { factor: number };
};

export type RotateAnimation = {
  id: string;
  type: "Rotate";
  targets: string[];
  start: number;
  duration: number;
  rate_function?: RateFunction;
  props: { angle: number };
};

export type SceneAnimation =
  | FadeAnimation
  | MoveAnimation
  | TransformAnimation
  | ReplacementTransformAnimation
  | SimpleAnimation
  | ScaleAnimation
  | RotateAnimation;

export type TimelineTrack = {
  id: string;
  items: string[];
};

export type SceneTimeline = {
  tracks: TimelineTrack[];
};

export type SceneSettings = {
  fps: number;
  resolution: string;
  background_color: string;
};

export type Relationship =
  | {
      id: string;
      type: "LineBetweenObjects";
      line_id: string;
      a_id: string;
      b_id: string;
    }
  | {
      id: string;
      type: "LabelFollowsObject";
      label_id: string;
      target_id: string;
      offset: Vec2;
    }
  | {
      id: string;
      type: "BraceFollows";
      brace_id: string;
      a_id: string;
      b_id: string;
      direction?: "UP" | "DOWN" | "LEFT" | "RIGHT";
    };

export type Scene = {
  meta: SceneMeta;
  objects: SceneObjectV2[];
  animations: SceneAnimation[];
  timeline: SceneTimeline;
  settings: SceneSettings;
  relationships?: Relationship[];
};
