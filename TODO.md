# TODO.md — Feature Expansion & Next Implementation Phase

---

## 🧠 PURPOSE

This document defines the **next set of features and improvements** required after the MVP foundation is complete.

Unlike `AGENT.md`, this is:
- A **living roadmap**
- Focused on **what to build next**
- More **product + feature oriented**

---

# 🎯 PRIORITY 1 — EXPAND OBJECT SYSTEM

## 🧱 Goal
Move from “basic demo tool” → “usable Manim GUI”

Currently supported:
- Circle
- Text

This is **not enough** to represent real Manim scenes.

---

## 🔷 1. Add Basic Shapes (Core Geometry)

### Required Objects:
- Square
- Rectangle
- Triangle
- RegularPolygon (generic n-sided polygon)
- Ellipse

---

### Implementation Notes:
- Each maps directly to a Manim class
- Must support:
  - Color
  - Fill opacity
  - Stroke width
  - Scale
  - Rotation

---

## 🔷 2. Lines, Arrows, and Vectors

### Required:
- Line
- Arrow
- Vector (important for math/physics use cases)

---

### Features:
- Start point
- End point
- Dynamic updating (important for later)

---

### Future Support (not MVP but plan ahead):
- Updaters like:
```python
l1.add_updater(lambda z: z.become(Line(d1.get_center(), d2.get_center())))
````

👉 This means:

* Objects can depend on other objects
* Requires dependency system later

---

## 🔷 3. Cartesian Grid & Axes

### Required:

* Axes
* NumberPlane / Grid

---

### Features:

* Configurable ranges:

  * x_range
  * y_range
* Tick marks
* Labels

---

### Why Important:

This unlocks:

* Graphing
* Coordinate geometry
* Functions like sin(x), cos(x)

---

## 🔷 4. Mathematical Objects (HIGH VALUE)

### Required:

* MathTex (LaTeX rendering)
* Tex (basic text equations)

---

### Use Cases:

* Equations
* Labels
* Mathematical notation

---

## 🔷 5. Brace, Distance, and Measurement Tools

Inspired by:

![Image](https://images.openai.com/static-rsc-4/asueWA156njIIu0osTsabJ__THeELQztEJphktXlgN4uUmxFRrD-nvgUha1y1es5N37cW-Ugk_s_R8G7zDSJG9AtYt-OKrQTnB_6lIRcP_VxwsqpluPpK_7Kq6yNbZq_vkSaQxvlYduTJ7HtwEZRF3xqGTC91THgUPBS_6il51vPH-C3vTpGZYhUalm4DeDA?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/5csgEgqEw6fojCS14h6fdL_biI6Oxe2iUzQyfkJL3S_nFU9DMB48eqFRq5i6XXntEIw77eVbPEHwjQTFJ2ypsSuXuktPFnIpdiUn1LsH3qozS5VX_Rm50_EBk1nz-bcftTOMfMflK1EpgfTga9iYyJBv29IsHS_zVm_Lm7-mb-mxwa8HQjinFtVrCOgfF3ne?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/ghhCoRl7fA3Bs7iRLxKza2lLCRVst6PUb3rsaU_69lFyiyYfHCpCebjyZ4nVkVSCU32B9IjfGesf190CraRHtBOc6_NzOqFBgOt79j3LsILPIcRA8p5mPDXluqPShaqNlla8eTMS23TXV-DlxVNZ9gOvDAKKoz4jGhK8pNwQl5OU4z-cOIGc8Vag6Jum4xt4?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/ekei75NgsFoAKoRi3o-9Cp1O_X-tPltvNKw0p0smioanj7VhVbYZmMfi75lBNkA4x-wXDJ8nwAM_1TPo4aAt5mJCT8gQJUBU79671gajZA3H8qYXodRBhuz13Sxwp3d5WEBGc7KBlabW7fDIOq49R3In1yp2R1FhJ0kSrxmDjaTJvSN9Jp2DX_SRNH2LTHlM?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/e2XD0jlVuy-6hygJJ_-31a2N27NYE20LWLQRqADtKvcDuw74UL-cqTfM203JXCJxVNuHF4IPY5-HkHrP4BA-J5mJTb1ZfnsrJqSjiC4jYqTUjR8NaCVKqW7JfYthNDbmKQxoeMRWi2eWbl90dpNu7SLKHFkrebhVVvEy07TLmnqeyJzk83MdV_Hju_A9mB7H?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/UBcqDa6R-lZTHXuOq1F4N_f2FFFnIZdl7aFIcqxfJde7hsPZuIn8OM_qehKNBaQVCviv86viwt7V-Agixqc_FFRAeSUmXDfijPMEYOeQWx2FkPUVbxZY7vpgEypzajHc8--ryJPjdjiB-0cOZtNLRUb-nZNbkD3D8KE5herei_iF9dgnnfn-JgsVA1wMe86q?purpose=fullsize)

### Required:

* Brace
* BraceBetweenPoints
* Label attached to brace

---

### Features:

* Attach to line or objects
* Auto-update position
* Label (MathTex)

---

## 🔷 6. Angles & Geometry Helpers

### Required:

* Angle (between two lines)
* Arc
* Sector (optional later)

---

### Use Cases:

* Geometry diagrams
* Educational animations

---

## 🔷 7. Grouping System

### Required:

* VGroup equivalent

---

### Features:

* Group multiple objects
* Move/scale together
* Apply animations to group

---

---

# 🎯 PRIORITY 2 — GRAPHING & FUNCTION SUPPORT

Inspired by:

![Image](https://images.openai.com/static-rsc-4/Jiz4IIaI70VlH6oq1NzyhRfcdt2nZAcnFGpCxGXwUxepZoIAbRS3Eswv3gaeDPsalTPLYFVcoY9kIb2NJt5Wuy6OExLtV4qI5lNH6SvKbDySvJYg2swFw40mC4uaIGvHOhCFuzLftTEhm5XuEhvQrgstJwNQGclBjjeG3xI41t6WK4V4TzmOFU4ku6IdYcGs?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/GQNBoaMYLXontKMxcUQ8pfBV8EeBJrQ7bcaB-GGclluGo_w_iRtyj60HvbTWkMKFxhy0kpAZoQUSI5oVt6-DSx0004ohvvQnQtgemq3YEgaMMSyC5noXikqK1C7RvnrIkZT6K7mI1zpPX2OGeKe9i3FKf5dfyH_miV079bjKEZcK2pzLFswhsB6umFPH_i2A?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/ThkhXbrnD0mxrJPibggUBvhRohTwK6D-k445HmjegY39SIe_E2mwe0NOaZTuHfRFKK-jlQmEpgcc4VkbRgyR7L_SY4dfSoscfXVff9WuGLwNw_y97bJn_66tiYC-4QkStnXtR4WUoaPaSG4B9yDArG9q8kO--ypvDatiExtpMFut-YDbXdPgu4iLyq4MSLWt?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/q7NLsE4_GntY6I7Y3_4Q2STNuQzJsTL1ctxdfUmyygsBL-A8DzyiMFRri_y01jjlSlrzhuwtML7l5Hwl6OUoA0uiROmeHWDOgLFS-iQ8g7qPeIMJ0DlG8FJeEcL6W6sWCs_KP74iFdnNgWO56sFgzpCeTgG-4sQnKwOSRe19PgbHQ8KsLujshIDUM10b_Bq2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/5aZzCcGqedL4mxjy_Drk07PttutCJk6xYnADmM4D3T8RSo0Qe0lDUcBFlAjtqoWtPRfsr56X8rxBILMTDxG13HfJZhCJT0O_bCmyK1R5FQZs8JadozHB21wfPPlwHtnMbcynickLLIABHnWf6zjakqf3cquJw2_GdJ9GE9zQa-SF480t_nyoy8axXze8_3kY?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/4-t46uxln-WeX4NUAqBDgDGY-fL8YsajST_FiViDLOdJ91omMQnfr-7CynbGanxp3BGyXyU1U8laqMhLnV80ZhSMDfnl3UqTKYttelqJjJHFAtBEaON0rNyQ_REwOSSONwclLoivfg7MdATVnFPRkqgLVW7Sq8BLVkzhYBCctvIX57ywLspNyi8u4k9WgMEt?purpose=fullsize)

---

## 🔷 1. Function Plotting

### Required:

* Plot function on axes

Example:

```python
axes.plot(lambda x: np.sin(x))
```

---

### UI Requirement:

* Input field:

```text
f(x) = sin(x)
```

---

### Constraints:

* Must parse safely (no arbitrary code execution)
* Use math parser (not eval)

---

## 🔷 2. Graph Labels

### Required:

* Attach label to graph
* Position at x-value

---

## 🔷 3. Special Graph Features

* Vertical line at x value
* Highlight points
* Intersection markers (future)

---

---

# 🎯 PRIORITY 3 — ANIMATION SYSTEM EXPANSION

Currently:

* FadeIn
* Move

This is **too limited**

---

## 🔷 1. Add Core Animations

### Required:

* FadeOut
* Create
* Write (for text)
* Transform
* ReplacementTransform
* Scale
* Rotate

---

## 🔷 2. Animation Properties (CRITICAL)

Each animation must support:

```json
{
  "duration": 1,
  "start": 0,
  "rate_function": "linear"
}
```

---

### UI Requirements:

* Duration slider/input
* Start time (timeline drag)
* Easing selection:

  * linear
  * smooth
  * rush_into
  * rush_from

---

## 🔷 3. Move Animation Upgrade

Currently: basic move

### Add:

* Target position selection
* Drag-to-set target
* Numeric + visual control

---

## 🔷 4. Transform UX Improvement

Current idea:

* Select target object

### Improve:

* Dropdown selection
* Highlight target visually

---

---

# 🎯 PRIORITY 4 — OBJECT RELATIONSHIPS (ADVANCED FOUNDATION)

Inspired by:

```python
d1.add_updater(lambda z: z.set_x(x.get_value()))
```

---

## 🔷 Goal

Support relationships between objects

---

## Examples:

* Line connecting two moving points
* Label following object
* Brace updating with object movement

---

## Requirements:

* Dependency system
* Object references
* Update loop (preview only for now)

---

⚠️ This is complex — implement AFTER core features

---

---

# 🎯 PRIORITY 5 — UI / UX IMPROVEMENTS

---

## 🔷 1. Object Library Panel

Organize objects into categories:

* Shapes
* Lines
* Math
* Graphs

---

## 🔷 2. Better Selection System

* Multi-select (shift click)
* Group select
* Bounding box

---

## 🔷 3. Snapping System

* Snap to center
* Snap to other objects
* Grid snapping (optional)

---

## 🔷 4. Visual Helpers

* Alignment guides
* Distance indicators

---

---

# 🎯 PRIORITY 6 — CODE GENERATION IMPROVEMENTS

---

## 🔷 1. Cleaner Output Code

* Readable variable names
* Grouped animations
* Avoid redundancy

---

## 🔷 2. Support Complex Constructs

* Groups → VGroup
* Graphs → Axes + plot
* Braces → proper attachment


---

# 🧠 FINAL PRIORITY ORDER

1. Shapes + lines + polygons
2. Math (LaTeX, braces, angles)
3. Axes + graphing
4. Animation expansion
5. UI improvements
6. Object relationships (advanced)

---

# ⚠️ IMPORTANT RULE

Every new feature must:

* Map cleanly to Manim
* Fit into existing scene JSON
* Not break deterministic code generation

---

END OF TODO


