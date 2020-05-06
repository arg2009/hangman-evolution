import web

urls = (
    '/', 'Index'
)

class Index:
    def GET(self):
        return "Hello, world!"


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
