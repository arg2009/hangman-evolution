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
    
    # API Routes
    '/api/random-word', 'ApiWord',

    # Game Routes
    '/api/game', 'GameController'
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


# /api/random-word Route
class ApiWord:
    def GET(self):
        # Set content type
        web.header("Content-Type", "application/json")

        # TODO: implement this propery by retrieving a random word and hint from some sort of data store
        data = {"word": "fun", "hint": "A noun"}

        return json.dumps(data)


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

        game_dto = GameDTO(game_id, random_word.word, random_word.hint)
        return json.dumps(game_dto.__dict__)


##
# Response DTOs
##
class GameDTO:
    def __init__(self, id_, word, hint):
        self.id_ = id_
        self.word = word
        self.hint = hint


##
# Data Entities
##
class RandomWord:
    def __init__(self, word, hint):
        self.word = word
        self.hint = hint


def get_random_word():
    # TODO: implement this properly by retrieving a random word and hint from some sort of data store
    random_word = RandomWord("fun", "A noun")

    return random_word


# Run the web application
if __name__ == "__main__":
    # Launch the web app
    app = web.application(urls, globals())
    app.run()
