# Import required modules
import web
import json

# Associate web route to handling class
urls = (
    # View Routes
    '/', 'Index',
    
    # API Routes
    '/api/random-word', 'ApiWord',
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
        data = {"word": "fun", "hint": "A noun"}

        return json.dumps(data)


# Run the web application
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
