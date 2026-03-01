/**
 * Utilitários para converter entre o formato do backend (Python) e frontend (TypeScript)
 */
import { Piece, PieceType, Color } from '../types';
import { BoardState, PieceData } from '../api/chessApi';

/**
 * Converte PieceData do backend para Piece do frontend
 */
export function convertBackendPieceToFrontend(pieceData: PieceData | null, x: number, y: number): Piece | null {
  if (!pieceData) return null;

  const colorMap: Record<string, Color> = {
    'white': Color.WHITE,
    'black': Color.BLACK,
  };

  const typeMap: Record<string, PieceType> = {
    'pawn': PieceType.PAWN,
    'rook': PieceType.ROOK,
    'knight': PieceType.KNIGHT,
    'bishop': PieceType.BISHOP,
    'queen': PieceType.QUEEN,
    'king': PieceType.KING,
  };

  const color = colorMap[pieceData.color];
  const type = typeMap[pieceData.type];

  if (!color || !type) {
    return null;
  }

  return {
    color,
    type,
    id: `${pieceData.color}-${pieceData.type}-${x}-${y}`,
  };
}

/**
 * Converte BoardState do backend para o formato do frontend
 */
export function convertBackendBoardToFrontend(boardState: BoardState): (Piece | null)[][] {
  return boardState.board.map((row, y) =>
    row.map((pieceData, x) => convertBackendPieceToFrontend(pieceData, x, y))
  );
}

/**
 * Converte string de cor do backend para Color enum
 */
export function convertBackendColorToFrontend(colorStr: string): Color {
  const colorMap: Record<string, Color> = {
    'white': Color.WHITE,
    'black': Color.BLACK,
  };
  return colorMap[colorStr] || Color.WHITE;
}

/**
 * Converte Color enum para string do backend
 */
export function convertFrontendColorToBackend(color: Color): string {
  const colorMap: Record<Color, string> = {
    [Color.WHITE]: 'white',
    [Color.BLACK]: 'black',
  };
  return colorMap[color] || 'white';
}
