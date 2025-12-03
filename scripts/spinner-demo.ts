#!/usr/bin/env npx tsx
/**
 * Spinner Demo - Shows all available spinner styles
 * Run with: npx tsx scripts/spinner-demo.ts
 * 
 * Includes an accurate port of OpenCode's Knight Rider spinner
 */

import pc from "picocolors";

// =============================================================================
// OPENCODE-ACCURATE KNIGHT RIDER IMPLEMENTATION
// Ported from: https://github.com/sst/opencode/blob/dev/packages/opencode/src/cli/cmd/tui/ui/spinner.ts
// =============================================================================

interface KnightRiderOptions {
  width?: number;
  style?: "blocks" | "diamonds";
  holdStart?: number;  // Frames to hold at start position
  holdEnd?: number;    // Frames to hold at end position
  trailLength?: number;
}

/**
 * Creates OpenCode-style Knight Rider frames with hold pauses
 * The scanner sweeps left→right, pauses, then right→left, pauses
 * 
 * KEY INSIGHT: OpenCode uses the SAME character (■) for ALL active positions!
 * The trail effect is achieved through COLOR, not different characters.
 * - Active positions: ■ (with color gradient)
 * - Inactive positions: ⬝
 */
function createOpenCodeFrames(options: KnightRiderOptions = {}): string[] {
  const {
    width = 8,
    style = "blocks",  // OpenCode default is "blocks"!
    holdStart = 30,    // OpenCode defaults
    holdEnd = 9,
    trailLength = 4,
  } = options;

  // OpenCode uses same char for all trail positions - color creates the gradient!
  const chars = style === "diamonds" 
    ? { active: "◆", inactive: "·" }   // diamonds variant
    : { active: "■", inactive: "⬝" };  // blocks (OpenCode default)

  const frames: string[] = [];

  // Helper to generate a single frame given active position
  const generateFrame = (activePos: number): string => {
    let frame = "";
    for (let i = 0; i < width; i++) {
      const dist = Math.abs(i - activePos);
      // All positions within trail length are "active" (■)
      // The colorizer will apply the gradient
      if (dist < trailLength) {
        frame += chars.active;
      } else {
        frame += chars.inactive;
      }
    }
    return frame;
  };

  // Phase 1: Forward sweep (0 → width-1)
  for (let i = 0; i < width; i++) {
    frames.push(generateFrame(i));
  }

  // Phase 2: Hold at end
  for (let i = 0; i < holdEnd; i++) {
    frames.push(generateFrame(width - 1));
  }

  // Phase 3: Backward sweep (width-2 → 0)
  for (let i = width - 2; i >= 0; i--) {
    frames.push(generateFrame(i));
  }

  // Phase 4: Hold at start
  for (let i = 0; i < holdStart; i++) {
    frames.push(generateFrame(0));
  }

  return frames;
}

/**
 * ANSI 256-color code helper
 * OpenCode uses true RGBA, we approximate with 256-color palette
 */
function ansi256(code: number): string {
  return `\x1b[38;5;${code}m`;
}
const reset = "\x1b[0m";

/**
 * Creates color function for OpenCode-style gradient
 * Uses ANSI 256 colors to approximate the alpha-based trail fade
 * 
 * OpenCode uses TRUE COLOR (RGBA) with alpha blending.
 * We approximate with ANSI 256 colors.
 */
