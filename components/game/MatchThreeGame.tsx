import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type GemColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple';
type Cell = GemColor | null;
type Board = Cell[][];

interface Position {
  row: number;
  col: number;
}

interface LevelConfig {
  level: number;
  scoreTarget: number;
  dangerSpeed: number;    // danger added per second (0–1 scale)
  dangerReduction: number; // danger removed per matched gem group
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS = 7;
const ROWS = 8;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 12;
const GEM_SIZE = Math.floor((SCREEN_WIDTH - BOARD_PADDING * 2 - (COLS - 1) * 3) / COLS);

const GEM_COLORS: GemColor[] = ['red', 'green', 'blue', 'yellow', 'purple'];

const GEM_BG: Record<GemColor, string> = {
  red: '#E53E3E',
  green: '#38A169',
  blue: '#3182CE',
  yellow: '#D69E2E',
  purple: '#805AD5',
};

const GEM_EMOJI: Record<GemColor, string> = {
  red: '♦',
  green: '♣',
  blue: '●',
  yellow: '★',
  purple: '■',
};

const LEVELS: LevelConfig[] = [
  { level: 1, scoreTarget: 300,  dangerSpeed: 0.018, dangerReduction: 0.12 },
  { level: 2, scoreTarget: 600,  dangerSpeed: 0.025, dangerReduction: 0.10 },
  { level: 3, scoreTarget: 1000, dangerSpeed: 0.033, dangerReduction: 0.09 },
  { level: 4, scoreTarget: 1500, dangerSpeed: 0.042, dangerReduction: 0.08 },
  { level: 5, scoreTarget: 2200, dangerSpeed: 0.050, dangerReduction: 0.07 },
];

const DANGER_BAR_HEIGHT = 110;

// ─── Board Helpers ────────────────────────────────────────────────────────────

function randomGem(): GemColor {
  return GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
}

function initBoard(): Board {
  const board: Board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      const forbidden = new Set<GemColor>();
      if (c >= 2 && board[r][c - 1] === board[r][c - 2] && board[r][c - 1] !== null) {
        forbidden.add(board[r][c - 1] as GemColor);
      }
      if (r >= 2 && board[r - 1][c] === board[r - 2][c] && board[r - 1][c] !== null) {
        forbidden.add(board[r - 1][c] as GemColor);
      }
      const allowed = GEM_COLORS.filter(g => !forbidden.has(g));
      board[r][c] = allowed[Math.floor(Math.random() * allowed.length)];
    }
  }
  return board;
}

function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

function swapCells(board: Board, a: Position, b: Position): Board {
  const next = cloneBoard(board);
  const tmp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = tmp;
  return next;
}

function isAdjacent(a: Position, b: Position): boolean {
  return (
    (Math.abs(a.row - b.row) === 1 && a.col === b.col) ||
    (Math.abs(a.col - b.col) === 1 && a.row === b.row)
  );
}

interface MatchGroup {
  positions: Position[];
}

function findMatches(board: Board): MatchGroup[] {
  const groups: MatchGroup[] = [];

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let start = 0;
    for (let c = 1; c <= COLS; c++) {
      if (c === COLS || board[r][c] !== board[r][c - 1] || board[r][c] === null) {
        const len = c - start;
        if (len >= 3) {
          const positions: Position[] = [];
          for (let k = start; k < c; k++) positions.push({ row: r, col: k });
          groups.push({ positions });
        }
        start = c;
      }
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    let start = 0;
    for (let r = 1; r <= ROWS; r++) {
      if (r === ROWS || board[r][c] !== board[r - 1][c] || board[r][c] === null) {
        const len = r - start;
        if (len >= 3) {
          const positions: Position[] = [];
          for (let k = start; k < r; k++) positions.push({ row: k, col: c });
          groups.push({ positions });
        }
        start = r;
      }
    }
  }

  return groups;
}

function applyGravityAndRefill(board: Board): Board {
  const next = cloneBoard(board);
  for (let c = 0; c < COLS; c++) {
    const gems: GemColor[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (next[r][c] !== null) gems.push(next[r][c] as GemColor);
    }
    let fill = ROWS - 1;
    for (let i = gems.length - 1; i >= 0; i--) {
      next[fill][c] = gems[i];
      fill--;
    }
    for (let r = fill; r >= 0; r--) {
      next[r][c] = randomGem();
    }
  }
  return next;
}

function scoreForGroup(len: number): number {
  if (len >= 5) return 150;
  if (len === 4) return 80;
  return 30;
}

