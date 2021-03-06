# Import required modules
import web
import json
import sqlite3
from datetime import datetime

# Sqlite database location
SQLITE_DB = "database/db.sqlite"

# Associate web route to handling class
urls = (
    # View Routes
    '/', 'Index',

    # Game Routes
    '/api/game', 'GameController',
    
    # Usage Statistics Routes
    '/api/usage', 'UsageController'
)

# Setup the default rendering engine
default_render = web.template.render('views/', base='layout')


##
# Controllers
##

# View Controllers extend this class
class ViewController:
    def __init__(self):
        web.header("Content-Type", "text/html; charset=utf-8")


# / Route
class Index(ViewController):
    def GET(self):
        return default_render.index()


# API Controllers extend this class
class ApiController(object):
    def __init__(self):
        # Connect to the DB
        self.db_connection = sqlite3.connect(SQLITE_DB)

        # Set content type for all API controllers
        web.header("Content-Type", "application/json")


# /api/game
class GameController(ApiController):
    # Start a new game
    def POST(self):
        random_word = get_random_word()
        game_id = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')

        # Store the new game in the DB
        db_cursor = self.db_connection.cursor()
        sql = "INSERT INTO played_games (" \
              "country, played_word, is_won, created_at, completed_at" \
              ") " \
              "VALUES (" \
              f"null, '{random_word.word}', null, '{game_id}', null" \
              ");"
        db_cursor.execute(sql)
        self.db_connection.commit()

        game_dto = GameDTO(game_id, random_word.word, random_word.hints)
        return json.dumps(game_dto.__dict__)

    def PATCH(self):
        data = json.loads(web.data())

        id_ = data['id_']
        is_won = (0, 1)[data['is_won']]
        completed_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')

        # Update if the game was won or lost in the DB
        db_cursor = self.db_connection.cursor()
        sql = f"UPDATE played_games SET is_won={is_won}, completed_at='{completed_at}' where created_at='{id_}';"
        db_cursor.execute(sql)
        self.db_connection.commit()


# /api/usage
class UsageController(ApiController):
    def GET(self):
        db_cursor = self.db_connection.cursor()

        # Collect usage statistics
        sql = 'select ' \
              'pg_max.played_word as word_most_played, ' \
              'pg_min.played_word as word_least_played, ' \
              'pg_wins.games_won as games_won, ' \
              'pg_losses.games_lost as games_lost ' \
              'from (' \
              'select ' \
              'played_word, MAX(occurrences) as occurrences ' \
              'from (select played_word, count(*) as occurrences from played_games GROUP BY played_word)' \
              ') pg_max ' \
              'cross join (' \
              'select ' \
              'played_word, MIN(occurrences) as occurrences ' \
              'from (select played_word, count(*) as occurrences from played_games GROUP BY played_word)' \
              ') pg_min ' \
              'cross join (' \
              'select count(*) as games_won from played_games where is_won=1' \
              ') pg_wins ' \
              'cross join (' \
              'select count(*) as games_lost from played_games where is_won=0' \
              ') pg_losses'

        db_cursor.execute(sql)
        result = db_cursor.fetchone()

        word_most_played = result[0]
        word_least_played = result[1]
        wins = result[2]
        losses = result[3]

        usage_dto = UsageDTO(wins, losses, word_most_played, word_least_played)
        return json.dumps(usage_dto.__dict__)


##
# Response DTOs
##
class GameDTO:
    def __init__(self, id_, word, hints):
        self.id_ = id_
        self.word = word
        self.hints = hints


class UsageDTO:
    def __init__(self, games_won, games_lost, word_most_played, word_least_played):
        self.games_won = games_won
        self.games_lost = games_lost
        self.word_most_played = word_most_played
        self.word_least_played = word_least_played


##
# Data Entities
##
class RandomWord:
    def __init__(self, word, hints):
        self.word = word
        self.hints = hints


def get_random_word():
    # TODO: implement this properly by retrieving a random word and it's hints from some sort of data store
    random_word = RandomWord("electrician", "A noun,Performs maintenance tasks in houses,Works with cables and wiring")

    return random_word


# Run the web application
if __name__ == "__main__":
    # Launch the web app
    app = web.application(urls, globals())
    app.run()
