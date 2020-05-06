import web

urls = (
    '/', 'Index'
)

default_render = web.template.render('views/', base='layout')


class Index:
    def GET(self):
        return default_render.index()


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()
