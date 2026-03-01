# Backend - Jogo de Xadrez em Python

Backend completo para o jogo de xadrez com IA e diferentes níveis de dificuldade.

## 🎮 Funcionalidades

- ✅ Lógica completa do jogo de xadrez (usa python‑chess)
- ✅ Movimentos válidos para todas as peças
- ✅ Detecção de xeque e xeque-mate
- ✅ API que expõe estado do tabuleiro e peças
- ✅ IA com 6 níveis de dificuldade (melhorada com poda alfa‑beta):
  - **Très-fácil**: Movimentos aleatórios
  - **Fácil**: Minimax profundidade 1
  - **Médio**: Minimax profundidade 2
  - **Difícil**: Minimax profundidade 3
  - **Muito-difícil**: Minimax profundidade 4
  - **Mestre**: Minimax profundidade 5

## 🚀 Instalação

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

> ✅ agora o pacote `python-chess` é usado para gerenciar o tabuleiro e as regras.

## 💻 Execução

Para iniciar o servidor, entre na pasta `backend` ou execute como módulo:
```bash
cd backend
python app.py
# ou, a partir da raiz do repositório:
# python -m backend.app
```

O servidor estará disponível em `http://localhost:5000`

## 📡 Endpoints da API

### Criar novo jogo
```
POST /api/game/new
Response: { "game_id": "1", "board": {...} }
```

### Obter estado do jogo
```
GET /api/game/<game_id>/state
Response: { "board": [...], "current_player": "white", ... }
```

### Fazer movimento
```
POST /api/game/<game_id>/move
Body: { "from_x": 0, "from_y": 6, "to_x": 0, "to_y": 5 }
Response: { "success": true, "board": {...} }
```

### Movimento da IA
```
POST /api/game/<game_id>/ai-move
Body: { "difficulty": "médio", "ai_color": "black" }
Response: { "success": true, "move": {...}, "board": {...} }
```

### Obter movimentos válidos
```
GET /api/game/<game_id>/valid-moves?x=0&y=6
Response: { "moves": [{"x": 0, "y": 5}, ...] }
```

## 🧠 Algoritmo da IA

A IA utiliza o algoritmo **Minimax** com diferentes profundidades baseadas na dificuldade:

- **Minimax**: Algoritmo de busca que explora todas as possíveis jogadas futuras
- **Avaliação**: Considera material (valor das peças), controle do centro, xeque e xeque-mate
- **Profundidade**: Quanto maior a profundidade, mais forte a IA (mas mais lenta)

## 📁 Estrutura

```
backend/
├── chess_game.py      # Lógica do jogo de xadrez (usa python-chess)
├── chess_ai.py        # Implementação da IA com minimax + alfa-beta
├── app.py             # API REST com Flask
├── requirements.txt   # Dependências Python
└── README.md          # Documentação
```

## 🔧 Tecnologias

- **Python 3.8+**
- **Flask**: Framework web para API REST
- **Flask-CORS**: Permite requisições do frontend

## 📝 Exemplo de Uso

```python
from chess_game import ChessGame
from chess_ai import ChessAI

# Criar jogo
game = ChessGame()

# Fazer movimento do jogador
game.make_move(0, 6, 0, 5)

# Obter movimento da IA
ai = ChessAI("médio")
move = ai.get_best_move(game, Color.BLACK)
if move:
    from_x, from_y, to_x, to_y = move
    game.make_move(from_x, from_y, to_x, to_y)
```
