"""
Lógica do tabuleiro e das peças usando python-chess.
"""
from __future__ import annotations

from enum import Enum
from typing import List, Optional, Tuple, Dict, Any

import chess


class Color(Enum):
    WHITE = "white"
    BLACK = "black"


class PieceType(Enum):
    PAWN = "pawn"
    KNIGHT = "knight"
    BISHOP = "bishop"
    ROOK = "rook"
    QUEEN = "queen"
    KING = "king"


class Piece:
    def __init__(self, color: Color, type: PieceType):
        self.color = color
        self.type = type


class ChessGame:
    def __init__(self):
        # usa a biblioteca python-chess para manter o estado
        self.board = chess.Board()
        self.current_player = Color.WHITE
        self.game_over = False
        self.winner: Optional[Color] = None

    # ----- utilitários de conversão -----
    @staticmethod
    def _coords_to_square(x: int, y: int) -> int:
        # x=0..7 corresponde a coluna a..h
        # y=0..7 corresponde a linha 8..1 (0 no topo)
        return chess.square(x, 7 - y)

    @staticmethod
    def _square_to_coords(square: int) -> Tuple[int, int]:
        file = chess.square_file(square)
        rank = chess.square_rank(square)
        return file, 7 - rank

    # ----- estado para o frontend -----
    def get_board_state(self) -> Dict[str, Any]:
        board_state: List[List[Optional[Dict[str, str]]]] = [
            [None for _ in range(8)] for __ in range(8)
        ]
        for square in chess.SQUARES:
            piece = self.board.piece_at(square)
            if piece:
                color = Color.WHITE if piece.color == chess.WHITE else Color.BLACK
                type_str = {
                    chess.PAWN: PieceType.PAWN,
                    chess.KNIGHT: PieceType.KNIGHT,
                    chess.BISHOP: PieceType.BISHOP,
                    chess.ROOK: PieceType.ROOK,
                    chess.QUEEN: PieceType.QUEEN,
                    chess.KING: PieceType.KING,
                }[piece.piece_type].value
                x, y = self._square_to_coords(square)
                board_state[y][x] = {"color": color.value, "type": type_str}

        return {
            "board": board_state,
            "current_player": self.current_player.value,
            "is_check": self._is_king_in_check(self.current_player),
            "game_over": self.board.is_game_over(),
            "winner": self.winner.value if self.winner else None,
        }

    # ----- movimentação -----
    def make_move(
        self, from_x: int, from_y: int, to_x: int, to_y: int
    ) -> bool:
        move = chess.Move(
            self._coords_to_square(from_x, from_y),
            self._coords_to_square(to_x, to_y),
        )
        if move in self.board.legal_moves:
            self.board.push(move)
            # atualizar jogador atual
            self.current_player = (
                Color.BLACK if self.current_player == Color.WHITE else Color.WHITE
            )
            if self.board.is_game_over():
                self.game_over = True
                result = self.board.result()
                if result == "1-0":
                    self.winner = Color.WHITE
                elif result == "0-1":
                    self.winner = Color.BLACK
                else:
                    self.winner = None
            return True
        return False

    def get_piece(self, x: int, y: int) -> Optional[Piece]:
        piece = self.board.piece_at(self._coords_to_square(x, y))
        if piece:
            color = Color.WHITE if piece.color == chess.WHITE else Color.BLACK
            type_map = {
                chess.PAWN: PieceType.PAWN,
                chess.KNIGHT: PieceType.KNIGHT,
                chess.BISHOP: PieceType.BISHOP,
                chess.ROOK: PieceType.ROOK,
                chess.QUEEN: PieceType.QUEEN,
                chess.KING: PieceType.KING,
            }
            return Piece(color, type_map[piece.piece_type])
        return None

    def get_valid_moves(self, x: int, y: int) -> List[Tuple[int, int]]:
        src = self._coords_to_square(x, y)
        moves: List[Tuple[int, int]] = []
        for m in self.board.legal_moves:
            if m.from_square == src:
                tx, ty = self._square_to_coords(m.to_square)
                moves.append((tx, ty))
        return moves

    def get_all_valid_moves(self, color: Color) -> List[Tuple[int, int, int, int]]:
        moves: List[Tuple[int, int, int, int]] = []
        # verificar se a cor solicitada é a que está para mover
        original_turn = self.board.turn
        desired = chess.WHITE if color == Color.WHITE else chess.BLACK
        # temporariamente ajustar a vez, caso esteja trocada
        self.board.turn = desired
        for m in self.board.legal_moves:
            fx, fy = self._square_to_coords(m.from_square)
            tx, ty = self._square_to_coords(m.to_square)
            moves.append((fx, fy, tx, ty))
        self.board.turn = original_turn
        return moves

    def _is_king_in_check(self, color: Color) -> bool:
        original_turn = self.board.turn
        self.board.turn = chess.WHITE if color == Color.WHITE else chess.BLACK
        result = self.board.is_check()
        self.board.turn = original_turn
        return result
