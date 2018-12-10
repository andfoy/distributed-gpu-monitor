# -*- coding: utf-8 -*-
# !/usr/bin/env python

"""keypoint-annotator backend Python server."""

# Standard lib imports
import os
import sys
import logging
import argparse
import os.path as osp

# Tornado imports
import tornado.web
import tornado.ioloop
import tornado.autoreload
from tornado.platform.asyncio import AsyncIOMainLoop

# Local imports
# from server.db import RiakDB
from server.routes import ROUTES
from server.zmq_poller import ZMQPoller

# Other library imports
import coloredlogs

riak_url = os.environ.get('RIAK_URL', 'pbc://localhost:8087')

parser = argparse.ArgumentParser(
    description='keypoint-annotator backend server')

parser.add_argument('--riak-url', type=str, default=riak_url,
                    help='Riak url endpoint used to locate DB')
parser.add_argument('--port', type=int, default=8000,
                    help='TCP port used to deploy the server')

args = parser.parse_args()

# AMQP_URL = ('amqp://langvis_server:eccv2018-textseg@margffoy-tuay.com:5672/'
#             'queryobjseg')

LOG_FORMAT = ('%(levelname) -10s %(asctime)s %(name) -30s %(funcName) '
              '-35s %(lineno) -5d: %(message)s')
LOGGER = logging.getLogger(__name__)
coloredlogs.install(level='info')

clr = 'clear'
if os.name == 'nt':
    clr = 'cls'


def recompile_react():
    os.system('yarn build')

def main():
    logging.basicConfig(level=logging.DEBUG, format=LOG_FORMAT)
    settings = {"static_path": os.path.join(
        os.path.dirname(__file__), "static", "static")}
    # routes = ROUTES
    application = tornado.web.Application(
        ROUTES, debug=True, serve_traceback=True, autoreload=True,
        **settings)
    print("Server is now at: 127.0.0.1:8000")

    application.zmq_poller = ZMQPoller()
    ioloop = tornado.ioloop.IOLoop.instance()
    ioloop.spawn_callback(application.zmq_poller.pulling)

    # application.db = RiakDB(args.riak_url)
    # LOGGER.info('Riak connected')
    application.listen(args.port)

    try:
        ioloop.start()
    except KeyboardInterrupt:
        pass
    finally:
        print("Closing server...\n")
        tornado.ioloop.IOLoop.instance().stop()


if __name__ == '__main__':
    os.system(clr)
    main()
