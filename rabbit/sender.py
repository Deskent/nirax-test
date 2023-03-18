import pickle
import random
import time
from typing import Any

from rabbit.rabbit_base import RabbitMQBase


class Exchange(RabbitMQBase):

    def send(self, text: str | bytes):
        self.channel.basic_publish(
            exchange='',
            routing_key=self.queue,
            body=text
        )
        print(f"Text sent: {text}")

    def send_object(self, data: Any):
        self.send(text=pickle.dumps(data))


def main():
    data = [
        {"a": 1, "b": 2},
        [1, 2, 3],
        {5, 62, 3},
        ('asd', 'bbb'),
        1,
    ]
    while True:
        to_send = random.choice(data)
        Exchange().send_object(to_send)
        time.sleep(random.randint(5, 10))


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('End of program')
