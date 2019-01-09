
import asyncio
import logging
import zmq.asyncio

LOGGER = logging.getLogger(__name__)

queue = asyncio.Queue()
ctx = zmq.asyncio.Context.instance()


class ZMQPoller:
    INFO_PARTS = {
        'gpu': {'id': int, 'model': lambda x: str(x, 'utf-8')},
        'load': int,
        'mem': {'used': int, 'free': int, 'total': int},
        'temp': {'temp': int, 'slow_temp': int, 'shut_temp': int, 'fan': int}
    }

    PROC_PARTS = {
        'pid': int,
        'cmd': lambda x: str(x, 'utf-8'),
        'user': lambda x: str(x, 'utf-8'),
        'mem': int
    }

    def __init__(self, sampler_queue):
        self.listeners = {}
        self.sampler_queue = sampler_queue

    def register_listener(self, _id, listener):
        self.listeners[_id] = listener

    def deregister_listener(self, _id):
        self.listeners.pop(_id)

    def _process_frame(self, frame, info_keys):
        if not isinstance(info_keys, dict):
            return int(frame)
        values = {}
        key_iterator = iter(info_keys.keys())
        # current_key = next(key_iterator)
        frame_pos = 0
        offset = 0
        # LOGGER.info(frame)
        while frame_pos < len(frame):
            current_key = next(key_iterator)
            offset = frame[frame_pos]
            frame_pos += 1
            type_conv = info_keys[current_key]
            value = type_conv(frame[frame_pos:frame_pos + offset])
            values[current_key] = value
            frame_pos = frame_pos + offset
        return values

    def _process_info(self, info):
        hostname = str(info[0], 'utf-8')
        machine_info = {'hostname': hostname, 'gpus': []}
        info = info[1:]
        for i in range(0, len(info), 5):
            gpu_info = {}
            for j, part in enumerate(self.INFO_PARTS):
                frame = info[i + j]
                info_keys = self.INFO_PARTS[part]
                gpu_info[part] = self._process_frame(frame, info_keys)
            procs_frame = info[i + j + 1]
            pos = 0
            offset = 0
            procs = []
            while pos < len(procs_frame):
                offset = procs_frame[pos]
                pos += 1
                proc_frame = procs_frame[pos: pos + offset]
                procs.append(self._process_frame(proc_frame, self.PROC_PARTS))
                pos += offset
            gpu_info['procs'] = procs
            machine_info['gpus'].append(gpu_info)
        return machine_info

    async def pulling(self):
        LOGGER.info('Starting ZMQ PULL socket at: 0.0.0.0:6587')
        socket = ctx.socket(zmq.PULL)
        socket.bind('tcp://*:6587')
        while True:
            # LOGGER.info('Waiting for messages...')
            gpu_info = await socket.recv_multipart()
            info = self._process_info(gpu_info)
            LOGGER.debug(info)
            for listener_id in self.listeners:
                self.listeners[listener_id].notify(info)
            await self.sampler_queue.put(info)
