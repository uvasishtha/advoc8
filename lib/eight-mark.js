// Geometry for the ADVOC8 "8".
//
// One definition of the mark, shared by the loading screen and the streak
// graphic, so the symbol a user sees while waiting is the same symbol they see
// when they have kept a streak going.

/** Drawing surface the two loops are positioned in. */
export const EIGHT_VIEWBOX = "0 0 120 164";

/** Upper loop — a full ellipse, narrower than the one below it. */
export const EIGHT_TOP_LOOP = "M60 12a27 34 0 1 1 0 68a27 34 0 1 1 0-68";

/** Lower loop — wider, so the figure sits on a broader base. */
export const EIGHT_BOTTOM_LOOP = "M60 76a31 38 0 1 1 0 76a31 38 0 1 1 0-76";

/** Width divided by height, for sizing an <svg> from a single number. */
export const EIGHT_ASPECT = 120 / 164;