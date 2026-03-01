# Xadrezzz - Chess Game Frontend + Backend

Um jogo de xadrez completo com frontend em **React + TypeScript + Vite** e backend em **Python + Flask**.

## 🎮 Features

✅ **Jogo de Xadrez Completo**
- Movimentos válidos para todas as peças
- Sistema de xeque e xeque-mate
- Afogamento (stalemate)
- Roque (castling)
- Promoção de peão
- En passant

✅ **IA com Múltiplos Níveis de Dificuldade**
- **Très-fácil**: Movimentos aleatórios
- **Fácil**: Minimax profundidade 1
- **Médio**: Minimax profundidade 2
- **Difícil**: Minimax profundidade 3
- **Muito-difícil**: Minimax profundidade 4
- **Mestre**: Minimax profundidade 5

✅ **Interface Moderna**
- Design responsivo
- Tabuleiro 8x8 com cores alternadas
- Visualização clara de movimentos válidos
- Indicadores de xeque em tempo real

## 🚀 Instalação e Execução

### Backend (Python)

1. Navegue até a pasta backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Inicie o servidor:
```bash
python app.py
```

O backend estará disponível em `http://localhost:5000`

### Frontend (React)

1. Na raiz do projeto, instale as dependências:
```bash
npm install
```

2. Configure a URL do backend (opcional):
Crie um arquivo `.env` na raiz do projeto:
```
VITE_API_URL=http://localhost:5000
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend abrirá automaticamente em `http://localhost:3000`

## 📡 API Endpoints

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

## 🏗️ Estrutura do Projeto

```
chess-frontend/
├── backend/                 # Backend Python
│   ├── chess_game.py       # Lógica do jogo de xadrez
│   ├── chess_ai.py         # Implementação da IA
│   ├── app.py              # API REST com Flask
│   ├── requirements.txt    # Dependências Python
│   └── README.md           # Documentação do backend
├── src/
│   ├── api/
│   │   └── chessApi.ts     # Cliente API para comunicação com backend
│   ├── components/
│   │   ├── Board.tsx       # Componente principal do tabuleiro
│   │   └── Square.tsx      # Componente de cada casa
│   ├── engine/             # (Legado - não usado mais)
│   ├── utils/
│   │   └── boardConverter.ts  # Conversão entre formatos backend/frontend
│   ├── types.ts            # Tipos TypeScript
│   └── App.tsx             # Componente raiz
├── package.json
└── README.md
```

## 🎯 Como Jogar

1. **Inicie o backend** primeiro (Python)
2. **Inicie o frontend** (React)
3. **Clique em uma peça** para selecioná-la (deve ser da cor do jogador atual)
4. **Clique em um quadrado destacado** para mover a peça
5. Os círculos mostram os movimentos legais
6. A IA joga automaticamente quando é sua vez

## 🔧 Tecnologias

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **CSS3**

### Backend
- **Python 3.8+**
- **Flask**: Framework web para API REST
- **Flask-CORS**: Permite requisições do frontend

## 🧠 Algoritmo da IA

A IA utiliza o algoritmo **Minimax** com diferentes profundidades baseadas na dificuldade:

- **Minimax**: Algoritmo de busca que explora todas as possíveis jogadas futuras
- **Avaliação**: Considera material (valor das peças), controle do centro, xeque e xeque-mate
- **Profundidade**: Quanto maior a profundidade, mais forte a IA (mas mais lenta)

## 📝 Notas

- O backend precisa estar rodando para o frontend funcionar
- Os jogos são armazenados em memória (em produção, usar banco de dados)
- A URL da API pode ser configurada via variável de ambiente `VITE_API_URL`
