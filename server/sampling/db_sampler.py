
import pendulum

SAMPLE_TEMPLATE = {
    'temp': 0,
    'fan': 0,
    'usage': 0
}


class MongoDBSampler:
    DB = 'gpu'
    COLLECTION = 'samples'

    def __init__(self, servers, mongo_client, queue):
        self.db = mongo_client.gpu
        self.queue = queue
        self.servers = servers
        gpu_template = {i: SAMPLE_TEMPLATE for i in range(4)}
        gpu_template['count'] = 0
        self.last_sample = {s: gpu_template for s in servers}
        self.current_day = pendulum.today()

    async def create_documents(self):
        minutes_template = {
            m: SAMPLE_TEMPLATE for m in range(0, 60, 2)
        }
        hour_template = {h: minutes_template for h in range(0, 24)}
        hour_template['avg'] = SAMPLE_TEMPLATE
        hour_template['count'] = 0

        for server in self.servers:
            entries = [{
                'timestamp_day': self.current_day,
                'machine': server,
                'gpuid': gpu,
                'values': hour_template
            } for gpu in range(0, 4)]
            await self.db.samples.insert_many(entries)

    async def sample(self):
        await self.create_documents()
        async for info in self.queue:
            current_time = pendulum.now()
            time_diff = current_time - self.current_day
            if time_diff.in_days() >= 1:
                self.current_day = pendulum.today()
                await self.create_documents()
            machine = info['hostname']
            gpus = info['gpus']
