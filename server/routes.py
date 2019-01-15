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

import server.web as web

# Define new rest associations
REST = []

# Define new web rendering route associations
WEB = [
    (r'/', web.main_handler.MainHandler),
    (r'/graphs', web.graphs_handler.GraphsHandler)
]

WS = [
    (r'/gpu/', web.gpu_ws_handler.GPUInfoWS)
]

ROUTES = REST + WEB + WS
