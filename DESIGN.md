---
name: Finance Manager
description: A personal money screen drawn like a US banknote engraving.
colors:
  paper: "#e9eee6"
  sheet: "#f8faf5"
  field: "#ffffff"
  ink: "#17201b"
  ink-muted: "#4c5850"
  placeholder: "#6b766f"
  rule: "#c3cdc2"
  field-border: "#84928a"
  green: "#1e4a34"
  green-dark: "#143426"
  on-green: "#eef4ee"
  on-green-muted: "#b9d0c0"
  income: "#1b6a42"
  income-soft: "#dcebdf"
  expense: "#ad2219"
  expense-soft: "#f6e2df"
  chart-gold: "#c9962b"
  chart-blue: "#3b6ea5"
  chart-sage: "#9fbf9a"
  chart-brown: "#7a5232"
  chart-folded: "#c3cbc4"
typography:
  brand:
    fontFamily: "'Bodoni Moda', 'Palatino Linotype', Palatino, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "0.03em"
  headline:
    fontFamily: "'Bodoni Moda', 'Palatino Linotype', Palatino, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
  figure-balance:
    fontFamily: "'Bodoni Moda', 'Palatino Linotype', Palatino, Georgia, serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "lnum, tnum"
    fontVariation: "'opsz' 6"
  figure-total:
    fontFamily: "'Bodoni Moda', 'Palatino Linotype', Palatino, Georgia, serif"
    fontSize: "1.625rem"
    fontWeight: 700
    fontFeature: "lnum, tnum"
    fontVariation: "'opsz' 6"
  figure:
    fontFamily: "'Bodoni Moda', 'Palatino Linotype', Palatino, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 700
    fontFeature: "lnum, tnum"
    fontVariation: "'opsz' 6"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  stamp:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  swatch: "1px"
  corner: "2px"
spacing:
  xxs: "0.25rem"
  xs: "0.375rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  xxl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.corner}"
    padding: "0.75rem"
  button-primary-hover:
    backgroundColor: "{colors.green-dark}"
    textColor: "{colors.on-green}"
  button-primary-disabled:
    backgroundColor: "{colors.ink-muted}"
    textColor: "{colors.on-green}"
  button-small:
    backgroundColor: "{colors.field}"
    textColor: "{colors.green}"
    rounded: "{rounded.corner}"
    padding: "0.3125rem 0.75rem"
  input-field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.corner}"
    padding: "0.5rem 0.625rem"
  type-option:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.corner}"
    padding: "0.625rem"
  type-option-expense-selected:
    backgroundColor: "{colors.expense-soft}"
    textColor: "{colors.expense}"
  type-option-income-selected:
    backgroundColor: "{colors.income-soft}"
    textColor: "{colors.income}"
  totals-plate:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    padding: "1rem 1.25rem"
  masthead:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    typography: "{typography.brand}"
    padding: "1rem"
  stamp-over:
    textColor: "{colors.expense}"
    typography: "{typography.stamp}"
    rounded: "{rounded.corner}"
    padding: "0 0.375rem"
---

# Design System: Finance Manager

## Overview

**Creative North Star: "The Engraved Note"**

The money screen is drawn like a US banknote. The page is pale currency paper, the text is green-black engraving ink, and the top of the screen is a band of the green you see on the back of a dollar. Money figures are set the way a note sets its value: in a high-contrast serif (Bodoni Moda), heavy and exact. Income uses the green of the Treasury seal; expenses use the red of the old United States Note seal.

Nothing floats. There are no shadows, no soft white cards, and no rounded bubbles. Sections sit straight on the paper, each one headed by a double ink line, the way printed notes rule off their parts. Fills are drawn as fine diagonal lines, like an engraver's shading, instead of flat blocks of colour. Only one object on the page has a full frame: the totals plate, which reads as a written sum (income − expenses = balance).

