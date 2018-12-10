# -*- coding: iso-8859-15 -*-

import os
import sys
import tornado.web
import tornado.escape

class MainHandler(tornado.web.RequestHandler):
    def initialize(self, db=None):
        self.db = db

    # @tornado.gen.coroutine
    async def get(self):
        self.render('../static/index.html')

    # @tornado.gen.coroutine
    async def post(self):
        self.set_status(403)

    async def put(self):
        self.set_status(403)
