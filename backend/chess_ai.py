from typing import Optional, Tuple
import random
import copy

from backend.chess_game import ChessGame, Color, PieceType


class ChessAI:
    def __init__(self, difficulty: str = "médio"):
        """
        Inteligência artificial baseada em Minimax com poda alfa-beta e heurísticas.

        Dificuldades:
          - très-fácil: escolha aleatória
          - fácil: profundidade 1
          - médio: profundidade 2
          - difícil: profundidade 3
          - muito-difícil: profundidade 4
          - mestre: profundidade 5 (ou uso de engine se estiver configurada)
        """
        self.difficulty = difficulty
        self.depth = self._get_depth_for_difficulty(difficulty)
        self.PIECE_VALUES = {
            PieceType.PAWN: 1,
            PieceType.KNIGHT: 3,
            PieceType.BISHOP: 3,
            PieceType.ROOK: 5,
            PieceType.QUEEN: 9,
            PieceType.KING: 1000,
        }

    def _get_depth_for_difficulty(self, difficulty: str) -> int:
        depth_map = {
            "très-fácil": 0,
            "fácil": 1,
            "médio": 2,
            "difícil": 3,
            "muito-difícil": 4,
            "mestre": 5,
        }
        return depth_map.get(difficulty, 2)

    def get_best_move(
        self, game: ChessGame, color: Color
    ) -> Optional[Tuple[int, int, int, int]]:
        moves = game.get_all_valid_moves(color)
        if not moves:
            return None

        if self.difficulty == "très-fácil":
            return random.choice(moves)

        best = None
        best_score = float("-inf")
        for m in moves:
            fx, fy, tx, ty = m
            score = self._minimax(
                game, fx, fy, tx, ty, self.depth, color, True, float("-inf"), float("inf")
            )
            if score > best_score:
                best_score = score
                best = m
        return best

    def _minimax(
        self,
        game: ChessGame,
        from_x: int,
        from_y: int,
        to_x: int,
        to_y: int,
        depth: int,
        maximizing_color: Color,
        is_maximizing: bool,
        alpha: float,
        beta: float,
    ) -> float:
        # aplica movimento em cópia
        test = copy.deepcopy(game)
        if not test.make_move(from_x, from_y, to_x, to_y):
            return float("-inf") if is_maximizing else float("inf")

        if depth == 0 or test.game_over:
            return self._evaluate_position(test, maximizing_color)

        current = test.current_player
        if is_maximizing:
            max_eval = float("-inf")
            for m in test.get_all_valid_moves(current):
                fx, fy, tx, ty = m
                eval_ = self._minimax(test, fx, fy, tx, ty, depth - 1, maximizing_color, False, alpha, beta)
                max_eval = max(max_eval, eval_)
                alpha = max(alpha, eval_)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = float("inf")
            for m in test.get_all_valid_moves(current):
                fx, fy, tx, ty = m
                eval_ = self._minimax(test, fx, fy, tx, ty, depth - 1, maximizing_color, True, alpha, beta)
                min_eval = min(min_eval, eval_)
                beta = min(beta, eval_)
                if beta <= alpha:
                    break
            return min_eval

    def _evaluate_position(self, game: ChessGame, color: Color) -> float:
        score = 0
        opponent = Color.BLACK if color == Color.WHITE else Color.WHITE

        for y in range(8):
            for x in range(8):
                piece = game.get_piece(x, y)
                if piece:
                    val = self.PIECE_VALUES[piece.type]
                    score += val if piece.color == color else -val

        # bônus positional simples: centro
        for cx, cy in [(3, 3), (3, 4), (4, 3), (4, 4)]:
            p = game.get_piece(cx, cy)
            if p and p.color == color:
                score += 0.5

        if game._is_king_in_check(color):
            score -= 10
        if game._is_king_in_check(opponent):
            score += 5

        if game.game_over:
            if game.winner == color:
                score += 10000
            elif game.winner == opponent:
                score -= 10000
        return score
