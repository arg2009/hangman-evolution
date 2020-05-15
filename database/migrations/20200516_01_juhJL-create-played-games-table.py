"""
Create played_games table
"""

from yoyo import step

__depends__ = {}

steps = [
    step(
        "CREATE TABLE played_games ("
        "country VARCHAR(255) DEFAULT NULL,"  # The country of the player
        "played_word VARCHAR(255) NOT NULL,"  # The word that was played
        "is_won TINYINT(1) DEFAULT NULL,"     # Whether the game was won or lost
        "created_at DATETIME NOT NULL,"       # When the game was started
        "completed_at DATETIME NULL "         # When and whether the game was finished
        ")",
        "DROP TABLE played_games"
    )
]
