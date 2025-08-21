## Snake Game (Pygame)

Jeu du serpent simple et jouable au clavier, développé avec Pygame. Mangez la nourriture, grandissez, évitez les murs et votre propre corps. Des effets sonores sont joués lors de l’ingestion et en cas de Game Over.

### Fonctionnalités
- **Contrôles au clavier**: flèches ou WASD
- **Score en temps réel**
- **Effets sonores** (si les fichiers `.mp3` sont présents)
- **Écran Game Over** avec redémarrage rapide

### Prérequis
- **Python** ≥ 3.8 (testé avec 3.13)
- **pip** (gestionnaire de paquets Python)
- **Pygame** (sera installé via `pip`)

### Installation rapide

#### Windows (PowerShell)
```powershell
cd C:\Users\chami\Desktop\SnackGame
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt  # ou: pip install pygame
```

#### macOS / Linux (bash/zsh)
```bash
cd ~/Desktop/SnackGame
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # ou: pip install pygame
```

### Lancement du jeu
```bash
python snake_game.py
# ou
python main.py
```

### Version Web (HTML + Tailwind)
- Fichier d’entrée: `index.html`
- Logique du jeu: `script.js`
- Tailwind via CDN, aucun build nécessaire.

Ouvrez simplement `index.html` dans un navigateur. Pour un serveur local simple:
```bash
python -m http.server 5500
# puis ouvrez http://localhost:5500
```

### Commandes
- **Haut**: flèche haut ou `W`
- **Bas**: flèche bas ou `S`
- **Gauche**: flèche gauche ou `A`
- **Droite**: flèche droite ou `D`
- **Écran Game Over**: `Q` pour quitter, n’importe quelle autre touche pour rejouer

### Structure du projet
```text
SnackGame/
  ├─ snake_game.py
  ├─ eating-chips-81092.mp3
  ├─ game-over-kid-voice-clip-352738.mp3
  └─ README.md
```

### Configuration rapide
Vous pouvez ajuster les constantes en haut de `snake_game.py`:
- **`SCREEN_WIDTH` / `SCREEN_HEIGHT`**: taille de la fenêtre
- **`GRID_SIZE`**: taille des cases (impacte la difficulté)
- **`FPS`**: vitesse de jeu
- Couleurs: `BLACK`, `WHITE`, `GREEN`, etc.

### Sons (optionnels)
- Les fichiers `eating-chips-81092.mp3` et `game-over-kid-voice-clip-352738.mp3` doivent être dans le même dossier que `snake_game.py`.
- Le code charge désormais les sons avec un **chemin relatif** fiable (basé sur `__file__`).
- Si les fichiers son ne sont pas présents, le jeu continue **sans son** et affiche un avertissement dans la console.
- Pour couper le son sans supprimer les fichiers, vous pouvez mettre le volume à zéro dans le code après le chargement:
  ```python
  self.eat_sound.set_volume(0.0)
  self.game_over_sound.set_volume(0.0)
  ```

### Dépannage
- **FileNotFoundError pour les sons**: vérifiez que les `.mp3` sont bien dans le même dossier et que leurs noms correspondent.
- **Erreur audio / pas de carte son**: Pygame peut afficher un avertissement; le jeu reste jouable. Si besoin, commentez `pygame.mixer.init()` dans `main()` pour désactiver le mixer.
- **Police non trouvée**: si `consolas` n’est pas disponible, remplacez par la police par défaut Pygame: `pygame.font.Font(None, 20)`.

Pour la version web:
- **Sons ne jouent pas**: la lecture audio peut être bloquée avant une interaction utilisateur; cliquez sur « Démarrer ».
- **Chemins des fichiers**: assurez-vous que `eating-chips-81092.mp3` et `game-over-kid-voice-clip-352738.mp3` sont à la racine du projet (même dossier que `index.html`).

### Développement
Le cœur du jeu est la classe `SnakeGame` dans `snake_game.py`:
- `reset_game()`: état initial
- `move_snake()`: déplacement et collisions
- `handle_input()`: gestion des touches
- `draw_elements()`: rendu (serpent, nourriture, score, Game Over)

Contributions bienvenues: refactorisation, niveaux de difficulté, skins, sonorisation, etc. Pensez à respecter le style existant et à expliquer brièvement vos changements.

### Licence et crédits
- Pygame: voir le site officiel [Pygame](https://www.pygame.org/)
- Sons: assurez-vous de disposer des droits/licences nécessaires pour les fichiers audio utilisés.
- Licence du projet: ajoutez un fichier `LICENSE` si vous souhaitez définir une licence (ex: MIT).

### Hébergement sur Vercel
Ce projet est un site statique. Déployez-le sur Vercel en pointant la racine du repo.

Paramètres recommandés:
- **Framework Preset**: Other
- **Build Command**: (vide)
- **Output Directory**: `.`

Assurez-vous que les fichiers suivants existent à la racine:
- `index.html`
- `script.js`
- `eating-chips-81092.mp3`
- `game-over-kid-voice-clip-352738.mp3`

Après déploiement, l’URL Vercel servira directement `index.html`.