function createOpenCodeColorizer(
  baseColor: "cyan" | "green" | "magenta" | "yellow" | "red" | "blue" = "cyan",
  _trailLength: number = 4
): (frame: string, frameIdx: number, totalFrames: number) => string {
  // ANSI 256 color gradients (bright → dim) for trail positions
  // Index 0 = lead (brightest), Index N = trail end (dimmest)
  const colorGradients: Record<string, number[]> = {
    cyan:    [51, 44, 37, 30, 23, 17],     // Bright cyan → dark cyan
    green:   [46, 40, 34, 28, 22, 22],     // Bright green → dark green
    magenta: [201, 165, 129, 93, 57, 53],  // Bright magenta → dark
    yellow:  [226, 220, 214, 178, 136, 94],
    red:     [196, 160, 124, 88, 52, 52],
    blue:    [33, 27, 21, 18, 17, 17],
  };

  const gradient = colorGradients[baseColor] || colorGradients.cyan;
  const dimColor = 240; // Gray for inactive (⬝)

  return (frame: string, _frameIdx: number, _totalFrames: number): string => {
    let result = "";
    const chars = [...frame]; // Handle unicode properly
    
    // Find the LEAD position - it's the leftmost or rightmost ■ depending on direction
    // In OpenCode, all ■ within trail are active, we need to find the "head"
    // The head is determined by which end has active chars
    
    // Find all active positions
    const activePositions: number[] = [];
    chars.forEach((c, i) => {
      if (c === "■" || c === "◆") activePositions.push(i);
    });
    
    if (activePositions.length === 0) {
      // No active positions, just dim everything
      return chars.map(c => ansi256(dimColor) + c + reset).join("");
    }
    
    // The lead is at one end of the active range
    // We detect direction by looking at which side has more "room"
    const firstActive = activePositions[0];
    const lastActive = activePositions[activePositions.length - 1];
    
    // Heuristic: lead is at the end closer to edge, or we use frame index
    // For simplicity, we'll color based on distance from the center of active region
    // Actually, let's find the "newest" position (the head of the scanner)
    // The head moves, so we look at the density
    
    // Simpler approach: the lead is at the end of the active cluster
    // that has inactive chars next to it (the "front" of the sweep)
    let leadIdx = firstActive;
    if (lastActive < chars.length - 1 && chars[lastActive + 1] === "⬝") {
      // Moving right, lead is at the right
      leadIdx = lastActive;
    } else if (firstActive > 0 && chars[firstActive - 1] === "⬝") {
      // Moving left, lead is at the left
      leadIdx = firstActive;
    } else {
      // At an edge, use the edge position
      leadIdx = firstActive === 0 ? lastActive : firstActive;
    }

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      
      if (char === "■" || char === "◆") {
        // Active position - color based on distance from lead
        const dist = Math.abs(i - leadIdx);
        const colorIdx = Math.min(dist, gradient.length - 1);
        result += ansi256(gradient[colorIdx]) + char + reset;
      } else {
        // Inactive (⬝ or ·)
        result += ansi256(dimColor) + char + reset;
      }
    }
    return result;
  };
}

// =============================================================================
// SIMPLE KNIGHT RIDER (my original simplified version)
// =============================================================================

function createKnightRiderFrames(width: number = 8): string[] {
  const frames: string[] = [];
  
  // Forward sweep
  for (let i = 0; i < width; i++) {
    let frame = "";
    for (let j = 0; j < width; j++) {
      if (j === i) frame += "█";
      else if (j === i - 1 || j === i + 1) frame += "▓";
      else if (j === i - 2 || j === i + 2) frame += "▒";
      else if (j === i - 3 || j === i + 3) frame += "░";
      else frame += "·";
    }
    frames.push(frame);
  }
  
  // Backward sweep
  for (let i = width - 2; i > 0; i--) {
    let frame = "";
    for (let j = 0; j < width; j++) {
      if (j === i) frame += "█";
      else if (j === i - 1 || j === i + 1) frame += "▓";
      else if (j === i - 2 || j === i + 2) frame += "▒";
      else if (j === i - 3 || j === i + 3) frame += "░";
      else frame += "·";
    }
    frames.push(frame);
  }
  
  return frames;
}

// Knight Rider with color gradient (simple version)
function createColoredKnightRider(width: number = 8): { frames: string[], colorize: (frame: string, idx: number) => string } {
  const frames = createKnightRiderFrames(width);
  
  const colorize = (frame: string, _frameIdx: number): string => {
    let result = "";
    
    for (let i = 0; i < frame.length; i++) {
      const char = frame[i];
      
      if (char === "█") {
        result += pc.cyan(char);
      } else if (char === "▓") {
        result += pc.blue(char);
      } else if (char === "▒") {
        result += pc.dim(pc.blue(char));
      } else if (char === "░") {
        result += pc.dim(pc.gray(char));
      } else {
        result += pc.dim(char);
      }
    }
    return result;
  };
  
  return { frames, colorize };
}

