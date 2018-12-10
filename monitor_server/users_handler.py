# -*- coding: iso-8859-15 -*-

import os
import sys
import json
import logging
import tornado.web
import tornado.escape

LOGGER = logging.getLogger(__name__)

class MainHandler(tornado.web.RequestHandler):
    def initialize(self, db=None):
        self.db = db

    @tornado.gen.coroutine
    def get(self):
        self.set_header('Content-Type', 'text/javascript')
        data = tornado.escape.json_decode(self.request.body)
        user = yield self.application.db.get('users', data['email'])
        if user is None:
            first_img = yield self.application.db.get_first('images')
        else:
            data['next_img'] = None
            if user.get('next_img') is not None:
                first_img = yield self.application.db.get(
                    'images', user['next_id'])
        first_img['num_anns'] = first_img.get('num_anns', 0)
        while (first_img['num_anns'] > 3 and
            first_img['next_id'] is not None):
            first_img = yield self.application.db.get(
                'images', first_img['next_id'])
        if first_img['num_anns'] > 3:
            data['next_img'] = None
        else:
            data['next_img'] = first_img['id']
            if user is None:
                data = yield self.application.db.insert('users',
                                                        data, data['email'])
        self.write(tornado.escape.json_encode(data))


    @tornado.gen.coroutine
    def post(self):
        self.set_status(403)
