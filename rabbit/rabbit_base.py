import pika


class RabbitMQBase:

    def __init__(
            self,
            host: str = 'localhost',
            queue: str = 'hello'
    ):
        self.__host: str = host
        self.queue: str = queue
        self.channel = self._create_channel()
        self.channel.queue_declare(queue=self.queue)

    def _get_connection(self):
        connection = pika.BlockingConnection(pika.ConnectionParameters(self.__host))
        yield connection
        connection.close()

    def _create_channel(self):
        connection = next(self._get_connection())
        return connection.channel()
