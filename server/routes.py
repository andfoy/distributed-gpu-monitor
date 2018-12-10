# -*- coding: iso-8859-15 -*-

"""
routes
======

This module establishes and defines the Web Handlers and Websockets
that are associated with a specific URL routing name. New routing
associations must be defined here.

Notes
-----
For more information regarding routing URL and valid regular expressions
visit: http://www.tornadoweb.org/en/stable/guide/structure.html
"""

import os
import sys
import tornado.web
import server.web as web

# Define new rest associations
REST = []

# Define new web rendering route associations
WEB = [
    # (r'/user', web.users_handler.MainHandler),
    # (r'/anns/.*', web.ann_handler.MainHandler),
    # (r'/images/', web.image_handler.MainHandler),
    (r'/cart/(.*)', web.new_handler.MainHandler),
    (r'/', web.main_handler.MainHandler)
]

ROUTES = REST + WEB
