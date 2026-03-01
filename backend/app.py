"""
API REST para o jogo de xadrez com IA
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.chess_game import ChessGame, Color
from backend.chess_ai import ChessAI
import json

app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

# Armazenar jogos em memória (em produção, usar banco de dados)
games = {}


@app.route('/api/game/new', methods=['POST'])
def new_game():
    """Cria um novo jogo"""
    game_id = str(len(games) + 1)
    game = ChessGame()
    games[game_id] = game
    
    return jsonify({
        "game_id": game_id,
        "board": game.get_board_state()
    })


@app.route('/api/game/<game_id>/state', methods=['GET'])
def get_game_state(game_id):
    """Retorna o estado atual do jogo"""
    if game_id not in games:
        return jsonify({"error": "Jogo não encontrado"}), 404
    
    game = games[game_id]
    return jsonify(game.get_board_state())


@app.route('/api/game/<game_id>/move', methods=['POST'])
def make_move(game_id):
    """Faz um movimento no jogo"""
    if game_id not in games:
        return jsonify({"error": "Jogo não encontrado"}), 404
    
    data = request.get_json()
    from_x = data.get('from_x')
    from_y = data.get('from_y')
    to_x = data.get('to_x')
    to_y = data.get('to_y')
    
    if None in [from_x, from_y, to_x, to_y]:
        return jsonify({"error": "Coordenadas inválidas"}), 400
    
    game = games[game_id]
    
    if game.make_move(from_x, from_y, to_x, to_y):
        return jsonify({
            "success": True,
            "board": game.get_board_state()
        })
    else:
        return jsonify({
            "success": False,
            "error": "Movimento inválido"
        }), 400


@app.route('/api/game/<game_id>/ai-move', methods=['POST'])
def ai_move(game_id):
    """Obtém o melhor movimento da IA"""
    if game_id not in games:
        return jsonify({"error": "Jogo não encontrado"}), 404
    
    data = request.get_json()
    difficulty = data.get('difficulty', 'médio')
    ai_color = data.get('ai_color', 'black')
    
    game = games[game_id]
    
    # Verificar se é a vez da IA
    color = Color.BLACK if ai_color == 'black' else Color.WHITE
    if game.current_player != color:
        return jsonify({"error": "Não é a vez da IA"}), 400
    
    # Obter movimento da IA
    ai = ChessAI(difficulty)
    move = ai.get_best_move(game, color)
    
    if not move:
        return jsonify({"error": "Nenhum movimento disponível"}), 400
    
    from_x, from_y, to_x, to_y = move
    
    # Fazer o movimento
    if game.make_move(from_x, from_y, to_x, to_y):
        return jsonify({
            "success": True,
            "move": {
                "from_x": from_x,
                "from_y": from_y,
                "to_x": to_x,
                "to_y": to_y
            },
            "board": game.get_board_state()
        })
    else:
        return jsonify({"error": "Erro ao fazer movimento"}), 500


@app.route('/api/game/<game_id>/valid-moves', methods=['GET'])
def get_valid_moves(game_id):
    """Retorna os movimentos válidos para uma posição"""
    if game_id not in games:
        return jsonify({"error": "Jogo não encontrado"}), 404
    
    x = request.args.get('x', type=int)
    y = request.args.get('y', type=int)
    
    if x is None or y is None:
        return jsonify({"error": "Coordenadas inválidas"}), 400
    
    game = games[game_id]
    moves = game.get_valid_moves(x, y)
    
    return jsonify({
        "moves": [{"x": mx, "y": my} for mx, my in moves]
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Endpoint de saúde da API"""
    return jsonify({"status": "ok", "message": "API funcionando"})


if __name__ == '__main__':
    print("🚀 Iniciando servidor de xadrez...")
    print("📡 API disponível em http://localhost:5000")
    print("📚 Endpoints disponíveis:")
    print("   POST /api/game/new - Criar novo jogo")
    print("   GET  /api/game/<id>/state - Estado do jogo")
    print("   POST /api/game/<id>/move - Fazer movimento")
    print("   POST /api/game/<id>/ai-move - Movimento da IA")
    print("   GET  /api/game/<id>/valid-moves - Movimentos válidos")
    app.run(debug=True, port=5000)
