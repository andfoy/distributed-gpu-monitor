
import logging
import pendulum
from copy import deepcopy
from server.sampling import COLLECTIONS

LOGGER = logging.getLogger(__name__)


class MongoDBSampler:
    DB = 'gpu'
    READING_SAMPLE = {
        'temp': {
            'value': 0,
            'slowdown': 90,
            'shutdown': 100
        },
        'fan': 0,
        'load': 0,
        'timestamp': pendulum.now(),
        'modified': False
    }

    def __init__(self, servers, mongo_client, queue):
        self.db = mongo_client[self.DB]
        self.queue = queue
        self.servers = servers

        server_template = {s: self.gpu_template for s in servers}
        self.acc_samples = {c: deepcopy(server_template) for c in COLLECTIONS}
        self.current_times = {}
        now = pendulum.now()
        for c in COLLECTIONS:
            collection_info = COLLECTIONS[c]
            self.current_times[c] = now.start_of(collection_info['reference'])

    @property
    def reading_template(self):
        return deepcopy(self.READING_SAMPLE)

    @property
    def gpu_template(self):
        gpu_template = {i: self.reading_template for i in range(4)}
        gpu_template['count'] = 0
        gpu_template['last_sample'] = None
        gpu_template['current_sample'] = None
        return deepcopy(gpu_template)

    async def create_document(self, collection, collection_info):
        LOGGER.info(f"Creating template documents for collection {collection}")
        inner_template = {
            str(x): self.reading_template
            for x in range(0, *collection_info['inner_range'])
        }
        outer_template = {
            str(x): inner_template
            for x in range(0, collection_info['max_value'])
        }
        # outer_template['avg'] = self.reading_template
        # outer_template['count'] = 0

        time = self.current_times[collection].start_of(
            collection_info['reference'])
        for server in self.servers:
            entries = [{
                collection_info['key']: time,
                'machine': server,
                'gpuid': gpu,
                'values': outer_template
            } for gpu in range(0, 4)]
            await self.db[collection].insert_many(entries)
        await self.db.last_renewal.update_one(
            {'collection': collection}, {'$set': {'timestamp': time}})

    async def check_document(self, collection, collection_info):
        last_timestamp = await self.db.last_renewal.find_one(
            {'collection': collection})
        generate = True
        current_time = self.current_times[collection]
        time = current_time.start_of(collection_info['reference'])
        if last_timestamp is not None:
            last_timestamp = pendulum.instance(last_timestamp['timestamp'])
            last_timestamp = last_timestamp.in_tz(time.timezone_name)
            last_timestamp = last_timestamp.start_of(
                collection_info['reference'])
            LOGGER.info(f"Server timestamp: {last_timestamp}")
            LOGGER.info(f"Local timestamp: {time}")
            generate = last_timestamp != time
        else:
            await self.db.last_renewal.insert_one({
                'collection': collection, 'timestamp': time})
        return generate

    async def create_documents(self):
        for collection in COLLECTIONS:
            collection_info = COLLECTIONS[collection]
            pending = await self.check_document(collection, collection_info)
            if pending:
                await self.create_document(collection, collection_info)

    async def period_renewal(self):
        for collection in COLLECTIONS:
            reference_time = pendulum.now()
            collection_info = COLLECTIONS[collection]
            current_time = self.current_times[collection]
            reference_time = reference_time.start_of(
                collection_info['reference'])
            diff = reference_time - current_time
            diff_value = getattr(diff, collection_info['periodicity'])
            if diff_value() >= collection_info['diff']:
                LOGGER.info(f'Current time is: {reference_time}')
                LOGGER.info(f'Last timestamp stored was {current_time}')
                self.current_times[collection] = reference_time
                await self.create_document(collection, collection_info)

    async def update_collection(self, collection, machine, machine_acc):
        def floor_to_multiple(num, divisor):
            return num - (num % divisor)

        collection_info = COLLECTIONS[collection]
        timestamp = machine_acc['current_sample']
        outer_most, inner_most = [
            getattr(timestamp, t) for t in collection_info['sample_periods']]
        inner_most = floor_to_multiple(
            inner_most, collection_info['inner_range'][1])
        count = machine_acc['count']
        for gpuid in range(0, 4):
            gpu_sample = machine_acc[gpuid]
            gpu_sample['temp']['value'] /= count
            gpu_sample['fan'] /= count
            gpu_sample['load'] /= count
            temp = gpu_sample['temp']
            fan = gpu_sample['fan']
            load = gpu_sample['load']
            common_prefix = f"values.{outer_most}.{inner_most}"
            LOGGER.debug(common_prefix)
            LOGGER.debug(gpu_sample)
            result = await self.db[collection].update_one(
                {
                    collection_info['key']: timestamp.start_of(
                        collection_info['reference']),
                    "machine": machine,
                    "gpuid": gpuid
                },
                {
                    "$set": {
                        f"{common_prefix}.temp.value": temp['value'],
                        f"{common_prefix}.temp.slowdown": temp['slowdown'],
                        f"{common_prefix}.temp.shutdown": temp['shutdown'],
                        f"{common_prefix}.fan": fan,
                        f"{common_prefix}.load": load,
                        f"{common_prefix}.timestamp": timestamp,
                        f"{common_prefix}.modified": True
                    }
                })
            LOGGER.debug(result.modified_count)

    async def update_collections(self, info):
        machine = info['hostname']
        gpus = info['gpus']
        for collection in COLLECTIONS:
            current_time = pendulum.now()
            collection_info = COLLECTIONS[collection]
            collection_acc_samples = self.acc_samples[collection]
            machine_acc_sample = collection_acc_samples[machine]
            if machine_acc_sample['last_sample'] is None:
                machine_acc_sample['last_sample'] = current_time
            diff = current_time - machine_acc_sample['last_sample']
            LOGGER.debug(f"diff/expected: {diff.in_seconds()}/"
                         f"{collection_info['sample_period']}")
            if diff.in_seconds() >= collection_info['sample_period']:
                LOGGER.info(f"Updating collection {collection}")
                await self.update_collection(
                    collection, machine, machine_acc_sample)
                machine_acc_sample = self.gpu_template
                machine_acc_sample['last_sample'] = current_time
            machine_acc_sample['count'] += 1
            machine_acc_sample['current_sample'] = current_time
            for gpu in gpus:
                LOGGER.debug(gpu)
                gpuid = gpu['gpu']['id']
                gpu_acc = machine_acc_sample[gpuid]
                gpu_acc['temp']['value'] += gpu['temp']['temp']
                gpu_acc['temp']['slowdown'] = gpu['temp']['slow_temp']
                gpu_acc['temp']['shutdown'] = gpu['temp']['shut_temp']
                gpu_acc['fan'] += gpu['temp']['fan']
                gpu_acc['load'] += gpu['load']
                gpu_acc['timestamp'] = current_time
                machine_acc_sample[gpuid] = gpu_acc
            LOGGER.debug(machine_acc_sample)
            collection_acc_samples[machine] = machine_acc_sample
            self.acc_samples[collection] = collection_acc_samples

    async def sample(self):
        await self.create_documents()
        async for info in self.queue:
            await self.period_renewal()
            await self.update_collections(info)
