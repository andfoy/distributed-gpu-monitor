import json
import tornado
import tornado.web
import tornado.escape

import pendulum
from datetime import date, datetime


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))


class GraphsHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.db = self.application.mongo.gpu

    def set_default_headers(self):
        self.set_header('Content-Type', 'application/json')

    async def post(self, *args, **kwargs):
        data = tornado.escape.json_decode(self.request.body)
        machine = data['machine']
        gpuid = data['gpuid']
        start_timestamp = pendulum.parse(data['start_timestamp'])
        end_timestamp = pendulum.parse(data['end_timestamp'])
        period = data['period']
        collection = f'{period}_samples'

        query = [
            {"$match": {
                f'timestamp_{period}': {
                    '$gte': start_timestamp,
                    '$lte': end_timestamp
                },
                'machine': machine,
                'gpuid': gpuid
            }},
            {'$project': {
                'values': {'$objectToArray': '$values'}
            }},
            {'$unwind': '$values'},
            {'$project': {
                'values': {'$objectToArray': '$values.v'}
            }},
            {'$unwind': '$values'},
            {'$project': {'values': "$values.v"}},
            {'$match': {'values.modified': True}}
        ]

        response = []
        async for document in self.db[collection].aggregate(query):
            document['_id'] = str(document['_id'])
            response.append(document)
        self.write(json.dumps(response, default=json_serial))

    async def put(self):
        self.set_header('Content-Type', 'text/javascript')
        data = tornado.escape.json_decode(self.request.body)
        # data = {k: data[k] + 1 for k in data}
        self.write(tornado.escape.json_encode(data))