// Diamond style (like OpenCode's default)
function createDiamondFrames(width: number = 8): string[] {
  const frames: string[] = [];
  
  // Forward sweep
  for (let i = 0; i < width; i++) {
    let frame = "";
    for (let j = 0; j < width; j++) {
      if (j === i) frame += "◆";
      else if (j === i - 1 || j === i + 1) frame += "⬥";
      else if (j === i - 2 || j === i + 2) frame += "⬩";
      else frame += "·";
    }
    frames.push(frame);
  }
  
  // Backward sweep
  for (let i = width - 2; i > 0; i--) {
    let frame = "";
    for (let j = 0; j < width; j++) {
      if (j === i) frame += "◆";
      else if (j === i - 1 || j === i + 1) frame += "⬥";
      else if (j === i - 2 || j === i + 2) frame += "⬩";
      else frame += "·";
    }
    frames.push(frame);
  }
  
  return frames;
}

// All spinner definitions
const spinners: Record<string, { interval: number; frames: string[], opencode?: boolean, color?: string }> = {
  // === OPENCODE-ACCURATE SPINNERS (with hold frames) ===
  "opencode-cyan": {
    interval: 40,
    frames: createOpenCodeFrames({ width: 8, style: "diamonds", holdStart: 30, holdEnd: 9 }),
    opencode: true,
    color: "cyan",
  },
  "opencode-green": {
    interval: 40,
    frames: createOpenCodeFrames({ width: 8, style: "diamonds", holdStart: 30, holdEnd: 9 }),
    opencode: true,
    color: "green",
  },
  "opencode-magenta": {
    interval: 40,
    frames: createOpenCodeFrames({ width: 8, style: "diamonds", holdStart: 30, holdEnd: 9 }),
    opencode: true,
    color: "magenta",
  },
  "opencode-blocks": {
    interval: 40,
    frames: createOpenCodeFrames({ width: 8, style: "blocks", holdStart: 30, holdEnd: 9 }),
    opencode: true,
    color: "cyan",
  },
  "opencode-fast": {
    interval: 40,
    frames: createOpenCodeFrames({ width: 8, style: "diamonds", holdStart: 5, holdEnd: 3 }),
    opencode: true,
    color: "cyan",
  },
  "opencode-wide": {
    interval: 40,
    frames: createOpenCodeFrames({ width: 12, style: "diamonds", holdStart: 20, holdEnd: 6 }),
    opencode: true,
    color: "cyan",
  },
  
  // === SIMPLIFIED SPINNERS (no hold frames) ===
  knightRider: {
    interval: 50,
    frames: createKnightRiderFrames(8),
  },
  knightRiderWide: {
    interval: 40,
    frames: createKnightRiderFrames(12),
  },
  diamond: {
    interval: 50,
    frames: createDiamondFrames(8),
  },
  
  // === BUILT-IN SPINNER STYLES ===
  dots: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  dots2: {
    interval: 80,
    frames: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  },
  dots3: {
    interval: 80,
    frames: ["⠋", "⠙", "⠚", "⠞", "⠖", "⠦", "⠴", "⠲", "⠳", "⠓"],
  },
  line: {
    interval: 130,
    frames: ["-", "\\", "|", "/"],
  },
  arrow3: {
    interval: 100,
    frames: ["▹▹▹▹▹", "▸▹▹▹▹", "▹▸▹▹▹", "▹▹▸▹▹", "▹▹▹▸▹", "▹▹▹▹▸"],
  },
  bouncingBar: {
    interval: 80,
    frames: [
      "[    ]", "[=   ]", "[==  ]", "[=== ]", "[====]",
      "[ ===]", "[  ==]", "[   =]", "[    ]",
      "[   =]", "[  ==]", "[ ===]", "[====]",
      "[=== ]", "[==  ]", "[=   ]",
    ],
  },
  bouncingBall: {
    interval: 80,
    frames: [
      "( ●    )", "(  ●   )", "(   ●  )", "(    ● )", "(     ●)",
      "(    ● )", "(   ●  )", "(  ●   )", "( ●    )", "(●     )",
    ],
  },
  pong: {
    interval: 80,
    frames: [
      "▐⠂       ▌", "▐⠈       ▌", "▐ ⠂      ▌", "▐ ⠠      ▌",
      "▐  ⡀     ▌", "▐  ⠠     ▌", "▐   ⠂    ▌", "▐   ⠈    ▌",
      "▐    ⠂   ▌", "▐    ⠠   ▌", "▐     ⡀  ▌", "▐     ⠠  ▌",
      "▐      ⠂ ▌", "▐      ⠈ ▌", "▐       ⠂▌", "▐       ⠠▌",
      "▐       ⡀▌", "▐      ⠠ ▌", "▐      ⠂ ▌", "▐     ⠈  ▌",
      "▐     ⠂  ▌", "▐    ⠠   ▌", "▐    ⡀   ▌", "▐   ⠠    ▌",
      "▐   ⠂    ▌", "▐  ⠈     ▌", "▐  ⠂     ▌", "▐ ⠠      ▌",
      "▐ ⡀      ▌", "▐⠠       ▌",
    ],
  },
  aesthetic: {
    interval: 80,
    frames: [
      "▰▱▱▱▱▱▱", "▰▰▱▱▱▱▱", "▰▰▰▱▱▱▱", "▰▰▰▰▱▱▱",
      "▰▰▰▰▰▱▱", "▰▰▰▰▰▰▱", "▰▰▰▰▰▰▰", "▰▱▱▱▱▱▱",
    ],
  },
  growHorizontal: {
    interval: 120,
    frames: ["▏", "▎", "▍", "▌", "▋", "▊", "▉", "▊", "▋", "▌", "▍", "▎"],
  },
  betaWave: {
    interval: 80,
    frames: ["ρββββββ", "βρβββββ", "ββρββββ", "βββρβββ", "ββββρββ", "βββββρβ", "ββββββρ"],
  },
  point: {
    interval: 125,
    frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"],
  },
  arc: {
    interval: 100,
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
  },
  circle: {
    interval: 120,
    frames: ["◡", "⊙", "◠"],
  },
  squareCorners: {
    interval: 180,
    frames: ["◰", "◳", "◲", "◱"],
  },
  toggle3: {
    interval: 120,
    frames: ["□", "■"],
  },
  boxBounce: {
    interval: 120,
    frames: ["▖", "▘", "▝", "▗"],
  },
  boxBounce2: {
    interval: 100,
    frames: ["▌", "▀", "▐", "▄"],
  },
  triangle: {
    interval: 50,
    frames: ["◢", "◣", "◤", "◥"],
  },
  star: {
    interval: 70,
    frames: ["✶", "✸", "✹", "✺", "✹", "✷"],
  },
  
  // === EMOJI SPINNERS ===
  moon: {
    interval: 80,
    frames: ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"],
  },
  clock: {
    interval: 100,
    frames: ["🕛", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚"],
  },
  earth: {
    interval: 180,
    frames: ["🌍", "🌎", "🌏"],
  },
  orangeBluePulse: {
    interval: 100,
    frames: ["🔸", "🔶", "🟠", "🟠", "🔶", "🔹", "🔷", "🔵", "🔵", "🔷"],
  },
};

// === DISPLAY FUNCTIONS ===

class SpinnerDisplay {
  private intervalId: NodeJS.Timeout | null = null;
  private frameIndex = 0;
  private frames: string[] = [];
  private colorize?: (frame: string, idx: number) => string;

  start(
    name: string,
    frames: string[],
    interval: number,
    message: string,
    colorize?: (frame: string, idx: number) => string
  ) {
    this.frames = frames;
    this.frameIndex = 0;
    this.colorize = colorize;

    process.stdout.write("\x1B[?25l"); // Hide cursor

    this.intervalId = setInterval(() => {
      const frame = this.colorize
        ? this.colorize(this.frames[this.frameIndex], this.frameIndex)
        : pc.cyan(this.frames[this.frameIndex]);

      process.stdout.write(`\r  ${frame} ${pc.gray(message)} ${pc.dim(`(${name})`)}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    process.stdout.write("\r\x1B[K"); // Clear line
    process.stdout.write("\x1B[?25h"); // Show cursor
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function showAllSpinners() {
  console.log(pc.cyan("\n  ╭─────────────────────────────────────────╮"));
  console.log(pc.cyan("  │       Spinner Demo for Token Tracker    │"));
  console.log(pc.cyan("  ╰─────────────────────────────────────────╯\n"));

  console.log(pc.yellow("  Press Ctrl+C to exit\n"));
  console.log(pc.gray("  Each spinner will display for 3 seconds...\n"));

  const spinner = new SpinnerDisplay();
  const entries = Object.entries(spinners);

  // Handle graceful exit
  process.on("SIGINT", () => {
    spinner.stop();
    console.log(pc.green("\n\n  Done! Pick your favorite spinner.\n"));
    process.exit(0);
  });

  for (const [name, config] of entries) {
    // OpenCode-accurate spinners with color gradient
    if (config.opencode && config.color) {
      const colorizer = createOpenCodeColorizer(config.color as any);
      const wrappedColorizer = (frame: string, idx: number) => 
        colorizer(frame, idx, config.frames.length);
      spinner.start(name, config.frames, config.interval, "esc interrupt", wrappedColorizer);
    }
    // Legacy colorized knight rider
    else if (name === "knightRider" || name === "knightRiderWide") {
      const width = name === "knightRiderWide" ? 12 : 8;
      const colored = createColoredKnightRider(width);
      spinner.start(name, colored.frames, config.interval, "Loading...", colored.colorize);
    } else {
      spinner.start(name, config.frames, config.interval, "Loading...");
    }

    await sleep(3000);
    spinner.stop();

    console.log(pc.green(`  ✓ ${name}`));
  }

  console.log(pc.cyan("\n  All spinners shown!"));
  console.log(pc.gray("  Recommended: opencode-cyan, opencode-blocks (accurate OpenCode port)\n"));
}

async function showInteractive() {
  const spinner = new SpinnerDisplay();
  const names = Object.keys(spinners);
  let currentIndex = 0;

  console.log(pc.cyan("\n  ╭─────────────────────────────────────────╮"));
  console.log(pc.cyan("  │     Interactive Spinner Viewer          │"));
  console.log(pc.cyan("  ╰─────────────────────────────────────────╯\n"));
  console.log(pc.yellow("  Controls:"));
  console.log(pc.gray("    n = next spinner"));
  console.log(pc.gray("    p = previous spinner"));
  console.log(pc.gray("    q = quit\n"));

  const showCurrent = () => {
    const name = names[currentIndex];
    const config = spinners[name];

    spinner.stop();

    // OpenCode-accurate spinners with color gradient
    if (config.opencode && config.color) {
      const colorizer = createOpenCodeColorizer(config.color as any);
      const wrappedColorizer = (frame: string, idx: number) => 
        colorizer(frame, idx, config.frames.length);
      spinner.start(name, config.frames, config.interval, "esc interrupt", wrappedColorizer);
    }
    // Legacy colorized knight rider
    else if (name === "knightRider" || name === "knightRiderWide") {
      const width = name === "knightRiderWide" ? 12 : 8;
      const colored = createColoredKnightRider(width);
      spinner.start(name, colored.frames, config.interval, "esc interrupt", colored.colorize);
    } else {
      spinner.start(name, config.frames, config.interval, "esc interrupt");
    }
  };

  // Start with first spinner
  showCurrent();

  // Setup keypress handling
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key: string) => {
    if (key === "q" || key === "\u0003") {
      // q or Ctrl+C
      spinner.stop();
      process.stdin.setRawMode(false);
      console.log(pc.green("\n\n  Bye!\n"));
      process.exit(0);
    } else if (key === "n" || key === "\u001B[C") {
      // n or right arrow
      currentIndex = (currentIndex + 1) % names.length;
      showCurrent();
    } else if (key === "p" || key === "\u001B[D") {
      // p or left arrow
      currentIndex = (currentIndex - 1 + names.length) % names.length;
      showCurrent();
    }
  });
}

// === MAIN ===

const args = process.argv.slice(2);
const mode = args[0];

if (mode === "--interactive" || mode === "-i") {
  showInteractive();
} else if (mode === "--help" || mode === "-h") {
  console.log(`
  Usage: npx tsx scripts/spinner-demo.ts [options]

  Options:
    (no args)      Show all spinners in sequence (3 sec each)
    -i, --interactive   Interactive mode (n/p to switch, q to quit)
    -h, --help     Show this help
  `);
} else {
  showAllSpinners().catch(console.error);
}