The screen is light only. It is used in two places: on a phone in daylight right after spending, and at a desk during a weekly review. Both are bright settings, so there is no dark mode yet.

**Key Characteristics:**
- Pale green-grey paper ground, never cream or white.
- Bodoni Moda for headings and every money figure; the system sans-serif for controls and everyday text.
- Green means income, red means expense or over budget. Nothing else on the page is red.
- Double ink rules and hairlines instead of boxes and shadows.
- Fine diagonal line "engraving" as the only fill pattern.
- Sharp 2px corners.

## Colors

A quiet paper-and-ink palette with one green for the shell and buttons, and the two seal colours reserved for money direction.

### Primary
- **Back-of-the-Note Green** (green): The masthead band, the main "Add transaction" button, the focus outline, the engraved fill of budget meters, and the largest chart slice. It is the colour of the page's structure, not a money signal.
- **Deep Note Green** (green-dark): Hover state of the main button only.
- **Pale Note Light** (on-green) and **Faded Note Light** (on-green-muted): Text on the green band and on green buttons. The muted one is for the masthead's small line.

### Secondary
- **Treasury Seal Green** (income): Income figures, the selected "Income" option. **Pale Seal Green** (income-soft) is the selected option's background.
- **Note Seal Red** (expense): Expense figures, a negative balance, the selected "Expense" option, error messages, invalid input borders, the over-budget stamp and over-budget meter. **Pale Seal Red** (expense-soft) is the selected option's background.

### Tertiary (chart only)
The spending chart uses these, largest slice first: Back-of-the-Note Green, then **Certificate Gold** (chart-gold), **Seal Blue** (chart-blue), **Sage** (chart-sage), **Engraver's Brown** (chart-brown), and **Folded Grey** (chart-folded) for the "N more categories" slice. Neighbouring slices alternate dark and light so they stay apart without colour vision, and the legend always names each slice.

### Neutral
- **Currency Paper** (paper): The page ground everywhere.
- **Clean Sheet** (sheet): The inside of the totals plate only.
- **White Field** (field): Inside inputs, toggle buttons, small buttons, and meter tracks.
- **Engraving Ink** (ink): Body text, headings, the double rules.
- **Faded Ink** (ink-muted): Secondary text: descriptions, dates, labels, notes. About 6:1 on paper.
- **Placeholder Ink** (placeholder): Placeholder text in inputs (4.6:1 on white).
- **Hairline** (rule): Thin lines between list rows and meter outlines.
- **Field Edge** (field-border): Input and button outlines (3:1 on white).

### Named Rules
**The Red Means Money Out Rule.** Red is used only for expenses, a negative balance, errors, and over budget. Never use red for decoration, for a chart slice, or for a heading.

**The Chart Is Not Income Rule.** The chart never uses red, because red already means "expense" and "over budget". Green in the chart means a category, not income. Income is shown only by the "+" sign and the income colour on figures.

## Typography

