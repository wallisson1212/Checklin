/// <reference types="vite/client" />

/**
 * Serviço de API para comunicação com o backend Python
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface BoardState {
  board: (PieceData | null)[][];
  current_player: string;
  is_check: boolean;
  game_over: boolean;
  winner: string | null;
}

export interface PieceData {
  color: string;
  type: string;
}

export interface MoveResponse {
  success: boolean;
  board: BoardState;
  error?: string;
}

export interface AIMoveResponse extends MoveResponse {
  move?: {
    from_x: number;
    from_y: number;
    to_x: number;
    to_y: number;
  };
}

export interface NewGameResponse {
  game_id: string;
  board: BoardState;
}

export interface ValidMovesResponse {
  moves: Array<{ x: number; y: number }>;
}

class ChessAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Cria um novo jogo
   */
  async createNewGame(): Promise<NewGameResponse> {
    const response = await fetch(`${this.baseUrl}/api/game/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar jogo: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtém o estado atual do jogo
   */
  async getGameState(gameId: string): Promise<BoardState> {
    const response = await fetch(`${this.baseUrl}/api/game/${gameId}/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter estado do jogo: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Faz um movimento no jogo
   */
  async makeMove(
    gameId: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Promise<MoveResponse> {
    const response = await fetch(`${this.baseUrl}/api/game/${gameId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_x: fromX,
        from_y: fromY,
        to_x: toX,
        to_y: toY,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        board: data.board || this.getEmptyBoardState(),
        error: data.error || 'Erro ao fazer movimento',
      };
    }

    return {
      success: true,
      board: data.board,
    };
  }

  /**
   * Obtém o melhor movimento da IA
   */
  async getAIMove(
    gameId: string,
    difficulty: string,
    aiColor: 'white' | 'black'
  ): Promise<AIMoveResponse> {
    const response = await fetch(`${this.baseUrl}/api/game/${gameId}/ai-move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: difficulty,
        ai_color: aiColor,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        board: data.board || this.getEmptyBoardState(),
        error: data.error || 'Erro ao obter movimento da IA',
      };
    }

    return {
      success: true,
      board: data.board,
      move: data.move,
    };
  }

  /**
   * Obtém os movimentos válidos para uma posição
   */
  async getValidMoves(
    gameId: string,
    x: number,
    y: number
  ): Promise<ValidMovesResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/game/${gameId}/valid-moves?x=${x}&y=${y}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao obter movimentos válidos: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Retorna um estado de tabuleiro vazio (fallback)
   */
  private getEmptyBoardState(): BoardState {
    return {
      board: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
      current_player: 'white',
      is_check: false,
      game_over: false,
      winner: null,
    };
  }
}

export const chessAPI = new ChessAPI();
