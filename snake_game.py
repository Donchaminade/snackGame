"""
Snake Game with Pygame UI
Use WASD or Arrow keys to control the snake.
"""

import sys
import random
import pygame
from collections import deque
import os

# --- Constants ---
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 480
GRID_SIZE = 20
GRID_WIDTH = SCREEN_WIDTH // GRID_SIZE
GRID_HEIGHT = SCREEN_HEIGHT // GRID_SIZE

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
DARK_GREEN = (0, 155, 0)
RED = (255, 0, 0)

# Game speed
FPS = 10

class SnakeGame:
    def __init__(self, width=GRID_WIDTH, height=GRID_HEIGHT):
        self.width = width
        self.height = height
        self.font = pygame.font.SysFont('consolas', 20)
        self.eat_sound = None
        self.game_over_sound = None
        try:
            # NOTE: You need to provide these sound files in the same directory.
            # You can find free WAV or OGG files online for a "crunch" and "game over" sound.
            sound_dir = os.path.dirname(os.path.abspath(__file__))
            eat_path = os.path.join(sound_dir, "eating-chips-81092.mp3")
            over_path = os.path.join(sound_dir, "game-over-kid-voice-clip-352738.mp3")
            self.eat_sound = pygame.mixer.Sound(eat_path)
            self.game_over_sound = pygame.mixer.Sound(over_path)
        except (pygame.error, FileNotFoundError) as e:
            print(f"Warning: Sound files not found. Game will run without sound. Error: {e}")
        self.reset_game()

    def reset_game(self):
        """Resets the game to its initial state."""
        self.snake = deque([(self.width // 2, self.height // 2)])
        self.direction = (1, 0)  # Initially moving right
        self.food = self.generate_food()
        self.score = 0
        self.game_over = False

    def generate_food(self):
        """Generate food at a random position not occupied by the snake."""
        while True:
            food = (random.randint(0, self.width - 1), random.randint(0, self.height - 1))
            if food not in self.snake:
                return food

    def move_snake(self):
        """Move snake in the current direction and check for collisions."""
        if self.game_over:
            return

        head_x, head_y = self.snake[0]
        new_head = (head_x + self.direction[0], head_y + self.direction[1])

        # Check for game over conditions
        is_wall_collision = (new_head[0] < 0 or new_head[0] >= self.width or
                             new_head[1] < 0 or new_head[1] >= self.height)
        is_self_collision = new_head in self.snake

        if is_wall_collision or is_self_collision:
            self.game_over = True
            if self.game_over_sound:
                self.game_over_sound.play()
            return

        self.snake.appendleft(new_head)

        # Check if food is eaten
        if new_head == self.food:
            if self.eat_sound:
                self.eat_sound.play()
            self.score += 10
            self.food = self.generate_food()
        else:
            self.snake.pop()  # Remove tail if no food is eaten

    def change_direction(self, new_direction):
        """Change snake direction, preventing 180-degree turns"""
        # Prevent the snake from reversing on itself
        current_dx, current_dy = self.direction
        new_dx, new_dy = new_direction
        if (current_dx, current_dy) != (-new_dx, -new_dy):
            self.direction = new_direction

    def draw_elements(self, surface):
        """Draw all game elements on the given surface."""
        surface.fill(BLACK)
        self._draw_snake(surface)
        self._draw_food(surface)
        self._draw_score(surface)
        if self.game_over:
            self._draw_game_over(surface)

    def _draw_snake(self, surface):
        """Draw the snake."""
        # Draw head
        head_rect = pygame.Rect(self.snake[0][0] * GRID_SIZE, self.snake[0][1] * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        pygame.draw.rect(surface, DARK_GREEN, head_rect)
        # Draw body
        for segment in list(self.snake)[1:]:
            seg_rect = pygame.Rect(segment[0] * GRID_SIZE, segment[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE)
            pygame.draw.rect(surface, GREEN, seg_rect)

    def _draw_food(self, surface):
        """Draw the food."""
        food_rect = pygame.Rect(self.food[0] * GRID_SIZE, self.food[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        pygame.draw.rect(surface, RED, food_rect)

    def _draw_score(self, surface):
        """Draw the score."""
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        surface.blit(score_text, (10, 10))

    def _draw_game_over(self, surface):
        """Draw the game over message."""
        over_font = pygame.font.SysFont('consolas', 50)
        over_text = over_font.render("GAME OVER", True, RED)
        over_rect = over_text.get_rect(center=(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30))
        surface.blit(over_text, over_rect)

        restart_font = pygame.font.SysFont('consolas', 25)
        restart_text = restart_font.render("Press any key to Restart or Q to Quit", True, WHITE)
        restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 30))
        surface.blit(restart_text, restart_rect)

    def handle_input(self, event):
        """Handle user input events."""
        if event.type == pygame.KEYDOWN:
            if self.game_over:
                if event.key == pygame.K_q:
                    return False # Signal to quit
                else:
                    self.reset_game()
            else:
                if event.key == pygame.K_w or event.key == pygame.K_UP:
                    self.change_direction((0, -1))  # Up
                elif event.key == pygame.K_s or event.key == pygame.K_DOWN:
                    self.change_direction((0, 1))   # Down
                elif event.key == pygame.K_a or event.key == pygame.K_LEFT:
                    self.change_direction((-1, 0))  # Left
                elif event.key == pygame.K_d or event.key == pygame.K_RIGHT:
                    self.change_direction((1, 0))   # Right
        return True # Signal to continue

def main():
    """Main function to initialize and run the game."""
    pygame.init()
    pygame.mixer.init()  # Initialize the sound mixer
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Snake Game")
    clock = pygame.time.Clock()

    game = SnakeGame()
    running = True

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            running = game.handle_input(event)
            if not running:
                break

        if not game.game_over:
            game.move_snake()

        game.draw_elements(screen)
        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
