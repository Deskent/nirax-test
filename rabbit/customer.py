import pickle

import pika

from rabbit.rabbit_base import RabbitMQBase


class Customer(RabbitMQBase):

    @staticmethod
    def callback(
            channel: pika.channel.Channel,
            method: pika.spec.Basic.Deliver,
            properties: pika.spec.BasicProperties,
            body: bytes
    ):
        try:
            result: str = body.decode()
        except UnicodeDecodeError:
            result = pickle.loads(body)
        print(f'Result: {result} Type: {type(result)}')

    def start_consuming(self):
        self.channel.basic_consume(
            queue=self.queue, on_message_callback=self.callback, auto_ack=True
        )
        print("Waiting messages")
        self.channel.start_consuming()


if __name__ == '__main__':
    try:
        Customer().start_consuming()
    except KeyboardInterrupt:
        print('End of program')
