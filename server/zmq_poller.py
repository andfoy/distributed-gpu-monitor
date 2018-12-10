import asyncio
import logging
import zmq.asyncio
from tornado.platform.asyncio import AsyncIOMainLoop


LOGGER = logging.getLogger(__name__)

queue = asyncio.Queue()
ctx = zmq.asyncio.Context.instance()


class ZMQPoller:
    INFO_PARTS = {
        'gpu': ['id', 'model'],
        'load': [],
        'mem': ['used', 'free', 'total'],
        'temp': ['temp', 'slow_temp', 'shut_temp', 'fan']
    }

    def __init__(self):
        self.listeners = {}

    def register_listener(self, listener, _id):
        self.listeners[_id] = listener

    def deregister_listener(self, _id):
        self.listeners.pop(_id)

    def process_info(self, info):
        machine_info = []
        hostname = info[0]
        info = info[1:]
        pos = 0
        while pos < len(info):
            gpu_info = {}
            for i, part in enumerate(self.INFO_PARTS):
                info_part = info[i + pos]



    async def pulling(self):
        LOGGER.info('Starting ZMQ PULL socket at: 0.0.0.0:6587')
        socket = ctx.socket(zmq.PULL)
        socket.bind('tcp://*:6587')
        while True:
            # LOGGER.info('Waiting for messages...')
            gpu_info = await socket.recv_multipart()
            LOGGER.info(gpu_info)
            for listener_id in self.listeners:
                self.listeners[listener_id].notify(gpu_info)
