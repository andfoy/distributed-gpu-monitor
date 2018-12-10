
import uuid
import json
import logging
import tornado
import tornado.web
import tornado.websocket


LOGGER = logging.getLogger(__name__)


class GPUInfoWS(tornado.websocket.WebSocketHandler):
    def open(self):
        self.uuid = uuid.uuid4()
        self.application.zmq_poller.register_listener(self.uuid, self)

    def on_message(self, message):
        # self.write_message(u"You said: " + message)
        LOGGER.info(f"Websocket {self.uuid} wrote: {message}")

    def on_close(self):
        self.application.zmq_poller.deregister_listener(self.uuid)

    def notify(self, info):
        info = json.dump(info)
        self.write(info)
