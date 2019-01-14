import tornado
import tornado.web
import tornado.escape

import pendulum


class GraphsHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.db = self.application.mongo

    def set_default_headers(self):
        self.set_header('Content-Type', 'application/json')

    async def get(self, *args, **kwargs):
        data = tornado.escape.json_decode(self.request.body)
        machine = data['machine']
        gpuid = data['gpuid']
        start_timestamp = pendulum.parse(data['start_timestamp'])
        end_timestamp = pendulum.parse(data['end_timestamp'])
        period = data['period']
        collection = f'{period}_samples'
        query = {
            f'timestamp_{period}': {
                {'$gt': start_timestamp, '$lt': end_timestamp}
            },
            'machine': machine,
            'gpuid': gpuid
        }
        # videos = await db.videos.find({})
        # cursor = db.test_collection.find({'i': {'$lt': 5}}).sort('i')
        response = []
        async for document in self.db[collection].find(query):
            document['_id'] = str(document['_id'])
            response.append(document)
        self.write(tornado.escape.json_encode(response))

    async def post(self):
        self.set_header('Content-Type', 'text/javascript')
        data = tornado.escape.json_decode(self.request.body)
        # data = {k: data[k] + 1 for k in data}
        self.write(tornado.escape.json_encode(data))
