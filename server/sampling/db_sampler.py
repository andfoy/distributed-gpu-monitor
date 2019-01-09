
import pendulum

SAMPLE_TEMPLATE = {
    'temp': 0,
    'fan': 0,
    'usage': 0
}

SAMPLE_VALUE = {
    'last_time': None,
    'values': SAMPLE_TEMPLATE,
    'count': 0
}


class MongoDBSampler:
    def __init__(self, servers, mongo_client, queue):
        self.db = mongo_client.gpu_sampling
        self.queue = queue
        self.servers = servers
        self.last_samples = {s: {i: SAMPLE_VALUE for i in range(4)}
                             for s in servers}

    async def create_documents(self, time):
        minutes_template = {
            m: SAMPLE_TEMPLATE for m in range(0, 60, 2)
        }
        hour_template = {h: minutes_template for h in range(0, 24)}
        hour_template['avg'] = SAMPLE_TEMPLATE
        hour_template['count'] = 0

        for server in self.servers:
            entries = [{
                'timestamp_day': time,
                'machine': server,
                'gpuid': gpu,
                'values': hour_template
            } for gpu in range(0, 4)]
            await self.db.gpu_values.insert_many(entries)

    async def sample(self):
        current_time = pendulum.today()
        await self.create_documents(current_time)
