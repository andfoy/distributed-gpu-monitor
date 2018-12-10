
import tornado
import tornado.web
import tornado.escape

class MainHandler(tornado.web.RequestHandler):
    async def f(self):
        return "Spam spam spam"

    async def get(self, *args, **kwargs):
        d = {}
        r = await self.f()
        d['response'] = r
        self.write(tornado.escape.json_encode(d))

    async def post(self, path):
        self.set_header('Content-Type', 'text/javascript')
        data = tornado.escape.json_decode(self.request.body)
        data = {k: data[k] + 1 for k in data}
        self.write(tornado.escape.json_encode(data))
