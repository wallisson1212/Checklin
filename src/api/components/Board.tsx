import React, { useState, useEffect } from 'react';
import { Color, Piece } from '../../types';
import { chessAPI } from '../../api/chessApi';
import { convertBackendBoardToFrontend, convertBackendColorToFrontend } from '../../utils/boardConverter';
import Square from './Square';
import './Board.css';

interface BoardProps {
  playerColor?: 'white' | 'black';
  difficulty?: 'très-fácil' | 'fácil' | 'médio' | 'difícil' | 'muito-difícil' | 'mestre';
  timeLimit?: number;
  onTimeUpdate?: (remainingSeconds: number) => void;
  onBack?: () => void;
}

const Board: React.FC<BoardProps> = ({ playerColor = 'white', difficulty = 'médio', timeLimit = 10, onTimeUpdate, onBack }) => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [board, setBoard] = useState<(Piece | null)[][]>(Array(8).fill(null).map(() => Array(8).fill(null)));
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState({ gameOver: false, winner: null as Color | null, isCheck: false });
  const [currentPlayer, setCurrentPlayer] = useState(Color.WHITE);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeLimit * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playerColorEnum = playerColor === 'white' ? Color.WHITE : Color.BLACK;
  const aiColor = playerColorEnum === Color.WHITE ? Color.BLACK : Color.WHITE;

  // Inicializar jogo ao montar componente
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chessAPI.createNewGame();
        setGameId(response.game_id);
        const frontendBoard = convertBackendBoardToFrontend(response.board);
        setBoard(frontendBoard);
        setCurrentPlayer(convertBackendColorToFrontend(response.board.current_player));
        setGameStatus({
          gameOver: response.board.game_over,
          winner: response.board.winner ? convertBackendColorToFrontend(response.board.winner) : null,
          isCheck: response.board.is_check,
        });
      } catch (err) {
        setError('Erro ao conectar com o servidor. Certifique-se de que o backend está rodando em http://localhost:5000');
        console.error('Erro ao inicializar jogo:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameStatus.gameOver || timeExpired) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1;
        if (onTimeUpdate) {
          onTimeUpdate(newTime);
        }
        if (newTime <= 0) {
          setTimeExpired(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameStatus.gameOver, timeExpired, onTimeUpdate]);

  // AI move effect
  useEffect(() => {
    if (!gameId || gameStatus.gameOver || currentPlayer !== aiColor || isAIThinking || timeExpired || loading) {
      return;
    }

    setIsAIThinking(true);

    const makeAIMove = async () => {
      try {
        const aiColorStr = aiColor === Color.WHITE ? 'white' : 'black';
        const response = await chessAPI.getAIMove(gameId, difficulty, aiColorStr);
        
        if (response.success && response.board) {
          const frontendBoard = convertBackendBoardToFrontend(response.board);
          setBoard(frontendBoard);
          setSelectedSquare(null);
          setValidMoves(new Set());
          setCurrentPlayer(convertBackendColorToFrontend(response.board.current_player));
          setGameStatus({
            gameOver: response.board.game_over,
            winner: response.board.winner ? convertBackendColorToFrontend(response.board.winner) : null,
            isCheck: response.board.is_check,
          });
        }
      } catch (err) {
        console.error('Erro ao fazer movimento da IA:', err);
        setError('Erro ao obter movimento da IA');
      } finally {
        setIsAIThinking(false);
      }
    };

    makeAIMove();
  }, [gameId, currentPlayer, aiColor, gameStatus.gameOver, difficulty, timeExpired, loading]);

  const handleSquareClick = async (x: number, y: number) => {
    if (!gameId || gameStatus.gameOver || currentPlayer !== playerColorEnum || isAIThinking || timeExpired || loading) return;

    // Iniciar o jogo no primeiro movimento
    if (!gameStarted) {
      setGameStarted(true);
    }

    if (selectedSquare) {
      const [fromX, fromY] = selectedSquare;

      if (validMoves.has(`${x},${y}`)) {
        // Fazer movimento
        try {
          const response = await chessAPI.makeMove(gameId, fromX, fromY, x, y);
          
          if (response.success && response.board) {
            const frontendBoard = convertBackendBoardToFrontend(response.board);
            setBoard(frontendBoard);
            setSelectedSquare(null);
            setValidMoves(new Set());
            setCurrentPlayer(convertBackendColorToFrontend(response.board.current_player));
            setGameStatus({
              gameOver: response.board.game_over,
              winner: response.board.winner ? convertBackendColorToFrontend(response.board.winner) : null,
              isCheck: response.board.is_check,
            });
          } else {
            console.error('Movimento inválido:', response.error);
          }
        } catch (err) {
          console.error('Erro ao fazer movimento:', err);
          setError('Erro ao fazer movimento');
        }
      } else if (x === fromX && y === fromY) {
        setSelectedSquare(null);
        setValidMoves(new Set());
      } else {
        // Selecionar nova peça
        const piece = board[y][x];
        if (piece && piece.color === currentPlayer) {
          setSelectedSquare([x, y]);
          loadValidMoves(x, y);
        } else {
          setSelectedSquare(null);
          setValidMoves(new Set());
        }
      }
    } else {
      // Selecionar peça
      const piece = board[y][x];
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare([x, y]);
        loadValidMoves(x, y);
      }
    }
  };

  const loadValidMoves = async (x: number, y: number) => {
    if (!gameId) return;
    
    try {
      const response = await chessAPI.getValidMoves(gameId, x, y);
      setValidMoves(new Set(response.moves.map(m => `${m.x},${m.y}`)));
    } catch (err) {
      console.error('Erro ao carregar movimentos válidos:', err);
      setValidMoves(new Set());
    }
  };

  // Função para reiniciar o jogo
  const handleRestart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chessAPI.createNewGame();
      setGameId(response.game_id);
      const frontendBoard = convertBackendBoardToFrontend(response.board);
      setBoard(frontendBoard);
      setCurrentPlayer(convertBackendColorToFrontend(response.board.current_player));
      setGameStatus({
        gameOver: response.board.game_over,
        winner: response.board.winner ? convertBackendColorToFrontend(response.board.winner) : null,
        isCheck: response.board.is_check,
      });
      setSelectedSquare(null);
      setValidMoves(new Set());
      setGameStarted(false);
      setTimeExpired(false);
      setRemainingTime(timeLimit * 60);
      setIsAIThinking(false);
    } catch (err) {
      console.error('Erro ao reiniciar jogo:', err);
      setError('Erro ao reiniciar jogo');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gameId) {
    return (
      <div className="board-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Carregando jogo...</p>
        </div>
      </div>
    );
  }

  if (error && !gameId) {
    return (
      <div className="board-container">
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="board-container">
      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '10px', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      <div className="board">
        {playerColor === 'black' 
          ? board.slice().reverse().map((row, y) =>
              row.slice().reverse().map((piece, x) => {
                const boardX = 7 - x;
                const boardY = 7 - y;
                const isLight = (boardX + boardY) % 2 === 0;
                const isSelected = selectedSquare ? selectedSquare[0] === boardX && selectedSquare[1] === boardY : false;
                const moveKey = `${boardX},${boardY}`;
                const isValidMove = validMoves.has(moveKey);
                const isCapture = isValidMove && piece !== null;

                return (
                  <Square
                    key={`${boardX}-${boardY}`}
                    piece={piece}
                    isLight={isLight}
                    x={boardX}
                    y={boardY}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    isCapture={isCapture}
                    onClick={handleSquareClick}
                  />
                );
              })
            )
          : board.map((row, y) =>
              row.map((piece, x) => {
                const isLight = (x + y) % 2 === 0;
                const isSelected = selectedSquare ? selectedSquare[0] === x && selectedSquare[1] === y : false;
                const moveKey = `${x},${y}`;
                const isValidMove = validMoves.has(moveKey);
                const isCapture = isValidMove && piece !== null;

                return (
                  <Square
                    key={`${x}-${y}`}
                    piece={piece}
                    isLight={isLight}
                    x={x}
                    y={y}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    isCapture={isCapture}
                    onClick={handleSquareClick}
                  />
                );
              })
            )
        }
      </div>
      
      {/* Checkmate Victory Modal */}
      {gameStatus.gameOver && gameStatus.winner && (
        <div className="checkmate-modal">
          <div className="checkmate-panel">
            <div className="checkmate-icon">
              {gameStatus.winner === Color.WHITE ? '♔' : '♚'}
            </div>
            <h2>{gameStatus.winner === Color.WHITE ? '♔ PEÇAS DOURADAS' : '♚ PEÇAS PRETAS'} VENCEM!</h2>
            <p className="checkmate-message">🎉 XEQUE-MATE! 🎉</p>
            <div className="checkmate-stats">
              <div className="stat">
                <span className="stat-label">Vencedor:</span>
                <span className="stat-value">{gameStatus.winner === Color.WHITE ? '♔ Brancas' : '♚ Pretas'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Dificuldade:</span>
                <span className="stat-value">{difficulty}</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="modal-btn back-modal-btn" onClick={onBack}>
                ← Voltar
              </button>
              <button className="modal-btn restart-modal-btn" onClick={handleRestart}>
                🔄 Recomeçar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Expired Modal */}
      {timeExpired && (
        <div className="time-expired-modal">
          <div className="time-expired-panel">
            <div className="time-expired-icon">⏱️</div>
            <h2>⏰ TEMPO EXPIRADO!</h2>
            <p className="time-message">Você não conseguiu terminar a partida a tempo.</p>
            <div className="time-stats">
              <div className="stat">
                <span className="stat-label">Dificuldade:</span>
                <span className="stat-value">{difficulty}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Limite de Tempo:</span>
                <span className="stat-value">{timeLimit} minuto{timeLimit !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="modal-btn back-modal-btn" onClick={onBack}>
                ← Voltar
              </button>
              <button className="modal-btn restart-modal-btn" onClick={handleRestart}>
                🔄 Recomeçar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
