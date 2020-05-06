# Import required modules
import web

# Associate web route to handling class
urls = (
    '/', 'Index'
)

# Setup the default rendering engine
default_render = web.template.render('views/', base='layout')


# / Route
class Index:
    def GET(self):
        return default_render.index()


# Run the web application
if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
