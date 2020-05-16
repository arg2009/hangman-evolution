# Import required modules
import web
import json
import sqlite3
import random

import logging

# Associate web route to handling class
urls = (
    # View Routes
    '/', 'Index',
    
    # API Routes
    '/api/random-word', 'ApiWord',
    '/api/get-hint', 'GetHint',
)

# Setup the default rendering engine
default_render = web.template.render('views/', base='layout')


# / Route
class Index:
    def GET(self):
        return default_render.index()


# /api/random-word Route
class ApiWord:
    def GET(self):
        # Set content type
        web.header("Content-Type", "application/json")

        # TODO: implement this propery by retrieving a random word and hint from some sort of data store

        # connect to database and get a random word and a hint
        conn = sqlite3.connect('dbHangman.db')
        query = "SELECT * FROM wordSource ORDER BY RANDOM() LIMIT 1;"
        cursor = conn.execute(query)

        for row in cursor:
            word = row[0]
            hint = row[random.randrange(1,4)]

        conn.close()

        data = {"word": word, "hint": hint}

        return json.dumps(data)

# /api/get-hint Route
class GetHint:
    def GET(self):
        # Set content type
        web.header("Content-Type", "application/json")
        
        # connect to database and get a hint associated to the word
        conn = sqlite3.connect('dbHangman.db')
        query_parms = web.input()
 
        query = "SELECT * FROM wordSource WHERE word="
        word = ''.join(query_parms.word)
        query += "'" +word +"'"
    
        cursor = conn.execute(query)

        for row in cursor:
            hint = row[random.randrange(1,4)]

        conn.close()

        data = {"hint": hint}

        return json.dumps(data)


# Run the web application
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