**Display Font:** Bodoni Moda (with Palatino Linotype, Palatino, Georgia, serif), self-hosted from `frontend/public/fonts/` under the SIL Open Font License.
**Body Font:** system-ui (the device's own sans-serif).

**Character:** Bodoni gives the page the voice of a printed note: sharp, formal, and exact. The plain system font does the everyday work (labels, inputs, buttons) so the serif stays special.

### Hierarchy
- **Brand** (600, 1.5rem, 1.25rem on phones, uppercase, slightly spaced): The app name in the masthead only.
- **Headline** (600, 1.375rem, line height 1.2): Section titles such as "Transactions" and "Budgets · October 2026".
- **Balance figure** (700, 2.75rem on wide screens, 2rem below 640px, 1.75rem on phones): The balance in the totals plate.
- **Total figure** (700, 1.625rem on wide screens, 1.25rem below 640px): Income and expenses in the totals plate.
- **Figure** (700, 1.125rem in the list; 1rem in the chart and legend): Every other money amount.
- **Body** (400, 1rem, line height 1.5): Everyday text. Inputs and buttons are always at least 1rem, so iPhones don't zoom in.
- **Label** (600, 0.875rem): Form labels, totals labels, small notes (notes and dates use 400 in Faded Ink).
- **Stamp** (0.75rem, uppercase, 0.06em spacing): The "Over by $…" stamp only.

### Named Rules
**The Small-Print Figures Rule.** Every money figure uses Bodoni Moda at optical size 6 (`font-variation-settings: 'opsz' 6`), at every size, including the big balance. Bodoni's display cut has hairline-thin strokes: a "4" can look like a "1", and the "+" and "−" signs almost disappear. A trial at optical size 28 turned a negative balance's red "−" into a near-invisible line. Money must be exact and its direction unmistakable, so figures always use the sturdy small-text cut.

**The Column Rule.** Money figures use lining, equal-width digits (`font-variant-numeric: lining-nums tabular-nums`) so amounts line up in a column.

**The Sign Rule.** Income shows a "+" and expenses show a real minus sign "−" (not a hyphen). Zero has no sign.

## Layout

The page is a centred column up to 75rem wide with 1rem side padding. The green masthead runs full width, with its content lined up to the same 75rem column.

- **Phone (up to 767px):** One column in reading order: totals plate, add form, transactions, then spending and budgets. Spacing at the top is tighter so the whole add form fits on the first screen without scrolling.
- **Tablet (768px and up):** The form (19rem) and transactions sit side by side; spending and budgets sit in two columns below. The form stays in view (sticky) while the list scrolls.
- **Desktop (1100px and up):** Three columns: form (19rem), transactions (flexible), and the month's spending and budgets (22rem).
- **Totals plate:** On phones, income and expenses sit side by side with the balance under a rule, like the answer of a written sum. From 640px, the three read left to right as one equation, with a decorative "=" before the balance.
- **Spending chart:** Responds to its own width, not the screen: the donut sits above the legend in a narrow panel and to its left once the panel is 26rem wide.

Spacing follows a small set of steps (0.25, 0.375, 0.5, 0.75, 1, 1.5 and 2rem). Sections are 1.5rem apart (2rem on phones); rows inside a list are 0.75rem apart.

## Elevation & Depth

The system is completely flat. There are no drop shadows anywhere. Depth and grouping come from lines: a 3px double ink rule over each section, 1px hairlines between rows, and the one double-rule frame around the totals plate. The only tonal step is the totals plate's lighter sheet on the paper.

### Named Rules
**The Ruled, Not Boxed Rule.** Work areas are unboxed sections on the paper, each headed by a 3px double ink rule. The totals plate is the only fully framed object. Don't add cards, panels with backgrounds, or shadows around sections.

**The Engraved Fill Rule.** When something needs a fill (meter bars, the masthead's lower edge), draw it as fine diagonal lines at −45°, not a flat block of colour.

## Shapes

Corners are nearly square: 2px on inputs, buttons, toggle options, the over-budget stamp, and the favicon; 1px on chart swatches. The totals plate and sections have square corners. Lines are the main shape language: double rules (3px double), hairlines (1px), and the hatched band under the masthead (6px of diagonal lines). The spending chart is a donut drawn as a ring, with thin gaps between slices.

## Components

### Buttons
Firm and plain, like a stamped ticket.
- **Shape:** Nearly square (2px).
- **Primary:** Back-of-the-Note Green with Pale Note Light text, bold, 0.75rem padding, full width of the form.
- **Hover / Focus:** Hover darkens to Deep Note Green. Focus shows a 2px green outline 2px outside the button (the same focus ring is used on every control).
- **Disabled (saving):** Faded Ink background with a "wait" cursor.
- **Small (budget "Save"):** White Field with green bold text and a Field Edge outline; hover turns the outline green.
- **Quiet (transaction "Delete"):** No box: underlined Faded Ink text at 0.875rem, on the same line as the row's date so rows don't grow. Hover turns it Note Seal Red. Deleting is rare and logging is common, so it never competes with the green primary button. It asks with the browser's own confirm box before deleting.

### Expense / Income toggle
Two real radio buttons styled as two large side-by-side buttons. Unselected: White Field with a Field Edge outline; hover darkens the outline to ink. Selected "Expense": Pale Seal Red background, 2px Note Seal Red border, red text. Selected "Income": the same in seal green. The padding shrinks by 1px when selected so the button doesn't change size.

### Totals plate (signature)
- **Corner Style:** Square.
- **Background:** Clean Sheet.
- **Border:** 3px double ink, all four sides. The only framed object on the page.
- **Internal Padding:** 1rem 1.25rem (tighter on phones).
- **Content:** A small "Totals for [month]" line, then income − expenses = balance in Bodoni figures. A negative balance turns red with a "−".

### Inputs / Fields
- **Style:** White Field, 1px Field Edge outline, 2px corners, 0.5rem 0.625rem padding, 1rem text. Budget inputs are smaller and right-aligned with equal-width digits.
- **Focus:** The shared 2px green outline.
- **Error:** The border turns Note Seal Red and a red message appears under the field.

### Navigation (masthead)
A full-width Back-of-the-Note Green band with the app name in uppercase Bodoni on the left and a small "Practice app: use made-up data only." line on the right. Its lower edge is a 6px band of diagonal engraved lines. There are no links or menus.

### Lists (transactions and budgets)
Rows sit on the paper, separated by 1px hairlines (no line above the first row). In a transaction row, the category (bold) and description sit on the left; the amount and date are right-aligned.

### Budget meter (signature)
An 8px track with a hairline outline and a white inside. The filled part is drawn in green diagonal lines with a solid green edge where it stops. Over budget, the fill becomes tighter red lines and an "Over by $…" stamp appears: red uppercase text in a thin red box.

**The One Motion Rule.** The meters "engrave" in from left to right on load (`scaleX` from 0, 700ms, `cubic-bezier(0.16, 1, 0.3, 1)`). This is the page's only animation, and it is turned off when the device asks for reduced motion.

### Spending chart
A ring (donut) of up to six slices: the five largest categories plus one Folded Grey slice for the rest. The month's total sits in the hole. A legend lists each slice with a small square swatch, its amount, and its percentage.

## Do's and Don'ts

### Do:
- **Do** set every money figure in Bodoni Moda at `'opsz' 6`, bold, with lining, equal-width digits.
- **Do** show income with "+" in Treasury Seal Green and expenses with "−" in Note Seal Red.
- **Do** head every new section with a 3px double ink rule and let it sit on the paper.
- **Do** draw fills as fine diagonal lines (−45°) in green, or in red for over budget.
- **Do** keep corners at 2px and inputs and buttons at 1rem text or larger.
- **Do** use the 2px green focus outline on every interactive element.
- **Do** keep page colours in the `:root` list in `frontend/src/index.css`, so they are easy to change in one place. The chart's series colours are the one exception: they live in the `COLORS` list in `frontend/src/CategorySpending.jsx`, because the chart code hands them to each slice.

### Don't:
- **Don't** use Bodoni's display cut (a higher optical size) for money, even for the big balance; it hides the "−" sign.
- **Don't** use red in the chart or anywhere outside expenses, errors, and over budget.
- **Don't** treat green in the chart as income; it only marks a category.
- **Don't** add drop shadows, soft white cards, or rounded corners larger than 2px.
- **Don't** frame a second object like the totals plate; it stays the only framed one.
- **Don't** add a second animation, and never animate without a reduced-motion fallback.
- **Don't** use a cream or plain white page ground; the paper is green-grey.
- **Don't** add a dark mode without first deciding where it would be used; the current use scenes are both bright.