function hasValidMoves(board: Board): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c + 1 < COLS) {
        const swapped = swapCells(board, { row: r, col: c }, { row: r, col: c + 1 });
        if (findMatches(swapped).length > 0) return true;
      }
      if (r + 1 < ROWS) {
        const swapped = swapCells(board, { row: r, col: c }, { row: r + 1, col: c });
        if (findMatches(swapped).length > 0) return true;
      }
    }
  }
  return false;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchThreeGame() {
  const [board, setBoard] = useState<Board>(() => initBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0); // index into LEVELS
  const [danger, setDanger] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost' | 'complete'>('playing');
  const [locked, setLocked] = useState(false);
  const [shuffleMsg, setShuffleMsg] = useState(false);

  const dangerRef = useRef(0);
  const phaseRef = useRef<'playing' | 'won' | 'lost' | 'complete'>('playing');
  const levelRef = useRef(0);

  // Keep refs in sync for use inside intervals/timeouts
  useEffect(() => { dangerRef.current = danger; }, [danger]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { levelRef.current = level; }, [level]);

  const config = LEVELS[level] ?? LEVELS[LEVELS.length - 1];

  // ── Danger timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      setDanger(prev => {
        const next = +(prev + config.dangerSpeed).toFixed(4);
        if (next >= 1.0) {
          setPhase('lost');
          return 1.0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, config.dangerSpeed]);

  // ── Cascade processor ───────────────────────────────────────────────────────
  const processBoard = useCallback(
    (b: Board, depth = 1) => {
      const groups = findMatches(b);
      if (groups.length === 0) {
        // No more matches — check for valid moves
        if (!hasValidMoves(b)) {
          const reshuffled = initBoard();
          setBoard(reshuffled);
          setShuffleMsg(true);
          setTimeout(() => setShuffleMsg(false), 1200);
          setTimeout(() => processBoard(reshuffled, 1), 1300);
        } else {
          setLocked(false);
        }
        return;
      }

      // Mark matched cells null
      const next = cloneBoard(b);
      let pts = 0;
      let totalGems = 0;
      for (const g of groups) {
        pts += scoreForGroup(g.positions.length) * depth;
        totalGems += g.positions.length;
        for (const p of g.positions) next[p.row][p.col] = null;
      }

      setBoard(next);
      setScore(s => {
        const newScore = s + pts;
        // Check win
        if (newScore >= config.scoreTarget && phaseRef.current === 'playing') {
          if (levelRef.current >= LEVELS.length - 1) {
            setPhase('complete');
          } else {
            setPhase('won');
          }
        }
        return newScore;
      });

      // Reduce danger
      const reduction = config.dangerReduction * (totalGems / 3);
      setDanger(d => Math.max(0, d - reduction));

      setTimeout(() => {
        const filled = applyGravityAndRefill(next);
        setBoard(filled);
        setTimeout(() => processBoard(filled, depth + 1), 280);
      }, 280);
    },
    [config]
  );

  // ── Gem tap handler ─────────────────────────────────────────────────────────
  const handleTap = useCallback(
    (pos: Position) => {
      if (phase !== 'playing' || locked) return;

      if (!selected) {
        setSelected(pos);
        return;
      }

      if (selected.row === pos.row && selected.col === pos.col) {
        setSelected(null);
        return;
      }

      if (!isAdjacent(selected, pos)) {
        setSelected(pos);
        return;
      }

      const candidate = swapCells(board, selected, pos);
      const matches = findMatches(candidate);

      setSelected(null);

      if (matches.length === 0) {
        // Invalid swap — deselect silently
        return;
      }

      setLocked(true);
      setBoard(candidate);
      setTimeout(() => processBoard(candidate), 100);
    },
    [board, selected, phase, locked, processBoard]
  );

  // ── Restart ─────────────────────────────────────────────────────────────────
  const startLevel = useCallback((lvlIndex: number) => {
    setLevel(lvlIndex);
    setBoard(initBoard());
    setScore(0);
    setDanger(0);
    setSelected(null);
    setLocked(false);
    setPhase('playing');
  }, []);

  const handleNextLevel = useCallback(() => {
    const next = Math.min(level + 1, LEVELS.length - 1);
    startLevel(next);
  }, [level, startLevel]);

  const handleRestart = useCallback(() => {
    startLevel(level);
  }, [level, startLevel]);

  const handleRestartFromComplete = useCallback(() => {
    startLevel(0);
  }, [startLevel]);

  // ── Danger bar height ────────────────────────────────────────────────────────
  const boulderHeight = Math.round(danger * DANGER_BAR_HEIGHT);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* HUD */}
        <View style={styles.hud}>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>LEVEL</Text>
            <Text style={styles.hudValue}>{config.level}</Text>
          </View>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>SCORE</Text>
            <Text style={styles.hudValue}>{score}</Text>
          </View>
          <View style={styles.hudItem}>
            <Text style={styles.hudLabel}>TARGET</Text>
            <Text style={styles.hudValue}>{config.scoreTarget}</Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.dangerZone}>
          {/* Boulder fill from top */}
          <View style={[styles.boulder, { height: boulderHeight }]}>
            <View style={styles.boulderSurface}>
              <Text style={styles.boulderText}>🪨🪨🪨🪨🪨🪨🪨</Text>
            </View>
          </View>

          {/* Danger bar outline */}
          <View style={styles.dangerBarTrack}>
            <View
              style={[
                styles.dangerBarFill,
                { width: `${Math.round(danger * 100)}%` },
              ]}
            />
          </View>

          {/* King character */}
          <View style={styles.characterRow}>
            <Text style={styles.characterEmoji}>
              {phase === 'lost' ? '💀' : '👑'}
            </Text>
            <Text style={styles.characterLabel}>
              {phase === 'lost' ? 'CRUSHED' : 'SAVE THE KING!'}
            </Text>
          </View>
        </View>

        {/* Board */}
        <View style={styles.boardWrapper}>
          {shuffleMsg && (
            <View style={styles.shuffleBanner}>
              <Text style={styles.shuffleText}>SHUFFLE!</Text>
            </View>
          )}
          {board.map((row, r) => (
            <View key={r} style={styles.boardRow}>
              {row.map((gem, c) => {
                const isSelected = selected?.row === r && selected?.col === c;
                return (
                  <TouchableOpacity
                    key={`${r}-${c}`}
                    onPress={() => handleTap({ row: r, col: c })}
                    activeOpacity={0.75}
                    style={[
                      styles.gem,
                      {
                        width: GEM_SIZE,
                        height: GEM_SIZE,
                        backgroundColor: gem ? GEM_BG[gem] : '#333',
                        borderWidth: isSelected ? 3 : 0,
                        borderColor: '#FFFFFF',
                        transform: [{ scale: isSelected ? 1.1 : 1 }],
                      },
                    ]}
                  >
                    {gem && (
                      <Text style={[styles.gemEmoji, { fontSize: GEM_SIZE * 0.38 }]}>
                        {GEM_EMOJI[gem]}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Win Overlay */}
        {phase === 'won' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>LEVEL COMPLETE! 🎉</Text>
            <Text style={styles.overlayScore}>Score: {score}</Text>
            <TouchableOpacity style={styles.overlayBtn} onPress={handleNextLevel}>
              <Text style={styles.overlayBtnText}>NEXT LEVEL →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lose Overlay */}
        {phase === 'lost' && (
          <View style={[styles.overlay, styles.overlayLost]}>
            <Text style={styles.overlayTitle}>CRUSHED! 💀</Text>
            <Text style={styles.overlayScore}>Score: {score}</Text>
            <TouchableOpacity style={[styles.overlayBtn, styles.overlayBtnRed]} onPress={handleRestart}>
              <Text style={styles.overlayBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Complete Overlay */}
        {phase === 'complete' && (
          <View style={[styles.overlay, styles.overlayComplete]}>
            <Text style={styles.overlayTitle}>YOU SAVED THE KING! 👑</Text>
            <Text style={styles.overlayScore}>Final Score: {score}</Text>
            <TouchableOpacity style={styles.overlayBtn} onPress={handleRestartFromComplete}>
              <Text style={styles.overlayBtnText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: BOARD_PADDING,
    paddingTop: 8,
  },

  // HUD
  hud: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  hudItem: { alignItems: 'center' },
  hudLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  hudValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },

  // Danger zone
  dangerZone: {
    width: '100%',
    height: DANGER_BAR_HEIGHT,
    backgroundColor: '#0D0D1A',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  boulder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4A3728',
    justifyContent: 'flex-end',
  },
  boulderSurface: {
    backgroundColor: '#5D4037',
    paddingVertical: 4,
    alignItems: 'center',
  },
  boulderText: { fontSize: 18, letterSpacing: 1 },
  dangerBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginHorizontal: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  dangerBarFill: {
    height: '100%',
    backgroundColor: '#E53E3E',
    borderRadius: 3,
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    gap: 8,
  },
  characterEmoji: { fontSize: 32 },
  characterLabel: {
    color: '#FCD34D',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },

  // Board
  boardWrapper: {
    position: 'relative',
    gap: 3,
  },
  boardRow: {
    flexDirection: 'row',
    gap: 3,
  },
  gem: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  gemEmoji: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  shuffleBanner: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  shuffleText: {
    color: '#FCD34D',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
  },

  // Overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,30,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 16,
  },
  overlayLost: {
    backgroundColor: 'rgba(80,10,10,0.93)',
  },
  overlayComplete: {
    backgroundColor: 'rgba(10,50,10,0.93)',
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  overlayScore: {
    color: '#FCD34D',
    fontSize: 18,
    fontWeight: '700',
  },
  overlayBtn: {
    backgroundColor: '#3182CE',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
  },
  overlayBtnRed: {
    backgroundColor: '#E53E3E',
  },
  overlayBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
});
